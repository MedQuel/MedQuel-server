import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


const stats = [
  { label: 'Level', value: '12', color: '#F59E0B', icon: 'star' },
  { label: 'Rank', value: '#127', color: '#3B82F6', icon: 'trending-up' },
  { label: 'Streak', value: '24', color: '#EF4444', icon: 'fire' },
  { label: 'Accuracy', value: '87%', color: '#22C55E', icon: 'bullseye' },
];

export function ProfileScreenStatsCard() {
  const { theme } = useTheme();

  return (
   <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.space.lg,
        paddingHorizontal: theme.space.md + 6,
      }}
    >
      {stats.map((item, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: theme.space.sm + 8,
            marginHorizontal: theme.space.xs,
            borderWidth: 1.5,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.isDark ? theme.color.card : theme.color.card,
          }}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={theme.space.md + 6}
            color={item.color}
          />

          <Text
            style={{
              color: item.color,
              fontSize: theme.fontSize.md + 1,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
              marginTop: theme.space.xs * 0.5,
            }}
          >
            {item.value}
          </Text>

          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs + 1,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.xs * 0.5,
            }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
