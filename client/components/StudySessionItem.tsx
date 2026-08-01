import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../theme/ThemeContext';


type StudyTimelineCardProps = {
  sessions?: {
    id: string;
    time: string;
    title: string;
    subject: string;
    questionsCount: number;
    reward: number;
    status: 'completed' | 'current' | 'upcoming';
    iconName: keyof typeof Feather.glyphMap;
  }[];
  onPress?: (session: {
    id: string;
    time: string;
    title: string;
    subject: string;
    questionsCount: number;
    reward: number;
    status: 'completed' | 'current' | 'upcoming';
    iconName: keyof typeof Feather.glyphMap;
  }) => void;
};

export function StudyTimelineCard({ sessions = [], onPress }: StudyTimelineCardProps) {
  const { theme } = useTheme();

  const getStatusConfig = (status: 'completed' | 'current' | 'upcoming') => {
    switch (status) {
      case 'completed':
        return {
          icon: theme.color.success,
          text: theme.color.textMuted,
          line: theme.color.success + '40',
          border: theme.color.success,
          background: theme.color.card,
        };
      case 'current':
        return {
          icon: theme.color.accent,
          text: theme.color.textPrimary,
          line: theme.color.accent + '40',
          border: theme.color.accent,
          background: theme.color.card,
        };
      default:
        return {
          icon: theme.color.textMuted,
          text: theme.color.textPrimary,
          line: theme.color.border,
          border: theme.color.border,
          background: theme.color.card,
        };
    }
  };

  return (
    <View style={{ gap: theme.space.md }}>
      {sessions.map((session, i) => {
        const status = getStatusConfig(session.status);

        return (
          <TouchableOpacity
            key={`${session.id}-${i}`}
            activeOpacity={0.8}
            onPress={() => onPress?.(session)}
            style={{
              gap: theme.space.sm,
              position: 'relative',
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.space.sm,
              paddingHorizontal: theme.space.md,
              borderColor: status.border,
              borderRadius: theme.borderRadius.xl,
              borderWidth: session.status === 'current' ? 2 : 1.5,
              backgroundColor: status.background,
            }}
          >
            <View style={{ minWidth: theme.space.xl * 1.5, alignItems: 'center', justifyContent: 'center' }}>
              <Text
                style={{
                  color: session.status === 'current' ? theme.color.accent : theme.color.textMuted,
                  fontSize: theme.fontSize.md,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.number,
                }}
              >
                {session.time}
              </Text>
            </View>

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
                  borderWidth: 1.5,
                  borderColor: status.border,
                  borderRadius: theme.borderRadius.lg,
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

            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View style={{ gap: theme.space.sm, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    flexShrink: 1,
                    color: status.text,
                    textDecorationLine: session.status === 'completed' ? 'line-through' : 'none',
                    fontSize: theme.fontSize.lg,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {session.title}
                </Text>
              </View>

              <View
                style={{
                  gap: theme.space.sm,
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: theme.space.xs * 0.5,
                }}
              >
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.md,
                    fontFamily: theme.fontFamily.light,
                  }}
                >
                  {session.subject}
                </Text>

                <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
                  <Feather
                    name='clock'
                    size={theme.fontSize.sm}
                    color={theme.color.textMuted}
                  />

                  <Text
                    style={{
                      color: theme.color.textMuted,
                      fontSize: theme.fontSize.md,
                      fontFamily: theme.fontFamily.light,
                    }}
                  >
                    {session.questionsCount} Qs
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingLeft: theme.space.xs,
              }}
            >
              <Feather
                name='zap'
                size={theme.fontSize.md}
                color={theme.color.warning}
              />
              <Text
                style={{
                  color: theme.color.warning,
                  fontSize: theme.fontSize.lg,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.number,
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
