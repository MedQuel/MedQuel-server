import type { Timestamp } from 'firebase-admin/firestore';


export interface ContestDoc {
  contestId: string;
  subject: string;
  contestType: 'daily' | 'weekly' | 'live';
  difficulty: 'easy' | 'medium' | 'hard';
  epReward: number;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  startsAt: Timestamp;
  endsAt: Timestamp;
}

export interface ContestLeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
  completedAt: Timestamp;
}
