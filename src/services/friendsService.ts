import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';

import { publishNotification } from '../pubsub/publisher.js';
import { checkRateLimit } from '../middleware/rateLimiter.js';
import { NotOnboardedError, UserNotFoundError } from '../utils/errors.js';
import { SelfFriendRequestError, AlreadyFriendsError, NotFriendsError } from '../utils/errors.js';
import { DuplicateFriendRequestError, FriendRequestCooldownError, FriendRequestNotFoundError } from '../utils/errors.js';


const DECLINE_COOLDOWN_MS = 3 * 24*60*60*1000;

const SEARCH_RESULTS_LIMIT = 15;
const MIN_SEARCH_QUERY_LENGTH = 3;

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';
export interface FriendRequestDTO {
  requestId: string;
  fromUid: string;
  toUid: string;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt: string | null;
}

export type FriendRelationshipStatus = 'NONE' | 'FRIENDS' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'SELF';
export interface FriendSummaryDTO {
  uid: string;
  displayName: string;
  photoURL: string | null;
  currentLevel: number;
  currentStreak: number;
  xpPoints: number;
  epPoints: number;
  headToHead: { wins: number; losses: number; draws: number };
  addedAt: string;
}
interface RelationshipContext {
  friendIds: Set<string>;
  sentPendingIds: Set<string>;
  receivedPendingIds: Set<string>;
}

export interface PublicProfileDTO {
  uid: string;
  displayName: string;
  photoURL: string | null;
  targetExam: string;
  studyLevel: string;
  specialties: string[];
  currentLevel: number;
  xpPoints: number;
  epPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  studyHours: number;
  quizzesCompleted: number;
  badges: string[];
  friends: FriendSummaryDTO[];
  relationshipStatus: FriendRelationshipStatus;
  headToHead: { wins: number; losses: number; draws: number } | null;
  comparison: { xpDelta: number; epDelta: number; streakDelta: number; levelDelta: number };
}

export interface UserSearchResultDTO {
  uid: string;
  displayName: string;
  photoURL: string | null;
  targetExam: string;
  relationshipStatus: FriendRelationshipStatus;
}


function requestDocId(fromUid: string, toUid: string): string {
  return `${fromUid}_${toUid}`;
}

async function assertUserOnboarded(uid: string, db: Firestore): Promise<FirebaseFirestore.DocumentData> {
  const doc = await db.collection('users').doc(uid).get();
  if (!doc.exists) throw new UserNotFoundError();

  return doc.data()!;
}

function buildFriendSummary(uid: string, data: FirebaseFirestore.DocumentData) {
  return {
    uid,
    displayName: data.displayName ?? 'Unknown',
    photoURL: data.photoURL ?? null,
    currentLevel: data.currentLevel ?? 1,
    currentStreak: data.currentStreak ?? 0,
    epPoints: data.epPoints ?? 0,
  };
}

async function getCurrentPhotoURLs(friendIds: string[], db: Firestore): Promise<Map<string, string | null>> {
  const userRefs = friendIds.map((id) => db.collection('users').doc(id));
  if (userRefs.length === 0) return new Map();

  const userSnaps = await db.getAll(...userRefs);
  return new Map(
    userSnaps
      .filter((doc) => doc.exists)
      .map((doc) => [doc.id, doc.data()?.photoURL ?? null])
  );
}

function mapFriendRequestDoc(data: FirebaseFirestore.DocumentData): FriendRequestDTO {
  return {
    requestId: data.requestId,
    fromUid: data.fromUid,
    toUid: data.toUid,
    status: data.status,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    respondedAt: data.respondedAt
      ? (data.respondedAt as Timestamp).toDate().toISOString()
      : null,
  };
}

