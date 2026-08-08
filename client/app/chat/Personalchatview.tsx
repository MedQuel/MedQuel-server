import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Modal, FlatList, Platform, TextInput } from 'react-native';
import { Pressable, TouchableOpacity, KeyboardAvoidingView } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import { getInitials } from '../../common/utils/getInitials';
import { useBottomBar } from '../../common/context/useBottomBar';
import type { ChatRoom, GetChatMessagesResult, ChatMessage as ApiChatMessage } from '../../common/types/types';


const CONTACT_COLOR_KEYS = ['accent', 'info', 'success', 'warning', 'premium'] as const;
type ChatMessage = {
  id: string;
  text: string;
  isMe: boolean;
  senderId: string;
  senderName: string;
  timestamp: string;
  createdAt: string;
};

const getContactColor = (theme: ReturnType<typeof useTheme>['theme'], seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i+1)) % 2147483647;
  }
  const key = CONTACT_COLOR_KEYS[Math.abs(hash) % CONTACT_COLOR_KEYS.length] as keyof typeof theme.color;

  return theme.color[key] ?? theme.color.accent;
};

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

const toChatMessage = (msg: ApiChatMessage, currentUserId: string): ChatMessage => ({
  id: msg.messageId,
  text: msg.text,
  isMe: msg.userId === currentUserId,
  senderId: msg.userId,
  senderName: (msg as any).userName ?? msg.userId,
  timestamp: formatTime(msg.createdAt),
  createdAt: msg.createdAt,
});

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const formatDayLabel = (date: Date, t: (s: string) => string): string => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return t('Today');
  if (isSameDay(date, yesterday)) return t('Yesterday');

  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

type ChatListItem = {
  type: 'separator';
  id: string;
  label: string
} | {
  type: 'message';
  id: string;
  message: ChatMessage;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
};

const buildChatListData = (messages: ChatMessage[], t: (s: string) => string): ChatListItem[] => {
  const items: ChatListItem[] = [];
  messages.forEach((msg, index) => {
    const prev = messages[index - 1];
    const next = messages[index + 1];
    const msgDate = new Date(msg.createdAt);
    const prevDate = prev ? new Date(prev.createdAt) : null;
    const nextDate = next ? new Date(next.createdAt) : null;
    const isNewDay = !prevDate || !isSameDay(prevDate, msgDate);
    if (isNewDay) {
      items.push({ type: 'separator', id: `sep-${msg.id}`, label: formatDayLabel(msgDate, t) });
    }

    const isFirstInGroup = isNewDay || !prev || prev.senderId !== msg.senderId;
    const isLastInGroup = !next || !nextDate || !isSameDay(nextDate, msgDate) || next.senderId !== msg.senderId;
    items.push({
      type: 'message',
      id: msg.id,
      message: msg,
      isFirstInGroup,
      isLastInGroup,
    });
  });

  return items;
};


