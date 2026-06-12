import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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

  const difficultyColor = (difficulty: 'hard' | 'medium' | 'easy'): { textColor: string } => {
    if (difficulty === 'hard') return { textColor: theme.color.error };
    else if (difficulty === 'medium') return { textColor: theme.color.warning };
    else return { textColor: theme.color.success };
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.space.md * 0.75 }}
      >
        {contests.map((contest, index) => {
          const diffColor = difficultyColor(contest.difficulty);

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.75}
              onPress={() => {}}
              style={{
                minWidth: '35%',
                gap: theme.space.xs,
                padding: theme.space.md,
                borderWidth: 1.5,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.card,
                boxShadow: theme.isDark
                  ? '0px 2px 8px rgba(0,0,0,0.35)'
                  : '0px 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: theme.space.xs,
                }}
              >
                <View
                  style={{
                    paddingVertical: theme.space.xs,
                    paddingHorizontal: theme.space.sm,
                    borderRadius: theme.borderRadius.sm * 1.25,
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
                      paddingVertical: theme.space.xs,
                      paddingHorizontal: theme.space.sm,
                      borderRadius: theme.borderRadius.sm * 1.25,
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
                        fontFamily: theme.fontFamily.regular,
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
                  fontSize: theme.fontSize.md,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.regular,
                }}
                numberOfLines={2}
              >
                {contest.title}
              </Text>

              <Text
                style={{
                  marginBottom: theme.space.sm,
                  color: theme.color.textMuted,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.light,
                }}
              >
                {contest.subject}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View
                  style={{
                    gap: theme.space.xs,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name='users' size={theme.space.sm * 1.5} color={theme.color.textMuted} />
                  <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.light }}>
                    {contest.participantsCount >= 1000
                      ? (contest.participantsCount / 1000)
                          .toFixed(1)
                          .replace(/\.0$/, '') + 'K'
                      : contest.participantsCount.toString()}
                  </Text>
                </View>
                <Text
                  style={{
                    color: theme.isDark ? theme.color.info :theme.color.accent,
                    fontSize: theme.fontSize.md,
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
    </View>
  );
}
