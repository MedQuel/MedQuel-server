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

/**
 * Throw when a user tries to regenerate their study plan before the 24-hour cooldown has elapsed.
 */
export class StudyPlanRegenerationCooldownError extends GraphQLError {
  constructor(remainingHours: number) {
    super(`You can regenerate your study plan again in ${remainingHours} hours${remainingHours}.`, {
      extensions: { code: 'FAILED_PRECONDITION' },
    });
  }
}

/**
 * Throw when a study plan session doesn't exist or isn't part of the user's current week.
 */
export class StudyPlanSessionNotFoundError extends GraphQLError {
  constructor(message = 'This study plan session was not found in your current week.') {
    super(message, { extensions: { code: 'NOT_FOUND' } });
  }
}

/**
 * Throw when a study plan session has already been completed and the user tries to complete it again.
 */
export class StudyPlanSessionAlreadyCompletedError extends GraphQLError {
  constructor(message = 'This study plan session has already been completed.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when a quiz session is submitted with a study plan link that doesn't match the current study plan session.
 */
export class InvalidStudyPlanLinkError extends GraphQLError {
  constructor(message = 'The referenced quiz session does not match this study plan session.') {
    super(message, { extensions: { code: 'BAD_USER_INPUT' } });
  }
}

/**
 * Throw when a challenge doesn't exist or isn't accessible.
 */
export class ChallengeNotFoundError extends GraphQLError {
  constructor(message = 'Challenge not found.') {
    super(message, { extensions: { code: 'NOT_FOUND' } });
  }
}

/**
 * Throw when a user tries to challenge themselves.
 */
export class SelfChallengeError extends GraphQLError {
  constructor(message = 'You cannot challenge yourself.') {
    super(message, { extensions: { code: 'BAD_USER_INPUT' } });
  }
}

/**
 * Throw when a user tries to challenge another user while they already have a pending challenge with that user.
 */
export class DuplicatePendingChallengeError extends GraphQLError {
  constructor(message = 'You already have a pending challenge with this user.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when a user tries to respond to a challenge they are not a participant in.
 */
export class NotChallengeParticipantError extends GraphQLError {
  constructor(message = 'You are not a participant in this challenge.') {
    super(message, { extensions: { code: 'FORBIDDEN' } });
  }
}

/**
 * Throw when a user tries to respond to a challenge they have already responded to.
 */
export class ChallengeAlreadyRespondedError extends GraphQLError {
  constructor(message = 'You have already responded to this challenge.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when a user tries to respond to a challenge that is no longer pending (e.g. already accepted, declined, or expired).
 */
export class ChallengeNotPendingError extends GraphQLError {
  constructor(message = 'This challenge is no longer pending.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when a user tries to respond to a challenge that has expired.
 */
export class ChallengeExpiredError extends GraphQLError {
  constructor(message = 'This challenge invite has expired.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when a user tries to start a challenge session that is not yet active
 * (e.g. the invite has not been accepted yet).
 */
export class ChallengeNotActiveError extends GraphQLError {
  constructor(message = 'This challenge is not active yet, the invite must be accepted first.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when a user tries to start a challenge session that has already been started.
 */
export class ChallengeSessionAlreadyStartedError extends GraphQLError {
  constructor(message = 'You have already started your attempt for this challenge.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when a notification is not found.
 */
export class NotificationNotFoundError extends GraphQLError {
  constructor(message = 'Notification not found.') {
    super(message, { extensions: { code: 'NOT_FOUND' } });
  }
}

/**
 * Throw when a plan doesn't exist or isn't active.
 */
export class PlanNotFoundError extends GraphQLError {
  constructor(message = 'This plan is not available.') {
    super(message, { extensions: { code: 'NOT_FOUND' } });
  }
}

/**
 * Throw when a payments/{orderId} doc doesn't exist or doesn't belong to the caller.
 */
export class PaymentNotFoundError extends GraphQLError {
  constructor(message = 'Payment not found.') {
    super(message, { extensions: { code: 'NOT_FOUND' } });
  }
}

/**
 * Throw when the Razorpay checkout signature doesn't match.
 */
export class InvalidPaymentSignatureError extends GraphQLError {
  constructor(message = 'Payment verification failed.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when a payment is in a state that can't be activated (refunded, amount mismatch, not captured).
 */
export class PaymentStateError extends GraphQLError {
  constructor(message = 'This payment cannot be completed.') {
    super(message, { extensions: { code: 'FAILED_PRECONDITION' } });
  }
}

/**
 * Throw when the caller already has the maximum number of friends and tries to add another.
 */
export class FriendListFullError extends GraphQLError {
  constructor(limit: number) {
    super(`Your friend list is full (${limit} friends). Remove a friend to add someone new.`, {
      extensions: { code: 'FRIEND_LIST_FULL' },
    });
  }
}

/**
 * Throw when the OTHER person's friend list is full. The sender is told, so they are not left waiting for a request that can never be accepted.
 */
export class TargetFriendListFullError extends GraphQLError {
  constructor(message = "This user's friend list is full, so they can't accept new friends right now.") {
    super(message, { extensions: { code: 'TARGET_FRIEND_LIST_FULL' } });
  }
}