async function getRelationshipStatus(viewerUid: string, targetUid: string, db: Firestore): Promise<FriendRelationshipStatus> {
  if (viewerUid === targetUid) return 'SELF';

  const friendSnap = await db.collection('users').doc(viewerUid).collection('friends').doc(targetUid).get();
  if (friendSnap.exists) return 'FRIENDS';

  const forwardSnap = await db.collection('friendRequests').doc(requestDocId(viewerUid, targetUid)).get();
  if (forwardSnap.exists && forwardSnap.data()!.status === 'pending') return 'REQUEST_SENT';

  const reverseSnap = await db.collection('friendRequests').doc(requestDocId(targetUid, viewerUid)).get();
  if (reverseSnap.exists && reverseSnap.data()!.status === 'pending') return 'REQUEST_RECEIVED';

  return 'NONE';
}

async function buildRelationshipContextFor(viewerUid: string, candidateIds: string[], db: Firestore): Promise<RelationshipContext> {
  const friendRefs = candidateIds.map((id) =>
    db.collection('users').doc(viewerUid).collection('friends').doc(id)
  );

  const [friendSnaps, sentSnap, receivedSnap] = await Promise.all([
    friendRefs.length > 0 ? db.getAll(...friendRefs) : Promise.resolve([]),
    db.collection('friendRequests').where('fromUid', '==', viewerUid).where('status', '==', 'pending').get(),
    db.collection('friendRequests').where('toUid', '==', viewerUid).where('status', '==', 'pending').get(),
  ]);

  return {
    friendIds: new Set(friendSnaps.filter((s) => s.exists).map((s) => s.id)),
    sentPendingIds: new Set(sentSnap.docs.map((d) => d.data().toUid)),
    receivedPendingIds: new Set(receivedSnap.docs.map((d) => d.data().fromUid)),
  };
}

function resolveStatusFromContext(ctx: RelationshipContext, targetUid: string): FriendRelationshipStatus {
  if (ctx.friendIds.has(targetUid)) return 'FRIENDS';
  if (ctx.sentPendingIds.has(targetUid)) return 'REQUEST_SENT';
  if (ctx.receivedPendingIds.has(targetUid)) return 'REQUEST_RECEIVED';

  return 'NONE';
}


