import type { Firestore } from 'firebase-admin/firestore';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

import { ChallengeNotFoundError } from '../../utils/errors.js';
import { publishNotification } from '../../pubsub/publisher.js';
import type { NotificationEvent } from '../../types/notificationTypes.js';


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
  let pendingNotifications: NotificationEvent[] = [];

  const outcome = await db.runTransaction(async (tx) => {
    pendingNotifications = [];

    const snap = await tx.get(ref);
    if (!snap.exists) throw new ChallengeNotFoundError();
    const data = snap.data()!;

    const myState = data.participantStatus[uid];
    if (myState?.completedAt) {
      return {
        status: data.status as string,
        winnerUid: (data.winnerUid ?? null) as string | null,
      };
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

      participants
        .filter((p) => p !== uid && data.participantStatus[p]?.completedAt == null)
        .forEach((opponentUid) => {
          pendingNotifications.push({
            userId: opponentUid,
            type: 'challenge',
            kind: 'challenge_opponent_finished',
            title: 'Your turn!',
            body: `Your friend finished the ${data.subject} challenge. Beat their score!`,
            data: { challengeId, subject: data.subject },
            dedupeKey: `chFinished_${challengeId}_${uid}`,
          });
        });

      return { status: 'active', winnerUid: null as string | null };
    }

    const scores = participants.map((p) => ({
      uid: p,
      score: p === uid ? result.score : (data.participantStatus[p].score as number),
    }));
    const topScore = Math.max(...scores.map((s) => s.score));
    const winners = scores.filter((s) => s.score === topScore).map((s) => s.uid);
    const isDraw = winners.length > 1;
    const winnerUid = isDraw ? null : winners[0]!;

    const userRefs = participants.map((p) => db.collection('users').doc(p));
    const friendRefs = participants.map((p) => {
      const opponent = participants.find((x) => x !== p)!;
      return db.collection('users').doc(p).collection('friends').doc(opponent);
    });
    const [userSnaps, friendSnaps] = await Promise.all([
      Promise.all(userRefs.map((r) => tx.get(r))),
      Promise.all(friendRefs.map((r) => tx.get(r))),
    ]);

    userSnaps.forEach((userSnap, i) => {
      if (!userSnap.exists) return;

      const p = participants[i]!;
      const isWinner = !isDraw && p === winnerUid;
      const epToCredit = isDraw || isWinner ? data.rewards.winnerEp : data.rewards.participationEp;
      const userData = userSnap.data()!;

      tx.update(userRefs[i]!, {
        epPoints: (userData.epPoints ?? 0) + epToCredit,
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (friendSnaps[i]!.exists) {
        const field = isDraw
          ? 'headToHead.draws'
          : isWinner ? 'headToHead.wins' : 'headToHead.losses';
        tx.update(friendRefs[i]!, { [field]: FieldValue.increment(1) });
      }

      pendingNotifications.push({
        userId: p,
        type: 'challenge',
        kind: isDraw
          ? 'challenge_draw'
          : isWinner ? 'challenge_won' : 'challenge_lost',
        title: isDraw
          ? "It's a draw!"
          : isWinner ? 'You won your challenge!' : 'Challenge complete',
        body: isDraw
          ? `You tied in ${data.subject} — +${epToCredit} EP.`
          : isWinner
            ? `You beat your friend in ${data.subject} — +${epToCredit} EP.`
            : `You lost this round in ${data.subject} — +${epToCredit} EP for playing.`,
        data: { challengeId, subject: data.subject, epEarned: String(epToCredit) },
        dedupeKey: `chResult_${challengeId}_${p}`,
      });
    });

    tx.update(ref, {
      [`participantStatus.${uid}`]: myUpdatedState,
      status: 'completed',
      winnerUid,
      completedAt: now,
      updatedAt: now,
    });

    return { status: 'completed', winnerUid: winnerUid as string | null };
  });

  await Promise.all(pendingNotifications.map((event) => publishNotification(event)));

  return outcome;
}
