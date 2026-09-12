import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CustomSearchBar } from '../../components/CustomSearchBar';
import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import type { UserSearchResult } from '../../common/types/types';
import { UserProfileData, UserProfileScreen } from './UserProfileScreen';

type TabType = 'my_friends' | 'requests' | 'search';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Dynamic Theme-Aware User Avatar Component
const UserAvatar = ({ photoURL, theme }: { photoURL?: string | null; theme: any }) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [photoURL]);

  const isValidUrl = Boolean(photoURL && photoURL.trim().length > 0 && !imageError);

  const borderColor = theme?.color?.border || 'rgba(255, 255, 255, 0.08)';
  const accentColor = theme?.color?.accent || '#38BDF8';
  const fallbackBg = `${accentColor}20`;

  return (
    <View style={[styles.avatarWrapper, { backgroundColor: borderColor }]}>
      {isValidUrl ? (
        <Image
          source={{ uri: photoURL as string }}
          style={styles.avatar}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      ) : (
        <View style={[styles.avatar, styles.fallbackAvatar, { backgroundColor: fallbackBg }]}>
          <MaterialCommunityIcons name="account" size={26} color={accentColor} />
        </View>
      )}

      {imageLoading && isValidUrl && (
        <View style={styles.avatarLoader}>
          <ActivityIndicator size="small" color={accentColor} />
        </View>
      )}
    </View>
  );
};