export async function sendFriendRequest(callerUid: string, toUid: string, db: Firestore): Promise<FriendRequestDTO> {
  const targetUid = toUid?.trim();
  if (!targetUid) throw new UserNotFoundError();
  if (targetUid === callerUid) throw new SelfFriendRequestError();

  checkRateLimit(`sendFriendRequest:${callerUid}`, {
    limit: 20,
    windowMs: 60*60*1000,
  });

  const [callerData, targetData] = await Promise.all([
    assertUserOnboarded(callerUid, db),
    assertUserOnboarded(targetUid, db),
  ]);

  const existingFriendSnap = await db.collection('users').doc(callerUid).collection('friends').doc(targetUid).get();
  if (existingFriendSnap.exists) throw new AlreadyFriendsError();

  const forwardRef = db.collection('friendRequests').doc(requestDocId(callerUid, targetUid));
  const reverseRef = db.collection('friendRequests').doc(requestDocId(targetUid, callerUid));

  const result = await db.runTransaction(async (tx) => {
    const [forwardSnap, reverseSnap] = await Promise.all([
      tx.get(forwardRef),
      tx.get(reverseRef),
    ]);
    const now = Timestamp.now();

    if (reverseSnap.exists && reverseSnap.data()!.status === 'pending') {
      tx.update(reverseRef, { status: 'accepted', respondedAt: now });
      tx.set(forwardRef, {
        requestId: forwardRef.id,
        fromUid: callerUid,
        toUid: targetUid,
        status: 'accepted',
        createdAt: now,
        respondedAt: now,
      });

      const callerFriendRef = db.collection('users').doc(callerUid).collection('friends').doc(targetUid);
      const targetFriendRef = db.collection('users').doc(targetUid).collection('friends').doc(callerUid);
      tx.set(callerFriendRef, {
        ...buildFriendSummary(targetUid, targetData),
        headToHead: { wins: 0, losses: 0, draws: 0 },
        addedAt: now,
      });
      tx.set(targetFriendRef, {
        ...buildFriendSummary(callerUid, callerData),
        headToHead: { wins: 0, losses: 0, draws: 0 },
        addedAt: now,
      });

      return {
        requestId: forwardRef.id,
        fromUid: callerUid,
        toUid: targetUid,
        status: 'accepted' as const,
        createdAt: now.toDate().toISOString(),
        respondedAt: now.toDate().toISOString(),
      };
    }

    if (forwardSnap.exists) {
      const data = forwardSnap.data()!;
      if (data.status === 'pending') throw new DuplicateFriendRequestError();
      if (data.status === 'accepted') throw new AlreadyFriendsError();

      const respondedAtMs = (data.respondedAt as Timestamp | undefined)?.toMillis() ?? 0;
      const elapsed = Date.now() - respondedAtMs;
      if (elapsed < DECLINE_COOLDOWN_MS) {
        const remainingDays = Math.ceil((DECLINE_COOLDOWN_MS-elapsed) / (24*60*60*1000));
        throw new FriendRequestCooldownError(remainingDays);
      }
    }

    tx.set(forwardRef, {
      requestId: forwardRef.id,
      fromUid: callerUid,
      toUid: targetUid,
      status: 'pending',
      createdAt: now,
      respondedAt: null,
    });

    return {
      requestId: forwardRef.id,
      fromUid: callerUid,
      toUid: targetUid,
      status: 'pending' as const,
      createdAt: now.toDate().toISOString(),
      respondedAt: null,
    };
  });

  const now = Date.now();
  if (result.status === 'accepted') {
    await publishNotification({
      userId: targetUid,
      type: 'friends',
      kind: 'friend_request_accepted',
      title: 'Friend request accepted',
      body: `${callerData.displayName ?? 'Someone'} is now your friend.`,
      data: { friendUid: callerUid, actorName: callerData.displayName ?? '' },
      dedupeKey: `friendAcc_${result.requestId}_${now}`,
    });
  } else {
    await publishNotification({
      userId: targetUid,
      type: 'friends',
      kind: 'friend_request_received',
      title: 'New friend request',
      body: `${callerData.displayName ?? 'Someone'} wants to be your friend.`,
      data: { requestId: result.requestId, fromUid: callerUid, actorName: callerData.displayName ?? '' },
      dedupeKey: `friendReq_${result.requestId}_${now}`,
    });
  }

  return result;
}

export async function respondFriendRequest(callerUid: string, requestId: string, accept: boolean, db: Firestore): Promise<boolean> {
  const requestRef = db.collection('friendRequests').doc(requestId);

  const accepted = await db.runTransaction(async (tx) => {
    const snap = await tx.get(requestRef);
    if (!snap.exists) throw new FriendRequestNotFoundError();

    const data = snap.data()!;
    if (data.toUid !== callerUid || data.status !== 'pending') {
      throw new FriendRequestNotFoundError();
    }

    const now = Timestamp.now();

    if (!accept) {
      tx.update(requestRef, { status: 'declined', respondedAt: now });
      return null;
    }

    const [fromSnap, toSnap] = await Promise.all([
      tx.get(db.collection('users').doc(data.fromUid)),
      tx.get(db.collection('users').doc(data.toUid)),
    ]);
    if (!fromSnap.exists || !toSnap.exists) throw new UserNotFoundError();

    tx.update(requestRef, { status: 'accepted', respondedAt: now });

    const fromFriendRef = db.collection('users').doc(data.fromUid).collection('friends').doc(data.toUid);
    const toFriendRef = db.collection('users').doc(data.toUid).collection('friends').doc(data.fromUid);
    tx.set(fromFriendRef, {
      ...buildFriendSummary(data.toUid, toSnap.data()!),
      headToHead: { wins: 0, losses: 0, draws: 0 },
      addedAt: now,
    });
    tx.set(toFriendRef, {
      ...buildFriendSummary(data.fromUid, fromSnap.data()!),
      headToHead: { wins: 0, losses: 0, draws: 0 },
      addedAt: now,
    });

    return {
      fromUid: data.fromUid as string,
      accepterName: (toSnap.data()!.displayName ?? 'Someone') as string,
    };
  });

  if (accepted) {
    await publishNotification({
      userId: accepted.fromUid,
      type: 'friends',
      kind: 'friend_request_accepted',
      title: 'Friend request accepted',
      body: `${accepted.accepterName} accepted your friend request.`,
      data: { friendUid: callerUid, actorName: accepted.accepterName },
      dedupeKey: `friendAcc_${requestId}_${Date.now()}`,
    });
  }

  return true;
}

