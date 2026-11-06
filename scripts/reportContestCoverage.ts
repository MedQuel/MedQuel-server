// Read-only. After the generator has run, shows which subjects actually have OPEN contests right now.
//   npx tsx scripts/reportContestCoverage.ts
import { Timestamp } from 'firebase-admin/firestore';

import { db } from '../src/config/firebase.js';
import { ALL_SUBJECTS } from './contestTemplateDefinitions.js';


async function main(): Promise<void> {
  const snap = await db
    .collection('contests')
    .where('status', '==', 'active')
    .where('endsAt', '>', Timestamp.now())
    .get();

  const types = ['daily', 'live', 'contest', 'weekly'] as const;
  const table: Record<string, Record<string, number | string>> = {};

  for (const subject of ALL_SUBJECTS) {
    table[subject] = { daily: 0, live: 0, contest: 0, weekly: 0, premium: 0 };
  }

  const unknownSubjects = new Set<string>();
  snap.docs.forEach((doc) => {
    const data = doc.data();
    const row = table[data.subject as string];
    if (!row) {
      unknownSubjects.add(String(data.subject));
      return;
    }

    const key = data.isPremium === true
      ? 'premium'
      : (types as readonly string[]).includes(data.contestType) ? data.contestType : 'contest';
    row[key] = (row[key] as number) + 1;
  });

  console.log(`${snap.size} open contest(s) right now:`);
  console.table(table);

  const missingDaily = ALL_SUBJECTS.filter((s) => table[s]!.daily === 0);
  const missingAny = ALL_SUBJECTS.filter((s) =>
    Number(table[s]!.daily) + Number(table[s]!.live) + Number(table[s]!.contest) === 0
  );

  if (missingDaily.length > 0) console.log(`No open daily contest for: ${missingDaily.join(', ')}`);
  if (missingAny.length > 0) console.log(`NO free contest of any kind for: ${missingAny.join(', ')}`);
  if (unknownSubjects.size > 0) console.log(`Contests with an unrecognised subject (old templates?): ${[...unknownSubjects].join(', ')}`);
  if (missingDaily.length === 0 && missingAny.length === 0) console.log('Every subject has an open daily contest.');

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
