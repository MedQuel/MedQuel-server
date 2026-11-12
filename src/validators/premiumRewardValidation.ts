import { GraphQLError } from 'graphql';


const MAX_ACK_BADGE_IDS = 60;
const BADGE_ID_PATTERN = /^[a-z0-9_]{1,60}$/;

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}

export function validateAcknowledgeBadgeIds(badgeIds: string[]): string[] {
  if (!Array.isArray(badgeIds) || badgeIds.length === 0) badInput('badgeIds must be a non-empty array.');
  if (badgeIds.length > MAX_ACK_BADGE_IDS) badInput(`badgeIds allows at most ${MAX_ACK_BADGE_IDS} values.`);

  const deduped = Array.from(new Set(badgeIds.map((id) => id?.trim())));
  for (const id of deduped) {
    if (!id || !BADGE_ID_PATTERN.test(id)) badInput(`Invalid badge id: "${id}".`);
  }

  return deduped;
}
