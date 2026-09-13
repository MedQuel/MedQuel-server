import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';

type ActiveContestsCardProps = {
  contestId: string;
  title: string;
  subject: string;
  difficulty: 'hard' | 'medium' | 'easy';
  isLive?: boolean;
  participantsCount: number;
  epReward: number;
};

export function ActiveContestsCard({ contests }: { contests: ActiveContestsCardProps[] }) {
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const scrollRef = useRef<ScrollView>(null);
  const displayContests = contests.slice(0, 5);
  const isSingle = displayContests.length === 1;
  const cardWidth = Math.min(Math.max(Math.round(width * 0.78), 260), 340);
  const maxScroll = Math.max(contentWidth - containerWidth, 1);
  const thumbWidthRatio = Math.min(containerWidth / Math.max(contentWidth, 1), 1);
  const thumbPositionRatio = Math.min(Math.max(scrollX / maxScroll, 0), 1);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(e.nativeEvent.contentOffset.x);
  };

  const scrollByCard = (direction: 1 | -1) => {
    const nextX = Math.min(
      Math.max(scrollX + direction * (cardWidth + theme.space.md), 0),
      maxScroll
    );
    scrollRef.current?.scrollTo({ x: nextX, animated: true });
  };

  const difficultyColor = (difficulty: 'hard' | 'medium' | 'easy'): { textColor: string } => {
    if (difficulty === 'hard') return { textColor: theme.color.error };
    else if (difficulty === 'medium') return { textColor: theme.color.warning };
    else return { textColor: theme.color.success };
  };

  const handleContestPress = (contestId: string) => {
    router.push({
      pathname: '/contests/preQuizScreen',
      params: { contestId },
    });
  };

  const renderCard = (contest: ActiveContestsCardProps, isSingleCard: boolean) => {
    const diffColor = difficultyColor(contest.difficulty);
    return (
      <TouchableOpacity
        key={contest.contestId}
        activeOpacity={0.75}
        onPress={() => handleContestPress(contest.contestId)}
        style={{
          width: isSingleCard ? '100%' : cardWidth,
          minHeight: theme.space.xxl * 2.75,
          justifyContent: 'space-between',
          padding: theme.space.md,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.xl,
          backgroundColor: theme.color.card,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.space.sm,
          }}
        >
          <View
            style={{
              paddingVertical: theme.space.xs,
              paddingHorizontal: theme.space.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor: withAlpha(diffColor.textColor, 0.12),
            }}
          >
            <Text
              style={{
                color: diffColor.textColor,
                fontSize: theme.fontSize.sm,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t(`common.${contest.difficulty}`)}
            </Text>
          </View>

          {contest.isLive && (
            <View
              style={{
                gap: theme.space.xs,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: theme.space.xs * 0.75,
                paddingHorizontal: theme.space.sm * 0.75,
                borderRadius: theme.borderRadius.full,
                backgroundColor: withAlpha(theme.color.error, 0.12),
              }}
            >
              <View
                style={{
                  width: theme.space.xs * 1.5,
                  height: theme.space.xs * 1.5,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: theme.color.error,
                }}
              />
              <Text
                style={{
                  color: theme.color.error,
                  fontSize: theme.fontSize.sm,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('common.live')}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            lineHeight: theme.fontSize.xl,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
          numberOfLines={1}
        >
          {contest.title}
        </Text>

        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.light,
            marginTop: theme.space.xs * 0.5,
            marginBottom: theme.space.sm + theme.space.xs,
          }}
        >
          {contest.subject}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <View
            style={{
              gap: theme.space.xs,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name='users' size={theme.fontSize.md} color={theme.color.textSecondary} />
            <Text
              style={{
                color: theme.color.textMuted,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.light,
              }}
            >
              {contest.participantsCount >= 1000
                ? (contest.participantsCount / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
                : contest.participantsCount.toString()}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name='zap' size={theme.fontSize.sm + 2} color={theme.color.accent} />
            <Text
              style={{
                color: theme.color.accent,
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.number,
              }}
            >
              +{contest.epReward}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (displayContests.length === 0) return null;

  if (isSingle && displayContests[0]) {
    return (
      <View style={{ width: '100%' }}>
        {renderCard(displayContests[0], true)}
      </View>
    );
  }

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        onContentSizeChange={(w) => setContentWidth(w)}
        contentContainerStyle={{
          gap: theme.space.md,
          paddingRight: theme.space.md,
        }}
      >
        {displayContests.map((contest) => renderCard(contest, false))}
      </ScrollView>

      {contentWidth > containerWidth && (
        <View
          style={{
            gap: theme.space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.space.sm,
          }}
        >
          <TouchableOpacity activeOpacity={0.7} onPress={() => scrollByCard(-1)} hitSlop={8}>
            <Feather
              name='chevron-left'
              size={theme.fontSize.md}
              color={theme.color.textSecondary}
            />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              overflow: 'hidden',
              height: theme.space.xs,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.border,
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: `${thumbPositionRatio * (1 - thumbWidthRatio) * 100}%`,
                width: `${thumbWidthRatio * 100}%`,
                height: '100%',
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.textSecondary,
              }}
            />
          </View>

          <TouchableOpacity activeOpacity={0.7} onPress={() => scrollByCard(1)} hitSlop={8}>
            <Feather
              name='chevron-right'
              size={theme.fontSize.md}
              color={theme.color.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}