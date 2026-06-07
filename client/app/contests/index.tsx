import { View, Text } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


export default function ChatScreen() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <Text
        style={{
          color: theme.color.textPrimary,
          fontFamily: theme.fontFamily.text,
        }}
      >
        Contests Screen!
      </Text>
    </View>
  );
}
