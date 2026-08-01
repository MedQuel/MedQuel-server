import type { GraphQLContext } from '../context.js';
import { completeOnboardingResolver } from './onboarding.js';
import { meResolver, updateProfileResolver } from './user.js';
import { startQuizSessionResolver, submitQuizSessionResolver, getTopicsForSubjectResolver } from './quiz.js';


export const resolvers = {
  Query: {
    ping: (): string => 'pong',
    me: meResolver,
    getTopicsForSubject: getTopicsForSubjectResolver,
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
  },
};
