import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import { ContestCard } from '../../components/ContestCard';
import { ChipContainer } from '../../components/common/Chip';
import { normalizeError } from '../../common/api/api.errors';
import { useBottomBar } from '../../common/context/useBottomBar';
import { CustomSearchBar } from '../../components/CustomSearchBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { FeatureContestCard } from '../../components/FeatureContestCard';
import type { Contest, GetContestsFilter } from '../../common/types/types';
import { subjectCatalog, type SubjectId } from '../../common/constants/subject';
import type { ContestFilter, ContestItem, FeaturedContest } from '../../common/types/contestTypes';

const filterChips: ContestFilter[] = ['all', 'premium', ...(Object.keys(subjectCatalog) as SubjectId[])];

const SUBJECT_ALIASES: Record<string, SubjectId> = {
  'general medicine': 'medicine',
  'general surgery': 'surgery',
  otorhinolaryngology: 'ent',
  'preventive & social medicine': 'community_medicine',
  orthopaedics: 'orthopedics',
  anaesthesia: 'anesthesia',
  paediatrics: 'pediatrics',
};

const SUBJECT_TO_FILTER_ID: Record<string, SubjectId> = {
  ...Object.fromEntries(Object.values(subjectCatalog).map((s) => [s.title.toLowerCase(), s.id])),
  ...SUBJECT_ALIASES,
};

function subjectToFilterId(subject: string): SubjectId | null {
  return SUBJECT_TO_FILTER_ID[subject?.trim().toLowerCase()] ?? null;
}

function getEpochMs(target?: string | number | Date | { seconds?: number; _seconds?: number } | null): number {
  if (!target) return 0;
  if (typeof target === 'number') return target;
  if (typeof target === 'string') return new Date(target).getTime();
  if (target instanceof Date) return target.getTime();
  if (typeof target === 'object') {
    const sec = target.seconds ?? target._seconds;
    if (typeof sec === 'number') return sec * 1000;
  }
  return new Date(target as any).getTime();
}

function formatTimeLeft(endsAt?: string | number | Date | null, nowMs: number = Date.now()): string {
  const targetMs = getEpochMs(endsAt);
  const diffMs = targetMs - nowMs;

  if (diffMs <= 0) return '0 mins';

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days >= 1) {
    return `${days} ${days === 1 ? 'day' : 'days'} ${hours} hrs`;
  }
  if (hours >= 1) {
    return `${hours} hrs ${minutes} mins`;
  }
  return `${minutes} mins`;
}

function mapContest(raw: Contest, nowMs: number): ContestItem {
  const subjectTag = subjectToFilterId(raw.subject);
  const category: Exclude<ContestFilter, 'all'>[] = [
    ...(subjectTag ? [subjectTag] : []),
    ...(raw.isPremium ? ['premium' as const] : []),
  ];

  return {
    id: raw.contestId,
    title: raw.title,
    subject: raw.subject,
    category,
    difficulty: raw.difficulty,
    epReward: raw.epReward,
    timeLeft: formatTimeLeft(raw.endsAt, nowMs),
    questionsCount: raw.totalQuestions,
    duration: String(Math.round((raw.timeLimitSecs || 1200) / 60)),
    participantsCount: raw.participantCount || 0,
    isPro: raw.isPremium || false,
    isLive: raw.contestType === 'live' && raw.status === 'active',
  };
}

function pickFeatured(contests: Contest[]): FeaturedContest | null {
  const weeklyContests = contests.filter(
    (c) => c.status === 'active' && c.contestType === 'weekly'
  );
  const best = weeklyContests.slice().sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))[0];

  if (!best) return null;

  return {
    id: best.contestId,
    title: best.title,
    participants: best.participantCount,
    reward: best.epReward,
    questions: best.totalQuestions,
    duration: Math.round((best.timeLimitSecs || 1200) / 60),
    difficulty: best.difficulty,
    endsAt: best.endsAt ?? new Date(Date.now() + 3600_000).toISOString(),
  };
}
let memoryContestsCache: Contest[] | null = null;

