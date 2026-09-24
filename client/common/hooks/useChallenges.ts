import { useCallback, useRef, useState } from 'react';

import { api } from '../api/api';
import { normalizeError } from '../api/api.errors';
import type { Challenge, FriendSummary } from '../types/types';


export interface ChallengesState {
  challenges: Challenge[];
  friendsById: Map<string, FriendSummary>;
}
const EMPTY_STATE: ChallengesState = { challenges: [], friendsById: new Map() };

export function useChallenges() {
  const [data, setData] = useState<ChallengesState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const load = useCallback(async () => {
    if (hasLoadedOnceRef.current) setRefreshing(true);
    setError(null);
    try {
      const [challengesResult, friendsResult] = await Promise.all([
        api.challenge.getChallenges({ limit: 50 }),
        api.friends.getFriends(),
      ]);
      setData({
        challenges: challengesResult,
        friendsById: new Map(friendsResult.map((f) => [f.uid, f])),
      });
      hasLoadedOnceRef.current = true;
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const respond = useCallback(async (challengeId: string, accept: boolean) => {
    const updated = await api.challenge.respondChallenge(challengeId, accept);
    setData((prev) => ({
      ...prev,
      challenges: prev.challenges.map((c) => c.challengeId === challengeId ? updated : c),
    }));
    return updated;
  }, []);

  return { data, loading, refreshing, error, load, respond };
}
