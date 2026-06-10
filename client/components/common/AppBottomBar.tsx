import React, { useCallback, useRef } from 'react';
import {
  View,
  Animated,
  Platform,
  Pressable,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import { useLayoutContext } from '../../common/context/LayoutContext';


interface TabDefs {
  id: string;
  href: string;
  label: string;
  icon: (color: string, size: number) => React.ReactNode;
}
const TABS: TabDefs[] = [
  {
    id: 'home',
    href: '/home',
    label: 'Home',
    icon: (c, s) => <Feather name='home' size={s} color={c} />,
  },
  {
    id: 'leaderboard',
    href: '/leaderboard',
    label: 'Leaderboard',
    icon: (c, s) => <Feather name='bar-chart-2' size={s} color={c} />,
  },
  {
    id: 'contests',
    href: '/contests',
    label: 'Contests',
    icon: (c, s) => <Feather name='zap' size={s} color={c} />,
  },
  {
    id: 'chat',
    href: '/chat',
    label: 'Chat',
    icon: (c, s) => <Feather name='message-circle' size={s} color={c} />,
  },
  {
    id: 'profile',
    href: '/profile',
    label: 'Profile',
    icon: (c, s) => <Feather name='user' size={s} color={c} />,
  },
];

const ICON_SIZE = 22;


export function AppBottomBar() {
  const { layoutData, _setBottomBarHeight } = useLayoutContext();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  if (!layoutData.bottomBarVisible) return null;

  const safeBottom = isWeb ? 0 : insets.bottom;

  return (
    <View
      pointerEvents='box-none'
      style={{
        position: isWeb ? ('fixed' as any) : 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      <View
        onLayout={(e) => _setBottomBarHeight(e.nativeEvent.layout.height)}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-around',
          backgroundColor: theme.color.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.color.border,
          paddingTop: theme.space.sm,
          paddingBottom: safeBottom > 0 ? safeBottom : theme.space.sm,
          paddingHorizontal: 0,
          elevation: 12, // Shadow above the bar
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: theme.isDark ? 0.3 : 0.06,
          shadowRadius: 8,
        }}
      >
        {TABS.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isSelected={layoutData.bottomBarSelectedId === tab.id}
            onPress={() => router.navigate(tab.href as any)}
          />
        ))}
      </View>
    </View>
  );
}


interface TabItemProps {
  tab: TabDefs;
  isSelected: boolean;
  onPress: () => void;
}

function TabItem({ tab, isSelected, onPress }: TabItemProps) {
  const { theme } = useTheme();
  const { setBottomBarSelectedId } = useLayoutContext();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 10,
      }),
    ]).start();

    setBottomBarSelectedId(tab.id);
    onPress();
  }, [tab.id, onPress, scaleAnim, setBottomBarSelectedId]);

  const iconColor = isSelected ? theme.color.accent : theme.color.textMuted;
  const labelColor = isSelected ? theme.color.accent : theme.color.textMuted;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole='button'
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isSelected }}
      style={
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          outlineWidth: 0,
        } as ViewStyle
      }
    >
      <Animated.View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {tab.icon(iconColor, ICON_SIZE)}

        <Animated.Text
          numberofLines={1}
          style={{
            color: labelColor,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.text,
            fontWeight: isSelected
              ? theme.fontWeight.bold
              : theme.fontWeight.medium,
            letterSpacing: 0.1,
          }}
        >
          {tab.label}
        </Animated.Text>

        <View
          style={{
            width: 20,
            height: 3,
            borderRadius: 2,
            marginTop: 1,
            backgroundColor: isSelected ? theme.color.accent : 'transparent',
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
