import type { Challenge, ParticipantState } from '../types/types';


export function getOpponentUid(challenge: Challenge, myUid: string): string | undefined {
  return challenge.participants.find((uid) => uid !== myUid);
}

export function getMyParticipantState(challenge: Challenge, myUid: string): ParticipantState | null {
  return challenge.participantStates.find((p) => p.uid === myUid) ?? null;
}
export function getOpponentParticipantState(challenge: Challenge, myUid: string): ParticipantState | null {
  return challenge.participantStates.find((p) => p.uid !== myUid) ?? null;
}

export function isPendingInviteForMe(challenge: Challenge, myUid: string): boolean {
  const mine = getMyParticipantState(challenge, myUid);
  return challenge.status === 'pending' && mine?.status === 'invited';
}
export function isActiveForMe(challenge: Challenge, myUid: string): boolean {
  const mine = getMyParticipantState(challenge, myUid);
  return challenge.status === 'active' && mine?.completedAt == null;
}

export function didIWin(challenge: Challenge, myUid: string): boolean | null {
  if (challenge.status !== 'completed') return null;
  if (!challenge.winnerUid) return null;
  return challenge.winnerUid === myUid;
}
