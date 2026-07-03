import { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { lightColors } from '../../theme/colors';
import { useBottomBar } from '../../common/context/useBottomBar';
import { ActiveDiscussionCard } from '../../components/DiscussionRoomCard';
import { DiscussionChatView } from '../../components/DiscussionChatView';

type FilterTab = 'all' | 'joined' | 'trending';

function DiscussionRoomsHeader({
  onSearchPress,
  onTabChange,
}: {
  onSearchPress?: () => void;
  onTabChange?: (tab: FilterTab) => void;
}) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: theme.i18n.t('All Rooms') },
    { key: 'joined', label: theme.i18n.t('Joined') },
    { key: 'trending', label: theme.i18n.t('Trending') },
  ];

  const handleTabPress = (tab: FilterTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <View
      style={{
        backgroundColor: theme.color.background,
        paddingHorizontal: theme.space.md,
        paddingTop: theme.space.md,
        paddingBottom: theme.space.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.color.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1, paddingRight: theme.space.md }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: theme.fontFamily.bold,
              fontSize: theme.fontSize.xxxl,
              color: theme.color.textPrimary,
            }}
          >
            {theme.i18n.t('Discussion Rooms')}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              marginTop: theme.space.xs / 2,
              fontFamily: theme.fontFamily.regular,
              fontSize: theme.fontSize.sm,
              color: theme.color.textSecondary,
            }}
          >
            {theme.i18n.t('Join, discuss & learn together')}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSearchPress}
          style={{
            width: theme.space.xl,
            height: theme.space.xl,
            borderRadius: theme.borderRadius.md,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.card,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Feather
            name="search"
            size={theme.fontSize.lg}
            color={theme.color.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginTop: theme.space.md,
          gap: theme.space.sm,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              onPress={() => handleTabPress(tab.key)}
              style={{
                paddingHorizontal: theme.space.md,
                paddingVertical: theme.space.sm,
                borderRadius: theme.borderRadius.full,
                borderWidth: 1,
                borderColor: isActive
                  ? theme.color.accent
                  : theme.color.textSecondary,
                backgroundColor: isActive
                  ? theme.color.accent
                  : 'transparent',
                minWidth: 72,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: theme.fontSize.sm,
                  color: isActive
                    ? lightColors.textInverse
                    : theme.color.textSecondary,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { theme } = useTheme();

  useBottomBar(true, 'chat');

  const messages = [
    {
      id: '1',
      user: 'Sarah',
      initials: 'SK',
      message: 'The key in STEMI is time — door-to-balloon within 90 min!',
      time: '10:32',
    },
    {
      id: '2',
      user: 'Rahul',
      initials: 'RP',
      message: 'Agreed! Aspirin + heparin immediately. Cath lab protocols crucial.',
      time: '10:34',
    },
    {
      id: '3',
      user: 'Me',
      initials: '',
      message: "What about fibrinolysis if PCI isn't available within 2 hours?",
      time: '10:36',
      isCurrentUser: true,
    },
    {
      id: '4',
      user: 'Sarah',
      initials: 'SK',
      message: 'Current guidelines recommend fibrinolysis if PCI cannot be performed quickly.',
      time: '10:38',
    },
    {
      id: '5',
      user: 'Me',
      initials: '',
      message: 'Thanks! That clears it up.',
      time: '10:39',
      isCurrentUser: true,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: theme.space.xl }}
        showsVerticalScrollIndicator={false}
      >
        <DiscussionRoomsHeader />
        <View
          style={{
            paddingHorizontal: theme.space.md,
            paddingTop: theme.space.md,
            gap: theme.space.md,
          }}
        >
          <ActiveDiscussionCard
            title="Cardiology Discussion"
            message="Great point about STEMI management!"
            participants={142}
            roomId="#cardiology"
            timeAgo="2m"
            unreadCount={3}
            onPress={() => {}}
          />
          <ActiveDiscussionCard
            title="USMLE Step 1 Prep"
            message="Anyone struggling with Biochemistry?"
            participants={847}
            roomId="#usmle"
            timeAgo="5m"
            unreadCount={12}
            onPress={() => {}}
          />
          <DiscussionChatView
            title="Cardiology Discussion"
            onlineCount={142}
            messages={messages}
          />
        </View>
      </ScrollView>
    </View>
  );
}