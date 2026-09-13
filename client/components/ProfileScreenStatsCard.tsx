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
    <View style={{ gap: theme.space.sm, flexDirection: 'row', justifyContent: 'space-between' }}>
      {stats.map((item, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.md,
            paddingHorizontal: theme.space.xs,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.xl,
            backgroundColor: theme.color.card,
            gap: 4,
          }}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={theme.space.md * 1.3}
            color={item.color}
          />
          <Text
            style={{
              color: item.color,
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {item.value}
          </Text>

          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