export async function removeFriend(callerUid: string, friendUid: string, db: Firestore): Promise<boolean> {
  const targetUid = friendUid?.trim();
  if (!targetUid) throw new UserNotFoundError();

  const callerFriendRef = db.collection('users').doc(callerUid).collection('friends').doc(targetUid);
  const targetFriendRef = db.collection('users').doc(targetUid).collection('friends').doc(callerUid);
  const forwardRef = db.collection('friendRequests').doc(requestDocId(callerUid, targetUid));
  const reverseRef = db.collection('friendRequests').doc(requestDocId(targetUid, callerUid));

  await db.runTransaction(async (tx) => {
    const callerFriendSnap = await tx.get(callerFriendRef);
    if (!callerFriendSnap.exists) throw new NotFriendsError();

    tx.delete(callerFriendRef);
    tx.delete(targetFriendRef);
    tx.delete(forwardRef);
    tx.delete(reverseRef);
  });

  return true;
}

export async function getUserProfile(viewerUid: string, targetUid: string, db: Firestore): Promise<PublicProfileDTO> {
  const trimmedTarget = targetUid?.trim();
  if (!trimmedTarget) throw new UserNotFoundError();

  const [viewerSnap, targetSnap] = await Promise.all([
    db.collection('users').doc(viewerUid).get(),
    db.collection('users').doc(trimmedTarget).get(),
  ]);
  if (!viewerSnap.exists) throw new NotOnboardedError();
  if (!targetSnap.exists) throw new UserNotFoundError();

  const viewer = viewerSnap.data()!;
  const target = targetSnap.data()!;
  const relationshipStatus = await getRelationshipStatus(viewerUid, trimmedTarget, db);
  const friendsSnap = await db
    .collection('users')
    .doc(trimmedTarget)
    .collection('friends')
    .orderBy('displayName', 'asc')
    .limit(20)
    .get();
  const currentPhotoURLs = await getCurrentPhotoURLs(
    friendsSnap.docs.map((friendDoc) => friendDoc.id),
    db
  );

  let headToHead: PublicProfileDTO['headToHead'] = null;
  if (relationshipStatus === 'FRIENDS') {
    const friendDoc = await db.collection('users').doc(viewerUid).collection('friends').doc(trimmedTarget).get();
    const h2h = friendDoc.data()?.headToHead ?? { wins: 0, losses: 0, draws: 0 }
    headToHead = { wins: h2h.wins ?? 0, losses: h2h.losses ?? 0, draws: h2h.draws ?? 0 };
  }

  return {
    uid: trimmedTarget,
    displayName: target.displayName ?? 'Unknown',
    photoURL: target.photoURL ?? null,
    targetExam: target.targetExam,
    studyLevel: target.studyLevel,
    specialties: target.specialties ?? [],
    currentLevel: target.currentLevel ?? 1,
    xpPoints: target.xpPoints ?? 0,
    epPoints: target.epPoints ?? 0,
    currentStreak: target.currentStreak ?? 0,
    longestStreak: target.longestStreak ?? 0,
    totalQuestions: target.totalQuestions ?? 0,
    totalCorrect: target.totalCorrect ?? 0,
    accuracy: target.totalQuestions
      ? Math.round(((target.totalCorrect ?? 0)/target.totalQuestions)*10000) / 100
      : 0,
    studyHours: target.studyHours ?? 0,
    quizzesCompleted: target.stats?.completedSessions ?? target.stats?.contestsPlayed ?? 0,
    badges: target.badges ?? [],
    friends: friendsSnap.docs.map((friendDoc) => {
      const data = friendDoc.data();
      return {
        uid: friendDoc.id,
        displayName: data.displayName ?? 'Unknown',
        photoURL: currentPhotoURLs.get(friendDoc.id) ?? null,
        currentLevel: data.currentLevel ?? 1,
        currentStreak: data.currentStreak ?? 0,
        xpPoints: data.xpPoints ?? 0,
        epPoints: data.epPoints ?? 0,
        headToHead: {
          wins: data.headToHead?.wins ?? 0,
          losses: data.headToHead?.losses ?? 0,
          draws: data.headToHead?.draws ?? 0,
        },
        addedAt: data.addedAt instanceof Timestamp
          ? data.addedAt.toDate().toISOString()
          : new Date().toISOString(),
      };
    }),
    relationshipStatus,
    headToHead,
    comparison: {
      xpDelta: (viewer.xpPoints ?? 0) - (target.xpPoints ?? 0),
      epDelta: (viewer.epPoints ?? 0) - (target.epPoints ?? 0),
      streakDelta: (viewer.currentStreak ?? 0) - (target.currentStreak ?? 0),
      levelDelta: (viewer.currentLevel ?? 1) - (target.currentLevel ?? 1),
    },
  };
}

