import type { GraphQLContext } from '../context.js';
import { startQuizSessionResolver } from './quiz.js';
import { completeOnboardingResolver } from './onboarding.js';
import { meResolver, updateProfileResolver } from './user.js';


export const resolvers = {
  Query: {
    ping: (): string => 'pong',
    me: meResolver,
  },
  Mutation: {
    completeOnboarding: (
      parent: unknown,
      args: Parameters<typeof completeOnboardingResolver>[1],
      context: GraphQLContext
    ) => completeOnboardingResolver(parent, args, context, context.db),
    updateProfile: updateProfileResolver,
    startQuizSession: startQuizSessionResolver,
  },
};
