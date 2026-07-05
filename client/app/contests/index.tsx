import { useMemo, useState } from 'react';
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '../../theme/ThemeContext';
import { ContestCard } from '../../components/ContestCard';
import { FeatureContestCard } from '../../components/FeatureContestCard';
import { SortingChipContainer } from '../../components/SortingChipContainer';
import { contestsMockData, featuredContest, filterChips, type ContestFilter } from './contestsMockData';


export default function ContestScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<ContestFilter>('all');
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space.sm,
              paddingHorizontal: theme.space.md,
              paddingVertical: theme.space.sm * 1.25,
              borderRadius: theme.borderRadius.xl,
              borderWidth: 1.5,
              borderColor: isSearchFocused ? theme.color.accent : theme.color.border,
              backgroundColor: theme.color.card,
            }}
          >
            <Feather
              name="search"
              size={theme.fontSize.md}
              color={isSearchFocused ? theme.color.accent : theme.color.textMuted}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={theme.i18n.t('components.ContestScreen.search_placeholder')}
              placeholderTextColor={theme.color.textMuted}
              style={[
                {
                  flex: 1,
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
              ]}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                <Feather name="x-circle" size={theme.fontSize.md} color={theme.color.textMuted} />
              </TouchableOpacity>
            )}
          </View>
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