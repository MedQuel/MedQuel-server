import { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '../../theme/ThemeContext';
import { ContestCard } from '../../components/ContestCard';
import { FeatureContestCard } from '../../components/FeatureContestCard';
import { SortingChipContainer } from '../../components/common/Chip';
import { CustomSearchBar } from '../../components/CustomSearchBar';

export type ContestFilter = 'all' | 'daily' | 'weekly' | 'live' | 'premium' | 'anatomy';

export type ContestItem = {
  id: string; title: string; subject: string; category: Exclude<ContestFilter, 'all'>[];
  difficulty: 'easy' | 'medium' | 'hard'; epReward: number; timeLeft: string;
  questionsCount: number; duration: string; participantsCount: number;
  isPro: boolean; isLive: boolean;
};

export type FeaturedContest = {
  id: string; title: string; participants: number; reward: number;
  questions: number; duration: number; difficulty: 'easy' | 'medium' | 'hard'; endsAt: string;
};

export const filterChips: ContestFilter[] = ['all', 'daily', 'weekly', 'live', 'premium', 'anatomy'];

export const featuredContest: FeaturedContest = {
  id: 'grand-medical-championship',
  title: 'Grand Medical Championship',
  participants: 2341,
  reward: 500,
  questions: 100,
  duration: 120,
  difficulty: 'hard',
  endsAt: new Date(Date.now() + (1 * 3600 + 23 * 60 + 45) * 1000).toISOString(),
};

export const contestsMockData: ContestItem[] = [
  { id: 'daily-anatomy-quiz', title: 'Daily Anatomy Quiz', subject: 'Anatomy', category: ['daily', 'anatomy'], difficulty: 'medium', epReward: 75, timeLeft: '8h left', questionsCount: 20, duration: '30', participantsCount: 847, isPro: false, isLive: false },
  { id: 'pharmacology-sprint', title: 'Pharmacology Sprint', subject: 'Pharmacology', category: ['daily', 'premium'], difficulty: 'hard', epReward: 200, timeLeft: '3d left', questionsCount: 50, duration: '60', participantsCount: 1203, isPro: true, isLive: false },
  { id: 'immunology-basics', title: 'Immunology Basics', subject: 'Immunology', category: ['daily'], difficulty: 'easy', epReward: 50, timeLeft: '5h left', questionsCount: 15, duration: '15', participantsCount: 2100, isPro: false, isLive: false },
  { id: 'live-cardio-challenge', title: 'Cardiology Live Challenge', subject: 'Cardiology', category: ['live'], difficulty: 'hard', epReward: 500, timeLeft: 'Now', questionsCount: 40, duration: '45', participantsCount: 890, isPro: false, isLive: true },
  { id: 'genetics-pro-tier', title: 'Genetics Expert Series', subject: 'Genetics', category: ['premium'], difficulty: 'hard', epReward: 750, timeLeft: '12h left', questionsCount: 60, duration: '90', participantsCount: 320, isPro: true, isLive: false },
  { id: 'live-nursing-triage', title: 'Nursing Triage Speed Round', subject: 'Nursing', category: ['live','premium'], difficulty: 'medium', epReward: 300, timeLeft: 'Starts in 5m', questionsCount: 25, duration: '20', participantsCount: 1500, isPro: true, isLive: true },
  { id: 'biochem-midterm-prep', title: 'Biochem Midterm Prep', subject: 'Biochemistry', category: ['daily', 'anatomy'], difficulty: 'medium', epReward: 150, timeLeft: '2d left', questionsCount: 40, duration: '60', participantsCount: 450, isPro: false, isLive: false }
];

export default function ChatScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<ContestFilter>('all');
  const [search, setSearch] = useState('');

  const filterOptions = useMemo(
    () => filterChips.map((filter) => ({ id: filter, labelKey: `components.ContestScreen.filters.${filter}` })),
    []
  );

  const filteredContests = useMemo(() => {
    return contestsMockData.filter((contest) => {
      const matchesFilter =
        activeFilter === 'all' || contest.category.includes(activeFilter);

      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        contest.title.toLowerCase().includes(query) ||
        contest.subject.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.sm,
          gap: 2,
        }}
      >
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xxl,
            fontWeight: theme.fontWeight.bold as any,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {theme.i18n.t('components.ContestScreen.title')}
        </Text>
        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.light,
          }}
        >
          {theme.i18n.t('components.ContestScreen.subtitle')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.space.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingHorizontal: theme.space.md, paddingTop: theme.space.sm }}>
          <CustomSearchBar
            value={search}
            onChange={setSearch}
            onSubmit={setSearch}
            onClear={() => setSearch('')}
            placeholder={theme.i18n.t('components.ContestScreen.search_placeholder')}
          />
        </View>

        <SortingChipContainer
          options={filterOptions}
          selectedId={activeFilter}
          onChange={(id) => setActiveFilter(id as ContestFilter)}
        />

        <View style={{ paddingHorizontal: theme.space.md, paddingBottom: theme.space.lg }}>
          <FeatureContestCard
            title={featuredContest.title}
            participants={featuredContest.participants}
            reward={featuredContest.reward}
            questions={featuredContest.questions}
            duration={featuredContest.duration}
            difficulty={featuredContest.difficulty}
            endsAt={featuredContest.endsAt}
            onPress={() => router.push('/contests/preQuizScreen')}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.space.md,
            paddingBottom: theme.space.md,
          }}
        >
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold as any,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('components.ContestScreen.all_contests')}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {`${filteredContests.length} ${theme.i18n.t('components.ContestScreen.available_suffix')}`}
          </Text>
        </View>

        <View style={{ paddingHorizontal: theme.space.md, gap: theme.space.md }}>
          {filteredContests.length > 0 ? (
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
                onStartPress={() => router.push('/contests/preQuizScreen')}
              />
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: theme.space.xxl, gap: theme.space.sm }}>
              <Feather name="search" size={32} color={theme.color.textMuted} />
              <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
                {theme.i18n.t('components.ContestScreen.no_results')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
