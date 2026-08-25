import { useMemo, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  useRouter,
  useNavigation,
  useFocusEffect,
} from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "../../theme/ThemeContext";

type Plan = "free" | "monthly" | "annual";

export default function PremiumScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [selectedPlan, setSelectedPlan] = useState<Plan>("annual");

  // Bottom tab bar hiding logic for this screen only
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();

      parent?.setOptions({
        tabBarStyle: { display: "none" },
      });

      return () => {
        parent?.setOptions({
          tabBarStyle: undefined,
        });
      };
    }, [navigation])
  );

  // Safe Close Button Handler
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const freeFeatures = [
    "Access to basic quizzes",
    "Community chat & discussions",
    "Weekly contests",
    "Basic analytics dashboard",
    "Profile & achievements",
    "Leaderboard access",
  ];

  const premiumFeatures = [
    "Everything in Free plan",
    "Unlimited quiz attempts",
    "Advanced performance analytics",
    "Exclusive premium contests",
    "Priority support",
    "Ad-free experience",
    "Early access to new quizzes",
    "Personalized challenge recommendations",
  ];

  const pricing = useMemo(() => {
    if (selectedPlan === "monthly") {
      return {
        price: "₹299",
        period: "/ month",
        label: "Monthly plan",
        saving: null,
      };
    }

    return {
      price: "₹2,499",
      period: "/ year",
      label: "Annual plan",
      saving: "Save 20%",
    };
  }, [selectedPlan]);

  const FeatureItem = ({
    text,
    premium = false,
  }: {
    text: string;
    premium?: boolean;
  }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space.xs + 2,
        marginBottom: theme.space.xs + 2,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: theme.borderRadius.full,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: premium
            ? theme.color.premium
            : theme.color.success,
        }}
      >
        <Feather
          name="check"
          size={12}
          color={theme.color.textInverse}
        />
      </View>

      <Text
        style={{
          flex: 1,
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.sm,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {text}
      </Text>
    </View>
  );

  const PlanHeader = ({
    premium = false,
  }: {
    premium?: boolean;
  }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space.sm,
      }}
    >
      {premium ? (
        <LinearGradient
          colors={[
            theme.color.premium,
            theme.color.accent,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.borderRadius.md,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="crown-outline"
            size={22}
            color={theme.color.textInverse}
          />
        </LinearGradient>
      ) : (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.borderRadius.md,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.color.surface,
          }}
        >
          <Feather
            name="zap"
            size={22}
            color={theme.color.accent}
          />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {premium ? "Premium" : "Free Plan"}
        </Text>

        <Text
          style={{
            marginTop: 2,
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {premium
            ? "Unlock full potential"
            : "Get started today"}
        </Text>
      </View>
    </View>
  );

  const Divider = () => (
    <View
      style={{
        height: 1,
        backgroundColor: theme.color.border,
        marginVertical: theme.space.md,
      }}
    />
  );

  const FreePlan = () => (
    <View
      style={{
        width: "100%",
        padding: theme.space.md,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.color.card,
        borderWidth: 1,
        borderColor: theme.color.border,
      }}
    >
      <PlanHeader />

      <Divider />

      <View>
        {freeFeatures.map((feature) => (
          <FeatureItem
            key={feature}
            text={feature}
          />
        ))}
      </View>

      <View
        style={{
          marginTop: theme.space.md,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedPlan("free")}
          style={{
            height: 44,
            borderRadius: theme.borderRadius.md,
            borderWidth: 1,
            borderColor: theme.color.accent,
            backgroundColor: theme.color.surface,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: theme.space.xs,
          }}
        >
          <Feather
            name="download"
            size={16}
            color={theme.color.accent}
          />

          <Text
            style={{
              color: theme.color.accent,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            Continue Free
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const PremiumPlan = () => (
    <View
      style={{
        width: "100%",
        padding: theme.space.md,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.color.card,
        borderWidth: 1,
        borderColor: theme.color.premium,
        overflow: "hidden",
      }}
    >
      {/* Popular Badge */}
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          paddingVertical: 3,
          paddingHorizontal: theme.space.sm,
          backgroundColor: theme.color.premium,
          borderBottomLeftRadius: theme.borderRadius.md,
        }}
      >
        <Text
          style={{
            color: theme.color.textInverse,
            fontSize: 10,
            fontFamily: theme.fontFamily.bold,
            letterSpacing: 0.5,
          }}
        >
          MOST POPULAR
        </Text>
      </View>

      <PlanHeader premium />

      {/* Pricing */}
      <View
        style={{
          marginTop: theme.space.md,
          padding: theme.space.sm,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.color.surface,
          borderWidth: 1,
          borderColor: theme.color.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xl,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {pricing.price}
          </Text>

          <Text
            style={{
              marginLeft: 4,
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {pricing.period}
          </Text>
        </View>

        <Text
          style={{
            marginTop: 2,
            color: theme.color.premium,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {pricing.label}
        </Text>

        {pricing.saving && (
          <View
            style={{
              alignSelf: "flex-start",
              marginTop: 6,
              paddingVertical: 2,
              paddingHorizontal: theme.space.xs + 2,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.success,
            }}
          >
            <Text
              style={{
                color: theme.color.textInverse,
                fontSize: 10,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {pricing.saving}
            </Text>
          </View>
        )}
      </View>

      <Divider />

      <View>
        {premiumFeatures.map((feature) => (
          <FeatureItem
            key={feature}
            text={feature}
            premium
          />
        ))}
      </View>

      <View
        style={{
          marginTop: theme.space.md,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {}}
          style={{
            borderRadius: theme.borderRadius.md,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={[
              theme.color.premium,
              theme.color.accent,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 44,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.space.xs,
            }}
          >
            <MaterialCommunityIcons
              name="crown-outline"
              size={18}
              color={theme.color.textInverse}
            />

            <Text
              style={{
                color: theme.color.textInverse,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              Get Premium
            </Text>

            <Feather
              name="arrow-right"
              size={16}
              color={theme.color.textInverse}
            />
          </LinearGradient>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
            marginTop: theme.space.xs,
          }}
        >
          <Feather
            name="shield"
            size={11}
            color={theme.color.textMuted}
          />

          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: 11,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            Cancel anytime • Secure payment
          </Text>
        </View>
      </View>
    </View>
  );

  const TrustItem = ({
    icon,
    title,
    subtitle,
  }: {
    icon: React.ComponentProps<typeof Feather>["name"];
    title: string;
    subtitle: string;
  }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space.sm,
        paddingVertical: theme.space.xs,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: theme.borderRadius.md,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.color.surface,
        }}
      >
        <Feather
          name={icon}
          size={16}
          color={theme.color.accent}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: 10,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.color.background,
      }}
    >
      {/* Fixed Close Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleClose}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={{
          position: "absolute",
          top: 20,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.color.card,
          borderWidth: 1,
          borderColor: theme.color.border,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          elevation: 10,
        }}
      >
        <Feather
          name="x"
          size={18}
          color={theme.color.textSecondary}
        />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 72,
          paddingBottom: theme.space.xl,
          paddingHorizontal: theme.space.md,
        }}
      >
        {/* Hero */}
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingVertical: 4,
              paddingHorizontal: theme.space.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.surface,
              borderWidth: 1,
              borderColor: theme.color.border,
            }}
          >
            <MaterialCommunityIcons
              name="creation"
              size={14}
              color={theme.color.warning}
            />
            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              Level up your preparation
            </Text>
          </View>

          <Text
            style={{
              marginTop: theme.space.sm,
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xl,
              fontFamily: theme.fontFamily.bold,
              textAlign: "center",
            }}
          >
            Start your{" "}
            <Text style={{ color: theme.color.accent }}>
              gamified medical quiz journey
            </Text>{" "}
            today
          </Text>

          <Text
            style={{
              marginTop: 4,
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.regular,
              textAlign: "center",
            }}
          >
            Download the app for free and start competing in minutes!
          </Text>
        </View>

        {/* Plan Chips */}
        <View
          style={{
            alignSelf: "center",
            flexDirection: "row",
            marginTop: theme.space.md,
            padding: 3,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.surface,
            borderWidth: 1,
            borderColor: theme.color.border,
          }}
        >
          {(["free", "monthly", "annual"] as Plan[]).map((plan) => {
            const active = selectedPlan === plan;
            const label =
              plan === "free"
                ? "Free"
                : plan === "monthly"
                ? "Monthly"
                : "Annual";

            return (
              <TouchableOpacity
                key={plan}
                activeOpacity={0.8}
                onPress={() => setSelectedPlan(plan)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: theme.space.sm + 2,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: active
                    ? theme.color.accent
                    : "transparent",
                }}
              >
                <Text
                  style={{
                    color: active
                      ? theme.color.textInverse
                      : theme.color.textSecondary,
                    fontSize: theme.fontSize.xs,
                    fontFamily: active
                      ? theme.fontFamily.bold
                      : theme.fontFamily.regular,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Plan */}
        <View
          style={{
            width: "100%",
            marginTop: theme.space.md,
          }}
        >
          {selectedPlan === "free" ? <FreePlan /> : <PremiumPlan />}
        </View>

        {/* Trust Badges */}
        <View
          style={{
            width: "100%",
            marginTop: theme.space.md,
            padding: theme.space.sm,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.card,
            borderWidth: 1,
            borderColor: theme.color.border,
          }}
        >
          <TrustItem
            icon="shield"
            title="Secure & Safe"
            subtitle="Your data is protected"
          />
          <TrustItem
            icon="refresh-cw"
            title="Cancel Anytime"
            subtitle="No hidden charges"
          />
          <TrustItem
            icon="headphones"
            title="24/7 Support"
            subtitle="We're here for you"
          />
          <TrustItem
            icon="lock"
            title="Trusted by Students"
            subtitle="Loved by 50K+ users"
          />
        </View>
      </ScrollView>
    </View>
  );
}