import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { hasValidPhoto } from '../../common/utils/imageUrl';
import { useBottomBar } from '../../common/context/useBottomBar';
import { EarnedBadgeCard } from '../../components/EarnedBadgeCard';
import { ProfilePillRow } from '../../components/profile/ProfilePillRow';
import { ProfileScreenStatsCard } from '../../components/ProfileScreenStatsCard';
import { ActionSheet, ActionSheetOption } from '../../components/friends/Actionsheet';
import type { PublicProfile, FriendRelationshipStatus } from '../../common/types/types';


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
        Alert.alert('Could not load profile', err?.message ?? 'Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadProfile]);

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
      Alert.alert('Could not send request', err?.message ?? 'Please try again.');
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
      Alert.alert('Could not remove friend', err?.message ?? 'Please try again.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleChallenge = () => {
    // Swap this for router.push(`/challenge/${uid}`) once that route exists.
    Alert.alert('Challenge', 'Challenge flow coming soon!');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.color.accent} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background, alignItems: 'center', justifyContent: 'center', padding: theme.space.lg }}>
        <MaterialCommunityIcons name="account-off-outline" size={40} color={theme.color.textMuted} />
        <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.md, fontFamily: theme.fontFamily.regular, marginTop: theme.space.sm }}>
          This profile isn't available right now.
        </Text>
      </View>
    );
  }

  const isSelf = profile.relationshipStatus === 'SELF';
  const hasPhoto = hasValidPhoto(profile.photoURL);

  const sheetOptions: ActionSheetOption[] = [
    ...(!isSelf ? [{ key: 'challenge', label: 'Challenge', icon: 'sword-cross' as const, onPress: handleChallenge }] : []),
    ...(profile.relationshipStatus === 'FRIENDS'
      ? [{ key: 'remove', label: 'Remove Friend', icon: 'account-remove' as const, destructive: true, onPress: handleRemoveFriend }]
      : []),
    ...(!isSelf ? [{ key: 'report', label: 'Report User', icon: 'flag-outline' as const, destructive: true, onPress: () => Alert.alert('Reported', 'Thanks — our team will review this.') }] : []),
  ];

  // Covers currentLevel, xpPoints, currentStreak, longestStreak — everything not already
  // shown in the pill/icon row above.
  const stats = [
    { label: theme.i18n.t('common.level'), value: String(profile.currentLevel), color: theme.color.accent, icon: 'star' },
    { label: 'XP Points', value: String(profile.xpPoints), color: theme.color.info, icon: 'lightning-bolt' },
    { label: theme.i18n.t('common.streak'), value: String(profile.currentStreak), color: theme.color.error, icon: 'fire' },
    { label: 'Best Streak', value: String(profile.longestStreak), color: theme.color.warning, icon: 'trophy-outline' },
  ];

  // Same overlay/shadow tokens used in ProfileScreenHeader, so the photo viewer and header
  // buttons feel identical whether opened from your own profile or a friend's.
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
      {/* Full Screen Photo Modal — matches ProfileScreenHeader's viewer exactly */}
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

      {/* Header — banner + overlapping avatar, mirroring ProfileScreenHeader */}
      <View style={{ position: 'relative' }}>
        <View
          style={{
            paddingVertical: theme.space.xxl,
            backgroundColor: theme.isDark ? theme.color.card : theme.color.accent,
          }}
        />

        {/* Back button — same slot/style as the edit button on your own profile */}
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

        {/* More button — same slot/style as the settings button on your own profile */}
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

        {/* Avatar — overlaps the banner, tap opens the full-screen viewer */}
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
            backgroundColor: theme.color.premium + 'FF',
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

      {/* Name, pills, specialties, and the icon-label row — same structure as your own profile */}
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
          <IconLabel theme={theme} icon="star-circle" color={theme.color.textMuted} text={`${profile.epPoints} EP`} />
          <IconLabel
            theme={theme}
            icon="lightning-bolt"
            color={theme.color.info}
            bold
            text={theme.i18n.t('profile.xpPoints', { points: profile.xpPoints })}
          />
        </View>

        {!isSelf && (
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
                {actionBusy ? <ActivityIndicator size="small" color={theme.color.textInverse} /> : <MaterialCommunityIcons name="account-plus" size={16} color={theme.color.textInverse} />}
                <Text style={{ color: theme.color.textInverse, fontFamily: theme.fontFamily.bold, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.sm }}>Add Friend</Text>
              </TouchableOpacity>
            )}

            {profile.relationshipStatus === 'REQUEST_SENT' && (
              <View style={{ paddingVertical: theme.space.sm, paddingHorizontal: theme.space.lg, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.color.border }}>
                <Text style={{ color: theme.color.textMuted, fontFamily: theme.fontFamily.bold, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.sm }}>Requested</Text>
              </View>
            )}

            {profile.relationshipStatus === 'FRIENDS' && (
              <View
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  paddingVertical: theme.space.sm, paddingHorizontal: theme.space.lg,
                  borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.color.success,
                }}
              >
                <MaterialCommunityIcons name="account-check" size={16} color={theme.color.success} />
                <Text style={{ color: theme.color.success, fontFamily: theme.fontFamily.bold, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.sm }}>Friends</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleChallenge}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingVertical: theme.space.sm, paddingHorizontal: theme.space.lg,
                borderRadius: theme.borderRadius.full, backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.border,
              }}
            >
              <MaterialCommunityIcons name="sword-cross" size={16} color={theme.color.textPrimary} />
              <Text style={{ color: theme.color.textPrimary, fontFamily: theme.fontFamily.bold, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.sm }}>Challenge</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats — Level, XP, current streak, longest streak */}
      <View style={{ marginTop: theme.space.md, paddingHorizontal: theme.space.md }}>
        <ProfileScreenStatsCard stats={stats} />
      </View>

      {/* Head to head, only visible between friends */}
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
              <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>Wins</Text>
            </View>
            <View style={{ width: 1, height: 32, backgroundColor: theme.color.border }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: theme.color.error, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.number }}>
                {profile.headToHead.losses}
              </Text>
              <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>Losses</Text>
            </View>
          </View>
        </View>
      )}

      {/* Earned badges — reusing the existing component as-is */}
      <View style={{ marginTop: theme.space.sm * 1.5, paddingHorizontal: theme.space.md }}>
        <EarnedBadgeCard
          achievements={profile.badges.map((badgeId) => ({ badgeId }))}
          title="Earned Badges"
          onViewAllPress={() => router.push('/achievements')}
          onBadgePress={() => router.push('/achievements')}
        />
      </View>

      <ActionSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title={profile.displayName} options={sheetOptions} />
    </ScrollView>
  );
}
