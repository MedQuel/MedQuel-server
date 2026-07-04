import { meResolver } from './user.js';
import type { GraphQLContext } from '../context.js';
import { completeOnboardingResolver } from './onboarding.js';


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
  },
};
