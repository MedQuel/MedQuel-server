import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState, type ComponentProps } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';


type Plan = 'free' | 'monthly' | 'annual';
type IconName = ComponentProps<typeof Feather>['name'];

const freeFeatures = [
  'premium.features.basic_quizzes',
  'premium.features.community',
  'premium.features.weekly_contests',
  'premium.features.basic_analytics',
  'premium.features.profile',
  'premium.features.leaderboard',
];
const premiumFeatures = [
  'premium.features.everything_free',
  'premium.features.unlimited_attempts',
  'premium.features.advanced_analytics',
  'premium.features.exclusive_contests',
  'premium.features.priority_support',
  'premium.features.ad_free',
  'premium.features.early_access',
  'premium.features.recommendations',
];
const trustItems: { icon: IconName; title: string; subtitle: string }[] = [
  {
    icon: 'shield',
    title: 'premium.trust.secure',
    subtitle: 'premium.trust.secure_subtitle',
  },
  {
    icon: 'refresh-cw',
    title: 'premium.trust.cancel',
    subtitle: 'premium.trust.cancel_subtitle',
  },
  {
    icon: 'headphones',
    title: 'premium.trust.support',
    subtitle: 'premium.trust.support_subtitle',
  },
];

function FeatureItem({ text, premium, theme }: { text: string, premium: boolean, theme: any}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.xs + 2,
        marginBottom: theme.space.xs + 2,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: theme.borderRadius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: premium ? theme.color.premium : theme.color.success,
        }}
      >
        <Feather name='check' size={12} color={theme.color.textInverse} />
      </View>
      <Text
        style={{
          flex: 1,
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.sm,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {theme.i18n.t(text)}
      </Text>
    </View>
  );
}

function Divider({ theme }: { theme: any }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.color.border,
        marginVertical: theme.space.md,
      }}
    />
  );
}

