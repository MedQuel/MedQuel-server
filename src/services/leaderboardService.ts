import { FieldPath } from 'firebase-admin/firestore';
import type { Firestore, DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore';

import { NotImplementedError } from '../utils/errors.js';
import { buildPeriodKey, type LeaderboardPeriodInput } from '../utils/leaderboardPeriod.js';


const TOP_N_DISPLAY = 50;
const FRIENDS_CHUNK_SIZE = 30;

export type LeaderboardScopeInput = 'global' | 'friends';
export interface LeaderboardEntryDTO {
  userId: string;
  displayName: string;
  photoURL: string | null;
  specialization: string | null;
  epPoints: number;
  rank: number;
  prevRank: number;
  weeklyChange: number;
  updatedAt: string;
}
export interface LeaderboardResult {
  period: LeaderboardPeriodInput;
  periodKey: string;
  entries: LeaderboardEntryDTO[];
  myEntry: LeaderboardEntryDTO | null;
  myRank: number | null;
}

function mapEntry(doc: QueryDocumentSnapshot | DocumentSnapshot): LeaderboardEntryDTO {
  const data = doc.data()!;
  return {
    userId: data.userId,
    displayName: data.displayName ?? 'Unknown',
    photoURL: data.photoURL ?? null,
    specialization: data.specialization ?? null,
    epPoints: data.epPoints ?? 0,
    rank: data.rank ?? 0,
    prevRank: data.prevRank ?? 0,
    weeklyChange: data.weeklyChange ?? 0,
    updatedAt: (data.updatedAt?.toDate?.() ?? new Date()).toISOString(),
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i=0; i<items.length; i+=size) {
    result.push(items.slice(i, i+size));
  }
  return result;
}


async function getGlobalLeaderboard(uid: string, db: Firestore, period: LeaderboardPeriodInput, periodKey: string): Promise<LeaderboardResult> {
  const entriesRef = db.collection('leaderboard').doc(periodKey).collection('entries');

  const topSnap = await entriesRef.orderBy('epPoints', 'desc').limit(TOP_N_DISPLAY).get();
  const entries = topSnap.docs.map(mapEntry);

  const myEntryInTop = entries.find((e) => e.userId === uid);
  if (myEntryInTop) {
    return {
      period,
      periodKey,
      entries,
      myEntry: myEntryInTop,
      myRank: myEntryInTop.rank || null,
    };
  }

  const myEntrySnap = await entriesRef.doc(uid).get();
  if (!myEntrySnap.exists) return { period, periodKey, entries, myEntry: null, myRank: null };

  const myEntry = mapEntry(myEntrySnap);
  const aheadCount = await entriesRef.where('epPoints', '>', myEntry.epPoints).count().get();
  const myRank = aheadCount.data().count + 1;

  return { period, periodKey, entries, myEntry, myRank };
}

async function getFriendsLeaderboard(uid: string, db: Firestore, period: LeaderboardPeriodInput, periodKey: string): Promise<LeaderboardResult> {
  const friendsSnap = await db.collection('users').doc(uid).collection('friends').get();
  const friendIds = friendsSnap.docs.map((doc) => doc.id);

  const targetIds = [uid, ...friendIds];

  const entriesRef = db.collection('leaderboard').doc(periodKey).collection('entries');
  const idChunks = chunk(targetIds, FRIENDS_CHUNK_SIZE);

  const snaps = await Promise.all(idChunks.map(
    (ids) => entriesRef.where(FieldPath.documentId(), 'in', ids).get())
  );

  const entries = snaps
    .flatMap((snap) => snap.docs)
    .map(mapEntry)
    .sort((a, b) => b.epPoints - a.epPoints)
    .map((entry, index) => ({ ...entry, rank: index+1, prevRank: 0 }));

  const myEntry = entries.find((e) => e.userId === uid) ?? null;

  return { period, periodKey, entries, myEntry, myRank: myEntry?.rank ?? null };
}


export async function getLeaderboard(
  uid: string,
  db: Firestore,
  scope: LeaderboardScopeInput,
  period: LeaderboardPeriodInput
): Promise<LeaderboardResult> {
  const periodKey = buildPeriodKey(period, new Date());

  if (scope === 'friends') {
    return getFriendsLeaderboard(uid, db, period, periodKey);
  }

  return getGlobalLeaderboard(uid, db, period, periodKey);
}
