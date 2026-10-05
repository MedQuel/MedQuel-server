import { Feather } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { ContestPerformer } from '../../common/types/types';


type TopPerformersListProps = {
  performers: ContestPerformer[];
  currentUserId?: string | null;
  compact?: boolean;
};

export function TopPerformersList({ performers, currentUserId, compact = false }: TopPerformersListProps) {
  const { theme } = useTheme();

  const medalColor = (rank: number): string => {
    if (rank === 1) return theme.color.warning;
    if (rank === 2) return theme.color.textSecondary;
    if (rank === 3) return '#CD7F32';
    return theme.color.textMuted;
  };

  const sorted = performers.slice().sort((a, b) => a.rank - b.rank);
  const avatarSize = compact ? theme.space.lg + 4 : theme.space.xl + 4;

  if (sorted.length === 0) {
    return (
      <View style={{ gap: theme.space.xs, alignItems: 'center', paddingVertical: theme.space.sm }}>
        <Feather name='award' size={theme.fontSize.xl} color={theme.color.textMuted} />
        <Text
          style={{
            textAlign: 'center',
            fontSize: theme.fontSize.sm,
            color: theme.color.textMuted,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {theme.i18n.t('contests.topPerformers.empty')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: theme.space.sm }}>
      {sorted.map((p) => {
        const isMe = !!currentUserId && p.userId === currentUserId;
        const color = medalColor(p.rank);
        const initial = (p.displayName?.trim()?.[0] ?? '?').toUpperCase();

        return (
          <View
            key={p.userId}
            style={{
              gap: theme.space.sm,
              flexDirection: 'row',
              alignItems: 'center',
              padding: theme.space.sm,
              paddingHorizontal: theme.space.md,
              borderWidth: 1,
              borderRadius: theme.borderRadius.lg,
              borderColor: isMe ? theme.color.accent + '77' : theme.color.border,
              backgroundColor: isMe ? theme.color.accent + '12' : theme.color.surface,
            }}
          >
            <Text style={{ color, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.numberBold }}>
              #{p.rank}
            </Text>

            {p.photoURL ? (
              <Image
                source={{ uri: p.photoURL }}
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                }}
              />
            ) : (
              <View
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: avatarSize / 2,
                  backgroundColor: theme.color.accent + '22',
                }}
              >
                <Text
                  style={{
                    color: theme.color.accent,
                    fontSize: theme.fontSize.md,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {initial}
                </Text>
              </View>
            )}

            <View
              style={{
                flex: 1,
                gap: theme.space.xs,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  flexShrink: 1,
                  fontSize: theme.fontSize.md,
                  color: theme.color.textPrimary,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {p.displayName}
              </Text>

              {isMe && (
                <View
                  style={{
                    paddingVertical: 1,
                    paddingHorizontal: theme.space.xs * 1.5,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: theme.color.accent + '22',
                  }}
                >
                  <Text
                    style={{
                      color: theme.color.accent,
                      fontSize: theme.fontSize.xs,
                      fontFamily: theme.fontFamily.bold,
                    }}
                  >
                    {theme.i18n.t('contests.topPerformers.you')}
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={{
                fontSize: theme.fontSize.md,
                color: theme.color.textPrimary,
                fontFamily: theme.fontFamily.numberBold,
              }}
            >
              {theme.i18n.t('contests.topPerformers.pts', { score: p.score })}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
