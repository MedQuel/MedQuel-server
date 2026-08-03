import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

type Stat = {
  label: string;
  value: string;
  color: string;
  icon: string;
};

type Props = {
  stats: Stat[];
};

export function ProfileScreenStatsCard({ stats }: Props) {
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