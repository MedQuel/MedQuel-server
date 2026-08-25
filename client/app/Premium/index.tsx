import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";

import { useTheme } from "../../theme/ThemeContext";

type Plan = "free" | "monthly" | "annual";

export default function PremiumScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const [selectedPlan, setSelectedPlan] = useState<Plan>("annual");

  const isCompact = width < theme.space.xxl * 16;

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
        gap: theme.space.sm,
        marginBottom: theme.space.sm,
      }}
    >
      <View
        style={{
          width: theme.space.lg,
          height: theme.space.lg,
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
          size={theme.fontSize.xs}
          color={theme.color.textInverse}
        />
      </View>

      <Text
        style={{
          flex: 1,
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.md,
          fontFamily: theme.fontFamily.regular,
          lineHeight:
            theme.fontSize.md * theme.lineHeight.normal,
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
        gap: theme.space.md,
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
            width: theme.space.xxl + theme.space.sm,
            height: theme.space.xxl + theme.space.sm,
            borderRadius: theme.borderRadius.lg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="crown-outline"
            size={theme.fontSize.xxl}
            color={theme.color.textInverse}
          />
        </LinearGradient>
      ) : (
        <View
          style={{
            width: theme.space.xxl + theme.space.sm,
            height: theme.space.xxl + theme.space.sm,
            borderRadius: theme.borderRadius.lg,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.color.surface,
          }}
        >
          <Feather
            name="zap"
            size={theme.fontSize.xxl}
            color={theme.color.accent}
          />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xl,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {premium ? "Premium" : "Free Plan"}
        </Text>

        <Text
          style={{
            marginTop: theme.space.xs,
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
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
        height: theme.space.xs / theme.space.xs,
        backgroundColor: theme.color.border,
        marginVertical: theme.space.lg,
      }}
    />
  );

  const FreePlan = () => (
    <View
      style={{
        width: "100%",
        padding: theme.space.lg,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        borderWidth: theme.space.xs / theme.space.xs,
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
          marginTop: theme.space.xl,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedPlan("free")}
          style={{
            minHeight:
              theme.space.xxl + theme.space.sm,
            borderRadius: theme.borderRadius.md,
            borderWidth:
              theme.space.xs / theme.space.xs,
            borderColor: theme.color.accent,
            backgroundColor: theme.color.surface,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: theme.space.sm,
          }}
        >
          <Feather
            name="download"
            size={theme.fontSize.lg}
            color={theme.color.accent}
          />

          <Text
            style={{
              color: theme.color.accent,
              fontSize: theme.fontSize.md,
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
        padding: theme.space.lg,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        borderWidth:
          theme.space.xs / theme.space.xs,
        borderColor: theme.color.premium,
      }}
    >
      {/* Popular */}
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          paddingVertical: theme.space.xs,
          paddingHorizontal: theme.space.md,
          backgroundColor: theme.color.premium,
          borderBottomLeftRadius: theme.borderRadius.md,
          borderTopRightRadius: theme.borderRadius.xl,
        }}
      >
        <Text
          style={{
            color: theme.color.textInverse,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          MOST POPULAR
        </Text>
      </View>

      <PlanHeader premium />

      {/* Pricing */}
      <View
        style={{
          marginTop: theme.space.lg,
          padding: theme.space.md,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.surface,
          borderWidth:
            theme.space.xs / theme.space.xs,
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
              fontSize: isCompact
                ? theme.fontSize.xxl
                : theme.fontSize.xxxl,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {pricing.price}
          </Text>

          <Text
            style={{
              marginLeft: theme.space.xs,
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {pricing.period}
          </Text>
        </View>

        <Text
          style={{
            marginTop: theme.space.xs,
            color: theme.color.premium,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {pricing.label}
        </Text>

        {pricing.saving && (
          <View
            style={{
              alignSelf: "flex-start",
              marginTop: theme.space.sm,
              paddingVertical: theme.space.xs,
              paddingHorizontal: theme.space.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.success,
            }}
          >
            <Text
              style={{
                color: theme.color.textInverse,
                fontSize: theme.fontSize.xs,
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
          marginTop: theme.space.lg,
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
              minHeight:
                theme.space.xxl + theme.space.sm,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.space.sm,
            }}
          >
            <MaterialCommunityIcons
              name="crown-outline"
              size={theme.fontSize.lg}
              color={theme.color.textInverse}
            />

            <Text
              style={{
                color: theme.color.textInverse,
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              Get Premium
            </Text>

            <Feather
              name="arrow-right"
              size={theme.fontSize.md}
              color={theme.color.textInverse}
            />
          </LinearGradient>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: theme.space.xs,
            marginTop: theme.space.sm,
          }}
        >
          <Feather
            name="shield"
            size={theme.fontSize.xs}
            color={theme.color.textMuted}
          />

          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.xs,
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
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space.sm,
        padding: theme.space.sm,
      }}
    >
      <View
        style={{
          width: theme.space.xl,
          height: theme.space.xl,
          borderRadius: theme.borderRadius.md,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.color.surface,
        }}
      >
        <Feather
          name={icon}
          size={theme.fontSize.md}
          color={theme.color.accent}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            marginTop: theme.space.xs,
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.xs,
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
      {/* Close */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: theme.space.md,
          right: theme.space.md,
          width: theme.space.xxl,
          height: theme.space.xxl,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.color.card,
          borderWidth:
            theme.space.xs / theme.space.xs,
          borderColor: theme.color.border,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <Feather
          name="x"
          size={theme.fontSize.lg}
          color={theme.color.textSecondary}
        />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: theme.space.xxl + theme.space.lg,
          paddingBottom: theme.space.xxl,
          paddingHorizontal: theme.space.md,
        }}
      >
        {/* Hero */}
        <View
          style={{
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.space.xs,
              paddingVertical: theme.space.xs,
              paddingHorizontal: theme.space.md,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.surface,
              borderWidth:
                theme.space.xs / theme.space.xs,
              borderColor: theme.color.border,
            }}
          >
           <MaterialCommunityIcons
  name="creation"
  size={theme.fontSize.sm}
  color={theme.color.warning}
/>
            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              Level up your preparation
            </Text>
          </View>

          <Text
            style={{
              marginTop: theme.space.md,
              color: theme.color.textPrimary,
              fontSize: isCompact
                ? theme.fontSize.xxl
                : theme.fontSize.xxxl,
              lineHeight:
                (isCompact
                  ? theme.fontSize.xxl
                  : theme.fontSize.xxxl) *
                theme.lineHeight.tight,
              fontFamily: theme.fontFamily.bold,
              textAlign: "center",
            }}
          >
            Start your{" "}
            <Text
              style={{
                color: theme.color.accent,
              }}
            >
              gamified medical quiz journey
            </Text>{" "}
            today
          </Text>

          <Text
            style={{
              marginTop: theme.space.sm,
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.regular,
              textAlign: "center",
            }}
          >
            Download the app for free and start competing in
            minutes!
          </Text>
        </View>

        {/* Plan Chips */}
        <View
          style={{
            alignSelf: "center",
            flexDirection: "row",
            marginTop: theme.space.lg,
            padding: theme.space.xs,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.surface,
            borderWidth:
              theme.space.xs / theme.space.xs,
            borderColor: theme.color.border,
          }}
        >
          {(["free", "monthly", "annual"] as Plan[]).map(
            (plan) => {
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
                    paddingVertical: theme.space.sm,
                    paddingHorizontal: theme.space.md,
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: active
                      ? theme.color.accent
                      : theme.color.surface,
                  }}
                >
                  <Text
                    style={{
                      color: active
                        ? theme.color.textInverse
                        : theme.color.textSecondary,
                      fontSize: theme.fontSize.sm,
                      fontFamily: active
                        ? theme.fontFamily.bold
                        : theme.fontFamily.regular,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </View>

        {/* Selected Plan */}
        <View
          style={{
            width: "100%",
            alignSelf: "center",
            marginTop: theme.space.xl,
          }}
        >
          {selectedPlan === "free" ? (
            <FreePlan />
          ) : (
            <PremiumPlan />
          )}
        </View>

        {/* Trust */}
        <View
          style={{
            width: "100%",
            marginTop: theme.space.xl,
            padding: theme.space.sm,
            borderRadius: theme.borderRadius.xl,
            backgroundColor: theme.color.card,
            borderWidth:
              theme.space.xs / theme.space.xs,
            borderColor: theme.color.border,
            gap: theme.space.xs,
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