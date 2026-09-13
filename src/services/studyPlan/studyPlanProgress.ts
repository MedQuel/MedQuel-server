import type { Firestore } from 'firebase-admin/firestore';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

import { mapStudyPlanDoc } from './studyPlanMapper.js';
import { computeLevelFromXp } from '../../services/xpEpService.js';
import type { StudyPlanDocument } from '../../types/studyPlanTypes.js';
import { NotOnboardedError, SessionNotFoundError, InvalidStudyPlanLinkError } from '../../utils/errors.js';
import { StudyPlanSessionNotFoundError, StudyPlanSessionAlreadyCompletedError } from '../../utils/errors.js';


const LIFETIME_COMPLETION_WEIGHT = 0.4;
const CURRENT_WEEK_COMPLETION_WEIGHT = 0.6;

export interface MarkStudySessionCompleteResult {
  plan: StudyPlanDocument;
  xpEarned: number;
}

export function computePreparationPercent(
  sessions: { status: string }[],
  lifetimePlanned: number,
  lifetimeCompleted: number
): number {
  const totalThisWeek = sessions.length;
  const completedThisWeek = sessions.filter((s) => s.status === 'completed').length;
  const currentWeekRate = totalThisWeek > 0 ? completedThisWeek/totalThisWeek : 0;
  const lifetimeRate = lifetimePlanned > 0 ? lifetimeCompleted/lifetimePlanned : 0;

  const blended = CURRENT_WEEK_COMPLETION_WEIGHT*currentWeekRate + LIFETIME_COMPLETION_WEIGHT*lifetimeRate;

  return Math.round(Math.min(1, Math.max(0, blended))*100);
}


export async function markStudySessionComplete(
  uid: string,
  sessionId: string,
  quizSessionId: string | null,
  db: Firestore
): Promise<MarkStudySessionCompleteResult> {
  const userRef = db.collection('users').doc(uid);
  const planRef = db.collection('studyPlans').doc(uid);

  const result = await db.runTransaction(async (tx) => {
    const planSnap = await tx.get(planRef);
    if (!planSnap.exists) throw new NotOnboardedError('You do not have a study plan yet.');

    const planData = planSnap.data()!;
    const sessions = (planData.sessions ?? []) as any[];
    const index = sessions.findIndex((s) => s.sessionId === sessionId);
    if (index === -1) throw new StudyPlanSessionNotFoundError();

    const session = sessions[index];
    if (session.status === 'completed') throw new StudyPlanSessionAlreadyCompletedError();

    let xpToCredit = 0;
    let updatedSession: any;
    const now = Timestamp.now();

    if (session.sessionType === 'quiz') {
      if (!quizSessionId) {
        throw new InvalidStudyPlanLinkError('quizSessionId is required to complete a quiz-type study plan session.');
      }

      const alreadyLinked = sessions.some((s) => s.linkedQuizSessionId === quizSessionId);
      if (alreadyLinked) {
        throw new InvalidStudyPlanLinkError('This quiz session has already been linked to a study plan session.');
      }

      const quizSnap = await tx.get(db.collection('quizSessions').doc(quizSessionId));
      if (!quizSnap.exists) throw new SessionNotFoundError();

      const quizData = quizSnap.data()!;
      if (quizData.userId !== uid) throw new SessionNotFoundError();
      if (quizData.status !== 'completed') {
        throw new InvalidStudyPlanLinkError('The referenced quiz session has not been completed yet.');
      }
      if (quizData.subject !== session.subject) {
        throw new InvalidStudyPlanLinkError('The referenced quiz session is for a different subject.');
      }

      updatedSession = {
        ...session,
        status: 'completed',
        completedAt: now,
        linkedQuizSessionId: quizSessionId,
      };
    } else {
      updatedSession = { ...session, status: 'completed', completedAt: now };
      xpToCredit = session.xpReward ?? 0;
    }

    let userData: FirebaseFirestore.DocumentData | null = null;
    if (xpToCredit > 0) {
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new NotOnboardedError();
      userData = userSnap.data()!;
    }

    const updatedSessions = [...sessions];
    updatedSessions[index] = updatedSession;

    const lifetimeCompleted = (planData.lifetimeSessionsCompleted ?? 0) + 1;
    const lifetimePlanned = planData.lifetimeSessionsPlanned ?? updatedSessions.length;
    const preparationPercent = computePreparationPercent(
      updatedSessions,
      lifetimePlanned,
      lifetimeCompleted
    );

    tx.update(planRef, {
      sessions: updatedSessions,
      lifetimeSessionsCompleted: lifetimeCompleted,
      preparationPercent,
      updatedAt: now,
    });

    if (xpToCredit > 0 && userData) {
      const updatedXpPoints = (userData.xpPoints ?? 0) + xpToCredit;
      tx.update(userRef, {
        xpPoints: updatedXpPoints,
        currentLevel: computeLevelFromXp(updatedXpPoints),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return {
      plan: { ...planData, sessions: updatedSessions, preparationPercent },
      xpEarned: xpToCredit,
    };
  });

  return {
    plan: mapStudyPlanDoc(result.plan),
    xpEarned: result.xpEarned
  };
}
