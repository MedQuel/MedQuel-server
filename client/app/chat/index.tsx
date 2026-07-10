import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import ChatHeader from './chatheader';

type Subject = 'cardiology' | 'usmle' | 'pharma' | 'anatomy';
type DiscussionRoom = {
  id: string;
  name: string;
  subject: Subject;
  lastMessage: string;
  lastActive: string;
  unreadCount: number;
  membersCount: number;
  isJoined: boolean;
  isTrending: boolean;
};

export const DUMMY_ROOMS: DiscussionRoom[] = [
  {
    id: 'room1',
    name: 'Cardiology Discussion',
    subject: 'cardiology',
    lastMessage: 'Great point about STEMI management!',
    lastActive: '2m',
    unreadCount: 3,
    membersCount: 142,
    isJoined: true,
    isTrending: true,
  },
  {
    id: 'room2',
    name: 'USMLE Step 1 Prep',
    subject: 'usmle',
    lastMessage: 'Anyone struggling with Biochemistry?',
    lastActive: '5m',
    unreadCount: 12,
    membersCount: 847,
    isJoined: true,
    isTrending: true,
  },
  {
    id: 'room3',
    name: 'Pharmacology Hub',
    subject: 'pharma',
    lastMessage: 'Pharmacokinetics practice Q posted!',
    lastActive: '15m',
    unreadCount: 0,
    membersCount: 234,
    isJoined: false,
    isTrending: false,
  },
  {
    id: 'room4',
    name: 'Anatomy Masters',
    subject: 'anatomy',
    lastMessage: 'Brachial plexus mnemonics anyone?',
    lastActive: '2h',
    unreadCount: 1,
    membersCount: 421,
    isJoined: false,
    isTrending: false,
  },
];
type SubjectColorKey = 'error' | 'accent' | 'success' | 'premium';
export const subjectColorKeys: Record<Subject, SubjectColorKey> = {
  cardiology: 'error',
  usmle: 'accent',
  pharma: 'success',
  anatomy: 'premium',
};
export const SubjectIcon = ({ id, color, size }: { id: Subject; color: string; size: number }) => {
  switch (id) {
    case 'cardiology': return <Ionicons name="heart-outline" size={size} color={color} />;
    case 'usmle':      return <Ionicons name="school" size={size} color={color} />;
    case 'pharma':      return <MaterialCommunityIcons name="pill" size={size} color={color} />;
    case 'anatomy':     return <MaterialCommunityIcons name="brain" size={size} color={color} />;
    default:            return null;
  }
};
export default function DiscussionRoomsScreen() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  useBottomBar(true, 'chat');
  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState('');
  const subjectColorMap: Record<SubjectColorKey, string> = {
    error: theme.color.error,
    accent: theme.color.accent,
    success: theme.color.success,
    premium: theme.color.premium,
  };
  const rooms = DUMMY_ROOMS;
  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderRoom = ({ item }: { item: DiscussionRoom }) => {
    const colorKey = subjectColorKeys[item.subject] ?? 'accent';
    const iconColor = subjectColorMap[colorKey];

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item.id}`)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.color.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.space.sm,
          marginBottom: theme.space.sm,
          shadowColor: theme.color.textPrimary,
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: Platform.OS === 'android' ? 2 : 0,
        }}
      >
        <View
          style={{
            width: theme.space.xxl,
            height: theme.space.xxl,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: `${iconColor}18`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.space.sm,
          }}
        >
          <SubjectIcon id={item.subject} color={iconColor} size={theme.fontSize.lg} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                marginRight: theme.space.xs,
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {item.name}
            </Text>
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>
              {item.lastActive}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={{
              marginTop: theme.space.xs * 0.5,
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {item.lastMessage}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.space.xs * 0.5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people-outline" size={theme.fontSize.xs} color={theme.color.textSecondary} />
              <Text style={{ marginLeft: theme.space.xs * 0.5, color: theme.color.textSecondary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>
                {item.membersCount}
              </Text>
            </View>

            {item.unreadCount > 0 && (
              <View
                style={{
                  minWidth: theme.space.md,
                  height: theme.space.md,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: theme.color.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: theme.space.xs,
                }}
              >
                <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.bold }}>
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
        theme={theme}
        searchVisible={searchVisible}
        setSearchVisible={setSearchVisible}
        search={search}
        setSearch={setSearch}
      />

      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoom}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.space.md, paddingBottom: theme.space.xxl }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: theme.space.xxl * 2, gap: theme.space.sm }}>
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
              {theme.i18n.t('No discussion rooms found')}
            </Text>
          </View>
        }
      />
    </View>
  );
}