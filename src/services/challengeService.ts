import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore, Query } from 'firebase-admin/firestore';

import type { BigQueryService } from './bigqueryService.js';
import { publishNotification } from '../pubsub/publisher.js';
import { checkRateLimit } from '../middleware/rateLimiter.js';
import { computeChallengeRewards } from './challenge/challengeRewards.js';
import type { ValidatedCreateChallenge } from '../validators/challengeValidation.js';
import type { ChallengeDocument, ParticipantState } from '../types/challengeTypes.js';

import { isPremiumActive } from '../utils/premium.js';
import { NotFriendsError, UserNotFoundError, SelfChallengeError } from '../utils/errors.js';
import { ChallengeNotPendingError, DuplicatePendingChallengeError } from '../utils/errors.js';
import { InsufficientQuestionsError, ChallengeAlreadyRespondedError } from '../utils/errors.js';
import { ChallengeExpiredError, ChallengeNotFoundError, NotChallengeParticipantError } from '../utils/errors.js';


const INVITE_EXPIRY_MS = 48 * 60*60*1000;
const DEFAULT_CHALLENGES_LIMIT = 20;
const MAX_CHALLENGES_LIMIT = 50;

export interface GetChallengesFilter {
  status?: string | null;
  limit?: number | null;
}

function mapChallengeDoc(id: string, data: FirebaseFirestore.DocumentData) {
  const participantStates = Object.entries(
    data.participantStatus as Record<string, any>
  ).map(([uid, state]) => ({
    uid,
    status: state.status,
    respondedAt: state.respondedAt ? (state.respondedAt as Timestamp).toDate().toISOString() : null,
    score: state.score ?? null,
    correctCount: state.correctCount ?? null,
    quizSessionId: state.quizSessionId ?? null,
    completedAt: state.completedAt ? (state.completedAt as Timestamp).toDate().toISOString() : null,
  }));

  const isStalePending = data.status === 'pending' && (data.expiresAt as Timestamp).toMillis() <= Date.now();
  const effectiveStatus = isStalePending ? 'expired' : data.status;

  return {
    challengeId: id,
    createdBy: data.createdBy,
    participants: data.participants,
    participantStates,
    subject: data.subject,
    difficulty: data.difficulty,
    questionCount: data.questionCount,
    timeLimitSecs: data.timeLimitSecs,
    status: effectiveStatus,
    winnerUid: data.winnerUid ?? null,
    rewards: data.rewards,
    expiresAt: (data.expiresAt as Timestamp).toDate().toISOString(),
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
  };
}

async function assertOnboarded(uid: string, db: Firestore): Promise<FirebaseFirestore.DocumentData> {
  const doc = await db.collection('users').doc(uid).get();
  if (!doc.exists) throw new UserNotFoundError();

  return doc.data()!;
}

async function assertFriends(callerUid: string, targetUid: string, db: Firestore): Promise<void> {
  const friendDoc = await db.collection('users').doc(callerUid).collection('friends').doc(targetUid).get();

  if (!friendDoc.exists) throw new NotFriendsError('You can only challenge a friend.');
}

async function hasBlockingPendingChallenge(callerUid: string, targetUid: string, db: Firestore): Promise<boolean> {
  const snap = await db
    .collection('challenges')
    .where('participants', 'array-contains', callerUid)
    .where('status', '==', 'pending')
    .get();

  const now = Date.now();

  return snap.docs.some((doc) => {
    const data = doc.data();
    return (data.participants.includes(targetUid) && (data.expiresAt as Timestamp).toMillis() > now);
  });
}


export async function createChallenge(callerUid: string, input: ValidatedCreateChallenge, db: Firestore) {
  if (input.toUid === callerUid) throw new SelfChallengeError();

  const callerData = await assertOnboarded(callerUid, db);
  await assertOnboarded(input.toUid, db);
  await assertFriends(callerUid, input.toUid, db);

  checkRateLimit(`createChallenge:${callerUid}`, { limit: 15, windowMs: 60*60*1000 });

  if (await hasBlockingPendingChallenge(callerUid, input.toUid, db)) {
    throw new DuplicatePendingChallengeError();
  }

  const now = Timestamp.now();
  const rewards = computeChallengeRewards(input.difficulty, input.questionCount);
  const ref = db.collection('challenges').doc();

  const participantStatus: Record<string, ParticipantState> = {
    [callerUid]: {
      status: 'accepted',
      respondedAt: now,
      score: null,
      correctCount: null,
      quizSessionId: null,
      completedAt: null,
    },
    [input.toUid]: {
      status: 'invited',
      respondedAt: null,
      score: null,
      correctCount: null,
      quizSessionId: null,
      completedAt: null,
    },
  };

  const doc: Omit<ChallengeDocument, 'challengeId'> = {
    createdBy: callerUid,
    participants: [callerUid, input.toUid],
    participantStatus,
    subject: input.subject,
    difficulty: input.difficulty,
    questionCount: input.questionCount,
    timeLimitSecs: input.timeLimitSecs,
    questionIds: null,
    status: 'pending',
    winnerUid: null,
    rewards,
    expiresAt: Timestamp.fromMillis(now.toMillis() + INVITE_EXPIRY_MS),
    createdAt: now,
    updatedAt: now,
  };
  await ref.set({ ...doc, challengeId: ref.id });

  await publishNotification({
    userId: input.toUid,
    type: 'challenge',
    kind: 'challenge_invite',
    title: 'New challenge!',
    body: `${callerData.displayName ?? 'A friend'} challenged you to a ${input.difficulty} ${input.subject} quiz.`,
    data: { challengeId: ref.id, fromUid: callerUid, actorName: callerData.displayName ?? '', subject: input.subject },
    dedupeKey: `chInvite_${ref.id}`,
  });

  return mapChallengeDoc(ref.id, { ...doc, challengeId: ref.id });
}

