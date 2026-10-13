import { GraphQLError } from 'graphql';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import type { Firestore, Query } from 'firebase-admin/firestore';

import { checkRateLimit } from '../middleware/rateLimiter.js';
import { NotOnboardedError, NotificationNotFoundError } from '../utils/errors.js';


const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;
const UNREAD_COUNT_CAP = 100;
const MARK_ALL_BATCH = 400;
const MARK_ALL_MAX_BATCHES = 5;
const MAX_DEVICE_TOKENS = 5;
const MAX_TOKEN_LENGTH = 1024;

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}

function encodeCursor(ts: Timestamp): string {
  return `${ts.seconds}_${ts.nanoseconds}`;
}
function decodeCursor(cursor: string): Timestamp | null {
  const m = /^(\d+)_(\d+)$/.exec(cursor);
  return m ? new Timestamp(Number(m[1]), Number(m[2])) : null;
}

function mapNotification(id: string, data: FirebaseFirestore.DocumentData, isReadOverride?: boolean) {
  return {
    notificationId: id,
    type: data.type,
    kind: data.kind ?? '',
    title: data.title,
    body: data.body,
    data: JSON.stringify(data.data ?? {}),
    isRead: isReadOverride ?? data.isRead === true,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
  };
}


export async function getNotifications(uid: string, args: { limit?: number | null; cursor?: string | null }, db: Firestore) {
  const limit = Math.min(Math.max(Math.trunc(args.limit ?? DEFAULT_LIMIT), 1), MAX_LIMIT);

  let query: Query = db
    .collection('notifications')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc');

  if (args.cursor) {
    const ts = decodeCursor(args.cursor);
    if (!ts) badInput('Invalid cursor.');
    query = query.startAfter(ts);
  }

  const snap = await query.limit(limit + 1).get();
  const hasMore = snap.size > limit;
  const docs = hasMore ? snap.docs.slice(0, limit) : snap.docs;

  return {
    notifications: docs.map((d) => mapNotification(d.id, d.data())),
    nextCursor: hasMore
      ? encodeCursor(docs[docs.length - 1]!.data().createdAt as Timestamp)
      : null,
  };
}

export async function getUnreadNotificationCount(uid: string, db: Firestore): Promise<number> {
  const agg = await db
    .collection('notifications')
    .where('userId', '==', uid)
    .where('isRead', '==', false)
    .limit(UNREAD_COUNT_CAP)
    .count()
    .get();

  return agg.data().count;
}

export async function markNotificationRead(uid: string, notificationId: string, db: Firestore) {
  const ref = db.collection('notifications').doc(notificationId);

  const snap = await ref.get();
  if (!snap.exists || snap.data()!.userId !== uid) {
    throw new NotificationNotFoundError();
  }

  const data = snap.data()!;
  if (data.isRead !== true) {
    await ref.update({ isRead: true, readAt: Timestamp.now() });
  }

  return mapNotification(snap.id, data, true);
}

export async function markAllNotificationsRead(uid: string, db: Firestore): Promise<number> {
  let updated = 0;

  for (let i=0; i<MARK_ALL_MAX_BATCHES; i++) {
    const snap = await db
      .collection('notifications')
      .where('userId', '==', uid)
      .where('isRead', '==', false)
      .limit(MARK_ALL_BATCH)
      .get();
    if (snap.empty) break;

    const now = Timestamp.now();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { isRead: true, readAt: now }));
    await batch.commit();

    updated += snap.size;
    if (snap.size < MARK_ALL_BATCH) break;
  }

  return updated;
}

export async function registerDeviceToken(uid: string, rawToken: string, db: Firestore): Promise<boolean> {
  const token = rawToken?.trim();
  if (!token) badInput('token is required.');
  if (token.length > MAX_TOKEN_LENGTH) badInput('token is too long.');

  checkRateLimit(`registerDeviceToken:${uid}`, { limit: 10, windowMs: 60_000 });

  const holders = await db.collection('users').where('notifTokens', 'array-contains', token).get();
  const otherHolders = holders.docs.filter((d) => d.id !== uid);

  const userRef = db.collection('users').doc(uid);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists) throw new NotOnboardedError();

    const current: string[] = snap.data()!.notifTokens ?? [];
    if (current[0] === token && otherHolders.length === 0) return;

    const next = [token, ...current.filter((t) => t !== token)].slice(0, MAX_DEVICE_TOKENS);
    tx.update(userRef, { notifTokens: next });

    otherHolders.forEach((d) => tx.update(d.ref, { notifTokens: FieldValue.arrayRemove(token) }));
  });

  return true;
}

export async function unregisterDeviceToken(uid: string, rawToken: string, db: Firestore): Promise<boolean> {
  const token = rawToken?.trim();
  if (!token) badInput('token is required.');

  await db.collection('users').doc(uid).update({ notifTokens: FieldValue.arrayRemove(token) });

  return true;
}