export async function searchUsers(callerUid: string, query: string, db: Firestore): Promise<UserSearchResultDTO[]> {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < MIN_SEARCH_QUERY_LENGTH) return [];

  checkRateLimit(`searchUsers:${callerUid}`, { limit: 30, windowMs: 60_000 });

  const lower = trimmed.toLowerCase();
  const snap = await db
    .collection('users')
    .where('displayNameLower', '>=', lower)
    .where('displayNameLower', '<=', lower + '\uf8ff')
    .limit(SEARCH_RESULTS_LIMIT + 1)
    .get();

  const candidates = snap.docs.filter((d) => d.id !== callerUid).slice(0, SEARCH_RESULTS_LIMIT);
  const ctx = await buildRelationshipContextFor(callerUid, candidates.map((d) => d.id), db);

  return candidates.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      displayName: data.displayName,
      photoURL: data.photoURL ?? null,
      targetExam: data.targetExam,
      relationshipStatus: resolveStatusFromContext(ctx, doc.id),
    };
  });
}

export async function getPendingFriendRequests(callerUid: string, db: Firestore): Promise<FriendRequestDTO[]> {
  const snap = await db
    .collection('friendRequests')
    .where('toUid', '==', callerUid)
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();

  return snap.docs.map((d) => mapFriendRequestDoc(d.data()));
}

export async function getFriends(callerUid: string, db: Firestore): Promise<FriendSummaryDTO[]> {
  const snap = await db.collection('users').doc(callerUid).collection('friends').orderBy('displayName', 'asc').get();
  const currentPhotoURLs = await getCurrentPhotoURLs(snap.docs.map((doc) => doc.id), db);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      displayName: data.displayName ?? 'Unknown',
      photoURL: currentPhotoURLs.get(doc.id) ?? null,
      currentLevel: data.currentLevel ?? 1,
      currentStreak: data.currentStreak ?? 0,
      xpPoints: data.xpPoints ?? 0,
      epPoints: data.epPoints ?? 0,
      headToHead: {
        wins: data.headToHead?.wins ?? 0,
        losses: data.headToHead?.losses ?? 0,
        draws: data.headToHead?.draws ?? 0,
      },
      addedAt: (data.addedAt as Timestamp).toDate().toISOString(),
    };
  });
}
