import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import { startQuizSession } from '../../services/quizService.js';
import { validateStartQuizSessionInput } from '../../services/quizValidation.js';
import { getContest, getContests, assertContestExists, type GetContestsFilter } from '../../services/contestService.js';


export async function getContestsResolver(
  _parent: unknown,
  args: { filter?: GetContestsFilter },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();
  return getContests(args.filter ?? {}, context.db);
}


export async function getContestResolver(
  _parent: unknown,
  args: { contestId: string },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();
  return getContest(args.contestId, context.db);
}


export async function joinContestResolver(
  _parent: unknown,
  args: { contestId: string },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();

  const { contestType } = await assertContestExists(args.contestId, context.db);
  const quizType = contestType === 'daily' ? 'daily' : 'contest'; // "live"/"weekly" both use "contest"

  const validated = validateStartQuizSessionInput({ quizType, contestId: args.contestId });

  return startQuizSession(validated, context);
}
