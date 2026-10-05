import { TouchableOpacity } from 'react-native';
import { View, Text, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import { ChipContainer } from '../../components/common/Chip';
import { normalizeError } from '../../common/api/api.errors';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ContestCard } from '../../components/contests/ContestCard';
import { CustomSearchBar } from '../../components/common/CustomSearchBar';
import { subjectCatalog, type SubjectId } from '../../common/constants/subject';
import { FeatureContestCard } from '../../components/contests/FeatureContestCard';
import type { Contest, ContestPerformer, GetContestsFilter } from '../../common/types/types';
import type { ContestItem, ContestFilter, FeaturedContest } from '../../common/types/contestTypes';


const CONTESTS_PAGE_LIMIT = 30;
const LIST_STALE_MS = 60_000;
const PERFORMERS_STALE_MS = 3 * 60_000;

let contestsCache: { contests: Contest[]; at: number } | null = null;
const performersCache = new Map<string, { list: ContestPerformer[]; at: number }>();

type PerformersState = {
  status: 'loading' | 'ready' | 'error';
  list: ContestPerformer[];
};

const SUBJECT_TO_FILTER_ID: Record<string, SubjectId> = {
  ...Object.fromEntries(
    Object.values(subjectCatalog).map((s) => [s.title.toLowerCase(), s.id])
  ),
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

function isStillOpen(contest: Contest, nowMs: number): boolean {
  if (contest.status !== 'active') return false;
  const endMs = getEpochMs(contest.endsAt);
  return endMs === 0 || endMs > nowMs;
}

function mapContest(raw: Contest): ContestItem {
  const subjectId = subjectToFilterId(raw.subject);
  const category: Exclude<ContestFilter, 'all'>[] = [
    ...(subjectId ? [subjectId] : []),
    ...(raw.isPremium ? ['premium' as const] : []),
  ];

  return {
    id: raw.contestId,
    title: raw.title,
    subject: raw.subject,
    subjectId,
    category,
    difficulty: raw.difficulty,
    epReward: raw.epReward,
    endsAtMs: getEpochMs(raw.endsAt),
    questionsCount: raw.totalQuestions,
    duration: String(Math.round((raw.timeLimitSecs || 1200) / 60)),
    participantsCount: raw.participantCount || 0,
    isPro: raw.isPremium || false,
    isLive: raw.contestType === 'live' && raw.status === 'active',
  };
}

function pickFeatured(contests: Contest[]): FeaturedContest | null {
  const best = contests
    .filter((c) => c.contestType === 'weekly')
    .sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))[0];
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


