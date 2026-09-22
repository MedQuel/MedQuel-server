import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Animated, Platform, Pressable, ViewStyle, StyleSheet } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useLayoutContext } from '../../common/context/LayoutContext';


const ICON_SIZE = 22;
interface TabDefs {
  id: string;
  href: Href;
  labelKey: string;
  icon: (color: string, size: number) => React.ReactNode;
}
const TABS: TabDefs[] = [
  {
    id: 'home',
    href: '/home',
    labelKey: 'common.tabs.home',
    icon: (c, s) => <Feather name='home' size={s} color={c} />,
  },
  {
    id: 'leaderboard',
    href: '/leaderboard',
    labelKey: 'common.tabs.leaderboard',
    icon: (c, s) => <Feather name='bar-chart-2' size={s} color={c} />,
  },
  {
    id: 'contests',
    href: '/contests',
    labelKey: 'common.tabs.contests',
    icon: (c, s) => <Feather name='zap' size={s} color={c} />,
  },
  {
    id: 'analytics',
    href: '/analytics',
    labelKey: 'common.tabs.analytics',
    icon: (c, s) => <Feather name='pie-chart' size={s} color={c} />,
  },
  {
    id: 'profile',
    href: '/profile',
    labelKey: 'common.tabs.profile',
    icon: (c, s) => <Feather name='user' size={s} color={c} />,
  },
];

interface TabItemProps {
  tab: TabDefs;
  isSelected: boolean;
  onPress: () => void;
}
function TabItem({ tab, isSelected, onPress }: TabItemProps) {
  const { theme } = useTheme();
  const { setBottomBarSelectedId } = useLayoutContext();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const label = theme.i18n.t(tab.labelKey);

  const handlePress = useCallback(() => {
    if (isSelected) return;
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
  }, [tab.id, isSelected, onPress, scaleAnim, setBottomBarSelectedId]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole='button'
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
      style={
        {
          flex: 1,
          outlineWidth: 0,
          alignItems: 'center',
          justifyContent: 'flex-start',
        } as ViewStyle
      }
    >
      <Animated.View
        style={{
          gap: theme.space.xs * 0.75,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: scaleAnim }],
        }}
      >
        {tab.icon(
          isSelected ? theme.color.accent : theme.color.textMuted,
          ICON_SIZE
        )}

        <Animated.Text
          numberOfLines={1}
          style={{
            letterSpacing: 0.1,
            color: isSelected ? theme.color.accent : theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            fontWeight: isSelected ? theme.fontWeight.bold : theme.fontWeight.regular,
            fontFamily: isSelected ? theme.fontFamily.regular : theme.fontFamily.light,
          }}
        >
          {label}
        </Animated.Text>

        <View
          style={{
            width: 20,
            height: 3,
            marginTop: theme.space.xs * 0.25,
            borderRadius: theme.borderRadius.sm * 0.5,
            backgroundColor: isSelected ? theme.color.accent : 'transparent',
          }}
        />
      </Animated.View>
    </Pressable>
  );
}


export function AppBottomBar() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { layoutData, _setBottomBarHeight } = useLayoutContext();

  const isWeb = Platform.OS === 'web';
  const safeBottom = isWeb ? 0 : insets.bottom;

  if (!layoutData.bottomBarVisible) return null;

  return (
    <View
      style={{
        position: isWeb ? ('fixed' as any) : 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        pointerEvents: 'box-none',
      }}
    >
      <View
        onLayout={(e) => _setBottomBarHeight(e.nativeEvent.layout.height)}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-around',
          paddingTop: theme.space.sm,
          paddingBottom: safeBottom > 0 ? safeBottom : theme.space.sm,
          paddingHorizontal: 0,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.color.border,
          backgroundColor: theme.color.card,
          elevation: 12,
          boxShadow: theme.isDark ? '0px -2px 8px rgba(0, 0, 0, 0.3)' : '0px -2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        {TABS.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isSelected={layoutData.bottomBarSelectedId === tab.id}
            onPress={() => router.navigate(tab.href)}
          />
        ))}
      </View>
    </View>
  );
}
