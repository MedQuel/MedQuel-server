import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { ContestCard } from '../../components/ContestCard';
import { ChipContainer } from '../../components/common/Chip';
import { useBottomBar } from '../../common/context/useBottomBar';
import { CustomSearchBar } from '../../components/CustomSearchBar';
import { FeatureContestCard } from '../../components/FeatureContestCard';


type ContestFilter = 'all' | 'daily' | 'weekly' | 'live' | 'premium' | 'anatomy';
const filterChips: ContestFilter[] = ['all', 'daily', 'weekly', 'live', 'premium', 'anatomy'];
type ContestItem = {
  id: string;
  title: string;
  subject: string;
  category: Exclude<ContestFilter, 'all'>[];
  difficulty: 'easy' | 'medium' | 'hard';
  epReward: number;
  timeLeft: string;
  questionsCount: number;
  duration: string;
  participantsCount: number;
  isPro: boolean;
  isLive: boolean;
};
type FeaturedContest = {
  id: string;
  title: string;
  participants: number;
  reward: number;
  questions: number;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  endsAt: string;
};

const featuredContest: FeaturedContest = {
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
  {
    id: 'daily-anatomy-quiz',
    title: 'Daily Anatomy Quiz',
    subject: 'Anatomy',
    category: ['daily', 'anatomy'],
    difficulty: 'medium',
    epReward: 75,
    timeLeft: '480',
    questionsCount: 20,
    duration: '30',
    participantsCount: 847,
    isPro: false,
    isLive: false,
  },
  {
    id: 'pharmacology-sprint',
    title: 'Pharmacology Sprint',
    subject: 'Pharmacology',
    category: ['daily', 'premium'],
    difficulty: 'hard',
    epReward: 200,
    timeLeft: '4320',
    questionsCount: 50,
    duration: '60',
    participantsCount: 1203,
    isPro: true,
    isLive: false,
  },
  {
    id: 'immunology-basics',
    title: 'Immunology Basics',
    subject: 'Immunology',
    category: ['daily'],
    difficulty: 'easy',
    epReward: 50,
    timeLeft: '300',
    questionsCount: 15,
    duration: '15',
    participantsCount: 2100,
    isPro: false,
    isLive: false,
  },
  {
    id: 'live-cardio-challenge',
    title: 'Cardiology Live Challenge',
    subject: 'Cardiology',
    category: ['live'],
    difficulty: 'hard',
    epReward: 500,
    timeLeft: '0',
    questionsCount: 40,
    duration: '45',
    participantsCount: 890,
    isPro: false,
    isLive: true,
  },
  {
    id: 'genetics-pro-tier',
    title: 'Genetics Expert Series',
    subject: 'Genetics',
    category: ['premium'],
    difficulty: 'hard',
    epReward: 750,
    timeLeft: '720',
    questionsCount: 60,
    duration: '90',
    participantsCount: 320,
    isPro: true,
    isLive: false,
  },
  {
    id: 'live-nursing-triage',
    title: 'Nursing Triage Speed Round',
    subject: 'Nursing',
    category: ['live', 'premium'],
    difficulty: 'medium',
    epReward: 300,
    timeLeft: '5',
    questionsCount: 25,
    duration: '20',
    participantsCount: 1500,
    isPro: true,
    isLive: true,
  },
  {
    id: 'biochem-midterm-prep',
    title: 'Biochemistry Midterm Prep',
    subject: 'Biochemistry',
    category: ['daily', 'anatomy'],
    difficulty: 'medium',
    epReward: 150,
    timeLeft: '2880',
    questionsCount: 40,
    duration: '60',
    participantsCount: 450,
    isPro: false,
    isLive: false,
  },
];


export default function ChatScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContestFilter>('all');

  const router = useRouter();
  const { theme } = useTheme();
  useBottomBar(true, 'contests');

  const filterOptions = useMemo(
    () =>
      filterChips.map((filter) => ({
        id: filter,
        labelKey: `contests.filters.${filter}`,
      })),
    []
  );

  const filteredContests = useMemo(() => {
    return contestsMockData.filter((contest) => {
      const matchesFilter = activeFilter === 'all' || contest.category.includes(activeFilter);
      const query = search.trim().toLowerCase();
      
      const matchesSearch = query.length === 0 ||
        contest.title.toLowerCase().includes(query) ||
        contest.subject.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
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
        contentContainerStyle={{ paddingBottom: theme.space.xl }}
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

        <View style={{ paddingBottom: theme.space.lg, paddingHorizontal: theme.space.md }}>
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
  );
}
