import { Timestamp } from 'firebase-admin/firestore';


export function getPremiumExpiryMs(userData: FirebaseFirestore.DocumentData | undefined): number | null {
  const expiresAt = userData?.premiumExpiresAt;
  return expiresAt instanceof Timestamp ? expiresAt.toMillis() : null;
}

// Single source of truth for "is this user premium right now?".
export function isPremiumActive(
  userData: FirebaseFirestore.DocumentData | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!userData || userData.isPremium !== true) return false;

  const expiryMs = getPremiumExpiryMs(userData);
  return expiryMs !== null && expiryMs > nowMs;
}
