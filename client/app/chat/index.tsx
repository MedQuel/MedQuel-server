import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';

import { ChatHeader } from './chatHeader';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';


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

type Subject = 'cardiology' | 'usmle' | 'pharma' | 'anatomy';
type SubjectColorKey = 'error' | 'accent' | 'success' | 'premium';

export const subjectColorKeys: Record<Subject, SubjectColorKey> = {
  cardiology: 'error',
  usmle: 'accent',
  pharma: 'success',
  anatomy: 'premium',
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

export const SubjectIcon = ({ id, color, size }: { id: Subject, color: string, size: number }) => {
  switch (id) {
    case 'cardiology':
      return <Ionicons name='heart-outline' size={size} color={color} />;
    case 'usmle':
      return <Ionicons name='school' size={size} color={color} />;
    case 'pharma':
      return <MaterialCommunityIcons name='pill' size={size} color={color} />;
    case 'anatomy':
      return <MaterialCommunityIcons name='brain' size={size} color={color} />;
    default:
      return null;
  }
};


export default function DiscussionRoomsScreen() {
  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState('');

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(true, 'chat');

  const rooms = DUMMY_ROOMS;
  const filteredRooms = rooms.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const subjectColorMap: Record<SubjectColorKey, string> = {
    error: theme.color.error,
    accent: theme.color.accent,
    success: theme.color.success,
    premium: theme.color.premium,
  };

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
    </View>
  );
}
