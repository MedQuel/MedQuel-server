import React from 'react';
import { View } from 'react-native';

import { FeatureCard } from '../../components/TestCard';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <FeatureCard
        icon='home'
        title='Home'
        subtitle='Welcome to the home screen'
        iconBackground='#eee'
      />
    </View>
  );
}
