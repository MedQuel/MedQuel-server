import { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { DUMMY_ROOMS, subjectColorKeys, SubjectIcon } from './index';

type ChatMessage = {
  id: string;
  text: string;
  senderName: string;
  senderInitials: string;
  timestamp: string;
  isMe: boolean;
};
// TODO: replace with Firebase auth.currentUser.uid when integrating
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
const AVATAR_COLORS = ['error', 'accent', 'success', 'premium', 'warning'] as const;

export default function DiscussionChatViewScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const rawRoomId = (params as any)?.roomId;
  const roomId = Array.isArray(rawRoomId) ? rawRoomId[0] : rawRoomId ?? '';
  useBottomBar(false);
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(DUMMY_MESSAGES);
  const [inputText, setInputText] = useState('');
  // TODO: fetch actual room doc from Firestore using roomId instead of local lookup
  const room = DUMMY_ROOMS.find((r) => r.id === roomId) ?? DUMMY_ROOMS[0]!;
  const subjectColorMap: Record<string, string> = {
    error: theme.color.error,
    accent: theme.color.accent,
    success: theme.color.success,
    premium: theme.color.premium,
    warning: theme.color.warning,
  };
  const roomIconColor = subjectColorMap[(subjectColorKeys as any)[room.subject]] ?? theme.color.accent;
  const avatarColorFor = (name: string) => {
    const idx = name.length % AVATAR_COLORS.length;
    const key = AVATAR_COLORS[idx] ?? 'accent';
    return subjectColorMap[key];
  };
  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderName: 'You',
      senderInitials: 'ME',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      isMe: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
            borderRadius: theme.borderRadius.full,
            backgroundColor: `${avatarColorFor(item.senderName)}22`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.space.xs,
          }}
        >
          <Text style={{ color: avatarColorFor(item.senderName), fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.bold }}>
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
            shadowColor: theme.color.textPrimary,
            shadowOpacity: 0.05,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 1 },
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
            marginTop: theme.space.xs * 0.5,
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.regular,
            alignSelf: item.isMe ? 'flex-end' : 'flex-start',
          }}
        >
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      {/* Custom header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.md,
          paddingBottom: theme.space.sm,
          borderBottomWidth: 1,
          borderBottomColor: theme.color.border,
        }}
      >
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/chat'))}
          style={{ marginRight: theme.space.sm }}
        >
          <Ionicons name="arrow-back" size={theme.fontSize.md} color={theme.color.textPrimary} />
        </TouchableOpacity>
        <View
          style={{
            width: theme.space.xl + theme.space.xs,
            height: theme.space.xl + theme.space.xs,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: `${roomIconColor}18`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.space.sm,
          }}
        >
          <SubjectIcon id={(room.subject as any) ?? 'cardiology'} color={roomIconColor} size={theme.fontSize.md} />
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.md, fontFamily: theme.fontFamily.bold }}>
            {room.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.space.xs * 0.5 }}>
            <View
              style={{
                width: theme.space.xs,
                height: theme.space.xs,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.success,
                marginRight: theme.space.xs * 0.5,
              }}
            />
            <Text style={{ color: theme.color.success, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>
              {`${room.membersCount} ${theme.i18n.t('online')}`}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={theme.fontSize.md} color={theme.color.textSecondary} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? theme.space.xxl * 2 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.space.md, paddingVertical: theme.space.sm }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        {/* Input bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.space.lg,
            paddingTop: theme.space.sm,
            paddingBottom: Math.max(insets.bottom, theme.space.sm),
            gap: theme.space.sm,
            backgroundColor: theme.color.background,
            borderTopWidth: 1,
            borderTopColor: theme.color.border,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: theme.color.card,
              borderRadius: theme.borderRadius.full,
              minHeight: theme.space.xl,
              maxHeight: theme.space.xxl * 2,
              justifyContent: 'center',
            }}
          >
            <TextInput
              style={{
                paddingHorizontal: theme.space.md,
                paddingVertical: Platform.OS === 'ios' ? theme.space.sm : theme.space.xs,
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.md,
                lineHeight: theme.fontSize.md * 1.3,
                fontFamily: theme.fontFamily.regular,
                textAlignVertical: 'center',
                includeFontPadding: false,
                outlineStyle: 'none',
              }}
              placeholder={theme.i18n.t('Ask or share an insight...')}
              placeholderTextColor={theme.color.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim()}
            style={{
              width: theme.space.xl,
              height: theme.space.xl,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.accent,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: inputText.trim() ? 1 : 0.5,
            }}
          >
            <Ionicons name="send" size={theme.fontSize.md} color={theme.color.textPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}