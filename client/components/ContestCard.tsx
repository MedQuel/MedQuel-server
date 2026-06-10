import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export interface ContestData {
  category: string;
  difficulty: string;
  title: string;
  timeLeft: string;
  questionsCount: number;
  duration: string;
  participantsCount: number;
  epReward: number;
  onStartPress: () => void;
}

export default function ContestCard({
  category,
  difficulty,
  title,
  timeLeft,
  questionsCount,
  duration,
  participantsCount,
  epReward,
  onStartPress,
}: ContestData) {
  const { theme } = useTheme();
  const { color, space, fontSize, fontWeight, borderRadius, lineHeight, fontFamily, i18n, isDark } = theme;

  const onSurface = color.text;
  const onSurfaceMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
  const pillBg = isDark ? 'rgba(255,255,255,0.08)' : color.accent + '18';
  const pillText = isDark ? 'rgba(255,255,255,0.75)' : color.info;
  const pillIcon = isDark ? 'rgba(255,255,255,0.6)' : color.info;

  return (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: borderRadius.xl,
        padding: space.md,
        marginHorizontal: space.md,
        marginVertical: space.sm,
        gap: space.xs,
        borderWidth: 1,
        borderColor: color.border,
        boxShadow: isDark
          ? '0px 4px 20px rgba(0,0,0,0.4)'
          : '0px 2px 12px rgba(0,0,0,0.08)',
      } as any}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: space.xs, flexShrink: 1, flexWrap: 'wrap' }}>
          <View
            style={{
              backgroundColor: color.error + '33',
              paddingHorizontal: space.xs,
              paddingVertical: 3,
              borderRadius: borderRadius.full,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: color.error, fontSize: fontSize.xs, fontWeight: fontWeight.bold.toString() as any }}>
              {category}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: color.warning + '33',
              paddingHorizontal: space.xs,
              paddingVertical: 3,
              borderRadius: borderRadius.full,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: color.warning, fontSize: fontSize.xs, fontWeight: fontWeight.bold.toString() as any }}>
              {difficulty}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end', marginLeft: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <MaterialCommunityIcons name="lightning-bolt" size={fontSize.md} color={color.info} />
            <Text
              style={{
                fontSize: fontSize.lg,
                fontWeight: fontWeight.bold.toString() as any,
                color: color.info,
                lineHeight: fontSize.lg * lineHeight.tight,
              }}
            >
              +{epReward}
            </Text>
          </View>
          <Text style={{ fontSize: fontSize.xs, color: onSurfaceMuted }}>
            {i18n.t('components.ContestCard.ep_reward')}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: fontSize.md,
          fontWeight: fontWeight.bold.toString() as any,
          color: onSurface,
          lineHeight: fontSize.md * lineHeight.normal,
          fontFamily: fontFamily.text,
          flexShrink: 1,
        }}
        numberOfLines={2}
      >
        {title}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
        <Ionicons name="time-outline" size={fontSize.sm} color={color.warning} />
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium.toString() as any,
            color: color.warning,
          }}
        >
          {timeLeft}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: space.xs }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            backgroundColor: pillBg,
            borderRadius: borderRadius.md,
            paddingVertical: space.xs,
            paddingHorizontal: space.xs,
          }}
        >
          <MaterialCommunityIcons name="file-document-outline" size={fontSize.sm} color={pillIcon} />
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium.toString() as any, color: pillText }}>
            {i18n.t('components.ContestCard.questions_count', { count: questionsCount })}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            backgroundColor: pillBg,
            borderRadius: borderRadius.md,
            paddingVertical: space.xs,
            paddingHorizontal: space.xs,
          }}
        >
          <Ionicons name="time-outline" size={fontSize.sm} color={pillIcon} />
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium.toString() as any, color: pillText }}>
            {duration}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            backgroundColor: pillBg,
            borderRadius: borderRadius.md,
            paddingVertical: space.xs,
            paddingHorizontal: space.xs,
          }}
        >
          <FontAwesome5 name="users" size={fontSize.xs} color={pillIcon} />
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium.toString() as any, color: pillText }}>
            {participantsCount.toLocaleString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onStartPress}
        activeOpacity={0.85}
        style={{
          backgroundColor: color.accent,
          borderRadius: borderRadius.lg,
          paddingVertical: space.sm,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: fontSize.md,
            fontWeight: fontWeight.bold.toString() as any,
            letterSpacing: 0.3,
            fontFamily: fontFamily.text,
          }}
        >
          {i18n.t('components.ContestCard.start_contest')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}