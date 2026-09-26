import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, FlatList, Alert } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import { ScreenHeader } from '../../components/common/ScreenHeader';
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
    Alert.alert(theme.i18n.t('friends.actions.challenge'), theme.i18n.t('friends.alerts.challengeSoon'));
  };

  const handleAddFriend = async (targetUid: string) => {
    setBusyUid(targetUid);
    try {
      await api.friends.sendFriendRequest(targetUid);
      // ✅ FIXED: Was using hardcoded strings, now uses i18n keys
      Alert.alert(
        theme.i18n.t('friends.alerts.requestSentTitle'),
        theme.i18n.t('friends.alerts.requestSentBody'),
      );
    } catch (err: any) {
      Alert.alert(theme.i18n.t('friends.alerts.sendRequestFailed'), err?.message ?? theme.i18n.t('friends.alerts.tryAgain'));
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
      Alert.alert(theme.i18n.t('friends.alerts.removeFriendFailed'), err?.message ?? theme.i18n.t('friends.alerts.tryAgain'));
    } finally {
      setBusyUid(null);
    }
  };

  const handleReport = (_targetUid: string) => {
    Alert.alert(
      theme.i18n.t('friends.alerts.reportTitle'),
      theme.i18n.t('friends.alerts.reportUserBody'),
    );
  };

  const sheetOptions: ActionSheetOption[] = useMemo(() => {
    if (!sheetTarget) return [];

    // Case 1: Agar list me meri apni ID hai
    if (sheetTarget.isMe) {
      return [
        {
          key: 'profile',
          label: theme.i18n.t('friends.actions.viewProfile'),
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
          label: theme.i18n.t('friends.actions.challenge'),
          icon: 'sword-cross',
          onPress: () => handleChallenge(sheetTarget.uid),
        },
        {
          key: 'profile',
          label: theme.i18n.t('friends.actions.viewProfile'),
          icon: 'account-circle-outline',
          onPress: () => goToProfile(sheetTarget.uid),
        },
        {
          key: 'remove',
          label: theme.i18n.t('friends.actions.removeFriend'),
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
        label: theme.i18n.t('friends.actions.viewProfile'),
        icon: 'account-circle-outline',
        onPress: () => goToProfile(sheetTarget.uid),
      },
      {
        key: 'add',
        label: theme.i18n.t('friends.actions.addFriend'),
        icon: 'account-plus-outline',
        onPress: () => handleAddFriend(sheetTarget.uid),
      },
      {
        key: 'report',
        // ✅ FIXED: Was 'friends.actions.report', standardized to 'friends.actions.reportUser'
        label: theme.i18n.t('friends.actions.reportUser'),
        icon: 'alert-circle-outline',
        destructive: true,
        onPress: () => handleReport(sheetTarget.uid),
      },
    ];
  }, [sheetTarget, theme]);

  if (friends === null) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background, alignItems: 'center', justifyContent: 'center' }}>
        <Loading />
      </View>
    );
  }
  const titleText = displayName ? theme.i18n.t('friends.list.title', { name: displayName }) : theme.i18n.t('friends.title');
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScreenHeader
        title={titleText}
        subtitle={friends.length === 1 ? theme.i18n.t('friends.list.totalOne') : theme.i18n.t('friends.list.totalMany', { count: friends.length })}
        onBack={handleBackPress}
        containerStyle={{
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.sm,
        }}
      />

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={{
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.xs,
          paddingBottom: theme.space.xxl,
        }}
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
              {theme.i18n.t('friends.empty.noFriendsToShow')}
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