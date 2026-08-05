import { FieldValue } from 'firebase-admin/firestore';

import { db } from '../src/config/firebase.js';
import type { ContestTemplateSeedInput } from '../src/types/contestTemplate.js';


const TEMPLATES: Record<string, ContestTemplateSeedInput> = {
  'daily-easy-warmup': {
    name: 'Daily Easy Warmup',
    templateKind: 'rotation',
    isActive: true,
    subjectPool: ['Anatomy', 'Biochemistry', 'Physiology', 'Microbiology', 'Pharmacology', 'Pathology', 'Community Medicine'],
    difficultyWeights: { easy: 70, medium: 25, hard: 5 },
    questionCountRange: { min: 10, max: 15 },
    durationRange: { minSecs: 600, maxSecs: 900 },
    contestTypeMix: { daily: 80, live: 20 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    passPercent: 50,
    epRewardFormula: { base: 20, perQuestion: 3, difficultyMultiplier: { easy: 1, medium: 1.2, hard: 1.5 } },
    recommendedLevel: 'MBBS Year 1-3',
    generationIntervalHrs: 4,
  },
  'balanced-mixed-sprint': {
    name: 'Balanced Mixed Sprint',
    templateKind: 'rotation',
    isActive: true,
    subjectPool: ['Medicine', 'Surgery', 'Pediatrics', 'Gynaecology Obstetrics', 'Orthopedics', 'ENT', 'Ophthalmology'],
    difficultyWeights: { easy: 30, medium: 50, hard: 20 },
    questionCountRange: { min: 15, max: 20 },
    durationRange: { minSecs: 900, maxSecs: 1200 },
    contestTypeMix: { daily: 50, live: 50 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    passPercent: 60,
    epRewardFormula: { base: 40, perQuestion: 4, difficultyMultiplier: { easy: 1, medium: 1.3, hard: 1.6 } },
    recommendedLevel: 'MBBS Year 3+',
    generationIntervalHrs: 4,
  },
  'live-hard-challenge': {
    name: 'Live Hard Challenge',
    templateKind: 'rotation',
    isActive: true,
    subjectPool: ['Medicine', 'Surgery', 'Pathology', 'Pharmacology', 'Orthopedics', 'Anesthesia'],
    difficultyWeights: { easy: 5, medium: 25, hard: 70 },
    questionCountRange: { min: 20, max: 25 },
    durationRange: { minSecs: 1200, maxSecs: 1500 },
    contestTypeMix: { daily: 0, live: 100 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -2, skipped: 0 },
    passPercent: 70,
    epRewardFormula: { base: 60, perQuestion: 6, difficultyMultiplier: { easy: 1, medium: 1.5, hard: 2 } },
    recommendedLevel: 'Final Year / Intern',
    generationIntervalHrs: 6,
  },
  'premium-advanced-series': {
    name: 'Premium Advanced Series',
    templateKind: 'rotation',
    isActive: true,
    subjectPool: ['Medicine', 'Surgery', 'Pediatrics', 'Gynaecology Obstetrics', 'Orthopedics', 'Dermatology', 'Psychiatry', 'Anesthesia', 'Radiology', 'ENT', 'Ophthalmology'],
    difficultyWeights: { easy: 10, medium: 30, hard: 60 },
    questionCountRange: { min: 20, max: 30 },
    durationRange: { minSecs: 1500, maxSecs: 1800 },
    contestTypeMix: { daily: 40, live: 60 },
    isPremium: true,
    markingScheme: { correct: 4, wrong: -2, skipped: 0 },
    passPercent: 70,
    epRewardFormula: { base: 100, perQuestion: 8, difficultyMultiplier: { easy: 1, medium: 1.6, hard: 2.2 } },
    recommendedLevel: 'Postgraduate / Practitioner',
    generationIntervalHrs: 8,
  },
  'weekly-grand-championship': {
    name: 'Weekly Grand Championship',
    templateKind: 'grand_championship',
    isActive: true,
    subjectPool: [
      'Anatomy', 'Biochemistry', 'Physiology', 'Microbiology', 'Pharmacology',
      'Forensic Medicine', 'Pathology', 'Ophthalmology', 'ENT', 'Community Medicine',
      'Medicine', 'Surgery', 'Pediatrics', 'Gynaecology Obstetrics', 'Orthopedics',
      'Dermatology', 'Psychiatry', 'Anesthesia', 'Radiology',
    ],
    difficultyWeights: { easy: 20, medium: 40, hard: 40 },
    questionCountRange: { min: 40, max: 50 },
    durationRange: { minSecs: 3000, maxSecs: 3600 },
    contestTypeMix: { daily: 0, live: 0 },
    isPremium: false,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    passPercent: 60,
    epRewardFormula: { base: 300, perQuestion: 10, difficultyMultiplier: { easy: 1, medium: 1.3, hard: 1.6 } },
    recommendedLevel: null,
    generationIntervalHrs: 168,
  },
};


async function seed(): Promise<void> {
  const collection = db.collection('contestTemplates');

  for (const [slug, template] of Object.entries(TEMPLATES)) {
    const ref = collection.doc(slug);
    const existing = await ref.get();

    if (existing.exists) {
      await ref.update({
        ...template,
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`Updated: ${slug}`);
    } else {
      await ref.set({
        ...template,
        templateId: slug,
        lastGeneratedAt: null,
        createdBy: 'seed-script',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`Created: ${slug}`);
    }
  }

  console.log(`Done — ${Object.keys(TEMPLATES).length} templates in sync.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
