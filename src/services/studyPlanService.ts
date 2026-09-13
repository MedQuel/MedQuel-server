import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';

import { mapStudyPlanDoc } from './studyPlan/studyPlanMapper.js';
import { generateWeekSessions } from './studyPlan/studyPlanGeneration.js';
import { validateGenerateStudyPlanInput } from '../validators/studyPlanValidation.js';
import { computeMilestones, computeWeeklyXpTarget } from './studyPlan/studyPlanShell.js';

import { VALID_SPECIALTIES } from '../validators/onboardingValidation.js';
import { getISTWeekStartDateKey, toISTDateKey } from '../utils/istDate.js';
import type { ValidatedGeminiSession } from '../validators/studyPlanOutputValidation.js';
import type { StudyPlanDocument, StudyPlanSessionItem } from '../types/studyPlanTypes.js';
import { NotOnboardedError, StudyPlanRegenerationCooldownError } from '../utils/errors.js';
import { type Weekday, type GenerateStudyPlanInput } from '../validators/studyPlanValidation.js';
import { MIN_ATTEMPTS_FOR_SUBJECT_HIGHLIGHT, computeSubjectPerformance } from './analyticsService.js';


const MIN_REGENERATION_INTERVAL_MS = 2*24 * 60*60 * 1000;
const WEEKDAY_OFFSET: Record<Weekday, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};
const QUIZ_XP_BASE_BY_DIFFICULTY: Record<'easy' | 'medium' | 'hard', number> = {
  easy: 15,
  medium: 25,
  hard: 35,
};
const READ_SESSION_XP_REWARD = 5;
const REFERENCE_QUESTION_COUNT = 15;
const READ_SESSION_DISCLAIMER = 'Quick revision summary: always verify against your textbook or faculty before relying on this for exam prep.';

export function computeQuizXpReward(difficulty: 'easy' | 'medium' | 'hard', questionCount: number): number {
  return Math.max(
    1,
    Math.round(QUIZ_XP_BASE_BY_DIFFICULTY[difficulty] * (questionCount/REFERENCE_QUESTION_COUNT))
  );
}

export function resolveSubjectPriority(userData: FirebaseFirestore.DocumentData, explicitPriority: string[] | null): string[] {
  if (explicitPriority && explicitPriority.length > 0) return explicitPriority;

  const subjectStats = userData.stats?.subjectStats ?? {};
  const performance = computeSubjectPerformance(subjectStats).filter(
    (s) => s.totalAttempted >= MIN_ATTEMPTS_FOR_SUBJECT_HIGHLIGHT
  );

  if (performance.length > 0) return performance.slice().reverse().slice(0, 5).map((s) => s.subject);
  if (userData.specialties?.length > 0) return userData.specialties;
  if (userData.contentScope === 'focused' && userData.focusSubjects?.length > 0) return userData.focusSubjects;

  return [...VALID_SPECIALTIES];
}

export function buildWeakSubjectsContext(userData: FirebaseFirestore.DocumentData): { subject: string; accuracy: number }[] {
  const subjectStats = userData.stats?.subjectStats ?? {};

  return computeSubjectPerformance(subjectStats)
    .filter((s) => s.totalAttempted >= MIN_ATTEMPTS_FOR_SUBJECT_HIGHLIGHT)
    .slice()
    .reverse()
    .slice(0, 5)
    .map((s) => ({ subject: s.subject, accuracy: s.accuracy }));
}

export function materializeSessions(validated: ValidatedGeminiSession[], weekStartDateKey: string): StudyPlanSessionItem[] {
  const weekStart = new Date(`${weekStartDateKey}T00:00:00.000Z`);

  return validated.map((s, index) => {
    const offsetDays = WEEKDAY_OFFSET[s.dayOfWeek];
    const scheduledDate = toISTDateKey(new Date(weekStart.getTime()+offsetDays * 24*60*60*1000));
    const sessionId = `w-${weekStartDateKey}-${index}`;

    if (s.sessionType === 'quiz') {
      return {
        sessionId,
        sessionType: 'quiz' as const,
        subject: s.subject,
        topic: s.topic,
        scheduledDate,
        questionCount: s.questionCount!,
        difficulty: s.difficulty!,
        xpReward: computeQuizXpReward(s.difficulty!, s.questionCount!),
        status: 'pending' as const,
        linkedQuizSessionId: null,
        completedAt: null,
      };
    }

    return {
      sessionId,
      sessionType: 'read' as const,
      subject: s.subject,
      topic: s.topic,
      scheduledDate,
      title: s.title!,
      content: s.content!,
      disclaimer: READ_SESSION_DISCLAIMER,
      estimatedMinutes: s.estimatedMinutes!,
      xpReward: READ_SESSION_XP_REWARD,
      status: 'pending' as const,
      completedAt: null,
    };
  });
}

