import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { api } from '@/common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import type { Badge, FriendSummary } from '../../common/types/types';
import ProfileScreenHeader from './profileScreenHeader';
import { useBottomBar } from '../../common/context/useBottomBar';

import { Loading } from '../../components/common/loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileEarnedBadge } from '../../components/ProfileEarnedBadge';
import { ProfilePillRow } from '../../components/profile/ProfilePillRow';
import { FriendsRow } from '../../components/friends/FriendsRow';
import { AddFriendButton } from '../../components/friends/AddfriendButton';
import { ProfileScreenStatsCard } from '../../components/ProfileScreenStatsCard';
import { SubjectPerformanceCard } from '../../components/SubjectPerformanceCard';
import { AttemptHistoryCard } from '../../components/AttemptHistoryCard';


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
    <View style={{ paddingHorizontal: theme.space.md, marginTop: marginTop ?? theme.space.sm * 1.5 }}>
      {children}
    </View>
  );
}

const RECENT_ATTEMPTS_LIMIT = 3;

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>({});         
  const [recentData, setRecentData] = useState<any[]>([]);     
  const [achievements, setAchievements] = useState<Badge[]>([]);
  const [myFriends, setMyFriends] = useState<FriendSummary[]>([]);
  const [load, setLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { theme } = useTheme();
  useBottomBar(true, 'profile');

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [user, analyticsData, achievementsData, friendsData] = await Promise.all([
        api.user.getMe(),
        api.analytics.getAnalytics(),
        api.achievement.getAchievements(),
        api.friends.getFriends(),
      ]);

      setUserData(user);
      setAnalytics(analyticsData ?? {});                          // ✅ safe fallback
      setRecentData(analyticsData?.recentAttempts ?? []);         // ✅ safe fallback
      setAchievements(achievementsData ?? []);
      setMyFriends(friendsData ?? []);
    } catch {
      setError('Could not load profile. Pull to refresh.');
    } finally {
      setLoad(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleAddFriendsPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/friends' as any);
  }, [router]);

  const handleFriendPress = useCallback((friend: FriendSummary) => {
    router.push({ pathname: '/friends/UserProfileScreen', params: { uid: friend.uid } } as any);
  }, [router]);

  const handleViewAllAttemptsPress = useCallback(() => {
    router.push('/analytics' as any);
  }, [router]);

  const subjectPerformance = analytics?.subjectPerformance ?? [];  // ✅ already safe
  const hasRecentAttempts = (recentData ?? []).length > 0;          // ✅ already safe
  const displayBadges = achievements.filter((b) => b.status === 'earned');

  const attemptHistoryItems = (recentData ?? []).map((a: any) => ({
    id: a.sessionId,
    title: `Quiz on ${a.subject}`,
    date: new Date(a.completedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    totalQuestions: a.totalQuestions || 10,
    correctAnswers: a.correctCount || Math.round(((a.scorePercent || 0) / 100) * (a.totalQuestions || 10)),
    timeTaken: `${Math.max(1, Math.round((a.timeTaken || 0) / 60))}m`,
  }));

  const hasMoreAttempts = attemptHistoryItems.length > RECENT_ATTEMPTS_LIMIT;

  if (load) {
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

  if (error || !userData) {
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
          {error ?? 'Could not load profile. Pull to refresh.'}
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
      <ProfileScreenHeader user={userData} />

      <View style={{ gap: theme.space.xs * 1.5, alignItems: 'center', marginTop: theme.space.xxl }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg + 2,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {userData?.displayName}
        </Text>

        <View style={{ gap: theme.space.sm, flexDirection: 'row' }}>
          {userData?.describesYou && (
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
                {userData.describesYou}
              </Text>
            </Pill>
          )}

          {userData?.yearOfStudy && (
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
                {userData.yearOfStudy}
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
              {theme.i18n.t('profile.level', { level: userData?.currentLevel ?? 0 })}
            </Text>
          </Pill>
        </View>

        {userData?.specialties?.length > 0 && (
          <ProfilePillRow items={userData.specialties} variant='accent' />
        )}

        <View
          style={{
            flexWrap: 'wrap',
            gap: theme.space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconLabel
            theme={theme}
            icon='target'
            color={theme.color.textSecondary}
            text={userData?.targetExam}
          />
          {userData?.institution && (
            <IconLabel
              theme={theme}
              icon='map-marker-outline'
              color={theme.color.textMuted}
              text={userData?.institution}
            />
          )}
          <IconLabel
            theme={theme}
            icon='lightning-bolt'
            color={theme.color.info}
            bold
            text={theme.i18n.t('profile.xpPoints', { points: userData?.xpPoints ?? 0 })}
          />
        </View>
      </View>

      <View style={{ marginTop: theme.space.md, paddingHorizontal: theme.space.md }}>
        <ProfileScreenStatsCard
          stats={[
            {
              label: theme.i18n.t('common.level'),
              value: String(userData?.currentLevel ?? 0),
              color: '#F59E0B',
              icon: 'star',
            },
            {
              label: theme.i18n.t('common.quizzes'),
              value: String(userData?.stats?.contestsPlayed ?? 0),
              color: '#3B82F6',
              icon: 'lightning-bolt',
            },
            {
              label: theme.i18n.t('common.streak'),
              value: String(userData?.longestStreak ?? 0),
              color: '#EF4444',
              icon: 'fire',
            },
            {
              label: theme.i18n.t('common.accuracy'),
              value: `${userData?.totalQuestions
                ? Math.floor((userData.totalCorrect/userData.totalQuestions)*1000) / 10
                : 0
              }%`,
              color: '#22C55E',
              icon: 'bullseye',
            },
          ]}
        />
      </View>
      <Section theme={theme}>
        {myFriends.length === 0 ? (
          <AddFriendButton onPress={handleAddFriendsPress} />
        ) : (
          <FriendsRow
            friends={myFriends}
            onViewAll={handleAddFriendsPress}
            onFriendPress={handleFriendPress}
            onAddFriendPress={handleAddFriendsPress}
          />
        )}
      </Section>

      <Section theme={theme}>
        <ProfileEarnedBadge
          achievements={displayBadges}
          title="Earned Badges"
          onViewAllPress={() => router.push('/achievements')}
          onBadgePress={() => router.push('/achievements')}
        />
      </Section>

      <Section theme={theme}>
        {subjectPerformance.length === 0 ? (
          <EmptyState
            icon='bar-chart-2'
            title='No subject data yet'
            subtitle='Complete a few quizzes to see your subject-wise performance here.'
          />
        ) : (
          <SubjectPerformanceCard
            subjects={subjectPerformance.map((s: { subject: string; accuracy: number }) => ({
              name: s.subject,
              score: s.accuracy,
            }))}
          />
        )}
      </Section>

      <Section theme={theme}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: theme.space.md,
            marginLeft: theme.space.xs,
          }}
        >
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.sm + 4,
              fontFamily: theme.fontFamily.regular,
              fontWeight: theme.fontWeight.bold,
            }}
          >
            {theme.i18n.t('profile.recentAttempts')}
          </Text>

          {hasMoreAttempts && (
            <TouchableOpacity onPress={handleViewAllAttemptsPress} hitSlop={8}>
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t('common.view_all')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!hasRecentAttempts ? (
          <EmptyState
            icon='clock'
            title='No attempts yet'
            subtitle='Your recent quiz and contest attempts will show up here.'
          />
        ) : (
          <AttemptHistoryCard attempts={attemptHistoryItems.slice(0, RECENT_ATTEMPTS_LIMIT)} />
        )}
      </Section>
    </ScrollView>
  );
}