import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export interface ActiveContestData {
  difficulty: string;
  isLive: boolean;
  title: string;
  subject: string;
  participantsCount: number;
  epReward: number;
  onPress: () => void;
}

export default function ActiveContestsSection({ activeContests }: { activeContests: ActiveContestData[] }) {
  const { theme } = useTheme();
  const { color, space, fontSize, fontWeight, borderRadius, lineHeight, fontFamily, i18n, isDark } = theme;

  const onSurface = isDark ? '#FFFFFF' : '#0F172A';
  const onSurfaceMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.55)';

  const difficultyStyle = (difficulty: string): { bg: string; textColor: string } => {
    if (difficulty === i18n.t('components.FeatureContestCard.difficulty_hard'))
      return { bg: color.error + '22', textColor: color.error };
    if (difficulty === i18n.t('components.FeatureContestCard.difficulty_medium'))
      return { bg: color.warning + '22', textColor: color.warning };
    return { bg: color.success + '22', textColor: color.success };
  };

  return (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: borderRadius.xl,
        padding: space.md,
        marginHorizontal: space.md,
        marginVertical: space.sm,
        borderWidth: 1,
        borderColor: color.border,
        gap: space.sm,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.bold.toString() as any,
            color: onSurface,
            fontFamily: fontFamily.text,
          }}
        >
          {i18n.t('components.ActiveContestsSection.title')}
        </Text>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium.toString() as any,
            color: color.accent,
          }}
        >
          {i18n.t('components.ActiveContestsSection.view_all')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: space.sm }}
      >
        {activeContests?.map(({ difficulty, isLive, title, subject, participantsCount, epReward, onPress }, index) => {
          const diff = difficultyStyle(difficulty);

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              activeOpacity={0.85}
              style={{
                backgroundColor: color.card,
                borderRadius: borderRadius.lg,
                padding: space.sm,
                borderWidth: 1,
                borderColor: color.border,
                gap: space.xs,
                boxShadow: isDark
                  ? '0px 2px 8px rgba(0,0,0,0.35)'
                  : '0px 1px 4px rgba(0,0,0,0.06)',
              } as any}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
                <View
                  style={{
                    backgroundColor: diff.bg,
                    paddingHorizontal: space.xs,
                    paddingVertical: 3,
                    borderRadius: borderRadius.full,
                  }}
                >
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: fontWeight.medium.toString() as any,
                      color: diff.textColor,
                    }}
                  >
                    {difficulty}
                  </Text>
                </View>

                {isLive && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: color.error + '18',
                      paddingHorizontal: space.xs,
                      paddingVertical: 3,
                      borderRadius: borderRadius.full,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        borderRadius: borderRadius.full,
                        aspectRatio: 1,
                        backgroundColor: color.error,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: fontWeight.medium.toString() as any,
                        color: color.error,
                      }}
                    >
                      {i18n.t('components.FeatureContestCard.live')}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.bold.toString() as any,
                  color: onSurface,
                  lineHeight: fontSize.sm * lineHeight.tight,
                  fontFamily: fontFamily.text,
                }}
                numberOfLines={2}
              >
                {title}
              </Text>

              <Text
                style={{
                  fontSize: fontSize.xs,
                  color: onSurfaceMuted,
                  fontWeight: fontWeight.medium.toString() as any,
                }}
              >
                {subject}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <FontAwesome5 name="users" size={fontSize.xs - 2} color={onSurfaceMuted} />
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      color: onSurfaceMuted,
                      fontWeight: fontWeight.medium.toString() as any,
                    }}
                  >
                    {participantsCount.toLocaleString()}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.bold.toString() as any,
                    color: color.accent,
                  }}
                >
                  {epReward}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}