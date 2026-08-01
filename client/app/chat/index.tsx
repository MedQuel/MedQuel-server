import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import { ChatHeader } from './chatHeader';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { Loading } from '../../components/common/loading';
import { api } from '../../common/api/api';
import { subjectCatalog, SubjectIcon, type SubjectId, type SubjectVariant } from '../../common/constants/subject';
import type { ChatRoom } from '../../common/types/types';

const createDiscussionRoom = (
  id: string,
  name: string,
  subject: SubjectId,
  lastMessage: string,
  lastActive: string,
  unreadCount: number,
  membersCount: number,
  isJoined: boolean,
  isTrending: boolean
) => ({ id, name, subject, lastMessage, lastActive, unreadCount, membersCount, isJoined, isTrending });

type DiscussionRoom = ReturnType<typeof createDiscussionRoom>;

const resolveSubjectId = (subjectTitle: string): SubjectId => {
  const normalized = subjectTitle.trim().toLowerCase();
  const match = Object.entries(subjectCatalog).find(
    ([, def]) => def.title.toLowerCase() === normalized
  );
  return (match?.[0] as SubjectId) ?? 'medicine';
};
const formatRelativeTime = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
};
const toDiscussionRoom = (room: ChatRoom): DiscussionRoom => ({
  id: room.roomId,
  name: room.name,
  subject: resolveSubjectId(room.subject),
  lastMessage: room.lastMessage ?? '',
  lastActive: formatRelativeTime(room.lastMessageAt),
  unreadCount: 0,
  membersCount: room.memberCount,
  isJoined: false,
  isTrending: false,
});
export default function DiscussionRoomsScreen() {
  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [rooms, setRooms] = useState<DiscussionRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(true, 'chat');
  useEffect(() => {
    let isMounted = true;
    async function fetchRooms() {
      try {
        setLoading(true);
        setError(null);
        const chatRooms = await api.chat.getChatRooms();
        if (!isMounted) return;

        setRooms(chatRooms.map(toDiscussionRoom));
      } catch (err) {
        console.log('Failed to fetch chat rooms:', err);
        if (isMounted) {
          setError(theme.i18n.t('Could not load discussion rooms. Pull to retry.'));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchRooms();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRooms = rooms.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const subjectColorMap: Record<SubjectVariant, string> = {
    error: theme.color.error,
    accent: theme.color.accent,
    success: theme.color.success,
    premium: theme.color.premium,
    warning: theme.color.warning,
  };
  const renderRoom = ({ item }: { item: DiscussionRoom }) => {
    const variant = subjectCatalog[item.subject]?.variant ?? 'accent';
    const iconColor = subjectColorMap[variant];
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item.id}`)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: theme.space.sm,
          marginBottom: theme.space.sm,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.card,
          boxShadow: `0px 2px 8px ${theme.color.textPrimary}0F`,
          elevation: Platform.OS === 'android' ? 2 : 0,
        }}
      >
        <View
          style={{
            width: theme.space.xxl,
            height: theme.space.xxl,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.space.sm,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: `${iconColor}18`,
          }}
        >
          <SubjectIcon
            id={item.subject}
            color={iconColor}
            size={theme.fontSize.lg}
          />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.bold,
                marginRight: theme.space.xs,
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {item.lastActive}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.xs * 0.5,
            }}
          >
            {item.lastMessage}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: theme.space.xs * 0.5,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name='people-outline'
                size={theme.fontSize.xs}
                color={theme.color.textSecondary}
              />
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.regular,
                  marginLeft: theme.space.xs * 0.5,
                }}
              >
                {item.membersCount}
              </Text>
            </View>

            {item.unreadCount > 0 && (
              <View
                style={{
                  minWidth: theme.space.md,
                  height: theme.space.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: theme.space.xs,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: theme.color.accent,
                }}
              >
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ChatHeader
        search={search}
        setSearch={setSearch}
        searchVisible={searchVisible}
        setSearchVisible={setSearchVisible}
      />

      {loading ? (
        <Loading message={theme.i18n.t('Loading discussion rooms...')} fullscreen />
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.space.md }}>
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoom}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.space.md,
            paddingBottom: theme.space.xxl,
          }}
          ListEmptyComponent={
            <View style={{ gap: theme.space.sm, alignItems: 'center', marginTop: theme.space.xxl * 2 }}>
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t('No discussion rooms found')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}