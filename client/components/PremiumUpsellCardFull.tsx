import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from "../theme/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";


export function PremiumUpsellCardFull ()  {
    const {theme} = useTheme()
    const {isDark} = theme
    const router = useRouter()
  return (
    <View
      style={{
        backgroundColor: theme.color.card,
        borderRadius: theme.borderRadius.lg + 3,
        paddingVertical:theme.space.xs +4,
        paddingHorizontal:theme.space.md,
        borderWidth: 1,
        borderColor:theme.color.border,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom:theme.space.md,
        }}
      >
        <Text
          style={{
            
            paddingRight:theme.space.sm,
          }}
        >
          <MaterialCommunityIcons
          name="crown-outline"
          size={theme.space.md + 6 }
          color={theme.color.premium}
        />
        </Text>

        <View>
          <Text
            style={{
              color:theme.color.premium + 'FF',
              fontSize: theme.fontSize.sm+2,
              fontWeight:theme.fontWeight.bold,
              fontFamily:theme.fontFamily.regular,
            }}
          >
           MedQuel {theme.i18n.t("common.premium")}
          </Text>

          <Text
            style={{
              color:theme.color.textSecondary,
              fontSize:theme.fontSize.xs+2 ,
              marginTop:theme.space.xs-3,
              fontFamily:theme.fontFamily.regular,
              fontWeight: theme.fontWeight.bold,
            }}
          >
             {theme.i18n.t("common.start_contest")}
          </Text>
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/Premium')}
        style={{
          backgroundColor:theme.color.premium+'AA' ,
          borderRadius: theme.borderRadius.lg -2,
          paddingVertical:theme.space.sm + 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color:isDark ?theme.color.textPrimary + 'FF':theme.color.textInverse,
            fontSize:theme.fontSize.sm + 1.2,
            fontWeight: theme.fontWeight.bold,
            fontFamily:theme.fontFamily.regular,
          }}
        >
          {theme.i18n.t("components.FeatureContestCard.join_now")}   →
        </Text>
      </TouchableOpacity>
    </View>
  );
};