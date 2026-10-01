import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import type { ChatRoom } from '../../common/types/types';
import { Loading } from '../../components/common/loading';
import { getInitials } from '../../common/utils/getInitials';
import PersonalChatListHeader from './Personalchatlistheader';
import { useBottomBar } from '../../common/context/useBottomBar';


const CONTACT_COLOR_KEYS = ['accent', 'info', 'success', 'warning', 'premium'] as const;
type PersonalChatSummary = {
  userId: string;
  displayName: string;
  isOnline: boolean;
  lastMessage: string;
  lastActive: string;
  unreadCount: number;
};

const getContactColor = (theme: ReturnType<typeof useTheme>['theme'], seed: string) => {
  let hash = 0;
  for (let i=0; i<seed.length; i++) {
    hash = (hash+seed.charCodeAt(i) * (i+1)) % 2147483647;
  }
  const key = CONTACT_COLOR_KEYS[
    Math.abs(hash) % CONTACT_COLOR_KEYS.length
  ] as keyof typeof theme.color;

  return theme.color[key] ?? theme.color.accent;
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

const toChatRoomSummary = (room: ChatRoom) => ({
  userId: room.roomId,
  displayName: room.name,
  isOnline: room.isActive,
  lastMessage: room.lastMessage ?? '',
  lastActive: formatRelativeTime(room.lastMessageAt),
  unreadCount: 0,
});


export default function PersonalChatsListScreen() {
  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<PersonalChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(true, 'chat');

  useEffect(() => {
    let isMounted = true;
    async function fetchConversations() {
      try {
        setLoading(true);
        setError(null);
        const result = await api.chat.getChatRooms();
        if (!isMounted) return;
        setConversations(result.map(toChatRoomSummary));
      } catch (err) {
        console.log('Failed to fetch conversations:', err);
        if (isMounted) setError(theme.i18n.t('Could not load your messages. Pull to retry.'));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchConversations();
    return () => {
      isMounted = false;
    };
  }, [theme.i18n]);

  const filteredConversations = conversations.filter((c) =>
    c.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const renderConversation = ({ item }: { item: PersonalChatSummary }) => {
    const contactColor = getContactColor(theme, item.userId);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/dm/${item.userId}`)}
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
            borderRadius: theme.borderRadius.full,
            borderWidth: 2,
            borderColor: contactColor,
            backgroundColor: `${contactColor}18`,
          }}
        >
          <Text
            style={{
              color: contactColor,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {getInitials(item.displayName)}
          </Text>

          {item.isOnline && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: theme.space.sm + 2,
                height: theme.space.sm + 2,
                borderWidth: 2,
                borderColor: theme.color.card,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.success,
              }}
            />
          )}
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
              {item.displayName}
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: theme.space.xs * 0.5,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                marginRight: theme.space.xs,
              }}
            >
              {item.lastMessage}
            </Text>

            {item.unreadCount > 0 && (
              <View
                style={{
                  minWidth: theme.space.md,
                  height: theme.space.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: theme.space.xs,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: contactColor,
                }}
              >
                <Text
                  style={{
                    color: theme.color.textInverse,
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
      <PersonalChatListHeader
        search={search}
        setSearch={setSearch}
        searchVisible={searchVisible}
        setSearchVisible={setSearchVisible}
      />

      {loading ? (
        <Loading message={theme.i18n.t('Loading messages...')} fullscreen />
      ) : error ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.space.md,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.userId}
          renderItem={renderConversation}
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
                {theme.i18n.t('No conversations yet')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
