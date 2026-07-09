import { View, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useBottomBar } from "../../common/context/useBottomBar";
import { ProfileScreen } from "../../components/ProfileScreen";
import { ProfileScreenBoxes } from "../../components/ProfileScreenBoxes";
import { PremiumUpsellCard } from "../../components/PremiumUpsellCard";
import { SubjectPerformanceCard } from "../../components/SubjectPerformanceCard";
import { AttemptHistoryItemCard } from "../../components/AttemptHistoryItemCard";

export default function ChatScreen() {
  const { theme } = useTheme();
  const level = '12';
  useBottomBar(true, "profile");


  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.color.background }}
    showsVerticalScrollIndicator={false}
     contentContainerStyle={{ flexGrow: 1, paddingBottom: 70 }}>
      
      <ProfileScreen />

      <View
        style={{
          alignItems: "center",
          marginTop: theme.space.xxl - 4,
          gap: theme.space.xs,
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

        <View style={{ flexDirection: "row", gap: 8 }}>
          <View
            style={{
              backgroundColor: theme.color.card,
              paddingHorizontal: theme.space.md,
              paddingVertical: theme.space.xs - 7,
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.color.border,
              justifyContent: "center",
              borderRadius: theme.borderRadius.md,
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
              backgroundColor: theme.color.warning + "22",
              paddingHorizontal: theme.space.sm + 1,
              paddingVertical: theme.space.xs - 2,
              borderWidth: 0.5,
              borderColor: theme.color.warning + "22",
              borderRadius: theme.borderRadius.md,
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Text style={{ fontSize: theme.space.sm }}>
              <MaterialCommunityIcons
              name='star'
              size={theme.space.md-5}
              color={theme.color.warning}>
                
              </MaterialCommunityIcons>
            </Text>
            <Text
              style={{
                color: theme.color.warning,
                fontSize: theme.fontSize.xs,
              }}
            >
             {theme.i18n.t('components.ProfileCard.level', { level: level }) }12
            </Text>
          </View>
        </View>

        {/* Location & EP */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.space.md,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.space.sm - 2,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={theme.space.md - 2}
              color={theme.color.textMuted}
            />
            <Text
              style={{
                color: theme.color.textMuted,
                fontSize: theme.fontSize.xs,
              }}
            >
              {theme.i18n.t('components.ProfileCard.location')}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <MaterialCommunityIcons
              name="lightning-bolt-outline"
              size={theme.space.md - 2}
              color={theme.color.info}
            />
            <Text
              style={{
                color: theme.color.info,
                fontWeight: theme.fontWeight.bold,
                fontSize: theme.fontSize.xs - 1.5,
              }}
            >
              2,847 EP
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          marginTop: -10,
          paddingHorizontal: theme.space.xs,
        }}
      >
        <ProfileScreenBoxes />
      </View>
      <View
        style={{
          paddingHorizontal: theme.space.sm + 4,
          marginTop: theme.space.sm + 2,
        }}
      >
        <PremiumUpsellCard></PremiumUpsellCard>
      </View>
      <View
        style={{
          paddingHorizontal: theme.space.sm + 4,
          marginTop: theme.space.sm + 2,
        }}
      >
        <SubjectPerformanceCard></SubjectPerformanceCard>
      </View>
      <View
        style={{
          paddingHorizontal: theme.space.sm + 4,
          marginTop: theme.space.sm + 2,
        }}
      >
        <AttemptHistoryItemCard />
      </View>
    </ScrollView>
  );
}
