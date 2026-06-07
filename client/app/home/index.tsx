import { View } from 'react-native';

import { FeatureCard } from '../../components/TestCard';
import { useTheme } from '../../theme/ThemeContext';

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <FeatureCard
        icon='home'
        title={theme.i18n.t('components.test_card.title')}
        subtitle={theme.i18n.t('components.test_card.subtitle')}
      />
    </View>
  );
}