export default function GroupChatViewScreen() {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<ChatListItem>>(null);

  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const roomId = Array.isArray(params.userId) ? (params.userId[0] ?? '') : (params.userId ?? '');

  const groupColor = getContactColor(theme, conversation?.roomId ?? roomId);

  useEffect(() => {
    let isMounted = true;
    async function fetchChat() {
      try {
        setLoading(true);
        setError(null);
        const [me, rooms, messagesResult]: [
          Awaited<ReturnType<typeof api.user.getMe>>,
          ChatRoom[],
          GetChatMessagesResult,
        ] = await Promise.all([
          api.user.getMe(),
          api.chat.getChatRooms(),
          api.chat.getChatMessages(roomId),
        ]);

        if (!isMounted) return;
        setCurrentUserId(me.uid);
        const matchedConversation = rooms.find((r) => r.roomId === roomId) ?? null;
        if (!matchedConversation) {
          setError(theme.i18n.t('Could not load this chat. Pull to retry.'));
          return;
        }

        setConversation(matchedConversation);
        setMessages(messagesResult.messages.map((m) => toChatMessage(m, me.uid)));
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

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || !roomId || !currentUserId) return;

    const nowIso = new Date().toISOString();
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      isMe: true,
      senderId: currentUserId,
      senderName: theme.i18n.t('You'),
      text,
      timestamp: formatTime(nowIso),
      createdAt: nowIso,
    };
    setInputText('');
    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      setSending(true);
      const sent = await api.chat.sendMessage(roomId, text);
      setMessages((prev) =>
        prev.map((m) => m.id === optimisticMessage.id ? toChatMessage(sent, currentUserId ?? sent.userId) : m)
      );
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
      label: theme.i18n.t('Group Info'),
      icon: 'people-circle-outline',
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
      key: 'report',
      label: theme.i18n.t('Report Group'),
      icon: 'flag-outline',
      danger: true,
      onPress: () => { setMenuVisible(false) },
    },
    {
      key: 'leave',
      label: theme.i18n.t('Leave Group'),
      icon: 'exit-outline',
      danger: true,
      onPress: () => { setMenuVisible(false) },
    },
  ];

  const getBubbleRadius = (isMe: boolean, isFirstInGroup: boolean) => {
    const lg = theme.borderRadius.lg;
    const sm = theme.borderRadius.sm;

    if (isMe) {
      return {
        borderTopLeftRadius: lg,
        borderTopRightRadius: isFirstInGroup ? lg : sm,
        borderBottomRightRadius: sm,
        borderBottomLeftRadius: lg,
      };
    }

    return {
      borderTopRightRadius: lg,
      borderTopLeftRadius: isFirstInGroup ? lg : sm,
      borderBottomLeftRadius: sm,
      borderBottomRightRadius: lg,
    };
  };

  const renderItem = ({ item }: { item: ChatListItem }) => {
    if (item.type === 'separator') {
      return (
        <View style={{ alignItems: 'center', marginVertical: theme.space.sm }}>
          <View
            style={{
              paddingVertical: theme.space.xs * 0.5,
              paddingHorizontal: theme.space.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.card,
            }}
          >
            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {item.label}
            </Text>
          </View>
        </View>
      );
    }

    const { message, isFirstInGroup, isLastInGroup } = item;
    const senderColor = getContactColor(theme, message.senderId);
    const avatarSize = theme.space.lg;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: message.isMe ? 'flex-end' : 'flex-start',
          marginBottom: isLastInGroup ? theme.space.sm : theme.space.xs * 0.5,
        }}
      >
        {!message.isMe && (
          <View style={{ width: avatarSize, marginRight: theme.space.xs }}>
            {isLastInGroup && (
              <View
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: senderColor,
                  borderRadius: avatarSize / 2,
                  backgroundColor: `${senderColor}18`,
                }}
              >
                <Text
                  style={{
                    color: senderColor,
                    fontSize: theme.fontSize.xs,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {getInitials(message.senderName)}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ maxWidth: '72%' }}>
          {!message.isMe && isFirstInGroup && (
            <Text
              style={{
                color: senderColor,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.bold,
                marginBottom: theme.space.xs * 0.5,
                marginLeft: theme.space.sm,
              }}
            >
              {message.senderName}
            </Text>
          )}

          <View
            style={{
              paddingVertical: theme.space.sm,
              paddingHorizontal: theme.space.md,
              backgroundColor: message.isMe ? theme.color.accent : theme.color.card,
              boxShadow: `0px 1px 3px ${theme.color.textPrimary}0D`,
              elevation: Platform.OS === 'android' ? 1 : 0,
              ...getBubbleRadius(message.isMe, isFirstInGroup),
            }}
          >
            <Text
              style={{
                color: message.isMe ? theme.color.textInverse : theme.color.textPrimary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {message.text}
            </Text>
          </View>

          {isLastInGroup && (
            <Text
              style={{
                alignSelf: message.isMe ? 'flex-end' : 'flex-start',
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.regular,
                marginTop: theme.space.xs * 0.5,
              }}
            >
              {message.timestamp}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <Loading message={theme.i18n.t('Loading conversation...')} fullscreen />
      </View>
    );
  }

  if (error || !conversation) {
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
          {error ?? theme.i18n.t('Conversation not found.')}
        </Text>
      </View>
    );
  }

  const chatListData = buildChatListData(messages, theme.i18n.t);


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
            borderRadius: theme.borderRadius.full,
            borderWidth: 2,
            borderColor: groupColor,
            backgroundColor: `${groupColor}18`,
          }}
        >
          <Ionicons name='people' size={theme.fontSize.lg} color={groupColor} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {conversation.name}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.xs * 0.5,
            }}
          >
            {`${conversation.memberCount} ${theme.i18n.t('members')}`}
          </Text>
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
          data={chatListData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
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
              placeholder={theme.i18n.t('Type a message...')}
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
              color={theme.color.textInverse}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
