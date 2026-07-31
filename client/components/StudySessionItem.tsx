import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type SessionStatus = 'completed' | 'current' | 'upcoming';

export function StudyTimelineCard({
  sessions = [],
  onPress,
}: {
  sessions?: {
    id: string;
    time: string;
    title: string;
    subject: string;
    questionsCount: number;
    reward: number;
    status: SessionStatus;
    iconName: keyof typeof Feather.glyphMap;
  }[];
  onPress?: (session: {
    id: string;
    time: string;
    title: string;
    subject: string;
    questionsCount: number;
    reward: number;
    status: SessionStatus;
    iconName: keyof typeof Feather.glyphMap;
  }) => void;
}) {
  const { theme } = useTheme();

  const getStatusConfig = (status: SessionStatus) => {
    switch (status) {
      case 'completed':
        return {
          border: theme.color.success,
         background: theme.color.card,
          icon: theme.color.success,
          text: theme.color.textMuted,
          line: theme.color.success + '40',
        };

      case 'current':
        return {
          border: theme.color.accent,
          background: theme.color.card,
          icon: theme.color.accent,
          text: theme.color.textPrimary,
          line: theme.color.accent + '40',
        };

      default:
        return {
          border: theme.color.border,
          background: theme.color.card,
          icon: theme.color.textMuted,
          text: theme.color.textPrimary,
          line: theme.color.border,
        };
    }
  };

  return (
    <View
      style={{
        gap: theme.space.md,
      }}
    >
      {sessions.map((session, index) => {
        const status = getStatusConfig(session.status);

        return (
          <TouchableOpacity
            key={session.id}
            activeOpacity={0.8}
            onPress={() => onPress?.(session)}
            style={{
              position: 'relative',

              flexDirection: 'row',
              alignItems: 'center',

              paddingVertical: theme.space.sm,
              paddingHorizontal: theme.space.md,

              borderRadius: theme.borderRadius.xl,

              borderWidth:
                session.status === 'current'
                  ? 2
                  : 1.5,

              borderColor: status.border,
              backgroundColor: status.background,

              gap: theme.space.sm,
            }}
          >
            {/* TIME */}
            <View
              style={{
                minWidth: theme.space.xl * 1.5,

                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color:
                    session.status === 'current'
                      ? theme.color.accent
                      : theme.color.textMuted,

                  fontSize: theme.fontSize.md,

                  fontWeight:
                    theme.fontWeight.bold.toString() as any,

                  fontFamily:
                    theme.fontFamily.number,
                }}
              >
                {session.time}
              </Text>
            </View>

            {/* ICON */}
            <View
  style={{
    position: 'relative',
    width: theme.space.xl * 1.6,
    height: theme.space.xl * 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  }}
>

  <View
    style={{
      width: theme.space.xl * 1.6,
      height: theme.space.xl * 1.6,

      alignItems: 'center',
      justifyContent: 'center',

      borderRadius: theme.borderRadius.lg,

      borderWidth: 1.5,
      borderColor: status.border,
     backgroundColor: theme.color.card,
    }}
  >
    <Feather
      name={session.iconName}
      size={theme.fontSize.lg}
      color={status.icon}
    />
  </View>
</View>

            {/* CONTENT */}
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',

                  gap: theme.space.sm,
                }}
              >
                <Text
                  style={{
                    flexShrink: 1,

                    color: status.text,

                    textDecorationLine:
                      session.status ===
                      'completed'
                        ? 'line-through'
                        : 'none',

                    fontSize: theme.fontSize.lg,

                    fontWeight:
                      theme.fontWeight.bold.toString() as any,

                    fontFamily:
                      theme.fontFamily.regular,
                  }}
                >
                  {session.title}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',

                  gap: theme.space.sm,

                  marginTop:
                    theme.space.xs * 0.5,
                }}
              >
                <Text
                  style={{
                    color:
                      theme.color.textMuted,

                    fontSize:
                      theme.fontSize.md,

                    fontFamily:
                      theme.fontFamily.light,
                  }}
                >
                  {session.subject}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',

                    gap: theme.space.xs,
                  }}
                >
                  <Feather
                    name="clock"
                    size={theme.fontSize.sm}
                    color={
                      theme.color.textMuted
                    }
                  />

                  <Text
                    style={{
                      color:
                        theme.color.textMuted,

                      fontSize:
                        theme.fontSize.md,

                      fontFamily:
                        theme.fontFamily.light,
                    }}
                  >
                    {session.questionsCount} Qs
                  </Text>
                </View>
              </View>
            </View>

            {/* REWARD */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',

                paddingLeft:
                  theme.space.xs,
              }}
            >
              <Feather
                name="zap"
                size={theme.fontSize.md}
                color={
                  theme.color.warning
                }
              />

              <Text
                style={{
                  color:
                    theme.color.warning,

                  fontSize:
                    theme.fontSize.lg,

                  fontWeight:
                    theme.fontWeight.bold.toString() as any,

                  fontFamily:
                    theme.fontFamily.number,
                }}
              >
                +{session.reward}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}