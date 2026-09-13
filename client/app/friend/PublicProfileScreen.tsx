import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { Avatar } from '../../components/Avatar';
import { ActionSheet, ActionSheetOption } from '../../components/Actionsheet';
import { ComparisonChips } from '../../components/ComparisonChips';
import { EarnedBadgeCard } from '../../components/EarnedBadgeCard';
import { ProfileScreenStatsCard } from '../../components/ProfileScreenStatsCard';
import { useBottomBar } from '../../common/context/useBottomBar';
import type { PublicProfile, FriendRelationshipStatus } from '../../common/types/types';

export default function PublicProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { uid } = useLocalSearchParams<{ uid: string }>();

  useBottomBar(false, 'publicProfile');

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

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

  const sheetOptions: ActionSheetOption[] = [
    ...(!isSelf ? [{ key: 'challenge', label: 'Challenge', icon: 'sword-cross' as const, onPress: handleChallenge }] : []),
    ...(profile.relationshipStatus === 'FRIENDS'
      ? [{ key: 'remove', label: 'Remove Friend', icon: 'account-remove' as const, destructive: true, onPress: handleRemoveFriend }]
      : []),
    ...(!isSelf ? [{ key: 'report', label: 'Report User', icon: 'flag-outline' as const, destructive: true, onPress: () => Alert.alert('Reported', 'Thanks — our team will review this.') }] : []),
  ];

  const stats = [
    { label: 'Level', value: String(profile.currentLevel), color: theme.color.accent, icon: 'shield-star' },
    { label: 'EP Points', value: String(profile.epPoints), color: theme.color.info, icon: 'star-circle' },
    { label: 'Day Streak', value: String(profile.currentStreak), color: theme.color.warning, icon: 'fire' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      {/* Top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.space.md, paddingTop: theme.space.lg, paddingBottom: theme.space.sm }}>
        <TouchableOpacity 
  onPress={() => router.back()} 
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  style={{
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <Feather name="chevron-left" size={22} color={theme.color.textPrimary} />
</TouchableOpacity>
        <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.bold }}>
          Profile
        </Text>
        {!isSelf ? (
          <TouchableOpacity onPress={() => setSheetVisible(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color={theme.color.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space.md, paddingBottom: theme.space.xxl, gap: theme.space.lg }}>
        {/* Header card */}
        <View style={{ alignItems: 'center', paddingVertical: theme.space.lg }}>
          <Avatar uri={profile.photoURL} name={profile.displayName} size={96} ringColor={theme.color.accent} />

          <Text style={{ marginTop: theme.space.md, color: theme.color.textPrimary, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.bold }}>
            {profile.displayName}
          </Text>
          <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular, marginTop: 2 }}>
            {profile.targetExam} • {profile.studyLevel}
          </Text>

          {!isSelf && (
            <View style={{ marginTop: theme.space.sm }}>
              <ComparisonChips comparison={profile.comparison} />
            </View>
          )}

          {!isSelf && (
            <View style={{ flexDirection: 'row', gap: theme.space.sm, marginTop: theme.space.lg }}>
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

        {/* Stats */}
        <ProfileScreenStatsCard stats={stats} />

        {/* Head to head, only visible between friends */}
        {profile.relationshipStatus === 'FRIENDS' && profile.headToHead && (
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
        )}

        {/* Earned badges — reusing the existing component as-is */}
        <EarnedBadgeCard achievements={profile.badges.map((badgeId) => ({ badgeId }))} title="Earned Badges" />
      </ScrollView>

      <ActionSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title={profile.displayName} options={sheetOptions} />
    </View>
  );
}