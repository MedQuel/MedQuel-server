import { useCallback, useRef, useState } from 'react';

import { api } from '../api/api';
import { normalizeError } from '../api/api.errors';
import type { Contest, Challenge, StudyPlan } from '../types/types';
import type { HomeData, FriendSummary, AnalyticsData } from '../types/types';


export interface HomeDashboardState {
  homeData: HomeData | null;
  myRank: number | null;
  analytics: AnalyticsData | null;
  challenges: Challenge[];
  friendsById: Map<string, FriendSummary>;
  studyPlan: StudyPlan | null;
  dailyChallengeContest: Contest | null;
}

const HOME_DATA_MAX_RETRIES = 2;
const HOME_DATA_RETRY_DELAY_MS = 400;
const EMPTY_STATE: HomeDashboardState = {
  homeData: null,
  myRank: null,
  analytics: null,
  challenges: [],
  friendsById: new Map(),
  studyPlan: null,
  dailyChallengeContest: null,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHomeDataWithRetry(retriesLeft = HOME_DATA_MAX_RETRIES): Promise<HomeData> {
  try {
    return await api.home.getHomeData();
  } catch (err) {
    if (retriesLeft <= 0) throw err;
    await delay(HOME_DATA_RETRY_DELAY_MS);
    return fetchHomeDataWithRetry(retriesLeft - 1);
  }
}


export function useHomeDashboard() {
  const [data, setData] = useState<HomeDashboardState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (hasLoadedOnceRef.current) setRefreshing(true);
    setError(null);

    try {
      const [homeRes, leaderboardRes, analyticsRes, challengesRes, friendsRes, studyPlanRes] = await Promise.allSettled([
        fetchHomeDataWithRetry(),
        api.leaderboard.getLeaderboard(),
        api.analytics.getAnalytics(),
        api.challenge.getChallenges({ limit: 20 }),
        api.friends.getFriends(),
        api.studyPlan.getStudyPlan(),
      ]);

      if (homeRes.status === 'rejected') throw homeRes.reason;
      const homeData = homeRes.value;

      const dailyChallengeContestId = homeData.dailyChallenge?.contestId ?? null;
      const dailyChallengeContest = dailyChallengeContestId
        ? ((await api.contest.getContest(dailyChallengeContestId).catch(() => null)) ?? null)
        : null;

      setData({
        homeData,
        myRank: leaderboardRes.status === 'fulfilled' ? leaderboardRes.value.myRank : null,
        analytics: analyticsRes.status === 'fulfilled' ? analyticsRes.value : null,
        challenges: challengesRes.status === 'fulfilled' ? challengesRes.value : [],
        friendsById: friendsRes.status === 'fulfilled'
          ? new Map(friendsRes.value.map((f) => [f.uid, f]))
          : new Map(),
        studyPlan: studyPlanRes.status === 'fulfilled' ? studyPlanRes.value : null,
        dailyChallengeContest,
      });
      hasLoadedOnceRef.current = true;
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  return { data, loading, refreshing, error, load };
}
