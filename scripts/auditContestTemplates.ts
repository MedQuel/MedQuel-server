// Read-only. Checks the contest templates against your real question bank,
// and simulates how often each subject will get a contest. Safe to run any time; it writes nothing.
//
//   npx tsx scripts/auditContestTemplates.ts            reads counts from BigQuery
//   npx tsx scripts/auditContestTemplates.ts --offline  uses the question counts from your spreadsheet (Nov 2026)
import 'dotenv/config';
import { BigQuery } from '@google-cloud/bigquery';

import { TEMPLATES, ALL_SUBJECTS, validateTemplates } from './contestTemplateDefinitions.js';


type Difficulty = 'easy' | 'medium' | 'hard';
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
type Bucket = { free: number; total: number };
type Bank = Record<string, Record<Difficulty, Bucket>>;

const SPREADSHEET: Record<string, [number, number, number]> = {
  Anatomy: [59, 102, 134],
  Anesthesiology: [55, 216, 55],
  Biochemistry: [57, 124, 135],
  'Community Medicine': [61, 117, 92],
  Dermatology: [55, 168, 56],
  ENT: [55, 165, 61],
  'Forensic Medicine & Toxicology': [56, 67, 58],
  'Gynaecology & Obstetrics': [61, 129, 60],
  Medicine: [59, 285, 61],
  Microbiology: [60, 148, 90],
  Ophthalmology: [57, 57, 57],
  Orthopedics: [56, 78, 57],
  Pathology: [58, 233, 179],
  Pediatrics: [60, 231, 58],
  Pharmacology: [55, 255, 285],
  Physiology: [57, 132, 119],
  Psychiatry: [59, 75, 56],
  Radiology: [65, 72, 63],
  Surgery: [57, 90, 59],
};