export async function respondChallenge(
  callerUid: string,
  challengeId: string,
  accept: boolean,
  db: Firestore,
  bigqueryService: BigQueryService
) {
  const ref = db.collection('challenges').doc(challengeId);
  const snap = await ref.get();
  if (!snap.exists) throw new ChallengeNotFoundError();

  const data = snap.data()!;
  if (!data.participants.includes(callerUid)) throw new NotChallengeParticipantError();

  const myState = data.participantStatus[callerUid];
  if (myState.status !== 'invited') throw new ChallengeAlreadyRespondedError();
  if (data.status !== 'pending') throw new ChallengeNotPendingError();

  const now = Timestamp.now();
  if ((data.expiresAt as Timestamp).toMillis() < now.toMillis()) {
    await ref.update({ status: 'expired', updatedAt: now });
    throw new ChallengeExpiredError();
  }

  if (!accept) {
    await ref.update({
      [`participantStatus.${callerUid}.status`]: 'declined',
      [`participantStatus.${callerUid}.respondedAt`]: now,
      status: 'declined',
      updatedAt: now,
    });

    const invitee = await assertOnboarded(callerUid, db);
    await publishNotification({
      userId: data.createdBy,
      type: 'challenge',
      kind: 'challenge_declined',
      title: 'Challenge declined',
      body: `${invitee.displayName ?? 'Your friend'} declined your ${data.subject} challenge.`,
      data: { challengeId, actorName: invitee.displayName ?? '', subject: data.subject },
      dedupeKey: `chDecline_${challengeId}`,
    });

    const updated = await ref.get();

    return mapChallengeDoc(ref.id, updated.data()!);
  }

  const [creatorData, inviteeData] = await Promise.all([
    assertOnboarded(data.createdBy, db),
    assertOnboarded(callerUid, db),
  ]);
  const includePremium = isPremiumActive(creatorData);

  const questions = await bigqueryService.fetchQuestions({
    subject: data.subject,
    difficulty: data.difficulty,
    questionCount: data.questionCount,
    includePremium,
  });
  if (questions.length < data.questionCount) {
    throw new InsufficientQuestionsError(`Not enough ${data.difficulty} questions available for ${data.subject}. Found only ${questions.length}.`);
  }
  const questionIds = questions.map((q) => q.questionId);

  await db.runTransaction(async (tx) => {
    const freshSnap = await tx.get(ref);
    const freshData = freshSnap.data()!;
    if (freshData.status !== 'pending') throw new ChallengeNotPendingError();

    tx.update(ref, {
      [`participantStatus.${callerUid}.status`]: 'accepted',
      [`participantStatus.${callerUid}.respondedAt`]: now,
      questionIds,
      status: 'active',
      updatedAt: now,
    });
  });

  const updated = await ref.get();

  await publishNotification({
    userId: data.createdBy,
    type: 'challenge',
    kind: 'challenge_accepted',
    title: 'Challenge accepted!',
    body: `${inviteeData.displayName ?? 'Your friend'} accepted. Time to play!`,
    data: { challengeId, actorName: inviteeData.displayName ?? '', subject: data.subject },
    dedupeKey: `chAccept_${challengeId}`,
  });

  return mapChallengeDoc(ref.id, updated.data()!);
}

export async function getChallenge(callerUid: string, challengeId: string, db: Firestore) {
  const doc = await db.collection('challenges').doc(challengeId).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  if (!data.participants.includes(callerUid)) return null;

  return mapChallengeDoc(doc.id, data);
}

export async function getChallenges(callerUid: string, filter: GetChallengesFilter, db: Firestore) {
  let query: Query = db.collection('challenges').where('participants', 'array-contains', callerUid);

  if (filter.status) query = query.where('status', '==', filter.status);
  query = query.orderBy('createdAt', 'desc');

  const limit = Math.min(
    Math.max(filter.limit ?? DEFAULT_CHALLENGES_LIMIT, 1),
    MAX_CHALLENGES_LIMIT
  );
  const snap = await query.limit(limit).get();

  return snap.docs.map((doc) => mapChallengeDoc(doc.id, doc.data()));
}
