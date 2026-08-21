import { getFirestore } from 'firebase-admin/firestore';
import functions from '@google-cloud/functions-framework';
import { initializeApp, getApps } from 'firebase-admin/app';
import type { CloudEvent } from '@google-cloud/functions-framework';

import { resetExpiredStreaks } from './resetStreaks.js';


if (getApps().length === 0) initializeApp();
const db = getFirestore();

functions.cloudEvent(
  'checkStreaks',
  async (_event: CloudEvent<unknown>) => {
    const now = new Date();
    const { scanned, reset } = await resetExpiredStreaks(db, now);
    console.log(`[checkStreaks] scanned ${scanned} active-streak user(s), reset ${reset} expired streak(s).`);
  }
);
