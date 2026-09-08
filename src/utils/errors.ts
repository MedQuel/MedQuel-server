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

/**
 * Throw when a quizSessions/{sessionId} doc doesn't exist, or exists but
 * doesn't belong to the calling user.
 */
export class SessionNotFoundError extends GraphQLError {
  constructor(message = 'Quiz session not found.') {
    super(message, {
      extensions: { code: 'NOT_FOUND' },
    });
  }
}

/**
 * Throw from submitQuizSession when the session's status isn't "in_progress",
 * covers both legitimate double-submits (retry storms) and someone replaying an old sessionId.
 */
export class SessionAlreadyCompletedError extends GraphQLError {
  constructor(message = 'This quiz session has already been submitted.') {
    super(message, {
      extensions: { code: 'FAILED_PRECONDITION' },
    });
  }
}

/**
 * Throw when a submitted answer references a questionId that was never
 * part of this session's frozen questionIds list.
 */
export class InvalidAnswerError extends GraphQLError {
  constructor(message = 'One or more answers reference a question not in this session.') {
    super(message, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
}

/**
 * Throw when a contest doesn't exist or isn't accessible.
 */
export class ContestNotFoundError extends GraphQLError {
  constructor(message = 'Contest not found.') {
    super(message, { extensions: { code: 'NOT_FOUND' } });
  }
}

/**
 * Throw when a contest exists but isn't currently active (e.g. not started yet, or already ended).
 */
export class ContestNotActiveError extends GraphQLError {
  constructor(message = 'This contest is not currently active.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when a contest exists but the user isn't allowed to join it
 * (e.g. non-premium user trying to join a premium contest).
 */
export class InsufficientQuestionsError extends GraphQLError {
  constructor(message = 'Not enough questions are available to start this session.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when a user exceeds the rate limit for a given operation.
 */
export class RateLimitExceededError extends GraphQLError {
  constructor(message = 'Too many requests. Please slow down.') {
    super(message, { extensions: { code: 'RATE_LIMITED' } });
  }
}

/**
 * Throw when a feature is intentionally not built yet.
 * Distinct from ForbiddenError — this isn't a permissions problem, it's "this doesn't exist yet."
 */
export class NotImplementedError extends GraphQLError {
  constructor(message = 'This feature is not implemented yet.') {
    super(message, { extensions: { code: 'NOT_IMPLEMENTED' } });
  }
}

/**
 * Throw when a friend/user lookup target doesn't exist or hasn't onboarded.
 * Distinct from NotOnboardedError, which is about the caller's own account.
 */
export class UserNotFoundError extends GraphQLError {
  constructor(message = 'User not found.') {
    super(message, { extensions: { code: 'NOT_FOUND' } });
  }
}

/**
 * Throw when a user tries to send a friend request to themselves.
 */
export class SelfFriendRequestError extends GraphQLError {
  constructor(message = 'You cannot send a friend request to yourself.') {
    super(message, { extensions: { code: 'BAD_USER_INPUT' } });
  }
}

/**
 * Throw when the two users are already friends.
 */
export class AlreadyFriendsError extends GraphQLError {
  constructor(message = 'You are already friends with this user.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when a pending friend request already exists between these two users.
 */
export class DuplicateFriendRequestError extends GraphQLError {
  constructor(message = 'A friend request is already pending with this user.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when re-sending a request too soon after the recipient declined it.
 */
export class FriendRequestCooldownError extends GraphQLError {
  constructor(remainingDays: number) {
    super(`This user declined your last request. You can send another in ${remainingDays} days.`, {
      extensions: { code: 'FAILED_PRECONDITION' }
    });
  }
}

/**
 * Throw when a friendRequests/{id} doc doesn't exist, isn't pending, or the
 * caller isn't its recipient. Intentionally generic — don't leak which case it was.
 */
export class FriendRequestNotFoundError extends GraphQLError {
  constructor(message = 'Friend request not found.') {
    super(message, { extensions: { code: 'NOT_FOUND' } });
  }
}

/**
 * Throw from removeFriend when the two users aren't currently friends.
 */
export class NotFriendsError extends GraphQLError {
  constructor(message = 'You are not friends with this user.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}
