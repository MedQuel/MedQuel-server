import type { Timestamp } from 'firebase-admin/firestore';


export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'declined' | 'expired' | 'cancelled';
export type ParticipantResponseStatus = 'invited' | 'accepted' | 'declined';

export interface ParticipantState {
  status: ParticipantResponseStatus;
  respondedAt: Timestamp | null;
  score: number | null;
  correctCount: number | null;
  quizSessionId: string | null;
  completedAt: Timestamp | null;
}

export interface ChallengeRewards {
  winnerEp: number;
  participationEp: number;
}

export interface ChallengeDocument {
  challengeId: string;
  createdBy: string;
  participants: string[];
  participantStatus: Record<string, ParticipantState>;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimitSecs: number;
  questionIds: string[] | null;
  status: ChallengeStatus;
  winnerUid: string | null;
  rewards: ChallengeRewards;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
