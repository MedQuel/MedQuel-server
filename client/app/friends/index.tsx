import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, SectionList, Text, View } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { CustomSearchBar } from '../../components/CustomSearchBar';
import { FriendListItem } from '../../components/friends/FriendListItem';
import { QuickActionList } from '../../components/friends/QuickActionRow';
import { SearchResultItem } from '../../components/friends/SearchResultItem';
import { FriendRequestItem } from '../../components/friends/FriendRequestItem';
import { ActionSheet, ActionSheetOption } from '../../components/friends/Actionsheet';
import type { FriendRequest, FriendSummary, UserSearchResult } from '../../common/types/types';


const DEBOUNCE_MS = 350;
const SEARCH_MIN_LENGTH = 2;

type SectionItem =
  | { type: 'friend'; data: FriendSummary }
  | { type: 'search'; data: UserSearchResult }
  | { type: 'request'; data: FriendRequest & { displayName: string; photoURL?: string | null } };


export default function FriendsScreen() {
  const [myUid, setMyUid] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [pendingRequests, setPendingRequests] = useState<(FriendRequest & { displayName: string; photoURL?: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [sheetTarget, setSheetTarget] = useState<{ uid: string; displayName: string; status: string } | null>(null);
  
  const [focusTrigger] = useState(0);

  const router = useRouter();
  const { theme } = useTheme();
  useBottomBar(true, 'friends');

  const loadAll = useCallback(async () => {
    const [me, friendsList, pending] = await Promise.all([
      api.user.getMe(),
      api.friends.getFriends(),
      api.friends.getPendingFriendRequests(),
    ]);
    setMyUid(me.uid);
    setFriends(friendsList);

    const enriched = await Promise.all(
      pending
        .filter((r) => r.status === 'pending')
        .map(async (r) => {
          try {
            const profile = await api.friends.getUserProfile(r.fromUid);
            return { ...r, displayName: profile.displayName, photoURL: profile.photoURL };
          } catch {
            return { ...r, displayName: 'Unknown', photoURL: null };
          }
        })
    );
    setPendingRequests(enriched);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadAll();
      } catch {
        Alert.alert('Could not load friends', 'Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  }, [loadAll]);

  // Debounced live search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < SEARCH_MIN_LENGTH) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const results = await api.friends.searchUsers(trimmed);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [query]);

  const isSearchMode = query.trim().length >= SEARCH_MIN_LENGTH;

  const filteredFriends = useMemo(() => {
    if (!isSearchMode) return friends;
    const lower = query.trim().toLowerCase();
    return friends.filter((f) => f.displayName.toLowerCase().includes(lower));
  }, [friends, isSearchMode, query]);

  const sections = useMemo(() => {
    if (isSearchMode) {
      const list: { title: string; data: SectionItem[] }[] = [];
      if (filteredFriends.length) {
        list.push({ title: `Friends (${filteredFriends.length})`, data: filteredFriends.map((f) => ({ type: 'friend' as const, data: f })) });
      }
      list.push({ title: 'Suggestions', data: searchResults.map((r) => ({ type: 'search' as const, data: r })) });
      return list;
    }

    const list: { title: string; data: SectionItem[] }[] = [];
    if (pendingRequests.length) {
      list.push({ title: `Friend Requests (${pendingRequests.length})`, data: pendingRequests.map((r) => ({ type: 'request' as const, data: r })) });
    }
    list.push({ title: `Your Friends (${friends.length})`, data: friends.map((f) => ({ type: 'friend' as const, data: f })) });
    return list;
  }, [isSearchMode, filteredFriends, searchResults, pendingRequests, friends]);

    const goToProfile = (uid: string) => {
    if (uid === myUid) return;
    router.push({
      pathname: '/friends/UserProfileScreen',
      params: { uid },
    });
  };

  const handleChallenge = (_uid: string) => {
    Alert.alert('Challenge', 'Challenge flow coming soon!');
  };

  const handleAddFriend = async (uid: string) => {
    setBusyUid(uid);
    try {
      await api.friends.sendFriendRequest(uid);
      setSearchResults((prev) => prev.map((r) => (r.uid === uid ? { ...r, relationshipStatus: 'REQUEST_SENT' } : r)));
    } catch (err: any) {
      Alert.alert('Could not send request', err?.message ?? 'Please try again.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    setBusyUid(requestId);
    try {
      await api.friends.respondFriendRequest(requestId, accept);
      await loadAll();
    } catch (err: any) {
      Alert.alert('Something went wrong', err?.message ?? 'Please try again.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleRemoveFriend = async (uid: string) => {
    setBusyUid(uid);
    try {
      await api.friends.removeFriend(uid);
      setFriends((prev) => prev.filter((f) => f.uid !== uid));
    } catch (err: any) {
      Alert.alert('Could not remove friend', err?.message ?? 'Please try again.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleShareFriendLink = async () => {
    if (!myUid) return;
    try {
      const { Share } = await import('react-native');
      await Share.share({
        message: `Add me on MedQuel and let's grind together! https://medquel.app/add-friend/${myUid}`,
      });
    } catch {
      // user dismissed
    }
  };

  const handleEmailInvite = () => {
    const link = myUid ? `https://medquel.app/add-friend/${myUid}` : 'https://medquel.app';
    const subject = encodeURIComponent('Join me on MedQuel');
    const body = encodeURIComponent(`Hey! I'm prepping on MedQuel — join me here: ${link}`);
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`).catch(() =>
      Alert.alert('No email app found', 'Please set up an email app to send invites.')
    );
  };

  const handleCreateChallengeLink = () => {
    Alert.alert('Coming soon', 'Challenge links will be available in a future update.');
  };
  const quickActions = [
    { key: 'link', label: 'Friend Link', icon: 'link-variant' as const, iconBg: theme.color.accent, onPress: handleShareFriendLink },
    { key: 'email', label: 'Send Email Invite', icon: 'email-outline' as const, iconBg: theme.color.success, onPress: handleEmailInvite },
    { key: 'challenge', label: 'Create Challenge Link', icon: 'sword-cross' as const, iconBg: theme.color.premium, onPress: handleCreateChallengeLink },
  ];

  const sheetOptions: ActionSheetOption[] = sheetTarget
    ? [
        { key: 'challenge', label: 'Challenge', icon: 'sword-cross', onPress: () => handleChallenge(sheetTarget.uid) },
        { key: 'profile', label: 'View Profile', icon: 'account-circle-outline', onPress: () => goToProfile(sheetTarget.uid) },
        ...(sheetTarget.status === 'FRIENDS'
          ? [{ key: 'remove', label: 'Remove Friend', icon: 'account-remove' as const, destructive: true, onPress: () => handleRemoveFriend(sheetTarget.uid) }]
          : []),
      ]
    : [];

  const renderItem = ({ item }: { item: SectionItem }) => {
    if (item.type === 'friend') {
      return (
        <FriendListItem
          friend={item.data}
          onPress={() => goToProfile(item.data.uid)}
          onMorePress={() => setSheetTarget({ uid: item.data.uid, displayName: item.data.displayName, status: 'FRIENDS' })}
        />
      );
    }
    if (item.type === 'search') {
      return (
        <SearchResultItem
          user={item.data}
          busy={busyUid === item.data.uid}
          onPress={() => goToProfile(item.data.uid)}
          onAddFriend={() => handleAddFriend(item.data.uid)}
          onMorePress={() => setSheetTarget({ uid: item.data.uid, displayName: item.data.displayName, status: item.data.relationshipStatus })}
        />
      );
    }
    return (
      <FriendRequestItem
        displayName={item.data.displayName}
        photoURL={item.data.photoURL}
        busy={busyUid === item.data.requestId}
        onPress={() => goToProfile(item.data.fromUid)}
        onAccept={() => handleRespond(item.data.requestId, true)}
        onDecline={() => handleRespond(item.data.requestId, false)}
      />
    );
  };

  const listHeader = (
    <View style={{ marginBottom: theme.space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm, marginBottom: theme.space.lg }}>
        <MaterialCommunityIcons name="account-group" size={26} color={theme.color.accent} />
        <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.bold }}>
          Friends
        </Text>
      </View>

      <QuickActionList actions={quickActions} />

      <View style={{ marginTop: theme.space.lg }}>
        <CustomSearchBar
          key={focusTrigger}
          value={query}
          onChange={setQuery}
          onSubmit={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search friends or find new people"
          autoFocus={focusTrigger > 0}
          loading={searching}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.color.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) =>
          item.type === 'friend' ? `friend-${item.data.uid}` :
          item.type === 'search' ? `search-${item.data.uid}` :
          `req-${item.data.requestId}-${index}`
        }
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
              backgroundColor: theme.color.background,
              paddingTop: theme.space.md,
              paddingBottom: theme.space.xs,
            }}
          >
            {section.title}
          </Text>
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !searching ? (
            <View style={{ alignItems: 'center', paddingVertical: theme.space.xl }}>
              <MaterialCommunityIcons name="account-search-outline" size={36} color={theme.color.textMuted} />
              <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular, marginTop: theme.space.sm }}>
                {isSearchMode ? 'No results found.' : 'No friends yet — try Find Friends above!'}
              </Text>
            </View>
          ) : null
        }
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: theme.space.md,
          paddingBottom: theme.space.xxl,
          paddingTop: Platform.OS === 'ios' ? theme.space.lg : theme.space.md,
        }}
        keyboardShouldPersistTaps="handled"
        refreshing={refreshing}
        onRefresh={onRefresh}
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