export default function ContestsScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContestFilter>('all');

  const [rawContests, setRawContests] = useState<Contest[]>(memoryContestsCache || []);
  const [featured, setFeatured] = useState<FeaturedContest | null>(() => (memoryContestsCache ? pickFeatured(memoryContestsCache) : null));
  const [loading, setLoading] = useState(!memoryContestsCache);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(Date.now());

  const isFetchingRef = useRef(false);
  const router = useRouter();
  const { theme } = useTheme();

  useBottomBar(true, 'contests');

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchContests = useCallback(async (isRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isRefresh && !memoryContestsCache) {
      setLoading(true);
    }
    setError(null);

    try {
      const filter: GetContestsFilter = { status: 'active' };
      const raw = await api.contest.getContests(filter);

      const currentTimestamp = Date.now();
      const activeOnly = raw.filter((c) => {
        if (c.status !== 'active') return false;
        const endMs = getEpochMs(c.endsAt);
        return endMs === 0 || endMs > currentTimestamp;
      });

      memoryContestsCache = activeOnly;
      setRawContests(activeOnly);
      setFeatured(pickFeatured(activeOnly));
    } catch (err) {
      const apiErr = normalizeError(err);
      setError(apiErr.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!memoryContestsCache) {
      fetchContests(false);
    }
  }, [fetchContests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContests(true);
  }, [fetchContests]);

  const contests = useMemo(() => {
    return rawContests.map((c) => mapContest(c, nowMs));
  }, [rawContests, nowMs]);

  const filterOptions = useMemo(() => {
    return filterChips.map((filter) => {
      if (filter === 'all' || filter === 'premium') {
        return { id: filter, labelKey: `contests.filters.${filter}` };
      }
      const subjectDef = subjectCatalog[filter as SubjectId];
      return {
        id: filter,
        labelKey: subjectDef?.title ?? filter,
      };
    });
  }, []);

  const filteredContests = useMemo(() => {
    return contests.filter((contest) => {
      if (featured && contest.id === featured.id) return false;
      const matchesFilter = activeFilter === 'all' || contest.category.includes(activeFilter);
      const query = search.trim().toLowerCase();

      const matchesSearch =
        query.length === 0 ||
        contest.title.toLowerCase().includes(query) ||
        contest.subject.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search, contests, featured]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View style={{ flex: 1, opacity: loading && contests.length === 0 ? 0 : 1 }}>
        <ScreenHeader
          title={theme.i18n.t('contests.title')}
          subtitle={theme.i18n.t('contests.subtitle')}
          showBack={false}
          containerStyle={{
            paddingTop: theme.space.lg,
            paddingBottom: theme.space.sm,
          }}
          rightElement={
            <MaterialCommunityIcons
              name="sword-cross"
              size={theme.space.lg}
              color={theme.color.accent}
              onPress={() => {
                router.push('/challenges');
              }}
            />
          }
        />

        <ScrollView
          contentContainerStyle={{ paddingBottom: theme.space.xl + 55 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.color.accent}
              colors={[theme.color.accent]}
            />
          }
        >
          <View style={{ paddingTop: theme.space.sm, paddingHorizontal: theme.space.md }}>
            <CustomSearchBar
              value={search}
              onChange={setSearch}
              onSubmit={setSearch}
              onClear={() => setSearch('')}
              placeholder={theme.i18n.t('contests.search_placeholder')}
            />
          </View>

          <ChipContainer
            options={filterOptions}
            selectedId={activeFilter}
            onChange={(id) => setActiveFilter(id as ContestFilter)}
          />

          {featured && (
            <View style={{ paddingBottom: theme.space.lg, paddingHorizontal: theme.space.md }}>
              <FeatureContestCard
                title={featured.title}
                participants={featured.participants}
                reward={featured.reward}
                questions={featured.questions}
                duration={featured.duration}
                difficulty={featured.difficulty}
                endsAt={featured.endsAt}
                onPress={() => router.push({ pathname: '/contests/preQuizScreen', params: { contestId: featured.id } })}
              />
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: theme.space.md,
              paddingHorizontal: theme.space.md,
            }}
          >
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t('contests.all_contests')}
            </Text>
            <Text
              style={{
                color: theme.color.textMuted,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.light,
              }}
            >
              {`${filteredContests.length} ${theme.i18n.t('contests.available_suffix')}`}
            </Text>
          </View>

          <View style={{ gap: theme.space.md, paddingHorizontal: theme.space.md }}>
            {error ? (
              <View style={{ gap: theme.space.sm, alignItems: 'center', paddingVertical: theme.space.xxl }}>
                <Feather name="alert-circle" size={32} color={theme.color.error} />
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.regular,
                    textAlign: 'center',
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : filteredContests.length > 0 ? (
              filteredContests.map((contest) => (
                <ContestCard
                  key={contest.id}
                  title={contest.title}
                  subject={contest.subject}
                  difficulty={contest.difficulty}
                  epReward={contest.epReward}
                  timeLeft={contest.timeLeft}
                  questionsCount={contest.questionsCount}
                  duration={contest.duration}
                  participantsCount={contest.participantsCount}
                  isPro={contest.isPro}
                  isLive={contest.isLive}
                  onStartPress={() =>
                    router.push({ pathname: '/contests/preQuizScreen', params: { contestId: contest.id } })
                  }
                />
              ))
            ) : (
              <View style={{ gap: theme.space.sm, alignItems: 'center', paddingVertical: theme.space.xxl }}>
                <Feather name="search" size={32} color={theme.color.textMuted} />
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.regular,
                    textAlign: 'center',
                  }}
                >
                  {theme.i18n.t('contests.no_results')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      {loading && contests.length === 0 && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.color.background,
          }}
        >
          <Loading message={theme.i18n.t('contests.loading')} />
        </View>
      )}
    </View>
  );
}