import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

type Message = {
  id: string;
  user: string;
  initials: string;              //remove initials refer krlena podium comp
  message: string;
  time: string;
  isCurrentUser?: boolean;
};

type DiscussionChatViewProps = {
  title: string;
  onlineCount: number;
  messages: Message[];
};

export function DiscussionChatView({
  title,
  onlineCount,
  messages,
}: DiscussionChatViewProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const bubbleWidth = Math.min(width * 0.68, 520);

  return (
    <View
      style={{
        flex: 1,
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.color.card,
        overflow: 'hidden',
        boxShadow: theme.isDark
          ? '0px 2px 8px rgba(0,0,0,0.35)'
          : '0px 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <View
        style={{
          padding: theme.space.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.sm,
          }}
        >
          <View
            style={{
              width: theme.space.xxl,
              height: theme.space.xxl,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.error + '18',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: theme.space.md * 0.75,
                height: theme.space.md * 0.75,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.error,
              }}
            />
          </View>

          <View>
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.xl,
                fontWeight: theme.fontWeight.bold as any,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {title}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.xs,
              }}
            >
              <View
                style={{
                  width: theme.space.sm,
                  height: theme.space.sm,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: theme.color.success,
                }}
              />

              <Text
                style={{
                  color: theme.color.success,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.light,
                }}
              >
                {onlineCount} online
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity>
          <Feather
            name='more-horizontal'
            size={theme.space.lg}
            color={theme.color.textMuted}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: theme.color.border,
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: theme.space.md,
          gap: theme.space.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((item) => (
          <View
            key={item.id}
            style={{
              flexDirection: item.isCurrentUser
                ? 'row-reverse'
                : 'row',
              alignItems: 'flex-end',
              gap: theme.space.sm,
            }}
          >
            {!item.isCurrentUser && (
              <View
                style={{
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: theme.space.lg * 1.8,
                    height: theme.space.lg * 1.8,
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: theme.color.premium + '18',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: theme.color.premium,
                      fontSize: theme.fontSize.sm,
                      fontWeight: theme.fontWeight.bold as any,
                      fontFamily: theme.fontFamily.regular,
                    }}
                  >
                    {item.initials}
                  </Text>
                </View>

                <Text
                  style={{
                    marginTop: theme.space.xs,
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs,
                    fontFamily: theme.fontFamily.light,
                  }}
                >
                  {item.time}
                </Text>
              </View>
            )}

            <View
              style={{
                maxWidth: bubbleWidth,
                padding: theme.space.md,
                borderRadius: theme.borderRadius.lg,

                backgroundColor: item.isCurrentUser
                  ? theme.color.accent
                  : theme.color.card,

                borderWidth: item.isCurrentUser ? 0 : 1,
                borderColor: theme.color.border,
              }}
            >
              <Text
                style={{
                  color: item.isCurrentUser
                    ? theme.color.textInverse
                    : theme.color.textPrimary,

                  fontSize: theme.fontSize.md,
                  fontFamily: theme.fontFamily.regular,
                  lineHeight:
                    theme.fontSize.md *
                    theme.lineHeight.normal,
                }}
              >
                {item.message}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          height: 1,
          backgroundColor: theme.color.border,
        }}
      />

      <View
        style={{
          padding: theme.space.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space.sm,
        }}
      >
        <TextInput
          placeholder='Ask or share an insight...'
          placeholderTextColor={theme.color.textMuted}
          style={{
            flex: 1,
            height: theme.space.xxl,
            paddingHorizontal: theme.space.md,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.surface,
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.regular,
          }}
        />

        <TouchableOpacity
          style={{
            width: theme.space.xxl,
            height: theme.space.xxl,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.accent,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Feather
            name='send'
            size={theme.space.md}
            color={theme.color.textInverse}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}