import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { api } from '../../common/api/api';
import { normalizeError } from '../../common/api/api.errors';
import { subjectCatalog, type SubjectId } from '../../common/constants/subject';
import { ContestCard } from '../../components/ContestCard';
import { ChipContainer } from '../../components/common/Chip';
import { useBottomBar } from '../../common/context/useBottomBar';
import { CustomSearchBar } from '../../components/CustomSearchBar';
import { FeatureContestCard } from '../../components/FeatureContestCard';
import { Loading } from '../../components/common/loading';
import type { Contest, GetContestsFilter, ContestFilter, ContestItem, FeaturedContest } from '../../common/types/types';

const filterChips: ContestFilter[] = ['all', 'premium', ...(Object.keys(subjectCatalog) as SubjectId[])];

// Backend `contest.subject` strings that don't exactly match subjectCatalog titles.
const SUBJECT_ALIASES: Record<string, SubjectId> = {
  'general medicine': 'medicine',
  'general surgery': 'surgery',
  otorhinolaryngology: 'ent',
  'obstetrics & gynaecology': 'gynae_obstetrics',
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
  return SUBJECT_TO_FILTER_ID[subject.trim().toLowerCase()] ?? null;
}

function minutesUntil(iso?: string): number {
  if (!iso) return 0;
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000));
}

function mapContest(raw: Contest): ContestItem {
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
    timeLeft: raw.status === 'active' ? '0' : String(minutesUntil(raw.endsAt ?? raw.startsAt)),
    questionsCount: raw.totalQuestions,
    duration: String(Math.round(raw.timeLimitSecs / 60)),
    participantsCount: raw.participantCount,
    isPro: raw.isPremium,
    isLive: raw.status === 'active',
  };
}

function pickFeatured(contests: Contest[]): FeaturedContest | null {
  const live = contests.filter((c) => c.status === 'active');
  const best = (live.length > 0 ? live : contests).slice().sort((a, b) => b.participantCount - a.participantCount)[0];
  if (!best) return null;

  return {
    id: best.contestId,
    title: best.title,
    participants: best.participantCount,
    reward: best.epReward,
    questions: best.totalQuestions,
    duration: Math.round(best.timeLimitSecs / 60),
    difficulty: best.difficulty,
    endsAt: best.endsAt ?? new Date(Date.now() + 3600_000).toISOString(),
  };
}

export default function ContestsScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContestFilter>('all');

  const [contests, setContests] = useState<ContestItem[]>([]);
  const [featured, setFeatured] = useState<FeaturedContest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { theme } = useTheme();
  
  useBottomBar(true, 'contests');

  useEffect(() => {
    let cancelled = false;

    async function fetchContests() {
      setLoading(true);
      setError(null);
      try {
        const filter: GetContestsFilter | undefined = undefined;
        const raw = await api.contest.getContests(filter);
        if (cancelled) return;

        setContests(raw.map(mapContest));
        setFeatured(pickFeatured(raw));
      } catch (err) {
        if (cancelled) return;
        const apiErr = normalizeError(err);
        console.log('[contests] fetch failed:', apiErr);
        setError(apiErr.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchContests();
    return () => {
      cancelled = true;
    };
  }, []);

  const filterOptions = useMemo(
    () => filterChips.map((filter) => ({ id: filter, labelKey: `contests.filters.${filter}` })),
    []
  );

  const filteredContests = useMemo(() => {
    return contests.filter((contest) => {
      const matchesFilter = activeFilter === 'all' || contest.category.includes(activeFilter);
      const query = search.trim().toLowerCase();

      const matchesSearch = query.length === 0 ||
        contest.title.toLowerCase().includes(query) ||
        contest.subject.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search, contests]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View style={{ flex: 1, opacity: (loading && contests.length === 0) ? 0 : 1 }}>
      <View
        style={{
          gap: theme.space.xs / 2,
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.sm,
          paddingHorizontal: theme.space.md,
        }}
      >
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xxl,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {theme.i18n.t('contests.title')}
        </Text>
        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.light,
          }}
        >
          {theme.i18n.t('contests.subtitle')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.space.xl + 55 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
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
              <Feather name='alert-circle' size={32} color={theme.color.error} />
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
                onStartPress={() => router.push({ pathname: '/contests/preQuizScreen', params: { contestId: contest.id } })}
              />
            ))
          ) : (
            <View style={{ gap: theme.space.sm, alignItems: 'center', paddingVertical: theme.space.xxl }}>
              <Feather name='search' size={32} color={theme.color.textMuted} />
              <Text
                style={{
                  color: theme.color.textMuted,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
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
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 999, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.color.background }}>
          <Loading message={theme.i18n.t('contests.loading')} />
        </View>
      )}
    </View>
  );
}