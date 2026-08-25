import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

type Props = {
  earned: number;
  total: number;
  rank?: number | string;
  level?: number;
  epReward?: number;
};

const alpha = (hex: string, opacity: number) => {
  const n = hex.replace('#', '');
  const full = n.length === 3 ? n.split('').map(ch => ch + ch).join('') : n.slice(0, 6);
  const i = Number.parseInt(full, 16);
  // eslint-disable-next-line no-bitwise
  return `rgba(${(i >> 16) & 255}, ${(i >> 8) & 255}, ${i & 255}, ${opacity})`;
};

export function AchievementProgressCard({ earned, total, rank, level }: Props) {
  const { theme } = useTheme();
  const progress = total > 0 ? Math.min(100, Math.max(0, (earned / total) * 100)) : 0;

  const cardBackground = theme.isDark ? theme.color.surface : theme.color.accent;
  const mutedText = alpha(theme.isDark ? theme.color.textPrimary : theme.color.textInverse, 0.68);
  const mainText = theme.isDark ? theme.color.textPrimary : theme.color.textInverse;
  const trackColor = alpha(theme.isDark ? theme.color.textPrimary : theme.color.textInverse, 0.18);
  const fillColor = theme.isDark ? theme.color.info : theme.color.textInverse;
  const circleColor = alpha(theme.isDark ? theme.color.textPrimary : theme.color.textInverse, 0.08);

  return (
    <View
      style={{
        overflow: 'hidden',
        borderRadius: theme.borderRadius.xl + theme.borderRadius.sm,
        backgroundColor: cardBackground,
        borderWidth: 1,
        borderColor: theme.isDark ? alpha(theme.color.textPrimary, 0.06) : alpha(theme.color.textInverse, 0.08),
        shadowColor: theme.color.accent,
        shadowOpacity: theme.isDark ? 0.18 : 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      }}
    >
      <View
        style={{
          position: 'absolute',
          right: -18,
          top: -12,
          height: 100,
          aspectRatio: 1,
          borderRadius: theme.borderRadius.full,
          backgroundColor: circleColor,
        }}
      />

      <View style={{ padding: theme.space.md }}>
        <Text
          style={{
            color: mutedText,
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.number,
            letterSpacing: 0.6,
          }}
        >
          {theme.i18n.t('components.AchievementProgressCard.progress')}
        </Text>

        <View style={{ marginTop: theme.space.sm, flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text
            style={{
              color: mainText,
              fontSize: theme.fontSize.xxxl + theme.space.sm,
              lineHeight: theme.fontSize.xxxl + theme.space.sm,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {earned}
          </Text>

          <Text
            style={{
              marginLeft: 8,
              paddingBottom: 4,
              color: mutedText,
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.medium,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            / {total} {theme.i18n.t('components.AchievementProgressCard.badges')}
          </Text>
        </View>

        <View
          style={{
            marginTop: theme.space.md,
            height: 6,
            borderRadius: theme.borderRadius.full,
            backgroundColor: trackColor,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${progress}%`,
              borderRadius: theme.borderRadius.full,
              backgroundColor: fillColor,
            }}
          />
        </View>

        <View
          style={{
            marginTop: theme.space.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1, gap: theme.space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
              <Feather name="award" size={theme.fontSize.md} color={theme.color.warning} />
              <Text
                style={{
                  color: mutedText,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t('Rank') || 'Rank'}:
              </Text>
              <Text
                style={{
                  color: mainText,
                  fontSize: theme.fontSize.sm,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.number,
                }}
              >
                {typeof rank === 'number' && rank > 0 ? `#${rank}` : (rank ?? 'Unranked')}
              </Text>
            </View>

            {level ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
                <Feather name="star" size={theme.fontSize.md} color={theme.color.info} />
                <Text
                  style={{
                    color: mutedText,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  Lvl:
                </Text>
                <Text
                  style={{
                    color: mainText,
                    fontSize: theme.fontSize.sm,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.number,
                  }}
                >
                  {level}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}