function PlanHeader({ premium, isPremium, theme }: { premium: boolean, isPremium: boolean, theme: any }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.sm,
      }}
    >
      {premium ? (
        <LinearGradient
          colors={[theme.color.premium, theme.color.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons
            name='crown-outline'
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
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.color.surface,
          }}
        >
          <Feather name='zap' size={22} color={theme.color.accent} />
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
          {premium
            ? theme.i18n.t('premium.premium_plan')
            : theme.i18n.t('premium.free_plan')}
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
            ? theme.i18n.t('premium.premium_subtitle')
            : theme.i18n.t('premium.free_subtitle')}
        </Text>
      </View>
      {premium === isPremium && (
        <View
          style={{
            paddingVertical: 4,
            paddingHorizontal: theme.space.xs,
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
            {theme.i18n.t('premium.active')}
          </Text>
        </View>
      )}
    </View>
  );
}


export default function PremiumScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isPremium } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');
  useBottomBar(false);

  const pricing = useMemo(
    () =>
      selectedPlan === 'monthly'
        ? {
            price: '₹299',
            period: theme.i18n.t('premium.per_month'),
            label: theme.i18n.t('premium.monthly_plan'),
            saving: null,
          }
        : {
            price: '₹2,499',
            period: theme.i18n.t('premium.per_year'),
            label: theme.i18n.t('premium.annual_plan'),
            saving: theme.i18n.t('premium.save_20'),
          },
    [selectedPlan, theme.i18n]
  );

  const handleClose = () =>
    router.canGoBack() ? router.back() : router.replace('/');
  const handleUpgrade = () =>
    Alert.alert(
      theme.i18n.t('premium.billing_unavailable_title'),
      theme.i18n.t('premium.billing_unavailable_message')
    );

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <TouchableOpacity
        accessibilityLabel={theme.i18n.t('common.close')}
        accessibilityRole='button'
        activeOpacity={0.7}
        onPress={handleClose}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={{
          position: 'absolute',
          top: 20,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.color.card,
          borderWidth: 1,
          borderColor: theme.color.border,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          elevation: 10,
        }}
      >
        <Feather name='x' size={18} color={theme.color.textSecondary} />
      </TouchableOpacity>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 72,
          paddingBottom: theme.space.xl,
          paddingHorizontal: theme.space.md,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('premium.eyebrow')}
          </Text>
          <Text
            style={{
              marginTop: theme.space.sm,
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xl,
              fontFamily: theme.fontFamily.bold,
              textAlign: 'center',
            }}
          >
            {theme.i18n.t('premium.title')}
          </Text>
          <Text
            style={{
              marginTop: 4,
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.regular,
              textAlign: 'center',
            }}
          >
            {theme.i18n.t('premium.subtitle')}
          </Text>
        </View>
        <View
          accessibilityRole='tablist'
          style={{
            alignSelf: 'center',
            flexDirection: 'row',
            marginTop: theme.space.md,
            padding: 3,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.surface,
            borderWidth: 1,
            borderColor: theme.color.border,
          }}
        >
          {(['free', 'monthly', 'annual'] as Plan[]).map((plan) => {
            const active = selectedPlan === plan;
            const label = theme.i18n.t(`premium.plans.${plan}`);
            return (
              <TouchableOpacity
                key={plan}
                accessibilityRole='tab'
                accessibilityLabel={label}
                accessibilityState={{ selected: active }}
                activeOpacity={0.8}
                onPress={() => setSelectedPlan(plan)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: theme.space.sm + 2,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: active ? theme.color.accent : 'transparent',
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
        <View style={{ marginTop: theme.space.md }}>
          {selectedPlan === 'free' ? (
            <View
              style={{
                padding: theme.space.md,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.card,
                borderWidth: 1,
                borderColor: theme.color.border,
              }}
            >
              <PlanHeader premium={false} isPremium={isPremium} theme={theme} />
              <Divider theme={theme} />
              {freeFeatures.map((feature) => (
                <FeatureItem
                  key={feature}
                  text={feature}
                  premium={false}
                  theme={theme}
                />
              ))}
              <TouchableOpacity
                accessibilityRole='button'
                accessibilityState={{ disabled: !isPremium }}
                disabled={!isPremium}
                onPress={() => setSelectedPlan('free')}
                style={{
                  height: 44,
                  marginTop: theme.space.md,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: 1,
                  borderColor: theme.color.accent,
                  backgroundColor: theme.color.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: theme.space.xs,
                  opacity: isPremium ? 1 : 0.75,
                }}
              >
                <Feather
                  name={isPremium ? 'check-circle' : 'download'}
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
                  {isPremium
                    ? theme.i18n.t('premium.switch_to_free')
                    : theme.i18n.t('premium.current_plan')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                padding: theme.space.md,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.card,
                borderWidth: 1,
                borderColor: theme.color.premium,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  position: 'absolute',
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
                  }}
                >
                  {theme.i18n.t('premium.most_popular')}
                </Text>
              </View>
              <PlanHeader premium isPremium={isPremium} theme={theme} />
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
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
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
                  <Text
                    style={{
                      marginTop: 6,
                      color: theme.color.success,
                      fontSize: theme.fontSize.xs,
                      fontFamily: theme.fontFamily.bold,
                    }}
                  >
                    {pricing.saving}
                  </Text>
                )}
              </View>
              <Divider theme={theme} />
              {premiumFeatures.map((feature) => (
                <FeatureItem
                  key={feature}
                  text={feature}
                  premium
                  theme={theme}
                />
              ))}
              <TouchableOpacity
                accessibilityRole='button'
                accessibilityState={{ disabled: isPremium }}
                activeOpacity={0.88}
                disabled={isPremium}
                onPress={handleUpgrade}
                style={{
                  height: 44,
                  marginTop: theme.space.md,
                  borderRadius: theme.borderRadius.md,
                  overflow: 'hidden',
                  opacity: isPremium ? 0.75 : 1,
                }}
              >
                <LinearGradient
                  colors={[theme.color.premium, theme.color.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme.space.xs,
                  }}
                >
                  <MaterialCommunityIcons
                    name='crown-outline'
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
                    {isPremium
                      ? theme.i18n.t('premium.current_plan')
                      : theme.i18n.t('premium.get_premium')}
                  </Text>
                  {!isPremium && (
                    <Feather
                      name='arrow-right'
                      size={16}
                      color={theme.color.textInverse}
                    />
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <Text
                style={{
                  marginTop: theme.space.xs,
                  color: theme.color.textSecondary,
                  fontSize: 11,
                  fontFamily: theme.fontFamily.regular,
                  textAlign: 'center',
                }}
              >
                {theme.i18n.t('premium.secure_payment')}
              </Text>
            </View>
          )}
        </View>
        <View
          style={{
            marginTop: theme.space.md,
            padding: theme.space.sm,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.card,
            borderWidth: 1,
            borderColor: theme.color.border,
          }}
        >
          {trustItems.map((item) => (
            <View
              key={item.title}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.sm,
                paddingVertical: theme.space.xs,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: theme.borderRadius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.color.surface,
                }}
              >
                <Feather
                  name={item.icon}
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
                  {theme.i18n.t(item.title)}
                </Text>
                <Text
                  style={{
                    color: theme.color.textSecondary,
                    fontSize: 10,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {theme.i18n.t(item.subtitle)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
