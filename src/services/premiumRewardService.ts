import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import { NotOnboardedError } from '../utils/errors.js';
import { checkRateLimit } from '../middleware/rateLimiter.js';
import { isPremiumActive, getPremiumExpiryMs } from '../utils/premium.js';


export interface PremiumRewardBadgeDTO {
  badgeId: string;
  name: string;
  iconKey: string;
  variant: string;
  rarity: string;
  days: number;
}
export interface PendingPremiumRewardDTO {
  totalDays: number;
  premiumExpiresAt: string | null;
  premiumActive: boolean;
  badges: PremiumRewardBadgeDTO[];
}

export function mapPendingPremiumReward(
  userData: FirebaseFirestore.DocumentData | undefined,
  nowMs: number = Date.now()
): PendingPremiumRewardDTO | null {
  const raw = userData?.pendingPremiumRewards;
  if (!raw || typeof raw !== 'object') return null;

  const entries: Array<PremiumRewardBadgeDTO & { grantedAtMs: number }> = [];
  for (const [badgeId, value] of Object.entries(raw as Record<string, unknown>)) {
    const v = value as Record<string, unknown> | null;
    if (!v || typeof v !== 'object') continue;

    const days = v.days;
    if (typeof days !== 'number' || !Number.isInteger(days) || days <= 0) continue;
    if (typeof v.name !== 'string' || typeof v.iconKey !== 'string') continue;

    entries.push({
      badgeId,
      name: v.name,
      iconKey: v.iconKey,
      variant: typeof v.variant === 'string' ? v.variant : 'gold',
      rarity: typeof v.rarity === 'string' ? v.rarity : 'Common',
      days,
      grantedAtMs: v.grantedAt instanceof Timestamp ? v.grantedAt.toMillis() : 0,
    });
  }
  if (entries.length === 0) return null;

  entries.sort((a, b) => a.grantedAtMs - b.grantedAtMs);
  const expiryMs = getPremiumExpiryMs(userData);

  return {
    totalDays: entries.reduce((sum, e) => sum+e.days, 0),
    premiumExpiresAt: expiryMs !== null ? new Date(expiryMs).toISOString() : null,
    premiumActive: isPremiumActive(userData, nowMs),
    badges: entries.map(({ grantedAtMs: _ignored, ...badge }) => badge),
  };
}

export async function getPendingPremiumReward(uid: string, db: Firestore): Promise<PendingPremiumRewardDTO | null> {
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) throw new NotOnboardedError();

  return mapPendingPremiumReward(snap.data());
}

export async function acknowledgePremiumReward(uid: string, badgeIds: string[], db: Firestore): Promise<boolean> {
  checkRateLimit(`ackPremiumReward:${uid}`, { limit: 10, windowMs: 60_000 });

  const updates: Record<string, FieldValue> = {};
  for (const id of badgeIds) {
    updates[`pendingPremiumRewards.${id}`] = FieldValue.delete();
  }

  try {
    await db.collection('users').doc(uid).update(updates);
  } catch (err) {
    if ((err as { code?: number }).code === 5) throw new NotOnboardedError();
    throw err;
  }

  return true;
}
