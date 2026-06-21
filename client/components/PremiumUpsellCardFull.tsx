import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from "../theme/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";


export function PremiumUpsellCardFull ()  {
    const {theme} = useTheme()
    const {isDark} = theme
  return (
    <View
      style={{
        backgroundColor: isDark?theme.color.background:theme.color.surface,
        borderRadius: theme.borderRadius.lg + 3,
        padding: theme.space.sm + 1,
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
          size={theme.space.md + 7 }
          color={theme.color.premium + "FF"}
        />
        </Text>

        <View>
          <Text
            style={{
              color:theme.color.premium + 'FF',
              fontSize: theme.fontSize.sm,
              fontWeight:theme.fontWeight.bold,
            }}
          >
           MedQuel {theme.i18n.t("common.premium")}
          </Text>

          <Text
            style={{
              color:theme.color.textSecondary,
              fontSize:theme.fontSize.xs ,
              marginTop:theme.space.xs-3,
            }}
          >
             {theme.i18n.t("common.start_contest")}
          </Text>
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity
        activeOpacity={0.8}
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
            fontSize:theme.fontSize.sm + 0.2,
            fontWeight: theme.fontWeight.bold,
          }}
        >
          {theme.i18n.t("components.FeatureContestCard.join_now")}→
        </Text>
      </TouchableOpacity>
    </View>
  );
};

