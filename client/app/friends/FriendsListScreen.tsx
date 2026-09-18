import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { FriendListItem } from '../../components/friends/FriendListItem';
import { ActionSheet, ActionSheetOption } from '../../components/friends/Actionsheet';
import type { FriendSummary } from '../../common/types/types';

export default function FriendsListScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { uid, displayName } = useLocalSearchParams<{ uid: string; displayName: string }>();

  const [myUid, setMyUid] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendSummary[] | null>(null);
  const [myFriendUids, setMyFriendUids] = useState<Set<string>>(new Set());
  const [busyUid, setBusyUid] = useState<string | null>(null);

  const [sheetTarget, setSheetTarget] = useState<{
    uid: string;
    displayName: string;
    isMutual: boolean;
    isMe: boolean;
  } | null>(null);

  const load = useCallback(async () => {
    if (!uid) return;
    const [me, profile, myFriends] = await Promise.all([
      api.user.getMe(),
      api.friends.getUserProfile(uid),
      api.friends.getFriends(),
    ]);
    setMyUid(me.uid);
    setMyFriendUids(new Set(myFriends.map((f) => f.uid)));
    setFriends(profile.friends);
  }, [uid]);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = friends
    ? [
        ...friends.filter((f) => myFriendUids.has(f.uid)),
        ...friends.filter((f) => !myFriendUids.has(f.uid)),
      ]
    : [];

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  const goToProfile = (targetUid: string) => {
    router.push({
      pathname: '/friends/UserProfileScreen',
      params: { uid: targetUid },
    } as any);
  };

  const handleChallenge = (_targetUid: string) => {
    Alert.alert('Challenge', 'Challenge flow coming soon!');
  };
  const handleAddFriend = async (targetUid: string) => {
    setBusyUid(targetUid);
    try {
      await api.friends.sendFriendRequest(targetUid);
      Alert.alert('Success', 'Friend request sent!');
    } catch (err: any) {
      Alert.alert('Could not send request', err?.message ?? 'Please try again.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleRemoveFriend = async (targetUid: string) => {
    setBusyUid(targetUid);
    try {
      await api.friends.removeFriend(targetUid);
      setMyFriendUids((prev) => {
        const next = new Set(prev);
        next.delete(targetUid);
        return next;
      });
      setFriends((prev) => prev?.filter((f) => f.uid !== targetUid) ?? null);
    } catch (err: any) {
      Alert.alert('Could not remove friend', err?.message ?? 'Please try again.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleReport = (_targetUid: string) => {
    Alert.alert('Report User', 'User report submitted for review.');
  };

  const sheetOptions: ActionSheetOption[] = useMemo(() => {
    if (!sheetTarget) return [];

    // Case 1: Agar list me meri apni ID hai
    if (sheetTarget.isMe) {
      return [
        {
          key: 'profile',
          label: 'View Profile',
          icon: 'account-circle-outline',
          onPress: () => goToProfile(sheetTarget.uid),
        },
      ];
    }
    // Case 2: Agar Mutual Friend hai
    if (sheetTarget.isMutual) {
      return [
        {
          key: 'challenge',
          label: 'Challenge',
          icon: 'sword-cross',
          onPress: () => handleChallenge(sheetTarget.uid),
        },
        {
          key: 'profile',
          label: 'View Profile',
          icon: 'account-circle-outline',
          onPress: () => goToProfile(sheetTarget.uid),
        },
        {
          key: 'remove',
          label: 'Remove Friend',
          icon: 'account-remove',
          destructive: true,
          onPress: () => handleRemoveFriend(sheetTarget.uid),
        },
      ];
    }
    // Case 3: Agar Friend nahi hai
    return [
      {
        key: 'profile',
        label: 'View Profile',
        icon: 'account-circle-outline',
        onPress: () => goToProfile(sheetTarget.uid),
      },
      {
        key: 'add',
        label: 'Add Friend',
        icon: 'account-plus-outline',
        onPress: () => handleAddFriend(sheetTarget.uid),
      },
      {
        key: 'report',
        label: 'Report',
        icon: 'alert-circle-outline',
        destructive: true,
        onPress: () => handleReport(sheetTarget.uid),
      },
    ];
  }, [sheetTarget]);

  if (friends === null) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.color.accent} />
      </View>
    );
  }
  const titleText = displayName ? `${displayName}'s Friends` : 'Friends';
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={{
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.xs,
          paddingBottom: theme.space.xxl,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: theme.space.md }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.sm,
                paddingTop: theme.space.xs,
                paddingBottom: theme.space.xs,
                marginBottom: theme.space.xs,
              }}
            >
              <TouchableOpacity
                onPress={handleBackPress}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: theme.space.xs * 1.75,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: theme.color.card,
                }}
              >
                <Feather name="chevron-left" size={theme.fontSize.xl} color={theme.color.textPrimary} />
              </TouchableOpacity>

              <View style={{ flexDirection: 'column', gap: theme.space.xs * 0.5, flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.lg * 1.1,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {titleText}
                </Text>
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.sm * 1.05,
                    fontFamily: theme.fontFamily.light,
                  }}
                >
                  {friends.length} {friends.length === 1 ? 'friend' : 'friends'} total
                </Text>
              </View>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: 1,
              backgroundColor: theme.color.border,
              marginLeft: 48 + theme.space.sm,
            }}
          />
        )}
        renderItem={({ item }) => {
          const isMe = item.uid === myUid;
          const isMutual = myFriendUids.has(item.uid);

          return (
            <FriendListItem
              friend={item}
              isMutual={!isMe && isMutual}
              busy={busyUid === item.uid}
              onPress={() => goToProfile(item.uid)}
              onMorePress={() =>
                setSheetTarget({
                  uid: item.uid,
                  displayName: item.displayName,
                  isMutual,
                  isMe,
                })
              }
            />
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: theme.space.xl }}>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.md,
                color: theme.color.textMuted,
              }}
            >
              No friends to show yet.
            </Text>
          </View>
        }
      />
      <ActionSheet
        visible={!!sheetTarget}
        onClose={() => setSheetTarget(null)}
        title={sheetTarget?.displayName}
        options={sheetOptions}
      />
    </View>
  );
}