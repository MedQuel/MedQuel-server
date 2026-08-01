import {
  View,
  Text,
  Modal,
  FlatList,
  Platform,
  TextInput,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import { MOCK_USER } from '../../common/constants/mockData';
import { getInitials } from '../../common/utils/getInitials';
import { useBottomBar } from '../../common/context/useBottomBar';
import type { ChatRoom, GetChatMessagesResult } from '../../common/types/types';
import { subjectCatalog, SubjectIcon, type SubjectId } from '../../common/constants/subject';


type ChatMessage = {
  id: string;
  text: string;
  isMe: boolean;
  senderName: string;
  timestamp: string;
};

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
const toChatMessage = (msg: GetChatMessagesResult['messages'][number], currentUserId: string): ChatMessage => ({
  id: msg.messageId,
  text: msg.text,
  isMe: msg.userId === currentUserId,
  senderName: msg.displayName,
  timestamp: formatTime(msg.createdAt),
});

const resolveSubjectId = (subjectTitle: string): SubjectId => {
  const normalized = subjectTitle.trim().toLowerCase();
  const match = Object.entries(subjectCatalog).find(([, def]) => def.title.toLowerCase() === normalized);

  return (match?.[0] as SubjectId) ?? 'medicine';
};


export default function DiscussionChatViewScreen() {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const rawRoomId = (params as any)?.roomId;
  const roomId = Array.isArray(rawRoomId) ? rawRoomId[0] : (rawRoomId ?? '');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchChat() {
      try {
        setLoading(true);
        setError(null);
        const [rooms, messagesResult] = await Promise.all([
          api.chat.getChatRooms(),
          api.chat.getChatMessages(roomId),
        ]);
        if (!isMounted) return;

        const matchedRoom = rooms.find((r) => r.roomId === roomId) ?? null;
        if (!matchedRoom) {
          setError(theme.i18n.t('Could not load this chat. Pull to retry.'));
          return;
        }

        setRoom(matchedRoom);
        setMessages(messagesResult.messages.map((m) => toChatMessage(m, MOCK_USER.uid)));
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      } catch (err) {
        console.log('Failed to fetch chat:', err);
        if (isMounted) setError(theme.i18n.t('Could not load this chat. Pull to retry.'));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (roomId) {
      fetchChat();
    } else {
      setLoading(false);
      setError(theme.i18n.t('Could not load this chat. Pull to retry.'));
    }
    return () => { isMounted = false };
  }, [roomId, theme.i18n]);

  const roomSubjectId = room ? resolveSubjectId(room.subject) : 'medicine';
  const roomVariant = subjectCatalog[roomSubjectId]?.variant ?? 'accent';
  const roomIconColor = theme.color[roomVariant] ?? theme.color.accent;

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || !roomId) return;

    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      isMe: true,
      senderName: MOCK_USER.displayName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
    setInputText('');
    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      setSending(true);
      const sent = await api.chat.sendMessage(roomId, text);
      setMessages((prev) => prev.map((m) => m.id === optimisticMessage.id ? toChatMessage(sent, MOCK_USER.uid) : m));
    } catch (err) {
      console.log('Failed to send message:', err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const menuItems: {
    key: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    danger?: boolean;
    onPress: () => void;
  }[] = [
    {
      key: 'info',
      label: theme.i18n.t('Room Info'),
      icon: 'information-circle-outline',
      onPress: () => { setMenuVisible(false) },
    },
    {
      key: 'members',
      label: theme.i18n.t('Members'),
      icon: 'people-outline',
      onPress: () => { setMenuVisible(false) },
    },
    {
      key: 'mute',
      label: isMuted ? theme.i18n.t('Unmute Notifications') : theme.i18n.t('Mute Notifications'),
      icon: isMuted ? 'notifications-off' : 'notifications-off-outline',
      onPress: () => {
        setIsMuted((prev) => !prev);
        setMenuVisible(false);
      },
    },
    {
      key: 'leave',
      label: theme.i18n.t('Leave Room'),
      icon: 'exit-outline',
      danger: true,
      onPress: () => { setMenuVisible(false) },
    },
    {
      key: 'report',
      label: theme.i18n.t('Report Room'),
      icon: 'flag-outline',
      danger: true,
      onPress: () => { setMenuVisible(false) },
    },
  ];

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: theme.space.md,
        justifyContent: item.isMe ? 'flex-end' : 'flex-start',
      }}
    >
      {!item.isMe && (
        <View
          style={{
            width: theme.space.lg,
            height: theme.space.lg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.space.xs,
            borderRadius: theme.borderRadius.full,
            backgroundColor: `${theme.color.accent}22`,
          }}
        >
          <Text
            style={{
              color: theme.color.accent,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {getInitials(item.senderName)}
          </Text>
        </View>
      )}

      <View style={{ maxWidth: '75%' }}>
        <View
          style={{
            paddingHorizontal: theme.space.md,
            paddingVertical: theme.space.sm,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: item.isMe ? theme.color.accent : theme.color.card,
            boxShadow: `0px 1px 3px ${theme.color.textPrimary}0D`,
            elevation: Platform.OS === 'android' ? 1 : 0,
          }}
        >
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {item.text}
          </Text>
        </View>

        <Text
          style={{
            alignSelf: item.isMe ? 'flex-end' : 'flex-start',
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.regular,
            marginTop: theme.space.xs * 0.5,
          }}
        >
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <Loading message={theme.i18n.t('Loading conversation...')} fullscreen />
      </View>
    );
  }

  if (error || !room) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.space.md,
          backgroundColor: theme.color.background,
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
          {error ?? theme.i18n.t('Room not found.')}
        </Text>
      </View>
    );
  }


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          flexDirection: 'row',
          minHeight: theme.space.xxl + theme.space.lg,
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.md,
          paddingHorizontal: theme.space.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.color.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/chat')}
          style={{ marginRight: theme.space.sm }}
        >
          <Ionicons
            name='arrow-back'
            size={theme.fontSize.lg}
            color={theme.color.textPrimary}
          />
        </TouchableOpacity>

        <View
          style={{
            width: theme.space.xxl,
            height: theme.space.xxl,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.space.sm,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: `${roomIconColor}18`,
          }}
        >
          <SubjectIcon
            id={roomSubjectId}
            color={roomIconColor}
            size={theme.fontSize.lg}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {room.name}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: theme.space.xs * 0.5,
            }}
          >
            <View
              style={{
                width: theme.space.xs,
                height: theme.space.xs,
                marginRight: theme.space.xs * 0.5,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.success,
              }}
            />
            <Text
              style={{
                color: theme.color.success,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {`${room.memberCount} ${theme.i18n.t('online')}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons
            name='ellipsis-horizontal'
            size={theme.fontSize.lg}
            color={theme.color.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={menuVisible}
        animationType='fade'
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)}>
          <View
            style={{
              position: 'absolute',
              top: insets.top + theme.space.xxl,
              right: theme.space.md,
              minWidth: 200,
              paddingVertical: theme.space.xs,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.card,
              boxShadow: `0px 4px 12px ${theme.color.textPrimary}22`,
              elevation: Platform.OS === 'android' ? 4 : 0,
            }}
          >
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={item.onPress}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: theme.space.sm,
                  paddingHorizontal: theme.space.md,
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={theme.fontSize.md}
                  color={item.danger ? theme.color.error : theme.color.textPrimary}
                  style={{ marginRight: theme.space.sm }}
                />
                <Text
                  style={{
                    color: item.danger ? theme.color.error : theme.color.textPrimary,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'android' ? 'height' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          contentContainerStyle={{
            paddingHorizontal: theme.space.md,
            paddingVertical: theme.space.sm,
          }}
        />

        <View
          style={{
            gap: theme.space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: theme.space.sm,
            paddingBottom: Math.max(insets.bottom, theme.space.sm),
            paddingHorizontal: theme.space.lg,
            borderTopWidth: 1,
            borderTopColor: theme.color.border,
            backgroundColor: theme.color.background,
          }}
        >
          <View
            style={{
              flex: 1,
              overflow: 'hidden',
              height: theme.space.xxl,
              justifyContent: 'center',
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.card,
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={theme.i18n.t('Ask or share an insight...')}
              placeholderTextColor={theme.color.textSecondary}
              multiline
              style={{
                flex: 1,
                outline: 'none',
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.lg,
                fontFamily: theme.fontFamily.regular,
                paddingVertical: theme.space.sm,
                paddingHorizontal: theme.space.md,
                ...(Platform.OS === 'android'
                  ? { textAlignVertical: 'center' as const, includeFontPadding: false }
                  : {}),
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            style={{
              width: theme.space.xxl,
              height: theme.space.xxl,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.accent,
              opacity: inputText.trim() && !sending ? 1 : 0.5,
            }}
          >
            <Ionicons
              name='send'
              size={theme.fontSize.md}
              color={theme.color.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
