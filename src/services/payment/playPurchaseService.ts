import crypto from 'node:crypto';
import type { Auth } from 'firebase-admin/auth';
import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';

import { activatePremium } from './activatePremium.js';
import { checkRateLimit } from '../../middleware/rateLimiter.js';
import { PaymentStateError, PlayPurchaseInvalidError } from '../../utils/errors.js';
import type { ValidatedPlayPurchase } from '../../validators/playPurchaseValidation.js';
import { NotOnboardedError, PlanNotFoundError, PaymentNotFoundError } from '../../utils/errors.js';
import { fetchPlayPurchase, acknowledgePlayPurchase } from '../../integrations/playPublisherClient.js';


export interface PlayPurchaseSessionDTO {
  planId: string;
  planName: string;
  productId: string;
  obfuscatedAccountId: string;
}
export interface VerifyPlayPurchaseResultDTO {
  status: 'activated' | 'pending';
  isPremium: boolean;
  premiumExpiresAt: string | null;
  premiumPlanId: string | null;
}

const FIRESTORE_ALREADY_EXISTS = 6;
const PENDING_RESULT: VerifyPlayPurchaseResultDTO = {
  status: 'pending',
  isPremium: false,
  premiumExpiresAt: null,
  premiumPlanId: null,
};

export function buildObfuscatedAccountId(uid: string): string {
  return crypto.createHash('sha256').update(`medquel:${uid}`).digest('hex');
}

function paymentDocIdForToken(purchaseToken: string): string {
  return `play_${crypto.createHash('sha256').update(purchaseToken).digest('hex').slice(0, 40)}`;
}

async function assertOnboarded(uid: string, db: Firestore): Promise<void> {
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) throw new NotOnboardedError();
}

async function findPlanByProductId(productId: string, db: Firestore) {
  const snap = await db.collection('plans').where('playProductId', '==', productId).limit(1).get();
  const doc = snap.docs[0];
  if (!doc || doc.data().isActive !== true) throw new PlanNotFoundError();

  return { planId: doc.id, data: doc.data() };
}

async function ensureAcknowledged(paymentRef: FirebaseFirestore.DocumentReference, productId: string, purchaseToken: string): Promise<void> {
  try {
    await acknowledgePlayPurchase(productId, purchaseToken);
    await paymentRef.update({
      playAcknowledged: true,
      updatedAt: Timestamp.now(),
    });
  } catch (err) {
    console.error(`[play] acknowledge not completed for ${paymentRef.id}; it will be retried on the next verify call:`, err);
  }
}


export async function initiatePlayPurchase(uid: string, planId: string, db: Firestore): Promise<PlayPurchaseSessionDTO> {
  checkRateLimit(`initiatePlayPurchase:${uid}`, { limit: 10, windowMs: 60_000 });
  await assertOnboarded(uid, db);

  const planSnap = await db.collection('plans').doc(planId).get();
  const plan = planSnap.data();
  if (!planSnap.exists || !plan || plan.isActive !== true || typeof plan.playProductId !== 'string') {
    throw new PlanNotFoundError();
  }

  return {
    planId: planSnap.id,
    planName: plan.name,
    productId: plan.playProductId,
    obfuscatedAccountId: buildObfuscatedAccountId(uid),
  };
}

export async function verifyPlayPurchase(uid: string, input: ValidatedPlayPurchase, db: Firestore, auth: Auth): Promise<VerifyPlayPurchaseResultDTO> {
  checkRateLimit(`verifyPlayPurchase:${uid}`, { limit: 10, windowMs: 60_000 });
  await assertOnboarded(uid, db);

  const plan = await findPlanByProductId(input.productId, db);
  const paymentId = paymentDocIdForToken(input.purchaseToken);
  const paymentRef = db.collection('payments').doc(paymentId);

  const existing = await paymentRef.get();
  if (existing.exists) {
    const payment = existing.data()!;
    if (payment.userId !== uid) throw new PaymentNotFoundError();
    if (payment.status === 'refunded') throw new PaymentStateError('This purchase has been refunded.');

    if (payment.status === 'captured' && payment.expiresAt instanceof Timestamp) {
      if (payment.playAcknowledged !== true) {
        await ensureAcknowledged(paymentRef, input.productId, input.purchaseToken);
      }

      return {
        status: 'activated',
        isPremium: true,
        premiumExpiresAt: payment.expiresAt.toDate().toISOString(),
        premiumPlanId: payment.planId,
      };
    }
  }

  const purchase = await fetchPlayPurchase(input.purchaseToken);

  const lineItem = purchase.productLineItem?.find((item) => item.productId === input.productId);
  if (!lineItem) throw new PlayPurchaseInvalidError('This purchase does not match the selected plan.');

  const quantity = lineItem.productOfferDetails?.quantity ?? 1;
  if (quantity !== 1) throw new PaymentStateError('Unsupported purchase quantity.');

  const purchaseState = purchase.purchaseStateContext?.purchaseState;
  if (purchaseState === 'PENDING') return PENDING_RESULT;
  if (purchaseState !== 'PURCHASED') {
    throw new PaymentStateError(`Purchase is ${purchaseState ?? 'in an unknown state'}, not completed.`);
  }

  if (purchase.obfuscatedExternalAccountId !== buildObfuscatedAccountId(uid)) {
    console.warn(`[play] account binding mismatch for ${paymentId} (uid ${uid}).`);
    throw new PaymentStateError('This purchase does not belong to this account.');
  }

  const now = Timestamp.now();
  const googleOrderId = purchase.orderId ?? paymentId;
  try {
    await paymentRef.create({
      orderId: paymentId,
      userId: uid,
      planId: plan.planId,
      planName: plan.data.name,
      provider: 'play',
      amountPaise: plan.data.pricePaise,
      currency: plan.data.currency ?? 'INR',
      durationDays: plan.data.durationDays,
      status: 'created',
      paymentId: googleOrderId,
      playOrderId: googleOrderId,
      playProductId: input.productId,
      purchaseToken: input.purchaseToken,
      isTestPurchase: purchase.testPurchaseContext !== undefined,
      playAcknowledged: purchase.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    if ((err as { code?: number }).code !== FIRESTORE_ALREADY_EXISTS) throw err;
  }

  const fresh = (await paymentRef.get()).data();
  if (!fresh || fresh.userId !== uid) throw new PaymentNotFoundError();

  const activation = await activatePremium(
    { orderId: paymentId, paymentId: googleOrderId, source: 'play' },
    db,
    auth
  );

  if (fresh.playAcknowledged !== true && purchase.acknowledgementState !== 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED') {
    await ensureAcknowledged(paymentRef, input.productId, input.purchaseToken);
  }

  return {
    status: 'activated',
    isPremium: true,
    premiumExpiresAt: activation.premiumExpiresAt.toISOString(),
    premiumPlanId: activation.planId,
  };
}