export default function ContestsScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContestFilter>('all');
  const [rawContests, setRawContests] = useState<Contest[]>(contestsCache?.contests ?? []);
  const [performers, setPerformers] = useState<Record<string, PerformersState>>({});

  const [loading, setLoading] = useState(!contestsCache);
  const [error, setError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(Date.now());

  const isFetchingRef = useRef(false);
  const performersInFlightRef = useRef(new Set<string>());

  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAppContext();
  const insets = useSafeAreaInsets();
  useBottomBar(true, 'contests');

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const fetchContests = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (mode === 'initial') setLoading(true);
      if (mode !== 'silent') setError(null);

      try {
        const filter: GetContestsFilter = { status: 'active', limit: CONTESTS_PAGE_LIMIT };
        const raw = await api.contest.getContests(filter);
        const openOnly = raw.filter((c) => isStillOpen(c, Date.now()));

        contestsCache = { contests: openOnly, at: Date.now() };
        setRawContests(openOnly);
        setNowMs(Date.now());
        if (mode === 'refresh') {
          performersCache.clear();
          setPerformers({});
        }
      } catch (err) {
        if (mode !== 'silent') setError(normalizeError(err).message);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }, []
  );

  useFocusEffect(
    useCallback(() => {
      if (!contestsCache) fetchContests('initial');
      else if (Date.now() - contestsCache.at > LIST_STALE_MS) fetchContests('silent');
    }, [fetchContests])
  );

  const loadPerformers = useCallback(async (contestId: string) => {
    const cached = performersCache.get(contestId);
    if (cached && Date.now() - cached.at < PERFORMERS_STALE_MS) {
      setPerformers((prev) => ({
        ...prev,
        [contestId]: { status: 'ready', list: cached.list },
      }));
      return;
    }

    if (performersInFlightRef.current.has(contestId)) return;
    performersInFlightRef.current.add(contestId);
    setPerformers((prev) => ({
      ...prev,
      [contestId]: { status: 'loading', list: [] },
    }));

    try {
      const detail = await api.contest.getContest(contestId);
      const list = detail?.topPerformers ?? [];
      performersCache.set(contestId, { list, at: Date.now() });
      setPerformers((prev) => ({
        ...prev,
        [contestId]: { status: 'ready', list },
      }));
    } catch {
      setPerformers((prev) => ({
        ...prev,
        [contestId]: { status: 'error', list: [] },
      }));
    } finally {
      performersInFlightRef.current.delete(contestId);
    }
  }, []);

  const openContests = useMemo(
    () => rawContests.filter((c) => isStillOpen(c, nowMs)),
    [rawContests, nowMs]
  );

  const contests = useMemo(
    () => openContests.map(mapContest).sort((a, b) => {
      if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
      return a.endsAtMs - b.endsAtMs;
    }), [openContests]
  );

  const featured = useMemo(() => pickFeatured(openContests), [openContests]);

  const filterOptions = useMemo(() => {
    const present = new Set<string>();
    contests.forEach((c) => c.category.forEach((cat) => present.add(cat)));

    const subjectChips = (Object.keys(subjectCatalog) as SubjectId[])
      .filter((id) => present.has(id))
      .map((id) => ({ id, labelKey: subjectCatalog[id].title }));

    return [
      { id: 'all', labelKey: 'contests.filters.all' },
      ...(present.has('premium') ? [{ id: 'premium', labelKey: 'contests.filters.premium' }] : []),
      ...subjectChips,
    ];
  }, [contests]);

  const effectiveFilter: ContestFilter = filterOptions.some((o) => o.id === activeFilter)
    ? activeFilter
    : 'all';
  const query = search.trim().toLowerCase();

  const showFeatured = !!featured && effectiveFilter === 'all' && query.length === 0;

  const filteredContests = useMemo(() => {
    return contests.filter((contest) => {
      if (showFeatured && featured && contest.id === featured.id) return false;
      const matchesFilter = effectiveFilter === 'all' || contest.category.includes(effectiveFilter);
      const matchesSearch =
        query.length === 0 ||
        contest.title.toLowerCase().includes(query) ||
        contest.subject.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [contests, effectiveFilter, query, showFeatured, featured]);

  const openPreQuiz = (contestId: string) => router.push({ pathname: '/contests/preQuizScreen', params: { contestId } });

  const retryButton = (
    <TouchableOpacity
      onPress={() => fetchContests(contests.length === 0 ? 'initial' : 'refresh')}
      style={{
        marginTop: theme.space.xs,
        paddingVertical: theme.space.sm,
        paddingHorizontal: theme.space.lg,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.color.accent,
      }}
    >
      <Text
        style={{
          fontFamily: theme.fontFamily.bold,
          color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
        }}
      >
        {theme.i18n.t('common.retry')}
      </Text>
    </TouchableOpacity>
  );

  const emptyState = (icon: 'search' | 'inbox', message: string) => (
    <View style={{ gap: theme.space.sm, alignItems: 'center', paddingVertical: theme.space.xxl }}>
      <Feather name={icon} size={theme.space.xl} color={theme.color.textMuted} />
      <Text
        style={{
          textAlign: 'center',
          fontSize: theme.fontSize.sm,
          color: theme.color.textMuted,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {message}
      </Text>
    </View>
  );


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View style={{ flex: 1, opacity: loading && contests.length === 0 ? 0 : 1 }}>
        <ScreenHeader
          title={theme.i18n.t('contests.title')}
          subtitle={theme.i18n.t('contests.subtitle')}
          showBack={false}
          containerStyle={{ paddingBottom: theme.space.sm }}
          rightElement={
            <TouchableOpacity
              onPress={() => router.push('/challenges')}
              hitSlop={10}
              accessibilityRole='button'
              accessibilityLabel={theme.i18n.t('challenges.title')}
            >
              <MaterialCommunityIcons
                name='sword-cross'
                size={theme.space.lg}
                color={theme.color.accent}
              />
            </TouchableOpacity>
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{ paddingBottom: insets.bottom * 2.75 }}
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
            selectedId={effectiveFilter}
            onChange={(id) => setActiveFilter(id as ContestFilter)}
          />

          {showFeatured && featured && (
            <View style={{ paddingBottom: theme.space.lg, paddingHorizontal: theme.space.md }}>
              <FeatureContestCard
                title={featured.title}
                participants={featured.participants}
                reward={featured.reward}
                questions={featured.questions}
                duration={featured.duration}
                difficulty={featured.difficulty}
                endsAt={featured.endsAt}
                onPress={() => openPreQuiz(featured.id)}
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
                fontSize: theme.fontSize.lg,
                color: theme.color.textPrimary,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('contests.all_contests')}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.color.textMuted,
                fontFamily: theme.fontFamily.light,
              }}
            >
              {`${filteredContests.length} ${theme.i18n.t('contests.available_suffix')}`}
            </Text>
          </View>

          {error && contests.length > 0 && (
            <View
              accessibilityRole='alert'
              style={{
                gap: theme.space.sm,
                flexDirection: 'row',
                alignItems: 'center',
                padding: theme.space.sm,
                marginBottom: theme.space.md,
                marginHorizontal: theme.space.md,
                borderWidth: 1,
                borderRadius: theme.borderRadius.lg,
                borderColor: theme.color.error + '55',
                backgroundColor: theme.color.error + '12',
              }}
            >
              <Feather name='alert-circle' size={theme.fontSize.md} color={theme.color.error} />
              <Text
                style={{
                  flex: 1,
                  color: theme.color.error,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {error}
              </Text>

              <TouchableOpacity
                onPress={() => fetchContests('refresh')}
                hitSlop={8}
              >
                <Text
                  style={{
                    color: theme.color.accent,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {theme.i18n.t('common.retry')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ gap: theme.space.md, paddingHorizontal: theme.space.md }}>
            {error && contests.length === 0 ? (
              <View style={{ gap: theme.space.sm, alignItems: 'center', paddingVertical: theme.space.xxl }}>
                <Feather name='alert-circle' size={theme.space.xl} color={theme.color.error} />
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: theme.fontSize.sm,
                    color: theme.color.textMuted,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {error}
                </Text>

                {retryButton}
              </View>
            ) : filteredContests.length > 0 ? (
              filteredContests.map((contest) => {
                const perf = performers[contest.id];
                return (
                  <ContestCard
                    key={contest.id}
                    title={contest.title}
                    subject={contest.subject}
                    subjectId={contest.subjectId}
                    difficulty={contest.difficulty}
                    epReward={contest.epReward}
                    endsAtMs={contest.endsAtMs}
                    nowMs={nowMs}
                    questionsCount={contest.questionsCount}
                    duration={contest.duration}
                    participantsCount={contest.participantsCount}
                    isPro={contest.isPro}
                    isLive={contest.isLive}
                    currentUserId={user?.uid}
                    performers={perf?.status === 'ready' ? perf.list : undefined}
                    performersLoading={perf?.status === 'loading'}
                    performersError={perf?.status === 'error'}
                    onExpand={() => loadPerformers(contest.id)}
                    onStartPress={() => openPreQuiz(contest.id)}
                  />
                );
              })
            ) : contests.length === 0 ? (
              emptyState('inbox', theme.i18n.t('contests.none_active'))
            ) : (
              emptyState('search', theme.i18n.t('contests.no_results'))
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
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.color.background,
          }}
        >
          <Loading message={theme.i18n.t('contests.loading')} />
        </View>
      )}
    </View>
  );
}
