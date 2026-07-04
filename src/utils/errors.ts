import { GraphQLError } from 'graphql';

/**
 * Throw this from any resolver when context.user is null but the
 * operation requires a signed-in user.
 */
export class AuthenticationError extends GraphQLError {
  constructor(message = 'You must be signed in to do this.') {
    super(message, {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}

/**
 * Throw this when the user is signed in, but isn't allowed to do
 * this specific thing (e.g. non-premium user joining a premium contest,
 * non-admin calling an admin mutation).
 */
export class ForbiddenError extends GraphQLError {
  constructor(message = 'You do not have permission to do this.') {
    super(message, {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

/**
 * Throw this when the user is signed in, but hasn't completed onboarding yet.
 */
export class NotOnboardedError extends GraphQLError {
  constructor(message = 'You must complete onboarding to do this.') {
    super(message, {
      extensions: { code: 'NOT_ONBOARDED' },
    });
  }
}
