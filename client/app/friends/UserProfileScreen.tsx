import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Alert, TouchableOpacity } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { hasValidPhoto } from '../../common/utils/imageUrl';
import { useBottomBar } from '../../common/context/useBottomBar';
import { Loading } from '../../components/common/loading';
import { ProfileEarnedBadge } from '../../components/ProfileEarnedBadge';
import { FriendsRow } from '../../components/friends/FriendsRow';
import { ProfilePillRow } from '../../components/profile/ProfilePillRow';
import { ProfileScreenStatsCard } from '../../components/ProfileScreenStatsCard';
import { ActionSheet, ActionSheetOption } from '../../components/friends/Actionsheet';
import type { PublicProfile, FriendSummary, FriendRelationshipStatus } from '../../common/types/types';


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


export default function UserProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { uid } = useLocalSearchParams<{ uid: string }>();

  useBottomBar(false, 'publicProfile');

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!uid) return;
    const data = await api.friends.getUserProfile(uid);
    setProfile(data);
  }, [uid]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadProfile();
      } catch (err: any) {
        Alert.alert(theme.i18n.t('friends.alerts.loadProfileTitle'), err?.message ?? theme.i18n.t('friends.alerts.tryAgain'));
      } finally {
        setLoading(false);
      }
    })();
  }, [loadProfile, theme.i18n]);

  const updateStatus = (status: FriendRelationshipStatus) => {
    setProfile((prev) => (prev ? { ...prev, relationshipStatus: status } : prev));
  };

  const handleAddFriend = async () => {
    if (!uid) return;
    setActionBusy(true);
    try {
      await api.friends.sendFriendRequest(uid);
      updateStatus('REQUEST_SENT');
    } catch (err: any) {
      Alert.alert(theme.i18n.t('friends.alerts.sendRequestFailed'), err?.message ?? theme.i18n.t('friends.alerts.tryAgain'));
    } finally {
      setActionBusy(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!uid) return;
    setActionBusy(true);
    try {
      await api.friends.removeFriend(uid);
      updateStatus('NONE');
    } catch (err: any) {
      Alert.alert(theme.i18n.t('friends.alerts.removeFriendFailed'), err?.message ?? theme.i18n.t('friends.alerts.tryAgain'));
    } finally {
      setActionBusy(false);
    }
  };

  const handleChallenge = () => {
    if (!profile) return;
    setSheetVisible(false);
    router.push({
      pathname: '/challenges/create',
      params: {
        opponentUid: profile.uid,
        opponentName: profile.displayName,
      },
    } as any);
  };

  const handleFriendPress = useCallback((friend: FriendSummary) => {
    router.push({ pathname: '/friends/UserProfileScreen', params: { uid: friend.uid } } as any);
  }, [router]);

  const handleViewAllFriends = useCallback(() => {
    if (!profile) return;
    router.push({
      pathname: '/friends/FriendsListScreen',
      params: { uid: profile.uid, displayName: profile.displayName },
    } as any);
  }, [router, profile]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background, alignItems: 'center', justifyContent: 'center' }}>
        <Loading />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background, alignItems: 'center', justifyContent: 'center', padding: theme.space.lg }}>
        <MaterialCommunityIcons name="account-off-outline" size={40} color={theme.color.textMuted} />
        <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.md, fontFamily: theme.fontFamily.regular, marginTop: theme.space.sm }}>
          {theme.i18n.t('friends.profile.unavailable')}
        </Text>
      </View>
    );
  }

  const isSelf = profile.relationshipStatus === 'SELF';
  const isFriend = profile.relationshipStatus === 'FRIENDS';
  const hasPhoto = hasValidPhoto(profile.photoURL);

  const sheetOptions: ActionSheetOption[] = [
    ...(!isSelf && isFriend
      ? [{ key: 'challenge', label: theme.i18n.t('friends.actions.challenge'), icon: 'sword-cross' as const, onPress: handleChallenge }]
      : []),
    ...(isFriend
      ? [{ key: 'remove', label: theme.i18n.t('friends.actions.removeFriend'), icon: 'account-remove' as const, destructive: true, onPress: handleRemoveFriend }]
      : []),
    ...(!isSelf ? [{ key: 'report', label: theme.i18n.t('friends.actions.reportUser'), icon: 'flag-outline' as const, destructive: true, onPress: () => Alert.alert(theme.i18n.t('friends.alerts.reportedTitle'), theme.i18n.t('friends.alerts.reportedBody')) }] : []),
  ];

  const stats = [
    {
      label: theme.i18n.t('common.level'),
      value: String(profile.currentLevel),
      color: '#F59E0B',
      icon: 'star',
    },
    {
      label: theme.i18n.t('common.quizzes'),
      value: String(profile.quizzesCompleted ?? 0),
      color: '#3B82F6',
      icon: 'lightning-bolt',
    },
    {
      label: theme.i18n.t('common.streak'),
      value: String(profile.currentStreak),
      color: '#EF4444',
      icon: 'fire',
    },
    {
      label: theme.i18n.t('common.accuracy'),
      value: `${profile.totalQuestions
        ? Math.floor((profile.totalCorrect / profile.totalQuestions) * 1000) / 10
        : 0
      }%`,
      color: '#22C55E',
      icon: 'bullseye',
    },
  ];

  const overlayBg = 'rgba(0,0,0,0.92)';
  const overlayCloseBtnBg = 'rgba(255,255,255,0.15)';
  const headerBtnBg = theme.isDark ? theme.color.card : theme.color.textMuted + '33';
  const headerBtnShadow = theme.isDark ? '0 6px 14px rgba(0,0,0,0.2)' : '0 6px 14px rgba(0,0,0,0.05)';
  const headerIconColor = theme.isDark ? theme.color.textPrimary : theme.color.textInverse;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 75 }}
      style={{ flex: 1, backgroundColor: theme.color.background }}
    >
      {/* Full Screen Photo Modal */}
      {hasPhoto && (
        <Modal
          visible={photoModalVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setPhotoModalVisible(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: overlayBg, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => setPhotoModalVisible(false)}
          >
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: theme.space.xxl,
                right: theme.space.md,
                width: theme.space.xl + theme.space.xs,
                height: theme.space.xl + theme.space.xs,
                borderRadius: theme.borderRadius.full,
                backgroundColor: overlayCloseBtnBg,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
              onPress={() => setPhotoModalVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={theme.fontSize.lg} color={theme.color.textInverse} />
            </TouchableOpacity>

            <Pressable onPress={() => {}}>
              <Image
                source={{ uri: profile.photoURL! }}
                style={{
                  width: theme.space.xxl * 7,
                  height: theme.space.xxl * 7,
                  borderRadius: theme.borderRadius.xl,
                }}
                resizeMode="contain"
              />
            </Pressable>

            <View style={{ position: 'absolute', bottom: theme.space.xxl + theme.space.md, alignItems: 'center' }}>
              <Text
                style={{
                  color: theme.color.textInverse,
                  fontSize: theme.fontSize.lg,
                  fontFamily: theme.fontFamily.bold,
                  letterSpacing: 0.3,
                }}
              >
                {profile.displayName}
              </Text>
            </View>
          </Pressable>
        </Modal>
      )}

      <View style={{ position: 'relative' }}>
        <View
          style={{
            paddingVertical: theme.space.xxl,
            backgroundColor: theme.isDark ? theme.color.card : theme.color.accent,
          }}
        />

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: theme.space.md + 4,
            left: theme.space.md + 4,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.sm + 4,
            paddingHorizontal: theme.space.sm + 4,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg + 2,
            backgroundColor: headerBtnBg,
            boxShadow: headerBtnShadow,
          }}
        >
          <Feather name="chevron-left" size={theme.space.md + 2} color={headerIconColor} />
        </TouchableOpacity>

        {!isSelf && (
          <TouchableOpacity
            onPress={() => setSheetVisible(true)}
            style={{
              position: 'absolute',
              top: theme.space.md + 4,
              right: theme.space.md + 4,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.sm + 4,
              paddingHorizontal: theme.space.sm + 4,
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.lg + 2,
              backgroundColor: headerBtnBg,
              boxShadow: headerBtnShadow,
            }}
          >
            <MaterialCommunityIcons name="dots-horizontal" size={theme.space.md + 2} color={headerIconColor} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={hasPhoto ? 0.85 : 1}
          onPress={() => hasPhoto && setPhotoModalVisible(true)}
          style={{
            position: 'absolute',
            bottom: -48,
            alignSelf: 'center',
            width: theme.space.xxl + 64,
            height: theme.space.xxl + 64,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderWidth: 4,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.full,
            backgroundColor: hasPhoto ? theme.color.card : theme.color.premium + 'FF',
            boxShadow: headerBtnShadow,
          }}
        >
          {hasPhoto ? (
            <Image source={{ uri: profile.photoURL! }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Text
              style={{
                lineHeight: 82,
                textAlign: 'center',
                includeFontPadding: false,
                color: headerIconColor,
                fontSize: theme.fontSize.xxl + 20,
                fontWeight: theme.fontWeight.bold,
              }}
            >
              {profile.displayName?.charAt(0)?.toUpperCase()}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ gap: theme.space.xs * 1.5, alignItems: 'center', marginTop: theme.space.xxl }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg + 2,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {profile.displayName}
        </Text>

        <View style={{ gap: theme.space.sm, flexDirection: 'row' }}>
          <Pill
            theme={theme}
            style={{ borderWidth: 1, borderColor: theme.color.border, backgroundColor: theme.color.card }}
          >
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.xs * 1.2, fontFamily: theme.fontFamily.bold }}>
              {profile.studyLevel}
            </Text>
          </Pill>

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
            <MaterialCommunityIcons name="star" size={theme.space.md} color={theme.color.warning} />
            <Text
              style={{
                color: theme.color.warning,
                fontSize: theme.fontSize.xs * 1.15,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.number,
              }}
            >
              {theme.i18n.t('profile.level', { level: profile.currentLevel })}
            </Text>
          </Pill>
        </View>

        {profile.specialties?.length > 0 && <ProfilePillRow items={profile.specialties} variant="accent" />}

        <View
          style={{
            flexWrap: 'wrap',
            gap: theme.space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconLabel theme={theme} icon="target" color={theme.color.textSecondary} text={profile.targetExam} />
          <IconLabel theme={theme} icon="flash-outline" color={theme.color.textMuted} text={`${profile.epPoints} ${theme.i18n.t('common.ep')}`} />
          <IconLabel
            theme={theme}
            icon="lightning-bolt"
            color={theme.color.info}
            bold
            text={theme.i18n.t('profile.xpPoints', { points: profile.xpPoints })}
          />
        </View>

        {!isSelf && !isFriend && (
          <View style={{ flexDirection: 'row', gap: theme.space.sm, marginTop: theme.space.sm }}>
            {profile.relationshipStatus === 'NONE' && (
              <TouchableOpacity
                disabled={actionBusy}
                onPress={handleAddFriend}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  paddingVertical: theme.space.sm, paddingHorizontal: theme.space.lg,
                  borderRadius: theme.borderRadius.full, backgroundColor: theme.color.success,
                  opacity: actionBusy ? 0.6 : 1,
                }}
              >
                {actionBusy ? <Loading size={22} style={{ padding: 0 }} /> : <MaterialCommunityIcons name="account-plus" size={16} color={theme.color.textInverse} />}
                <Text style={{ color: theme.color.textInverse, fontFamily: theme.fontFamily.bold, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.sm }}>{theme.i18n.t('friends.actions.addFriend')}</Text>
              </TouchableOpacity>
            )}

            {profile.relationshipStatus === 'REQUEST_SENT' && (
              <View style={{ paddingVertical: theme.space.sm, paddingHorizontal: theme.space.lg, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.color.border }}>
                <Text style={{ color: theme.color.textMuted, fontFamily: theme.fontFamily.bold, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.sm }}>{theme.i18n.t('friends.status.requested')}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={{ marginTop: theme.space.md, paddingHorizontal: theme.space.md }}>
        <ProfileScreenStatsCard stats={stats} />
      </View>

      {profile.relationshipStatus === 'FRIENDS' && profile.headToHead && (
        <View style={{ marginTop: theme.space.sm * 1.5, paddingHorizontal: theme.space.md }}>
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
              padding: theme.space.md, borderRadius: theme.borderRadius.lg,
              borderWidth: 1.5, borderColor: theme.color.border, backgroundColor: theme.color.card,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: theme.color.success, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.number }}>
                {profile.headToHead.wins}
              </Text>
              <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>{theme.i18n.t('friends.profile.wins')}</Text>
            </View>
            <View style={{ width: 1, height: 32, backgroundColor: theme.color.border }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: theme.color.error, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.number }}>
                {profile.headToHead.losses}
              </Text>
              <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>{theme.i18n.t('friends.profile.losses')}</Text>
            </View>
            <View style={{ width: 1, height: 32, backgroundColor: theme.color.border }} />
            <TouchableOpacity onPress={handleChallenge} activeOpacity={0.7} style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="sword-cross" size={theme.fontSize.xl} color={theme.color.accent} />
              <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>{theme.i18n.t('friends.actions.challenge')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ marginTop: theme.space.sm * 1.5, paddingHorizontal: theme.space.md }}>
        <FriendsRow
          friends={profile.friends}
          title={theme.i18n.t('friends.profile.friendsOf', { name: profile.displayName })}
          onViewAll={handleViewAllFriends}
          onFriendPress={handleFriendPress}
        />
      </View>

      <View style={{ marginTop: theme.space.sm * 1.5, paddingHorizontal: theme.space.md }}>
        <ProfileEarnedBadge
          achievements={profile.badges.map((badgeId) => ({ badgeId }))}
          title={theme.i18n.t('friends.profile.badges')}
          onViewAllPress={() => router.push('/achievements')}
          onBadgePress={() => router.push('/achievements')}
        />
      </View>

      <ActionSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title={profile.displayName} options={sheetOptions} />
    </ScrollView>
  );
}
