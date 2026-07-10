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
  const { theme } = useTheme();
  useBottomBar(true, 'profile');

  const level = '12';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.color.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 70 }}
    >
      <ProfileScreenHeader />

      <View
        style={{
          gap: theme.space.xs,
          alignItems: 'center',
          marginTop: theme.space.xxl - 4,
        }}
      >
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t('components.ProfileCard.name')}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.xs - 7,
              paddingHorizontal: theme.space.md,
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.color.card,
            }}
          >
            <Text
              style={{
                color: theme.color.accent,
                fontWeight: theme.fontWeight.bold,
                fontSize: theme.fontSize.xs - 1,
              }}
            >
              Medical student
            </Text>
          </View>

          <View
            style={{
              gap: 3,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.space.xs - 2,
              paddingHorizontal: theme.space.sm + 1,
              borderWidth: 0.5,
              borderColor: theme.color.warning + '22',
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.color.warning + '22',
            }}
          >
            <Text style={{ fontSize: theme.space.sm }}>
              <MaterialCommunityIcons
                name='star'
                size={theme.space.md - 5}
                color={theme.color.warning}
              />
            </Text>
            <Text style={{ color: theme.color.warning, fontSize: theme.fontSize.xs }}>
              {theme.i18n.t('components.ProfileCard.level', { level: level })}12
            </Text>
          </View>
        </View>

        <View style={{ gap: theme.space.md, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ gap: theme.space.sm - 2, flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name='map-marker-outline'
              size={theme.space.md - 2}
              color={theme.color.textMuted}
            />
            <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs }}>
              {theme.i18n.t('components.ProfileCard.location')}
            </Text>
          </View>

          <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name='lightning-bolt-outline'
              size={theme.space.md - 2}
              color={theme.color.info}
            />
            <Text
              style={{
                color: theme.color.info,
                fontSize: theme.fontSize.xs - 1.5,
                fontWeight: theme.fontWeight.bold,
              }}
            >
              2,847 EP
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: -theme.space.sm, paddingHorizontal: theme.space.xs }}>
        <ProfileScreenStatsCard />
      </View>

      <View style={{ marginTop: theme.space.sm + 2, paddingHorizontal: theme.space.sm + 4 }}>
        <PremiumUpsellCard />
      </View>

      <View style={{ marginTop: theme.space.sm + 2, paddingHorizontal: theme.space.sm + 4 }}>
        <SubjectPerformanceCard />
      </View>

      <View style={{ marginTop: theme.space.sm + 2, paddingHorizontal: theme.space.sm + 4 }}>
        <AttemptHistoryItemCard />
      </View>
    </ScrollView>
  );
}