// Context & Type-Safe Action Button Component
const FriendActionButton = ({
  item,
  activeTab,
  isLoading,
  onSendRequest,
  onRemoveFriend,
}: {
  item: UserSearchResult & { displayNameFormatted: string };
  activeTab: TabType;
  isLoading: boolean;
  onSendRequest: (uid: string) => void;
  onRemoveFriend: (uid: string) => void;
}) => {
  // 1. My Friends Tab -> Red "Remove" Button
  if (activeTab === 'my_friends') {
    return (
      <TouchableOpacity
        style={[styles.actionBtn, styles.removeBtn]}
        onPress={() => onRemoveFriend(item.uid)}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#EF4444" />
        ) : (
          <>
            <MaterialCommunityIcons name="account-minus-outline" size={16} color="#EF4444" />
            <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Remove</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Cast relationshipStatus to string to bypass strict type overlap errors
  const statusStr = item.relationshipStatus as string;

  // 2. Already Friends Status
  if (statusStr === 'FRIEND' || statusStr === 'ACCEPTED') {
    return (
      <View style={[styles.actionBtn, styles.alreadyFriendBadge]}>
        <MaterialCommunityIcons name="check" size={16} color="#10B981" />
        <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Friends</Text>
      </View>
    );
  }

  // 3. Request Sent Status
  if (statusStr === 'REQUEST_SENT' || statusStr === 'PENDING') {
    return (
      <View style={[styles.actionBtn, styles.pendingBtn]}>
        <MaterialCommunityIcons name="clock-outline" size={16} color="#94A3B8" />
        <Text style={[styles.actionBtnText, { color: '#94A3B8' }]}>Pending</Text>
      </View>
    );
  }

  // 4. Default -> "Add" Button for Non-Friends
  return (
    <TouchableOpacity
      style={[styles.actionBtn, styles.addBtn]}
      onPress={() => onSendRequest(item.uid)}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <MaterialCommunityIcons name="account-plus-outline" size={16} color="#FFFFFF" />
          <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Add</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// Animated Card Component
const AnimatedUserCard = React.memo(
  ({
    item,
    activeTab,
    isLoading,
    onSendRequest,
    onRemoveFriend,
    onPressCard,
    theme,
  }: {
    item: UserSearchResult & { displayNameFormatted: string };
    activeTab: TabType;
    isLoading: boolean;
    onSendRequest: (uid: string) => void;
    onRemoveFriend: (uid: string) => void;
    onPressCard: (user: UserSearchResult) => void;
    theme: any;
  }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(10)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, slideAnim]);

    return (
      <Animated.View
        style={[
          styles.userCard,
          {
            backgroundColor: '#0A1220',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardClickableArea}
          onPress={() => onPressCard(item)}
          activeOpacity={0.7}
        >
          <UserAvatar photoURL={item.photoURL} theme={theme} />

          <View style={styles.userInfo}>
            <Text
              style={[
                styles.displayName,
                {
                  color: theme?.color?.textPrimary || '#F8FAFC',
                  fontFamily: theme?.fontFamily?.bold || theme?.fontFamily?.regular,
                  fontSize: theme?.fontSize?.sm || 15,
                },
              ]}
              numberOfLines={1}
            >
              {item.displayNameFormatted}
            </Text>

            {item.targetExam ? (
              <View style={styles.examBadgeContainer}>
                <MaterialCommunityIcons name="school-outline" size={13} color="#64748B" />
                <Text
                  style={[
                    styles.targetExam,
                    {
                      color: theme?.color?.textSecondary || '#94A3B8',
                      fontFamily: theme?.fontFamily?.regular,
                      fontSize: theme?.fontSize?.xs || 12,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.targetExam}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.targetExam,
                  {
                    color: '#64748B',
                    fontFamily: theme?.fontFamily?.light || theme?.fontFamily?.regular,
                    fontSize: theme?.fontSize?.xs || 12,
                  },
                ]}
              >
                Student
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <FriendActionButton
          item={item}
          activeTab={activeTab}
          isLoading={isLoading}
          onSendRequest={onSendRequest}
          onRemoveFriend={onRemoveFriend}
        />
      </Animated.View>
    );
  }
);

export const SearchFriendsScreen = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('my_friends');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 350);

  const [rawResults, setRawResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const searchRequestIdRef = useRef(0);

  // Tab switch handler to reset search state and prevent infinite loop
  const handleTabChange = useCallback((newTab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuery('');
    setActiveTab(newTab);
  }, []);

  useEffect(() => {
    if (activeTab === 'search' && !debouncedQuery) {
      setRawResults([]);
      setLoading(false);
      return;
    }

    const requestId = ++searchRequestIdRef.current;
    setLoading(true);

    const apiCall =
      activeTab === 'my_friends'
        ? api.friends.getFriends()
        : activeTab === 'requests'
        ? api.friends.getPendingFriendRequests()
        : api.friends.searchUsers(debouncedQuery);

    apiCall
      .then((data: any) => {
        if (!isMountedRef.current || requestId !== searchRequestIdRef.current) return;
        setRawResults(Array.isArray(data) ? data : []);
      })
      .catch((err: any) => {
        console.error('API Error:', err);
        if (isMountedRef.current && requestId === searchRequestIdRef.current) {
          setRawResults([]);
        }
      })
      .finally(() => {
        if (isMountedRef.current && requestId === searchRequestIdRef.current) {
          setLoading(false);
        }
      });
  }, [activeTab, debouncedQuery]);

  const results = useMemo(() => {
    return rawResults.map((user) => ({
      ...user,
      displayNameFormatted: user.displayName ? user.displayName.trim() : 'Unknown',
    }));
  }, [rawResults]);

  const handleSendRequest = useCallback(async (toUid: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActionLoadingId(toUid);
    try {
      await api.friends.sendFriendRequest(toUid);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (isMountedRef.current) {
        setRawResults((prev) =>
          prev.map((user) =>
            user.uid === toUid ? { ...user, relationshipStatus: 'REQUEST_SENT' } : user
          )
        );
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Request Failed', error.message || 'Could not send friend request');
    } finally {
      if (isMountedRef.current) {
        setActionLoadingId(null);
      }
    }
  }, []);

  const handleRemoveFriend = useCallback(async (targetUid: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Remove Friend', 'Are you sure you want to remove this friend?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setActionLoadingId(targetUid);
          try {
            await api.friends.removeFriend(targetUid);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (isMountedRef.current) {
              setRawResults((prev) => prev.filter((user) => user.uid !== targetUid));
            }
          } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.message || 'Failed to remove friend');
          } finally {
            if (isMountedRef.current) {
              setActionLoadingId(null);
            }
          }
        },
      },
    ]);
  }, []);

  const handlePressCard = useCallback(async (user: UserSearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedUser({
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL ?? undefined,
      targetExam: user.targetExam,
    });
    setProfileModalVisible(true);

    try {
      const fullProfile = await api.friends.getUserProfile(user.uid);
      if (!isMountedRef.current) return;

      const formattedBadges = (fullProfile.badges ?? []).map((badge: any, index: number) => {
        if (typeof badge === 'string') {
          return { id: badge, badgeId: badge, title: badge, icon: 'shield-star' };
        }
        return {
          id: badge.id || badge.badgeId || `badge-${index}`,
          badgeId: badge.badgeId || badge.id || `badge-${index}`,
          title: badge.title || badge.name,
          icon: badge.icon,
          imageUrl: badge.imageUrl,
        };
      });

      setSelectedUser({
        uid: fullProfile.uid,
        displayName: fullProfile.displayName,
        photoURL: fullProfile.photoURL ?? undefined,
        targetExam: fullProfile.targetExam,
        level: fullProfile.currentLevel,
        xp: fullProfile.xpPoints,
        streak: fullProfile.currentStreak,
        badges: formattedBadges,
      });
    } catch (err) {
      console.error('Failed to load full profile:', err);
    }
  }, []);

  const RenderSkeleton = () => (
    <View style={{ gap: 10 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.userCard,
            { backgroundColor: '#0A1220', borderColor: 'rgba(255, 255, 255, 0.06)', opacity: 0.5 },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]} />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ width: '40%', height: 14, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            <View style={{ width: '25%', height: 10, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />
          </View>
          <View style={{ width: 64, height: 32, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme?.color?.background || '#050B14' }]}>
      {/* Top Navigation Tabs */}
      <View style={styles.topTabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'my_friends' && styles.activeTabButton]}
          onPress={() => handleTabChange('my_friends')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color={activeTab === 'my_friends' ? '#38BDF8' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'my_friends' && styles.activeTabText]}>
            My Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'requests' && styles.activeTabButton]}
          onPress={() => handleTabChange('requests')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="account-plus"
            size={20}
            color={activeTab === 'requests' ? '#38BDF8' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'search' && styles.activeTabButton]}
          onPress={() => handleTabChange('search')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={activeTab === 'search' ? '#38BDF8' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        {activeTab === 'search' && (
          <View style={styles.searchWrapper}>
            <CustomSearchBar
              value={query}
              onChange={setQuery}
              onSubmit={() => {}}
              placeholder="Search by name, handle, or exam..."
            />
          </View>
        )}

        {loading ? (
          <RenderSkeleton />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <AnimatedUserCard
                item={item}
                activeTab={activeTab}
                isLoading={actionLoadingId === item.uid}
                onSendRequest={handleSendRequest}
                onRemoveFriend={handleRemoveFriend}
                onPressCard={handlePressCard}
                theme={theme}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons
                    name={
                      activeTab === 'requests'
                        ? 'email-outline'
                        : activeTab === 'my_friends'
                        ? 'account-heart-outline'
                        : query.trim()
                        ? 'account-search-outline'
                        : 'compass-outline'
                    }
                    size={42}
                    color="#38BDF8"
                  />
                </View>
                <Text
                  style={[
                    styles.emptyTitle,
                    {
                      color: theme?.color?.textPrimary || '#F8FAFC',
                      fontFamily: theme?.fontFamily?.bold || theme?.fontFamily?.regular,
                      fontSize: theme?.fontSize?.lg || 18,
                    },
                  ]}
                >
                  {activeTab === 'requests'
                    ? 'No Friend Requests'
                    : activeTab === 'my_friends'
                    ? 'No Friends Yet'
                    : query.trim()
                    ? 'No Aspirants Found'
                    : 'Discover Peers'}
                </Text>
                <Text
                  style={[
                    styles.emptyText,
                    {
                      color: theme?.color?.textSecondary || '#94A3B8',
                      fontFamily: theme?.fontFamily?.light || theme?.fontFamily?.regular,
                      fontSize: theme?.fontSize?.xs || 13,
                    },
                  ]}
                >
                  {activeTab === 'requests'
                    ? 'Incoming requests will show up here.'
                    : activeTab === 'my_friends'
                    ? 'Use the Search tab to connect with other aspirants.'
                    : query.trim()
                    ? 'Check spelling or search using specific exam terms'
                    : 'Search for peers by name or target exams to collaborate'}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      <UserProfileScreen
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        userData={selectedUser}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#050B14',
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 4,
  },
  activeTabButton: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  searchWrapper: {
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 32,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardClickableArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  fallbackAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    fontWeight: '700',
    marginBottom: 2,
  },
  examBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  targetExam: {
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtn: {
    backgroundColor: '#2563EB',
  },
  removeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  alreadyFriendBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pendingBtn: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SearchFriendsScreen;