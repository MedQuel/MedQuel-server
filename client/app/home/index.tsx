import { View } from 'react-native';

import { FeatureCard } from '../../components/TestCard';
import { useTheme } from '../../theme/ThemeContext';


export default function HomeScreen() {
  const theme = useTheme().theme;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.color.background,
      }}
    >
      <FeatureCard
        icon='home'
        title='Home Screen'
        subtitle='Welcome to the home screen'
      />
    </View>
  );
}
