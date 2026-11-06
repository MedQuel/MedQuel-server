import { VALID_SPECIALTIES } from '../src/validators/onboardingValidation.js';
import type { ContestTemplateSeedInput } from '../src/types/contestTemplate.js';


export const ALL_SUBJECTS: string[] = [...VALID_SPECIALTIES];

const PRECLINICAL = ['Anatomy', 'Physiology', 'Biochemistry'];
const PARACLINICAL = ['Pathology', 'Pharmacology', 'Microbiology', 'Forensic Medicine & Toxicology', 'Community Medicine'];
const CLINICAL_CORE = ['Medicine', 'Surgery', 'Pediatrics', 'Gynaecology & Obstetrics', 'Orthopedics'];
const CLINICAL_ALLIED = ['ENT', 'Ophthalmology', 'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesiology'];

(function assertSubjectsAreValid() {
  const grouped = [...PRECLINICAL, ...PARACLINICAL, ...CLINICAL_CORE, ...CLINICAL_ALLIED];
  const unknown = grouped.filter((s) => !ALL_SUBJECTS.includes(s));
  const missing = ALL_SUBJECTS.filter((s) => !grouped.includes(s));

  if (unknown.length > 0) throw new Error(`Unknown subject name(s) in contest templates: ${unknown.join(', ')}`);
  if (missing.length > 0) throw new Error(`Subject(s) not placed in any group: ${missing.join(', ')}`);
})();


export const RETIRED_TEMPLATE_IDS = ['daily-easy-warmup', 'balanced-mixed-sprint', 'live-hard-challenge', 'premium-advanced-series'];

