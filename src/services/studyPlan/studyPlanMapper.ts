import type { Timestamp } from 'firebase-admin/firestore';
import type { StudyPlanDocument, StudyPlanSessionItem } from '../../types/studyPlanTypes.js';


function toISO(value: Timestamp | null | undefined): string | null {
  return value ? value.toDate().toISOString() : null;
}

function mapSession(raw: FirebaseFirestore.DocumentData): StudyPlanSessionItem {
  const base = {
    sessionId: raw.sessionId,
    subject: raw.subject,
    topic: raw.topic,
    scheduledDate: raw.scheduledDate,
    xpReward: raw.xpReward,
    status: raw.status,
    completedAt: toISO(raw.completedAt),
  };

  if (raw.sessionType === 'quiz') {
    return {
      ...base,
      sessionType: 'quiz',
      questionCount: raw.questionCount,
      difficulty: raw.difficulty,
      linkedQuizSessionId: raw.linkedQuizSessionId ?? null,
    };
  }

  return {
    ...base,
    sessionType: 'read',
    title: raw.title,
    content: raw.content,
    disclaimer: raw.disclaimer,
    estimatedMinutes: raw.estimatedMinutes,
  };
}


export function mapStudyPlanDoc(data: FirebaseFirestore.DocumentData): StudyPlanDocument {
  return {
    userId: data.userId,
    targetExam: data.targetExam,
    examDate: toISO(data.examDate),
    dailyCommitment: data.dailyCommitment,
    daysPerWeek: data.daysPerWeek ?? [],
    subjectPriority: data.subjectPriority ?? [],
    milestones: data.milestones ?? [],
    weeklyXpTarget: data.weeklyXpTarget ?? 0,
    preparationPercent: data.preparationPercent ?? 0,
    currentWeekNumber: data.currentWeekNumber ?? 1,
    currentWeekStartDate: data.currentWeekStartDate,
    sessions: (data.sessions ?? []).map(mapSession),
    generatedBy: data.generatedBy ?? 'ai',
  };
}
