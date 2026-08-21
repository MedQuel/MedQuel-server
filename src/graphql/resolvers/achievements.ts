import type { GraphQLContext } from '../context.js';
import { AuthenticationError, NotOnboardedError } from '../../utils/errors.js';


interface BadgeDoc {
  badgeId: string;
  name: string;
  description: string;
  iconKey: string;
  variant: string;
  rarity: string;
  category: string;
  requirementType: 'threshold' | 'arrayLength' | 'boolean';
  requirementField: string;
  requirementValue: number;
  isActive: boolean;
}

function getFieldValue(data: FirebaseFirestore.DocumentData, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, data);
}

function liveProgress(userData: FirebaseFirestore.DocumentData, badge: BadgeDoc): number {
  const raw = getFieldValue(userData, badge.requirementField);
  if (badge.requirementType === 'arrayLength') return Array.isArray(raw) ? raw.length : 0;
  if (badge.requirementType === 'boolean') return raw === true ? 1 : 0;

  return typeof raw === 'number' ? raw : 0;
}


export async function getAchievementsResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();

  const uid = context.user.uid;
  const userDoc = await context.db.collection('users').doc(uid).get();
  if (!userDoc.exists) throw new NotOnboardedError();

  const userData = userDoc.data()!;
  const earnedSet = new Set<string>(userData.badges ?? []);
  const badgeProgress: Record<string, number> = userData.badgeProgress ?? {};
  const badgeEarnedAt: Record<string, FirebaseFirestore.Timestamp> = userData.badgeEarnedAt ?? {};

  const badgesSnap = await context.db.collection('badges').where('isActive', '==', true).get();
  const badges = badgesSnap.docs.map((d) => d.data() as BadgeDoc);

  const results = badges.map((badge) => {
    const isEarned = earnedSet.has(badge.badgeId);
    const currentProgress = isEarned
      ? badge.requirementValue
      : (badgeProgress[badge.badgeId] ?? liveProgress(userData, badge));

    const status = isEarned
      ? 'earned'
      : currentProgress > 0 ? 'in_progress' : 'locked';

    return {
      badgeId: badge.badgeId,
      name: badge.name,
      description: badge.description,
      iconKey: badge.iconKey,
      variant: badge.variant,
      rarity: badge.rarity,
      category: badge.category,
      requirementValue: badge.requirementValue,
      currentProgress: Math.min(currentProgress, badge.requirementValue),
      status,
      earnedAt: badgeEarnedAt[badge.badgeId]?.toDate?.().toISOString() ?? null,
    };
  });

  return results.sort((a, b) => {
    const rank = (s: string) => s === 'earned' ? 0 : s === 'in_progress' ? 1 : 2;
    if (rank(a.status) !== rank(b.status))
      return rank(a.status) - rank(b.status);
    if (a.status === 'earned')
      return (b.earnedAt ?? '').localeCompare(a.earnedAt ?? '');
    if (a.status === 'in_progress')
      return (b.currentProgress/b.requirementValue - a.currentProgress/a.requirementValue);

    return a.category.localeCompare(b.category);
  });
}
