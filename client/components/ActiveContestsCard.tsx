import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


type ActiveContestsCardProps = {
  title: string;
  subject: string;
  difficulty: 'hard' | 'medium' | 'easy';
  isLive?: boolean;
  participantsCount: number;
  epReward: number;
};

export function ActiveContestsCard({ contests }: { contests: ActiveContestsCardProps[] }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(Math.max(width * 0.52, 220), 300);
  const scrollRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const maxScroll = Math.max(contentWidth - containerWidth, 1);
  const thumbWidthRatio = Math.min(containerWidth / Math.max(contentWidth, 1), 1);
  const thumbPositionRatio = Math.min(Math.max(scrollX / maxScroll, 0), 1);
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(e.nativeEvent.contentOffset.x);
  };
  const scrollByCard = (direction: 1 | -1) => {
    const nextX = Math.min(Math.max(scrollX + direction * (cardWidth + theme.space.md), 0), maxScroll);
    scrollRef.current?.scrollTo({ x: nextX, animated: true });
  };
  const difficultyColor = (difficulty: 'hard' | 'medium' | 'easy'): { textColor: string } => {
    if (difficulty === 'hard') return { textColor: theme.color.error };
    else if (difficulty === 'medium') return { textColor: theme.color.warning };
    else return { textColor: theme.color.success };
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
        contentContainerStyle={{
          gap: theme.space.md,
          paddingRight: theme.space.md,
        }}
      >
        {contests.map((contest, index) => {
          const diffColor = difficultyColor(contest.difficulty);
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.75}
              onPress={() => {}}
              style={{
                width: cardWidth,
                minHeight: theme.space.xxl * 2.75,
                padding: theme.space.md,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.xl,
                backgroundColor: theme.color.card,
                justifyContent: 'space-between',
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
                    backgroundColor: diffColor.textColor + '18',
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
                      paddingHorizontal: theme.space.sm * 0.75,
                      paddingVertical: theme.space.xs * 0.75,
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: theme.color.error + '18',
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
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
                  marginTop: theme.space.xs * 0.5,
                  marginBottom: theme.space.sm + theme.space.xs,
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.light,
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
                  <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.light }}>
                    {contest.participantsCount >= 1000
                      ? (contest.participantsCount / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
                      : contest.participantsCount.toString()}
                  </Text>
                </View>
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
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {contentWidth > containerWidth && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.sm,
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
              height: 4,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.border,
              overflow: 'hidden',
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