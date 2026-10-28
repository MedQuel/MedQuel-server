import crypto from 'node:crypto';
import type Razorpay from 'razorpay';
import type { Auth } from 'firebase-admin/auth';
import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';

import { isPremiumActive } from '../utils/premium.js';
import { checkRateLimit } from '../middleware/rateLimiter.js';
import { activatePremium } from './payment/activatePremium.js';
import { getRazorpayKeySecret } from './payment/razorpayClient.js';
import type { ValidatedVerifyPayment } from '../validators/paymentValidation.js';
import { PaymentStateError, InvalidPaymentSignatureError } from '../utils/errors.js';
import { NotOnboardedError, PlanNotFoundError, PaymentNotFoundError } from '../utils/errors.js';


export interface PlanDTO {
  planId: string;
  name: string;
  tagline: string | null;
  badge: string | null;
  durationDays: number;
  pricePaise: number;
  currency: string;
  features: string[];
  sortOrder: number;
}
export interface PaymentOrderDTO {
  orderId: string;
  keyId: string;
  amount: number;
  currency: string;
  planId: string;
  planName: string;
  prefillName: string | null;
  prefillEmail: string | null;
}
export interface VerifyPaymentResultDTO {
  status: 'activated' | 'pending';
  isPremium: boolean;
  premiumExpiresAt: string | null;
  premiumPlanId: string | null;
}
export interface PaymentStatusDTO {
  orderId: string;
  status: string;
  planId: string;
  isPremium: boolean;
  premiumExpiresAt: string | null;
}

function mapPlanDoc(id: string, data: FirebaseFirestore.DocumentData): PlanDTO {
  return {
    planId: id,
    name: data.name,
    tagline: data.tagline ?? null,
    badge: data.badge ?? null,
    durationDays: data.durationDays,
    pricePaise: data.pricePaise,
    currency: data.currency ?? 'INR',
    features: data.features ?? [],
    sortOrder: data.sortOrder ?? 0,
  };
}

function signaturesMatch(expectedHex: string, receivedHex: string): boolean {
  const expected = Buffer.from(expectedHex, 'hex');
  const received = Buffer.from(receivedHex, 'hex');

  return (expected.length === received.length && crypto.timingSafeEqual(expected, received));
}


export async function getPlans(db: Firestore): Promise<PlanDTO[]> {
  const snap = await db.collection('plans').where('isActive', '==', true).get();

  return snap.docs
    .map((doc) => mapPlanDoc(doc.id, doc.data()))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function initiatePayment(
  uid: string,
  planId: string,
  db: Firestore,
  razorpay: Razorpay,
  keyId: string
): Promise<PaymentOrderDTO> {
  checkRateLimit(`initiatePayment:${uid}`, { limit: 5, windowMs: 60_000 });

  const [userSnap, planSnap] = await Promise.all([
    db.collection('users').doc(uid).get(),
    db.collection('plans').doc(planId).get(),
  ]);
  if (!userSnap.exists) throw new NotOnboardedError();
  if (!planSnap.exists || planSnap.data()!.isActive !== true) throw new PlanNotFoundError();

  const user = userSnap.data()!;
  const plan = mapPlanDoc(planSnap.id, planSnap.data()!);

  const order = await razorpay.orders.create({
    amount: plan.pricePaise,
    currency: plan.currency,
    receipt: `mq_${Date.now().toString(36)}_${uid.slice(0, 8)}`,
    notes: { userId: uid, planId: plan.planId },
  });

  const now = Timestamp.now();
  await db.collection('payments').doc(order.id).set({
    orderId: order.id,
    userId: uid,
    planId: plan.planId,
    planName: plan.name,
    provider: 'razorpay',
    amountPaise: plan.pricePaise,
    currency: plan.currency,
    durationDays: plan.durationDays,
    status: 'created',
    paymentId: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    orderId: order.id,
    keyId,
    amount: plan.pricePaise,
    currency: plan.currency,
    planId: plan.planId,
    planName: plan.name,
    prefillName: user.displayName ?? null,
    prefillEmail: user.email ?? null,
  };
}

export async function verifyPayment(
  uid: string,
  input: ValidatedVerifyPayment,
  db: Firestore,
  auth: Auth,
  razorpay: Razorpay
): Promise<VerifyPaymentResultDTO> {
  checkRateLimit(`verifyPayment:${uid}`, { limit: 10, windowMs: 60_000 });

  const paymentRef = db.collection('payments').doc(input.orderId);
  const paymentSnap = await paymentRef.get();
  if (!paymentSnap.exists || paymentSnap.data()!.userId !== uid) throw new PaymentNotFoundError();

  const payment = paymentSnap.data()!;

  const expectedSignature = crypto
    .createHmac('sha256', getRazorpayKeySecret())
    .update(`${input.orderId}|${input.paymentId}`)
    .digest('hex');
  if (!signaturesMatch(expectedSignature, input.signature)) {
    console.warn(`[payment] Invalid signature for order ${input.orderId} (uid ${uid}).`);
    throw new InvalidPaymentSignatureError();
  }

  if (payment.status !== 'captured') {
    const rzpPayment = await razorpay.payments.fetch(input.paymentId);
    if (rzpPayment.order_id !== input.orderId) throw new InvalidPaymentSignatureError();
    if (Number(rzpPayment.amount) !== payment.amountPaise || rzpPayment.currency !== payment.currency) {
      throw new PaymentStateError('Paid amount does not match the order.');
    }

    if (rzpPayment.status !== 'captured') {
      if (rzpPayment.status === 'authorized') {
        return {
          status: 'pending',
          isPremium: false,
          premiumExpiresAt: null,
          premiumPlanId: null,
        };
      }

      throw new PaymentStateError(`Payment is ${rzpPayment.status}, not completed.`);
    }
  }

  const activation = await activatePremium(
    { orderId: input.orderId, paymentId: input.paymentId, source: 'verify' },
    db,
    auth
  );

  return {
    status: 'activated',
    isPremium: true,
    premiumExpiresAt: activation.premiumExpiresAt.toISOString(),
    premiumPlanId: activation.planId,
  };
}

export async function getPaymentStatus(uid: string, orderId: string, db: Firestore): Promise<PaymentStatusDTO> {
  const [paymentSnap, userSnap] = await Promise.all([
    db.collection('payments').doc(orderId).get(),
    db.collection('users').doc(uid).get(),
  ]);
  if (!paymentSnap.exists || paymentSnap.data()!.userId !== uid) throw new PaymentNotFoundError();

  const user = userSnap.data();
  const payment = paymentSnap.data()!;
  const active = isPremiumActive(user);

  return {
    orderId,
    status: payment.status,
    planId: payment.planId,
    isPremium: active,
    premiumExpiresAt: active && user?.premiumExpiresAt instanceof Timestamp
      ? user.premiumExpiresAt.toDate().toISOString()
      : null,
  };
}
