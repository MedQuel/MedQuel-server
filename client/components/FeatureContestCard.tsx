import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

type Countdown = {
  hours: string;
  minutes: string;
  seconds: string;
};

type Props = {
  title: string;
  participants: number;
  reward: number;
  questions?: number;
  duration?: string;
  difficulty?: string;
  countdown?: Countdown;
  onPress?: () => void;
};

const defaultCountdown: Countdown = {
  hours: '01',
  minutes: '23',
  seconds: '45',
};

export function FeatureContestCard({
  title,
  participants,
  reward,
  questions = 100,
  duration = '120 min',
  difficulty = 'Hard',
  countdown = defaultCountdown,
  onPress,
}: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        overflow: 'hidden',
        borderRadius: theme.borderRadius.xl + 4,
        borderWidth: 1,
        borderColor: theme.isDark
          ? 'rgba(90,110,255,0.28)'
          : 'rgba(108,76,246,0.16)',
        backgroundColor: theme.isDark ? '#16184D' : '#6C4CF6',
        shadowColor: theme.isDark ? '#4F6BFF' : '#6C4CF6',
        shadowOpacity: 0.22,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 12 },
        elevation: 10,
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: -140,
          bottom: -160,
          height: 340,
          aspectRatio: 1,
          borderRadius: 999,
          backgroundColor: theme.isDark
            ? 'rgba(124,58,237,0.42)'
            : 'rgba(124,58,237,0.58)',
        }}
      />

      <View
        style={{
          position: 'absolute',
          right: -140,
          top: -120,
          height: 500,
          aspectRatio: 1,
          borderRadius: 999,
          backgroundColor: theme.isDark
            ? 'rgba(59,123,248,0.32)'
            : 'rgba(59,123,248,0.52)',
        }}
      />

      <View
        style={{
          position: 'absolute',
          right: -70,
          top: -35,
          height: 170,
          aspectRatio: 1,
          borderRadius: 999,
          backgroundColor: theme.isDark
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(255,255,255,0.18)',
        }}
      />

      <View style={{ padding: theme.space.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: theme.space.md,
              }}
            >
              <View
                style={{
                  backgroundColor: 'rgba(130,25,65,0.95)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    color: '#FF5A5A',
                    fontWeight: '900',
                    fontSize: 14,
                  }}
                >
                  ● {theme.i18n.t('components.FeatureContestCard.live')}
                </Text>
              </View>

              <Text
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                {participants.toLocaleString()}{' '}
                {theme.i18n.t('components.FeatureContestCard.competing')}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: '800',
                lineHeight: 32,
                color: '#FFFFFF',
              }}
            >
              {title}
            </Text>

            <Text
              style={{
                marginTop: 10,
                fontSize: 15,
                fontWeight: '500',
                color: 'rgba(255,255,255,0.72)',
              }}
            >
              {questions} Qs · {duration} · {difficulty}
            </Text>
          </View>

          <View
            style={{
              alignItems: 'flex-end',
              marginLeft: theme.space.md,
            }}
          >
            <Text
              style={{
                fontSize: 34,
                fontWeight: '900',
                color: '#F59E0B',
              }}
            >
              +{reward}
            </Text>

            <Text
              style={{
                marginTop: 4,
                color: 'rgba(255,255,255,0.60)',
                fontSize: 14,
              }}
            >
              {theme.i18n.t('components.FeatureContestCard.ep_reward')}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: theme.space.xl,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="time-outline"
                size={22}
                color="rgba(255,255,255,0.72)"
              />

              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.72)',
                }}
              >
                {theme.i18n.t('components.FeatureContestCard.ends_in')}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 16,
                }}
              >
                {[countdown.hours, countdown.minutes, countdown.seconds].map(
                  (value, index) => (
                    <React.Fragment key={index}>
                      <View
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor: 'rgba(255,255,255,0.12)',
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 18,
                            fontWeight: '800',
                          }}
                        >
                          {value}
                        </Text>
                      </View>

                      {index < 2 && (
                        <Text
                          style={{
                            marginHorizontal: 8,
                            fontSize: 24,
                            fontWeight: '700',
                            color: 'rgba(255,255,255,0.55)',
                          }}
                        >
                          :
                        </Text>
                      )}
                    </React.Fragment>
                  )
                )}
              </View>
            </View>
          </View>

          <Pressable
            onPress={onPress}
            style={{
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 20,
              marginLeft: theme.space.md,
              shadowColor: '#FFFFFF',
              shadowOpacity: 0.08,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: '#7C3AED',
              }}
            >
              {theme.i18n.t('components.FeatureContestCard.join_now')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default FeatureContestCard;