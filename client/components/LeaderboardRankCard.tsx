import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../theme/ThemeContext';

type LeaderboardRankCardProps = {
  rank: number;
  name: string;
  specialty: string;
  points: number;
};

export function LeaderboardRankCard({
  rank,
  name,
  specialty,
  points,
}: LeaderboardRankCardProps) {
  const { theme } = useTheme();

  const getInitials = (userName: string) => {
    return userName
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  // Determine dynamic theme styling for Gold (#1), Silver (#2), Bronze (#3), or standard (#4+)
  const isGold = rank === 1;
  const isSilver = rank === 2;
  const isBronze = rank === 3;
  const isTop3 = isGold || isSilver || isBronze;

  const mainColor = isGold
    ? theme.color.warning
    : isSilver
    ? theme.color.info
    : isBronze
    ? theme.color.premium
    : theme.color.textMuted;

  const cardGradientColors: [string, string] = isGold
    ? [
        theme.isDark ? `${theme.color.warning}2B` : `${theme.color.warning}1A`,
        theme.isDark ? `${theme.color.warning}0A` : `${theme.color.warning}05`,
      ]
    : isSilver
    ? [
        theme.isDark ? `${theme.color.info}24` : `${theme.color.info}16`,
        theme.isDark ? `${theme.color.info}08` : `${theme.color.info}04`,
      ]
    : isBronze
    ? [
        theme.isDark ? `${theme.color.premium}24` : `${theme.color.premium}16`,
        theme.isDark ? `${theme.color.premium}08` : `${theme.color.premium}04`,
      ]
    : [theme.color.card, theme.color.card];

  const borderColor = isGold
    ? `${theme.color.warning}55`
    : isSilver
    ? `${theme.color.info}44`
    : isBronze
    ? `${theme.color.premium}44`
    : theme.color.border;

  const avatarGradientColors: [string, string] = isTop3
    ? [`${mainColor}45`, `${mainColor}15`]
    : [`${theme.color.accent}35`, `${theme.color.accent}12`];

  const avatarBorderColor = isTop3 ? `${mainColor}88` : `${theme.color.accent}44`;
  const avatarTextColor = isTop3 ? mainColor : theme.color.accent;

  return (
    <View
      style={{
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1.5,
        borderColor,
        overflow: 'hidden',
        shadowColor: isTop3 ? mainColor : 'transparent',
        shadowOpacity: isTop3 ? (theme.isDark ? 0.12 : 0.08) : 0,
        shadowRadius: isTop3 ? 8 : 0,
        shadowOffset: { width: 0, height: 3 },
        elevation: isTop3 ? 3 : 0,
      }}
    >
      <LinearGradient
        colors={cardGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.space.sm * 1.5,
          paddingHorizontal: theme.space.md,
          backgroundColor: isTop3 ? 'transparent' : theme.color.card,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: theme.space.sm }}>
          {/* Rank Indicator */}
          <View
            style={{
              minWidth: 36,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {isTop3 ? (
              <Feather
                name="award"
                size={theme.fontSize.md}
                color={mainColor}
                style={{ marginRight: 2 }}
              />
            ) : null}
            <Text
              style={{
                color: isTop3 ? mainColor : theme.color.textMuted,
                fontSize: isTop3 ? theme.fontSize.md + 1 : theme.fontSize.md,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.number,
              }}
            >
              #{rank}
            </Text>
          </View>

          {/* Avatar & User Details */}
          <View
            style={{
              gap: theme.space.sm * 1.25,
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: theme.space.xs,
              flex: 1,
            }}
          >
            <LinearGradient
              colors={avatarGradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: theme.space.xl * 1.25,
                height: theme.space.xl * 1.25,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: avatarBorderColor,
                borderRadius: theme.borderRadius.full,
              }}
            >
              <Text
                style={{
                  color: avatarTextColor,
                  fontSize: theme.fontSize.md,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {getInitials(name)}
              </Text>
            </LinearGradient>

            <View style={{ gap: theme.space.xs * 0.5, flexDirection: 'column', justifyContent: 'flex-start', flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.md,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {name}
              </Text>
              {specialty ? (
                <Text
                  numberOfLines={1}
                  style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs * 1.1, fontFamily: theme.fontFamily.light }}
                >
                  {specialty}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* EP Points */}
        <View style={{ gap: theme.space.xs * 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>
          <Text
            style={{
              color: isTop3 ? mainColor : theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {points.toLocaleString()}
          </Text>
          <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs * 1.1, fontFamily: theme.fontFamily.light }}>
            {theme.i18n.t('common.ep')}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
