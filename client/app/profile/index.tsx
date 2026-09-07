import { useCallback, useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, ScrollView, RefreshControl } from 'react-native';

import { api } from '@/common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { ProfileScreenHeader } from './profileScreenHeader';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';

import { Loading } from '../../components/common/loading';
import { EmptyState } from '../../components/common/EmptyState';
import { PremiumUpsellCard } from '../../components/PremiumUpsellCard';
import { ProfilePillRow } from '../../components/profile/ProfilePillRow';
import { ProfileScreenStatsCard } from '../../components/ProfileScreenStatsCard';
import { SubjectPerformanceCard } from '../../components/SubjectPerformanceCard';
import { AttemptHistoryItemCard } from '../../components/AttemptHistoryItemCard';


function Pill({ theme, children, style }: any) {
  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.space.xs,
          paddingHorizontal: theme.space.sm * 1.1,
          borderRadius: theme.borderRadius.md + 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
function IconLabel({ theme, icon, color, text, bold }: any) {
  return (
    <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
      <MaterialCommunityIcons name={icon} size={theme.space.md} color={color} />
      <Text
        style={{
          color,
          fontSize: theme.fontSize.xs + 2,
          fontWeight: bold ? theme.fontWeight.bold : undefined,
          fontFamily: bold ? theme.fontFamily.bold : theme.fontFamily.regular,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
function Section({ theme, children, marginTop }: any) {
  return (
    <View style={{ marginTop: marginTop ?? theme.space.sm * 1.5, paddingHorizontal: theme.space.md }}>
      {children}
    </View>
  );
}


export default function ProfileScreen() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsError, setAnalyticsError] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { theme } = useTheme();
  useBottomBar(true, 'profile');
  const { user, userLoading, userError, refreshUser } = useAppContext();

  const loadAnalytics = useCallback(async () => {
    try {
      setAnalyticsError(false);
      const data = await api.analytics.getAnalytics();
      setAnalytics(data);
    } catch {
      setAnalyticsError(true);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshUser(), loadAnalytics()]);
    setRefreshing(false);
  }, [refreshUser, loadAnalytics]);

  const recentData = analytics?.recentAttempts ?? [];
  const subjectPerformance = analytics?.subjectPerformance ?? [];

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  if (userLoading || analyticsLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.space.md,
          backgroundColor: theme.color.background,
        }}
      >
        <Loading />
      </View>
    );
  }
  if (userError || !user) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.space.md,
          backgroundColor: theme.color.background,
        }}
      >
        <Text style={{ color: theme.color.textSecondary }}>
          Could not load profile. Pull to refresh.
        </Text>
      </View>
    );
  }


  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 75 }}
      style={{ flex: 1, backgroundColor: theme.color.background }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.color.accent}
        />
      }
    >
      <ProfileScreenHeader user={user} />
      <View style={{ gap: theme.space.xs * 1.5, alignItems: 'center', marginTop: theme.space.xxl }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg + 2,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {user.displayName}
        </Text>

        <View style={{ gap: theme.space.sm, flexDirection: 'row' }}>
          <Pill
            theme={theme}
            style={{
              borderWidth: 1,
              borderColor: theme.color.border,
              backgroundColor: theme.color.card,
            }}
          >
            <Text
              style={{
                color: theme.color.accent,
                fontSize: theme.fontSize.xs * 1.2,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {user.describesYou}
            </Text>
          </Pill>

          {user.yearOfStudy && (
            <Pill
              theme={theme}
              style={{
                borderWidth: 1,
                borderColor: theme.color.border,
                backgroundColor: theme.color.card,
              }}
            >
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.xs * 1.2,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {user.yearOfStudy}
              </Text>
            </Pill>
          )}

          <Pill
            theme={theme}
            style={{
              gap: 5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.xs,
              paddingHorizontal: theme.space.sm + 3,
              borderWidth: 0.5,
              borderColor: theme.color.warning + '22',
              backgroundColor: theme.color.warning + '22',
            }}
          >
            <MaterialCommunityIcons
              name='star'
              size={theme.space.md}
              color={theme.color.warning}
            />
            <Text
              style={{
                color: theme.color.warning,
                fontSize: theme.fontSize.xs * 1.15,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.number,
              }}
            >
              {theme.i18n.t('profile.level', { level: user.currentLevel ?? 0 })}
            </Text>
          </Pill>
        </View>

        {user.specialties?.length > 0 && (
          <ProfilePillRow items={user.specialties} variant='accent' />
        )}

        <View
          style={{
            flexWrap: 'wrap',
            gap: theme.space.md + 2,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconLabel
            theme={theme}
            icon='target'
            color={theme.color.textSecondary}
            text={user.targetExam}
          />
          {user.institution && (
            <IconLabel
              theme={theme}
              icon='map-marker-outline'
              color={theme.color.textMuted}
              text={user.institution}
            />
          )}
          <IconLabel
            theme={theme}
            icon='lightning-bolt'
            color={theme.color.info}
            bold
            text={theme.i18n.t('profile.xpPoints', { points: user.xpPoints ?? 0 })}
          />
        </View>

        {/* {user.contentScope === 'focused' && (
          <View
            style={{
              gap: theme.space.xs,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.space.xs,
              paddingHorizontal: theme.space.sm,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.color.info + '15',
            }}
          >
            <MaterialCommunityIcons
              name='filter-variant'
              size={theme.fontSize.sm + 2}
              color={theme.color.info}
            />
            <Text
              style={{
                color: theme.color.info,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('profile.focusedOn', { subjects: user.focusSubjects?.join(', ') ?? '' })}
            </Text>
          </View>
        )} */}
      </View>

      <View style={{ marginTop: theme.space.md, paddingHorizontal: theme.space.md }}>
        <ProfileScreenStatsCard
          stats={[
            {
              label: theme.i18n.t('common.level'),
              value: String(user.currentLevel ?? 0),
              color: '#F59E0B',
              icon: 'star',
            },
            {
              label: theme.i18n.t('common.quizzes'),
              value: String(user.stats?.contestsPlayed ?? 0),
              color: '#3B82F6',
              icon: 'lightning-bolt',
            },
            {
              label: theme.i18n.t('common.streak'),
              value: String(user.longestStreak ?? 0),
              color: '#EF4444',
              icon: 'fire',
            },
            {
              label: theme.i18n.t('common.accuracy'),
              value: `${user.totalQuestions ? Math.floor((user.totalCorrect/user.totalQuestions)*1000) / 10 : 0}%`,
              color: '#22C55E',
              icon: 'bullseye',
            },
          ]}
        />
      </View>

      <Section theme={theme}>
        <PremiumUpsellCard />
      </Section>

      <Section theme={theme}>
        {analyticsError ? (
          <EmptyState
            icon='alert-triangle'
            title="Couldn't load subject performance"
            subtitle='Pull down to try again.'
          />
        ) : subjectPerformance.length === 0 ? (
          <EmptyState
            icon='bar-chart-2'
            title='No subject data yet'
            subtitle='Complete a few quizzes to see your subject-wise performance here.'
          />
        ) : (
          <SubjectPerformanceCard
            subjects={subjectPerformance.map(
              (s: { subject: string; accuracy: number }) => ({
                name: s.subject,
                score: s.accuracy,
              })
            )}
          />
        )}
      </Section>

      <Section theme={theme}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.sm + 4,
            fontFamily: theme.fontFamily.regular,
            fontWeight: theme.fontWeight.bold,
            paddingBottom: theme.space.md,
            marginLeft: theme.space.xs,
          }}
        >
          {theme.i18n.t('profile.recentAttempts')}
        </Text>

        {analyticsError ? null : recentData.length === 0 ? (
          <EmptyState
            icon='clock'
            title='No attempts yet'
            subtitle='Your recent quiz and contest attempts will show up here.'
          />
        ) : (
          <AttemptHistoryItemCard
            attempts={recentData.map(
              (a: {
                sessionId: string;
                subject: string;
                scorePercent: number;
                completedAt: string;
              }) => ({
                id: a.sessionId,
                title: a.subject,
                time: formatTime(a.completedAt),
                score: a.scorePercent,
              })
            )}
          />
        )}
      </Section>
    </ScrollView>
  );
}
