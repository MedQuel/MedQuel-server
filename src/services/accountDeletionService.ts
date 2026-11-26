import type { Auth } from 'firebase-admin/auth';
import { BigQuery } from '@google-cloud/bigquery';
import { getStorage } from 'firebase-admin/storage';
import { FieldValue } from 'firebase-admin/firestore';
import type { Firestore, BulkWriter, Query } from 'firebase-admin/firestore';

import { checkRateLimit } from '../middleware/rateLimiter.js';


const FIRESTORE_NOT_FOUND = 5;
const ATTEMPTS_TABLE = 'quiz_attempts_raw';

async function queueQueryDeletes(query: Query, writer: BulkWriter): Promise<number> {
  const snap = await query.select().get();
  snap.docs.forEach((doc) => void writer.delete(doc.ref));

  return snap.size;
}

async function deleteProfilePhotos(uid: string): Promise<void> {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (!bucketName) {
    console.warn('[deletion] FIREBASE_STORAGE_BUCKET is not set, profile photos were not deleted.');
    return;
  }

  try {
    await getStorage()
      .bucket(bucketName)
      .deleteFiles({ prefix: `profilePhotos/${uid}/`, force: true });
  } catch (err) {
    console.warn(`[deletion] profile photo cleanup failed for ${uid}:`, err);
  }
}

async function deleteBigQueryAttempts(uid: string): Promise<void> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const dataset = process.env.BIGQUERY_DATASET ?? 'medquel_production';
  if (!projectId) return;

  try {
    await new BigQuery({ projectId }).query({
      query: `DELETE FROM \`${projectId}.${dataset}.${ATTEMPTS_TABLE}\` WHERE user_id = @uid`,
      params: { uid },
      types: { uid: 'STRING' },
    });
  } catch (err) {
    console.warn(`[deletion] BigQuery attempt rows not removed for ${uid}:`, (err as Error).message);
  }
}


export async function deleteMyAccount(uid: string, db: Firestore, auth: Auth): Promise<boolean> {
  checkRateLimit(`deleteMyAccount:${uid}`, { limit: 3, windowMs: 60*60*1000 });

  const userRef = db.collection('users').doc(uid);
  const writer = db.bulkWriter();
  writer.onWriteError((err) => err.code !== FIRESTORE_NOT_FOUND && err.failedAttempts < 5);

  // 1. Remove this user from friends' lists first
  const friendsSnap = await userRef.collection('friends').get();
  for (const friend of friendsSnap.docs) {
    const friendRef = db.collection('users').doc(friend.id);
    void writer.delete(friendRef.collection('friends').doc(uid));
    void writer.update(friendRef, { friendCount: FieldValue.increment(-1) });
  }

  // 2. Data keyed by the user elsewhere
  await Promise.all([
    queueQueryDeletes(
      db.collection('friendRequests').where('fromUid', '==', uid),
      writer
    ),
    queueQueryDeletes(
      db.collection('friendRequests').where('toUid', '==', uid),
      writer
    ),
    queueQueryDeletes(
      db.collection('challenges').where('participants', 'array-contains', uid),
      writer
    ),
    queueQueryDeletes(
      db.collection('notifications').where('userId', '==', uid),
      writer
    ),
    queueQueryDeletes(
      db.collection('quizSessions').where('userId', '==', uid),
      writer
    ),
    queueQueryDeletes(
      db.collectionGroup('entries').where('userId', '==', uid),
      writer
    ),
    queueQueryDeletes(
      db.collectionGroup('leaderboard').where('userId', '==', uid),
      writer
    ),
    queueQueryDeletes(
      db.collectionGroup('participants').where('userId', '==', uid),
      writer
    ),
  ]);

  void writer.delete(db.collection('studyPlans').doc(uid));
  await writer.close();

  // 3. The profile and its subcollections
  await db.recursiveDelete(userRef);

  // 4. Files and analytics
  await Promise.all([deleteProfilePhotos(uid), deleteBigQueryAttempts(uid)]);

  // 5. Last: the sign-in account itself
  try {
    await auth.deleteUser(uid);
  } catch (err) {
    if ((err as { code?: string }).code !== 'auth/user-not-found') throw err;
  }

  console.warn(`[deletion] completed uid=${uid}`);
  return true;
}