function assertRegenerationAllowed(existingData: FirebaseFirestore.DocumentData | undefined): void {
  if (!existingData) return;
  const lastRegeneratedAt = existingData.lastRegeneratedAt as Timestamp | undefined;
  if (!lastRegeneratedAt) return;

  const elapsed = Date.now() - lastRegeneratedAt.toMillis();
  if (elapsed < MIN_REGENERATION_INTERVAL_MS) {
    const remainingHours = Math.ceil((MIN_REGENERATION_INTERVAL_MS-elapsed) / (60*60*1000));
    throw new StudyPlanRegenerationCooldownError(remainingHours);
  }
}


export async function getStudyPlan(uid: string, db: Firestore): Promise<StudyPlanDocument | null> {
  const doc = await db.collection('studyPlans').doc(uid).get();
  if (!doc.exists) return null;

  return mapStudyPlanDoc(doc.data()!);
}

export async function generateStudyPlan(uid: string, rawInput: GenerateStudyPlanInput, db: Firestore): Promise<StudyPlanDocument> {
  const validatedInput = validateGenerateStudyPlanInput(rawInput);

  const userRef = db.collection('users').doc(uid);
  const planRef = db.collection('studyPlans').doc(uid);

  const [userSnap, existingPlanSnap] = await Promise.all([
    userRef.get(),
    planRef.get(),
  ]);
  if (!userSnap.exists) throw new NotOnboardedError();

  assertRegenerationAllowed(existingPlanSnap.exists ? existingPlanSnap.data()! : undefined);

  const userData = userSnap.data()!;
  const subjectPriority = resolveSubjectPriority(userData, validatedInput.subjectPriority);
  const weakSubjects = buildWeakSubjectsContext(userData);

  const now = new Date();
  const weekStartDateKey = getISTWeekStartDateKey(now);

  const { sessions: validatedSessions, generatedBy } = await generateWeekSessions({
    targetExam: userData.targetExam,
    describesYou: userData.describesYou ?? userData.studyLevel,
    weekNumber: 1,
    daysPerWeek: validatedInput.daysPerWeek,
    sessionsPerDay: validatedInput.sessionsPerDay,
    weakSubjects,
    masteredSubjects: userData.stats?.masteredSubjects ?? [],
    subjectPriority,
  });

  const sessions = materializeSessions(validatedSessions, weekStartDateKey);
  const milestones = computeMilestones(validatedInput.examDate, now);
  const weeklyXpTarget = computeWeeklyXpTarget(sessions);
  const nowTs = Timestamp.now();

  const planDoc = {
    userId: uid,
    targetExam: userData.targetExam,
    examDate: validatedInput.examDate ? Timestamp.fromDate(validatedInput.examDate) : null,
    dailyCommitment: validatedInput.dailyCommitment,
    daysPerWeek: validatedInput.daysPerWeek,
    subjectPriority,
    milestones,
    weeklyXpTarget,
    preparationPercent: 0,
    currentWeekNumber: 1,
    currentWeekStartDate: weekStartDateKey,
    sessions,
    generatedBy,
    active: true,
    lifetimeSessionsPlanned: sessions.length,
    lifetimeSessionsCompleted: 0,
    createdAt: existingPlanSnap.exists ? existingPlanSnap.data()!.createdAt : nowTs,
    updatedAt: nowTs,
    lastRegeneratedAt: nowTs,
  };
  await planRef.set(planDoc);

  return mapStudyPlanDoc(planDoc);
}
