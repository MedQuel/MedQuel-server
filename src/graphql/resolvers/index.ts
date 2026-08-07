import type { GraphQLContext } from '../context.js';
import { getLeaderboardResolver } from './leaderboard.js';
import { completeOnboardingResolver } from './onboarding.js';
import { meResolver, updateProfileResolver } from './user.js';
import { startQuizSessionResolver, submitQuizSessionResolver } from './quiz.js';
import { getQuizSessionResolver, getTopicsForSubjectResolver } from './quiz.js';
import { getContestsResolver, getContestResolver, joinContestResolver } from './contest.js';


export const resolvers = {
  Query: {
    ping: (): string => 'pong',
    me: meResolver,
    getTopicsForSubject: getTopicsForSubjectResolver,
    getQuizSession: getQuizSessionResolver,
    getLeaderboard: getLeaderboardResolver,
    getContests: getContestsResolver,
    getContest: getContestResolver,
  },
  Mutation: {
    completeOnboarding: (
      parent: unknown,
      args: Parameters<typeof completeOnboardingResolver>[1],
      context: GraphQLContext
    ) => completeOnboardingResolver(parent, args, context, context.db),
    updateProfile: updateProfileResolver,
    startQuizSession: startQuizSessionResolver,
    submitQuizSession: submitQuizSessionResolver,
    joinContest: joinContestResolver,
  },
};
