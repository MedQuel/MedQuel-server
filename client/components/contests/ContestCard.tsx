import { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { TopPerformersList } from './TopPerformersList';
import type { ContestPerformer } from '../../common/types/types';
import { formatRelativeDuration } from '../../common/utils/dateUtils';
import { SubjectIcon, subjectCatalog, type SubjectId } from '../../common/constants/subject';


const URGENT_THRESHOLD_MS = 60*60*1000;

type Difficulty = 'hard' | 'medium' | 'easy';
type FeatherName = ComponentProps<typeof Feather>['name'];

export type ContestCardProps = {
  title: string;
  subject: string;
  subjectId?: SubjectId | null;
  difficulty: Difficulty;
  epReward: number;
  endsAtMs: number;
  nowMs: number;
  questionsCount: number;
  duration: string | number;
  participantsCount: number;
  isPro?: boolean;
  isLive?: boolean;
  currentUserId?: string | null;
  performers?: ContestPerformer[];
  performersLoading?: boolean;
  performersError?: boolean;
  onExpand?: () => void;
  onStartPress: () => void;
};

function StatPill({ icon, label }: { icon: FeatherName; label: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        gap: theme.space.xs * 1.25,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.space.sm,
        paddingHorizontal: theme.space.sm,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.color.surface,
      }}
    >
      <Feather name={icon} size={theme.space.md * 0.9} color={theme.color.textMuted} />
      <Text
        numberOfLines={1}
        style={{
          flexShrink: 1,
          color: theme.color.textSecondary,
          fontSize: theme.fontSize.sm * 1.1,
          fontFamily: theme.fontFamily.number,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Chip({ color, children, icon}: {
  color: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        gap: theme.space.xs,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.space.xs,
        paddingHorizontal: theme.space.sm,
        borderRadius: theme.borderRadius.sm * 1.25,
        backgroundColor: color + '18',
      }}
    >
      {icon}

      <Text style={{ color, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.bold }}>
        {children}
      </Text>
    </View>
  );
}


export function ContestCard(props: ContestCardProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const difficultyColor = props.difficulty === 'hard'
    ? theme.color.error
    : props.difficulty === 'medium' ? theme.color.warning : theme.color.success;

  const msLeft = props.endsAtMs - props.nowMs;
  const isUrgent = msLeft > 0 && msLeft < URGENT_THRESHOLD_MS;

  const subjectDef = props.subjectId ? subjectCatalog[props.subjectId] : null;
  const subjectColor = subjectDef ? theme.color[subjectDef.variant] : theme.color.accent;

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && props.performers === undefined && !props.performersLoading) {
      props.onExpand?.();
    }
  };

  return (
    <View
      style={{
        gap: theme.space.sm,
        flexDirection: 'column',
        padding: theme.space.md,
        borderWidth: 1.5,
        borderColor: props.isPro ? theme.color.premium + '55' : theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        boxShadow: theme.isDark ? '0px 4px 20px rgba(0,0,0,0.4)' : '0px 2px 12px rgba(0,0,0,0.08)',
      }}
    >
      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flex: 1,
            flexWrap: 'wrap',
            gap: theme.space.sm,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {props.isPro && (
            <Chip
              color={theme.color.premium}
              icon={
                <MaterialCommunityIcons
                  name='crown-outline'
                  size={theme.fontSize.xs + 2}
                  color={theme.color.premium}
                />
              }
            >
              {theme.i18n.t('common.pro')}
            </Chip>
          )}

          {props.isLive && (
            <Chip
              color={theme.color.error}
              icon={
                <Feather
                  name='radio'
                  size={theme.fontSize.xs + 2}
                  color={theme.color.error}
                />
              }
            >
              {theme.i18n.t('common.live')}
            </Chip>
          )}

          <Chip
            color={subjectColor}
            icon={
              props.subjectId ? (
                <SubjectIcon
                  id={props.subjectId}
                  color={subjectColor}
                  size={theme.fontSize.xs + 3}
                />
              ) : undefined
            }
          >
            {props.subject}
          </Chip>

          <Chip color={difficultyColor}>
            {theme.i18n.t(`common.${props.difficulty}`)}
          </Chip>
        </View>

        <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
          <Feather
            name='zap'
            size={theme.fontSize.lg}
            color={theme.isDark ? theme.color.info : theme.color.accent}
          />
          <Text
            style={{
              fontSize: theme.fontSize.xl,
              fontFamily: theme.fontFamily.numberBold,
              color: theme.isDark ? theme.color.info : theme.color.accent,
            }}
          >
            +{props.epReward}
          </Text>
        </View>
      </View>

      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1, gap: theme.space.sm }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: theme.fontSize.lg,
              color: theme.color.textPrimary,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {props.title}
          </Text>

          <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
            <Feather
              name='clock'
              size={theme.fontSize.sm}
              color={isUrgent ? theme.color.error : theme.color.warning}
            />
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                color: isUrgent ? theme.color.error : theme.color.warning,
              }}
            >
              {formatRelativeDuration(msLeft)}{' '}{theme.i18n.t('contests.timeLeft')}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: theme.fontSize.sm,
            color: theme.color.textMuted,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {theme.i18n.t('contests.ep_reward')}
        </Text>
      </View>

      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          marginVertical: theme.space.xs,
        }}
      >
        <StatPill
          icon='file-text'
          label={`${props.questionsCount} ${theme.i18n.t('contests.questions')}`}
        />
        <StatPill
          icon='clock'
          label={theme.i18n.t('contests.minute', { mins: props.duration })}
        />
        <StatPill
          icon='users'
          label={props.participantsCount.toLocaleString()}
        />
      </View>

      <TouchableOpacity
        onPress={toggleExpanded}
        activeOpacity={0.7}
        accessibilityRole='button'
        accessibilityState={{ expanded }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.space.xs,
        }}
      >
        <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
          <Feather name='award' size={theme.fontSize.md} color={theme.color.warning} />
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('contests.topPerformers.title')}
          </Text>
        </View>

        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={theme.fontSize.xl}
          color={theme.color.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={{ paddingBottom: theme.space.xs }}>
          {props.performersLoading ? (
            <ActivityIndicator
              size='small'
              color={theme.color.accent}
              style={{ paddingVertical: theme.space.md }}
            />
          ) : props.performersError ? (
            <TouchableOpacity
              onPress={props.onExpand}
              style={{
                gap: theme.space.xs,
                alignItems: 'center',
                paddingVertical: theme.space.sm,
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.color.textMuted,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t('contests.topPerformers.load_error')}
              </Text>
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('common.retry')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TopPerformersList
              performers={props.performers ?? []}
              currentUserId={props.currentUserId}
              compact
            />
          )}
        </View>
      )}

      <TouchableOpacity
        onPress={props.onStartPress}
        activeOpacity={0.85}
        style={{
          gap: theme.space.xs,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.space.md * 0.9,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: props.isPro ? theme.color.premium : theme.color.accent,
        }}
      >
        {props.isPro && (
          <MaterialCommunityIcons
            name='crown-outline'
            size={theme.fontSize.md}
            color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
          />
        )}

        <Text
          style={{
            letterSpacing: 0.3,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.bold,
            color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
          }}
        >
          {props.isPro ? theme.i18n.t('common.unlock_and_start') : theme.i18n.t('common.start_contest')}
        </Text>

        {!props.isPro && (
          <Feather
            name='chevron-right'
            size={theme.fontSize.lg}
            color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