export const TEMPLATES: Record<string, ContestTemplateSeedInput> = {
  'daily-challenge-pack': {
    name: 'Daily Challenge Pack',
    templateKind: 'rotation',
    isActive: true,
    perSubject: true,
    runAtHoursIST: [0],
    subjectPool: ALL_SUBJECTS,
    difficultyWeights: { easy: 35, medium: 50, hard: 15 },
    questionCountRange: { min: 10, max: 12 },
    durationRange: { minSecs: 600, maxSecs: 720 },
    joinWindowRange: null,
    contestTypeMix: { daily: 100, live: 0, contest: 0 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    passPercent: 50,
    epRewardFormula: {
      base: 20,
      perQuestion: 3,
      difficultyMultiplier: { easy: 1, medium: 1.2, hard: 1.5 },
    },
    recommendedLevel: null,
    generationIntervalHrs: 24,
  },
  'foundation-practice': {
    name: 'Foundation Practice (Preclinical)',
    templateKind: 'rotation',
    isActive: true,
    runAtHoursIST: [8],
    subjectPool: PRECLINICAL,
    difficultyWeights: { easy: 40, medium: 45, hard: 15 },
    questionCountRange: { min: 15, max: 20 },
    durationRange: { minSecs: 900, maxSecs: 1200 },
    joinWindowRange: { minHrs: 72, maxHrs: 96 },
    contestTypeMix: { daily: 0, live: 0, contest: 100 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    passPercent: 55,
    epRewardFormula: {
      base: 30,
      perQuestion: 4,
      difficultyMultiplier: { easy: 1, medium: 1.25, hard: 1.6 },
    },
    recommendedLevel: 'MBBS Year 1-2',
    generationIntervalHrs: 24,
  },
  'paraclinical-practice': {
    name: 'Paraclinical Practice',
    templateKind: 'rotation',
    isActive: true,
    runAtHoursIST: [8],
    subjectPool: PARACLINICAL,
    difficultyWeights: { easy: 30, medium: 50, hard: 20 },
    questionCountRange: { min: 15, max: 20 },
    durationRange: { minSecs: 900, maxSecs: 1200 },
    joinWindowRange: { minHrs: 120, maxHrs: 144 },
    contestTypeMix: { daily: 0, live: 0, contest: 100 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    passPercent: 55,
    epRewardFormula: {
      base: 30,
      perQuestion: 4,
      difficultyMultiplier: { easy: 1, medium: 1.25, hard: 1.6 },
    },
    recommendedLevel: 'MBBS Year 2-3',
    generationIntervalHrs: 24,
  },
  'clinical-core-practice': {
    name: 'Clinical Core Practice',
    templateKind: 'rotation',
    isActive: true,
    runAtHoursIST: [8],
    subjectPool: CLINICAL_CORE,
    difficultyWeights: { easy: 25, medium: 50, hard: 25 },
    questionCountRange: { min: 15, max: 22 },
    durationRange: { minSecs: 1000, maxSecs: 1400 },
    joinWindowRange: { minHrs: 120, maxHrs: 144 },
    contestTypeMix: { daily: 0, live: 0, contest: 100 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    passPercent: 60,
    epRewardFormula: {
      base: 40,
      perQuestion: 4,
      difficultyMultiplier: { easy: 1, medium: 1.3, hard: 1.6 },
    },
    recommendedLevel: 'MBBS Year 3+',
    generationIntervalHrs: 24,
  },
  'clinical-allied-practice': {
    name: 'Clinical Allied Practice',
    templateKind: 'rotation',
    isActive: true,
    runAtHoursIST: [8],
    subjectPool: CLINICAL_ALLIED,
    difficultyWeights: { easy: 25, medium: 50, hard: 25 },
    questionCountRange: { min: 15, max: 22 },
    durationRange: { minSecs: 1000, maxSecs: 1400 },
    joinWindowRange: { minHrs: 144, maxHrs: 168 },
    contestTypeMix: { daily: 0, live: 0, contest: 100 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    passPercent: 60,
    epRewardFormula: {
      base: 40,
      perQuestion: 4,
      difficultyMultiplier: { easy: 1, medium: 1.3, hard: 1.6 },
    },
    recommendedLevel: 'MBBS Year 3+',
    generationIntervalHrs: 24,
  },
  'live-midday-sprint': {
    name: 'Live Midday Sprint',
    templateKind: 'rotation',
    isActive: true,
    runAtHoursIST: [12],
    subjectPool: ALL_SUBJECTS,
    difficultyWeights: { easy: 40, medium: 50, hard: 10 },
    questionCountRange: { min: 12, max: 15 },
    durationRange: { minSecs: 600, maxSecs: 900 },
    joinWindowRange: null,
    contestTypeMix: { daily: 0, live: 100, contest: 0 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    passPercent: 55,
    epRewardFormula: {
      base: 30,
      perQuestion: 3,
      difficultyMultiplier: { easy: 1, medium: 1.25, hard: 1.6 },
    },
    recommendedLevel: null,
    generationIntervalHrs: 24,
  },
  'live-evening-challenge': {
    name: 'Live Evening Challenge',
    templateKind: 'rotation',
    isActive: true,
    runAtHoursIST: [20],
    subjectPool: ALL_SUBJECTS,
    difficultyWeights: { easy: 10, medium: 50, hard: 40 },
    questionCountRange: { min: 20, max: 25 },
    durationRange: { minSecs: 1200, maxSecs: 1500 },
    joinWindowRange: null,
    contestTypeMix: { daily: 0, live: 100, contest: 0 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -2, skipped: 0 },
    passPercent: 65,
    epRewardFormula: {
      base: 60,
      perQuestion: 6,
      difficultyMultiplier: { easy: 1, medium: 1.5, hard: 2 },
    },
    recommendedLevel: 'Final Year / Intern',
    generationIntervalHrs: 24,
  },
  'premium-subject-pack': {
    name: 'Premium Subject Pack',
    templateKind: 'rotation',
    isActive: true,
    perSubject: true,
    runAtHoursIST: [4],
    subjectPool: ALL_SUBJECTS,
    difficultyWeights: { easy: 5, medium: 35, hard: 60 },
    questionCountRange: { min: 20, max: 28 },
    durationRange: { minSecs: 1500, maxSecs: 1800 },
    joinWindowRange: { minHrs: 168, maxHrs: 168 },
    contestTypeMix: { daily: 0, live: 0, contest: 100 },
    isPremium: true,
    markingScheme: { correct: 4, wrong: -2, skipped: 0 },
    passPercent: 70,
    epRewardFormula: {
      base: 100,
      perQuestion: 8,
      difficultyMultiplier: { easy: 1, medium: 1.6, hard: 2.2 },
    },
    recommendedLevel: 'Postgraduate / Practitioner',
    generationIntervalHrs: 168,
  },
  'weekly-grand-championship': {
    name: 'Weekly Grand Championship',
    templateKind: 'grand_championship',
    isActive: true,
    subjectPool: ALL_SUBJECTS,
    difficultyWeights: { easy: 20, medium: 40, hard: 40 },
    questionCountRange: { min: 30, max: 40 },
    durationRange: { minSecs: 3000, maxSecs: 3600 },
    joinWindowRange: null,
    contestTypeMix: { daily: 0, live: 0, contest: 0 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    passPercent: 60,
    epRewardFormula: {
      base: 300,
      perQuestion: 10,
      difficultyMultiplier: { easy: 1, medium: 1.3, hard: 1.6 },
    },
    recommendedLevel: null,
    generationIntervalHrs: 168,
  },
};

const TICK_HOURS_IST = [0, 4, 8, 12, 16, 20];

export function validateTemplates(templates: Record<string, ContestTemplateSeedInput> = TEMPLATES): string[] {
  const problems: string[] = [];

  for (const [id, t] of Object.entries(templates)) {
    const weightSum = t.difficultyWeights.easy + t.difficultyWeights.medium + t.difficultyWeights.hard;
    if (weightSum <= 0) {
      problems.push(`${id}: difficultyWeights are all zero.`);
    }

    if (t.questionCountRange.min > t.questionCountRange.max) {
      problems.push(`${id}: questionCountRange min is above max.`);
    }

    if (t.subjectPool.length === 0) {
      problems.push(`${id}: subjectPool is empty.`);
    }

    if (t.contestTypeMix.contest > 0 && !t.joinWindowRange) {
      problems.push(`${id}: "contest" type needs a joinWindowRange.`);
    }

    for (const hour of t.runAtHoursIST ?? []) {
      if (!TICK_HOURS_IST.includes(hour)) {
        problems.push(`${id}: runAtHoursIST ${hour} is not a generator tick hour (${TICK_HOURS_IST.join(', ')}).`);
      }
    }

    if (t.perSubject && t.templateKind !== 'rotation') {
      problems.push(`${id}: perSubject only works on rotation templates.`);
    }
  }

  return problems;
}
