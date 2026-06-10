import { View, Text } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';


export default function ChatScreen() {
  const { theme } = useTheme();
  useBottomBar(true, 'chat');

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <Text style={{ color: theme.color.textPrimary, fontFamily: theme.fontFamily.text }}>
        Chat Screen!
      </Text>
    </View>
  );
}
