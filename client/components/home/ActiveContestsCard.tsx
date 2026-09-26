import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeScrollEvent, useWindowDimensions, NativeSyntheticEvent } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { ContestType, Difficulty } from '../../common/types/types';


type ActiveContestsCardProps = {
  contestId: string;
  title: string;
  subject: string;
  difficulty: Difficulty;
  contestType: ContestType;
  isPremium: boolean;
  participantsCount: number;
  epReward: number;
};

export function ActiveContestsCard({ contests }: { contests: ActiveContestsCardProps[] }) {
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const scrollRef = useRef<ScrollView>(null);
  const maxScroll = Math.max(contentWidth - containerWidth, 1);
  const cardWidth = Math.min(Math.max(width * 0.52, 220), 300);
  const thumbWidthRatio = Math.min(containerWidth/Math.max(contentWidth, 1), 1);
  const thumbPositionRatio = Math.min(Math.max(scrollX/maxScroll, 0), 1);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setScrollX(e.nativeEvent.contentOffset.x);
  const scrollByCard = (direction: 1 | -1) => {
    const nextX = Math.min(
      Math.max(scrollX+direction * (cardWidth+theme.space.md), 0),
      maxScroll
    );
    scrollRef.current?.scrollTo({ x: nextX, animated: true });
  };
  const difficultyColor = (difficulty: Difficulty): { textColor: string } => {
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
        contentContainerStyle={{ gap: theme.space.md }}
      >
        {contests.map((contest, index) => {
          const diffColor = difficultyColor(contest.difficulty);
          return (
            <TouchableOpacity
              key={contest.contestId ?? index}
              activeOpacity={0.75}
              onPress={() => handleContestPress(contest.contestId)}
              style={{
                width: cardWidth,
                minHeight: theme.space.xxl * 2.75,
                justifyContent: 'space-between',
                paddingVertical: theme.space.md * 0.75,
                paddingHorizontal: theme.space.md,
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
                    flexWrap: 'wrap',
                    gap: theme.space.xs,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {contest.isPremium && (
                    <View
                      style={{
                        gap: theme.space.xs,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: theme.space.xs,
                        paddingHorizontal: theme.space.sm,
                        borderRadius: theme.borderRadius.md,
                        backgroundColor: theme.color.premium + '18',
                      }}
                    >
                      <MaterialCommunityIcons
                        name='crown-outline'
                        size={theme.fontSize.xs}
                        color={theme.color.premium}
                      />
                      <Text
                        style={{
                          color: theme.color.premium,
                          fontSize: theme.fontSize.xs,
                          fontFamily: theme.fontFamily.numberBold,
                        }}
                      >
                        {theme.i18n.t('common.pro')}
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      paddingVertical: theme.space.xs,
                      paddingHorizontal: theme.space.sm,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: diffColor.textColor + '18',
                    }}
                  >
                    <Text
                      style={{
                        color: diffColor.textColor,
                        fontSize: theme.fontSize.xs,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.regular,
                      }}
                    >
                      {theme.i18n.t(`common.${contest.difficulty}`)}
                    </Text>
                  </View>
                </View>

                {contest.contestType === 'live' ? (
                  <View
                    style={{
                      gap: theme.space.xs,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: theme.space.xs,
                      paddingHorizontal: theme.space.sm,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: theme.color.error + '18',
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
                ) : (
                  <View
                    style={{
                      paddingVertical: theme.space.xs,
                      paddingHorizontal: theme.space.sm,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: theme.color.accent + '18',
                    }}
                  >
                    <Text
                      style={{
                        color: theme.color.accent,
                        fontSize: theme.fontSize.xs,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.regular,
                      }}
                    >
                      {theme.i18n.t(`common.contest_types.${contest.contestType}`)}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                numberOfLines={1}
                style={{
                  fontSize: theme.fontSize.lg,
                  lineHeight: theme.fontSize.xl,
                  color: theme.color.textPrimary,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {contest.title}
              </Text>

              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.color.textSecondary,
                  fontFamily: theme.fontFamily.light,
                  marginTop: theme.space.xs * 0.5,
                  marginBottom: theme.space.sm * 1.5,
                }}
              >
                {contest.subject}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                }}
              >
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
                      fontSize: theme.fontSize.lg,
                      fontFamily: theme.fontFamily.number,
                    }}
                  >
                    {contest.participantsCount >= 1000
                      ? (contest.participantsCount/1000).toFixed(1).replace(/\.0$/, '') + 'K'
                      : contest.participantsCount.toString()}
                  </Text>
                </View>

                <Text
                  style={{
                    color: theme.color.accent,
                    fontSize: theme.fontSize.lg,
                    fontFamily: theme.fontFamily.numberBold,
                  }}
                >
                  +{contest.epReward}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => scrollByCard(-1)}
            hitSlop={8}
          >
            <Feather name='chevron-left' size={theme.fontSize.md} color={theme.color.textSecondary} />
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
                left: `${thumbPositionRatio * (1-thumbWidthRatio) * 100}%`,
                width: `${thumbWidthRatio * 100}%`,
                height: '100%',
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.textSecondary,
              }}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => scrollByCard(1)}
            hitSlop={8}
          >
            <Feather name='chevron-right' size={theme.fontSize.md} color={theme.color.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
