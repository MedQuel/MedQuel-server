import type { Firestore } from 'firebase-admin/firestore';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

import { ChallengeNotFoundError } from '../../utils/errors.js';


interface ChallengeResultInput {
  score: number;
  correctCount: number;
  quizSessionId: string;
}
export interface ChallengeOutcome {
  status: string;
  winnerUid: string | null;
}

export async function recordChallengeResult(
  uid: string,
  challengeId: string,
  result: ChallengeResultInput,
  db: Firestore
): Promise<ChallengeOutcome> {
  const ref = db.collection('challenges').doc(challengeId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ChallengeNotFoundError();
    const data = snap.data()!;

    const myState = data.participantStatus[uid];
    if (myState?.completedAt) {
      return { status: data.status, winnerUid: data.winnerUid ?? null };
    }

    const now = Timestamp.now();
    const myUpdatedState = {
      ...myState,
      score: result.score,
      correctCount: result.correctCount,
      quizSessionId: result.quizSessionId,
      completedAt: now,
    };

    const participants: string[] = data.participants;
    const allComplete = participants.every((p) =>
      p === uid ? true : data.participantStatus[p]?.completedAt != null
    );

    if (!allComplete) {
      tx.update(ref, {
        [`participantStatus.${uid}`]: myUpdatedState,
        updatedAt: now,
      });
      return { status: 'active', winnerUid: null };
    }

    const scores = participants.map((p) => ({
      uid: p,
      score: p === uid ? result.score : (data.participantStatus[p].score as number),
    }));
    const topScore = Math.max(...scores.map((s) => s.score));
    const winners = scores.filter((s) => s.score === topScore).map((s) => s.uid);
    const isDraw = winners.length > 1;
    const winnerUid = isDraw ? null : winners[0];

    const userRefs = participants.map((p) => db.collection('users').doc(p));
    const userSnaps = await Promise.all(userRefs.map((r) => tx.get(r)));

    userSnaps.forEach((userSnap, i) => {
      if (!userSnap.exists) return;

      const p = participants[i];
      const epToCredit = isDraw || p === winnerUid
        ? data.rewards.winnerEp
        : data.rewards.participationEp;
      const userData = userSnap.data()!;

      tx.update(userRefs[i]!, {
        epPoints: (userData.epPoints ?? 0) + epToCredit,
        updatedAt: FieldValue.serverTimestamp(),
      });

      tx.set(db.collection('notifications').doc(), {
        userId: p,
        type: 'challenge_result',
        title: isDraw
          ? "It's a draw!"
          : p === winnerUid ? 'You won your challenge!' : 'Challenge complete',
        body: isDraw
          ? `You tied in ${data.subject} — +${epToCredit} EP.`
          : p === winnerUid
            ? `You beat your friend in ${data.subject} — +${epToCredit} EP.`
            : `You lost this round in ${data.subject} — +${epToCredit} EP for playing.`,
        data: { challengeId },
        isRead: false,
        createdAt: now,
      });
    });

    tx.update(ref, {
      [`participantStatus.${uid}`]: myUpdatedState,
      status: 'completed',
      winnerUid,
      completedAt: now,
      updatedAt: now,
    });

    return { status: 'completed', winnerUid };
  });
}
