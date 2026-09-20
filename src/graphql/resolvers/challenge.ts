import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import { createChallenge, respondChallenge } from '../../services/challengeService.js';
import { getChallenge, getChallenges, type GetChallengesFilter } from '../../services/challengeService.js';
import { validateCreateChallengeInput, type CreateChallengeInput } from '../../validators/challengeValidation.js';


export async function createChallengeResolver(_parent: unknown, args: { input: CreateChallengeInput }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  const validated = validateCreateChallengeInput(args.input);

  return createChallenge(
    context.user.uid,
    validated,
    context.db
  );
}

export async function respondChallengeResolver(
  _parent: unknown,
  args: { challengeId: string; accept: boolean },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();
  return respondChallenge(
    context.user.uid,
    args.challengeId,
    args.accept,
    context.db,
    context.bigqueryService
  );
}

export async function getChallengeResolver(_parent: unknown, args: { challengeId: string }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return getChallenge(
    context.user.uid,
    args.challengeId,
    context.db
  );
}

export async function getChallengesResolver(_parent: unknown, args: { filter?: GetChallengesFilter }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return getChallenges(
    context.user.uid,
    args.filter ?? {},
    context.db
  );
}
