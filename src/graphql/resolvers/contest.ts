import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import { startQuizSession } from '../../services/quizService.js';
import { validateStartQuizSessionInput } from '../../services/quizValidation.js';
import { getContest, getContests, assertContestExists } from '../../services/contestService.js';
import { getPersonalizedContests, type GetContestsFilter } from '../../services/contestService.js';


export async function getContestResolver(_parent: unknown, args: { contestId: string }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return getContest(args.contestId, context.db);
}

export async function getContestsResolver(
  _parent: unknown,
  args: { filter?: GetContestsFilter & { personalized?: boolean } },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();

  const { personalized, ...filter } = args.filter ?? {};

  if (personalized && !filter.subject) {
    const userDoc = await context.db.collection('users').doc(context.user.uid).get();
    const userData = userDoc.data();
    const focusSubjects: string[] = userData?.contentScope === 'focused'
      ? (userData?.focusSubjects ?? [])
      : [];

    if (focusSubjects.length > 0) {
      return getPersonalizedContests(filter, focusSubjects, context.db);
    }
  }

  return getContests(filter, context.db);
}

export async function joinContestResolver(_parent: unknown, args: { contestId: string }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();

  const { contestType } = await assertContestExists(args.contestId, context.db);
  const quizType = contestType === 'daily' ? 'daily' : 'contest';

  const validated = validateStartQuizSessionInput({
    quizType,
    contestId: args.contestId,
  });

  return startQuizSession(validated, context);
}
