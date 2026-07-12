import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, FlatList, Platform, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { DUMMY_ROOMS, subjectColorKeys, SubjectIcon } from './index';


type ChatMessage = {
  id: string;
  text: string;
  isMe: boolean;
  senderName: string;
  senderInitials: string;
  timestamp: string;
};

const AVATAR_COLORS = [
  'error',
  'accent',
  'success',
  'premium',
  'warning',
] as const;

const DUMMY_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    text: 'The key in STEMI is time — door-to-balloon within 90 min!',
    senderName: 'Sarah Khan',
    senderInitials: 'SK',
    timestamp: '10:32',
    isMe: false,
  },
  {
    id: 'm2',
    text: 'Agreed! Aspirin + heparin immediately. Cath lab protocol is crucial.',
    senderName: 'Rehan Piracha',
    senderInitials: 'RP',
    timestamp: '10:34',
    isMe: false,
  },
  {
    id: 'm3',
    text: "What about fibrinolysis if PCI isn't available within 2 hours?",
    senderName: 'You',
    senderInitials: 'ME',
    timestamp: '10:36',
    isMe: true,
  },
];


export default function DiscussionChatViewScreen() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(DUMMY_MESSAGES);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const rawRoomId = (params as any)?.roomId;
  const roomId = Array.isArray(rawRoomId) ? rawRoomId[0] : (rawRoomId ?? '');

  const flatListRef = useRef<FlatList>(null);
  const room = DUMMY_ROOMS.find((r) => r.id === roomId) ?? DUMMY_ROOMS[0]!;
  const subjectColorMap: Record<string, string> = {
    error: theme.color.error,
    accent: theme.color.accent,
    success: theme.color.success,
    premium: theme.color.premium,
    warning: theme.color.warning,
  };
  const roomIconColor =
    subjectColorMap[(subjectColorKeys as any)[room.subject]] ?? theme.color.accent;

  const avatarColorFor = (name: string) => {
    const idx = name.length % AVATAR_COLORS.length;
    const key = AVATAR_COLORS[idx] ?? 'accent';
    return subjectColorMap[key];
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      isMe: true,
      senderName: 'You',
      senderInitials: 'ME',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    setInputText('');
    setMessages((prev) => [...prev, newMessage]);
    setTimeout(() => { flatListRef.current?.scrollToEnd({ animated: true }) }, 100);
  };

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
            backgroundColor: `${avatarColorFor(item.senderName)}22`,
          }}
        >
          <Text
            style={{
              color: avatarColorFor(item.senderName),
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {item.senderInitials}
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
              color: item.isMe ? theme.color.textPrimary : theme.color.textPrimary,
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: theme.space.md,
          paddingBottom: theme.space.sm,
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
            size={theme.fontSize.md}
            color={theme.color.textPrimary}
          />
        </TouchableOpacity>

        <View
          style={{
            width: theme.space.xl + theme.space.xs,
            height: theme.space.xl + theme.space.xs,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.space.sm,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: `${roomIconColor}18`,
          }}
        >
          <SubjectIcon
            id={room.subject as any}
            color={roomIconColor}
            size={theme.fontSize.md}
          />
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
            {room.name}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.space.xs * 0.5 }}>
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
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {`${room.membersCount} ${theme.i18n.t('online')}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity>
          <Ionicons
            name='ellipsis-horizontal'
            size={theme.fontSize.md}
            color={theme.color.textSecondary}
          />
        </TouchableOpacity>
      </View>

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
              minHeight: theme.space.xl,
              maxHeight: theme.space.xxl * 2,
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
                outline: 'none',
                textAlignVertical: 'center',
                lineHeight: theme.fontSize.md * 1.3,
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.regular,
                includeFontPadding: false,
                paddingVertical: theme.space.xs,
                paddingHorizontal: theme.space.md,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim()}
            style={{
              width: theme.space.xl,
              height: theme.space.xl,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.borderRadius.full,
              opacity: inputText.trim() ? 1 : 0.5,
              backgroundColor: theme.color.accent,
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
