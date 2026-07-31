import { View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';
import { ProfileScreenHeader } from './profileScreenHeader';
import { useBottomBar } from '../../common/context/useBottomBar';
import { PremiumUpsellCard } from '../../components/PremiumUpsellCard';
import { ProfileScreenStatsCard } from '../../components/ProfileScreenStatsCard';
import { SubjectPerformanceCard } from '../../components/SubjectPerformanceCard';
import { AttemptHistoryItemCard } from '../../components/AttemptHistoryItemCard';


export default function ChatScreen() {
  const level = '12';

  const { theme } = useTheme();
  useBottomBar(true, 'profile');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.color.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 75 }}
    >
      <ProfileScreenHeader />

      <View style={{ gap: theme.space.xs * 1.5, alignItems: 'center', marginTop: theme.space.xxl - 2 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg + 2,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t('components.ProfileCard.name')}
        </Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.xs - 5,
              paddingHorizontal: theme.space.md + 2,
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.md + 2,
              backgroundColor: theme.color.card,
            }}
          >
            <Text
              style={{
                color: theme.color.accent,
                fontWeight: theme.fontWeight.bold,
                fontSize: theme.fontSize.xs + 1,
              }}
            >
              Medical student
            </Text>
          </View>

          <View
            style={{
              gap: 5,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.space.xs,
              paddingHorizontal: theme.space.sm + 3,
              borderWidth: 0.5,
              borderColor: theme.color.warning + '22',
              borderRadius: theme.borderRadius.md + 2,
              backgroundColor: theme.color.warning + '22',
            }}
          >
            <Text style={{ fontSize: theme.space.sm + 2 }}>
              <MaterialCommunityIcons
                name='star'
                size={theme.space.md - 3}
                color={theme.color.warning}
              />
            </Text>
            <Text
              style={{
                color: theme.color.warning,
                fontSize: theme.fontSize.xs + 2,
              }}
            >
              {theme.i18n.t('components.ProfileCard.level', { level: level })}12
            </Text>
          </View>
        </View>

        <View style={{ gap: theme.space.md + 2, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name='map-marker-outline'
              size={theme.space.md}
              color={theme.color.textMuted}
            />
            <Text
              style={{
                color: theme.color.textMuted,
                fontSize: theme.fontSize.xs + 2,
              }}
            >
              {theme.i18n.t('components.ProfileCard.location')}
            </Text>
          </View>

          <View style={{ gap: theme.space.xs + 2, flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name='lightning-bolt-outline'
              size={theme.space.md}
              color={theme.color.info}
            />
            <Text
              style={{
                color: theme.color.info,
                fontSize: theme.fontSize.xs + 0.5,
                fontWeight: theme.fontWeight.bold,
              }}
            >
              2,847 EP
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: -theme.space.sm, paddingHorizontal: theme.space.xs * 1.5 }}>
        <ProfileScreenStatsCard />
      </View>

      <View style={{ marginTop: theme.space.sm * 1.5, paddingHorizontal: theme.space.md }}>
        <PremiumUpsellCard />
      </View>

      <View style={{ marginTop: theme.space.sm * 1.5, paddingHorizontal: theme.space.md }}>
        <SubjectPerformanceCard />
      </View>

      <View style={{ marginTop: theme.space.sm * 1.5, paddingHorizontal: theme.space.md }}>
        <AttemptHistoryItemCard />
      </View>
    </ScrollView>
  );
}
