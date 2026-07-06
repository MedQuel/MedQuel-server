import { View, Text } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';

export default function HomeScreen() {
  const { theme } = useTheme();
  useBottomBar(false);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <Text
        style={{
          color: theme.color.textPrimary,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        Sign Up Screen!
      </Text>
    </View>
  );
}