async function loadBank(offline: boolean): Promise<{ bank: Bank; source: string }> {
  const bank: Bank = {};
  for (const subject of ALL_SUBJECTS) {
    bank[subject] = {
      easy: { free: 0, total: 0 },
      medium: { free: 0, total: 0 },
      hard: { free: 0, total: 0 },
    };
  }

  if (offline) {
    for (const [subject, [easy, medium, hard]] of Object.entries(SPREADSHEET)) {
      const row = bank[subject];
      if (!row) continue;
      row.easy = { free: easy, total: easy };
      row.medium = { free: medium, total: medium };
      row.hard = { free: hard, total: hard };
    }

    return { bank, source: 'spreadsheet snapshot (offline)' };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const dataset = process.env.BIGQUERY_DATASET ?? 'medquel_production';
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID is not set. Check your .env, or run with --offline.');

  const [rows] = await new BigQuery({ projectId }).query({
    query: `
      SELECT subject, difficulty, COUNTIF(is_premium = FALSE) AS free_count, COUNT(*) AS total_count
      FROM \`${projectId}.${dataset}.questions\`
      WHERE is_active = TRUE
      GROUP BY subject, difficulty
    `,
  });

  for (const row of rows) {
    const bucket = bank[row.subject as string]?.[row.difficulty as Difficulty];
    if (bucket) {
      bucket.free = Number(row.free_count);
      bucket.total = Number(row.total_count);
    }
  }

  const unknown = [...new Set(rows.map((r) => r.subject as string))].filter(
    (s) => !ALL_SUBJECTS.includes(s)
  );
  if (unknown.length > 0) {
    console.warn(`\nWARNING: question bank has subject name(s) that onboarding does not know: ${unknown.join(', ')}\n`);
  }

  return { bank, source: `BigQuery ${projectId}.${dataset}.questions` };
}

function checkQuestionSupply(bank: Bank): number {
  console.log('\n=== 1. Can the question bank fill each template? ===');
  let failures = 0;
  let warnings = 0;

  for (const [id, template] of Object.entries(TEMPLATES)) {
    const needed = template.questionCountRange.max;
    const issues: string[] = [];

    for (const subject of template.subjectPool) {
      for (const difficulty of DIFFICULTIES) {
        if (template.difficultyWeights[difficulty] <= 0) continue;

        const bucket = bank[subject]?.[difficulty];
        const available = bucket
          ? template.isPremium ? bucket.total : bucket.free
          : 0;

        if (available < needed) {
          failures++;
          issues.push(`  FAIL  ${subject} / ${difficulty}: has ${available}, a contest needs up to ${needed} (the generator will fall back to a neighbouring difficulty)`);
        } else if (available < needed*2) {
          warnings++;
          issues.push(`  warn  ${subject} / ${difficulty}: has ${available}; one contest can use ${Math.round((needed/available) * 100)}% of it`);
        }
      }
    }

    console.log(`${id}: ${issues.length === 0 ? 'OK' : `${issues.length} issue(s)`}`);
    issues.forEach((line) => console.log(line));
  }

  console.log(`\n${failures} FAIL, ${warnings} warn. A warn means contests will repeat many of the same questions.`);
  return failures;
}

function expectedRunsPerWeek(t: (typeof TEMPLATES)[string]): number {
  const slotsPerDay = t.runAtHoursIST?.length ? t.runAtHoursIST.length : 6;
  const runsPerDay = Math.min(slotsPerDay, 24/t.generationIntervalHrs);

  return runsPerDay * 7;
}

function simulateCoverage(): number {
  console.log('\n=== 2. Expected contests per subject per week (free unless stated) ===');
  const rows: Record<
    string,
    {
      daily: number;
      live: number;
      contest: number;
      weekly: number;
      premium: number;
    }
  > = {};

  for (const subject of ALL_SUBJECTS) {
    rows[subject] = { daily: 0, live: 0, contest: 0, weekly: 0, premium: 0 };
  }

  let contestsPerDay = 0;
  for (const template of Object.values(TEMPLATES)) {
    const runsPerWeek = expectedRunsPerWeek(template);
    const mix = template.contestTypeMix;
    const mixTotal = mix.daily + mix.live + mix.contest;

    const contestsPerRun = template.perSubject ? template.subjectPool.length : 1;
    contestsPerDay += (runsPerWeek*contestsPerRun) / 7;

    for (const subject of template.subjectPool) {
      const perSubjectPerWeek = template.perSubject ? runsPerWeek : runsPerWeek/template.subjectPool.length;
      const row = rows[subject]!;

      if (template.templateKind === 'grand_championship') {
        row.weekly += perSubjectPerWeek;
      } else if (template.isPremium) {
        row.premium += perSubjectPerWeek;
      } else if (mixTotal > 0) {
        row.daily += (perSubjectPerWeek*mix.daily) / mixTotal;
        row.live += (perSubjectPerWeek*mix.live) / mixTotal;
        row.contest += (perSubjectPerWeek*mix.contest) / mixTotal;
      }
    }
  }

  const table = Object.fromEntries(
    Object.entries(rows).map(([subject, r]) => [
      subject,
      {
        daily: r.daily.toFixed(1),
        live: r.live.toFixed(2),
        contest: r.contest.toFixed(1),
        weekly: r.weekly.toFixed(2),
        premium: r.premium.toFixed(1),
      },
    ])
  );

  console.table(table);
  console.log(`About ${contestsPerDay.toFixed(1)} new contests per day in total.`);

  const gaps = ALL_SUBJECTS.filter(
    (s) => rows[s]!.daily < 7 || rows[s]!.contest < 1
  );
  if (gaps.length > 0) {
    console.log(`Subjects with thin free coverage: ${gaps.join(', ')}`);
  } else {
    console.log('Every subject gets a daily contest every day and at least one longer contest per week.');
  }

  return gaps.length;
}


async function main(): Promise<void> {
  const problems = validateTemplates();
  if (problems.length > 0) {
    console.error('Template definition problems:\n - ' + problems.join('\n - '));
    process.exit(1);
  }

  const offline = process.argv.includes('--offline');
  const { bank, source } = await loadBank(offline);
  console.log(`Question counts from: ${source}`);

  console.log('\nQuestion bank (free / total):');
  console.table(
    Object.fromEntries(ALL_SUBJECTS.map((s) => [
      s,
      Object.fromEntries(DIFFICULTIES.map((d) => [
        d,
        `${bank[s]![d].free} / ${bank[s]![d].total}`,
      ]))
    ]))
  );

  const failures = checkQuestionSupply(bank);
  const gaps = simulateCoverage();

  process.exit(failures > 0 || gaps > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
