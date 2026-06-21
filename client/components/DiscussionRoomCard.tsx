import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

type ActiveDiscussionCardProps = {
  title: string;
  message: string;
  participants: number;
  roomId?: string;
  timeAgo?: string;
  unreadCount: number;
  onPress?: () => void;
};

export function ActiveDiscussionCard({
  title,
  message,
  participants,
  roomId,
  timeAgo,
  unreadCount,
  onPress,
}: ActiveDiscussionCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flexDirection: 'row',
       alignItems: 'flex-start',
        gap: theme.space.md,

        padding: theme.space.md,

        borderWidth: 1.5,
        borderColor: theme.color.info + '35',

        borderRadius: theme.borderRadius.xl,

        backgroundColor: theme.color.card,
      }}
    >
      {/* Left Icon Box */}
      <View
        style={{
          width: theme.space.xxl,
          height: theme.space.xxl,

          justifyContent: 'center',
          alignItems: 'center',

          borderWidth: 1.5,
          borderColor: theme.color.error + '45',

          borderRadius: theme.borderRadius.xl,

          backgroundColor: theme.color.error + '08',
        }}
      >
        <View
          style={{
            width: theme.space.md,
            height: theme.space.md,

            borderRadius: theme.borderRadius.full,

            backgroundColor: theme.color.error,
          }}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            fontWeight:
              theme.fontWeight.bold.toString() as any,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {title}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            marginTop: theme.space.xs,

            color: theme.color.textMuted,

            fontSize: theme.fontSize.md,

            fontFamily: theme.fontFamily.light,
          }}
        >
          {message}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',

            gap: theme.space.xs,

            marginTop: theme.space.sm,
          }}
        >
          <Feather
            name="users"
            size={theme.fontSize.sm}
            color={theme.color.textMuted}
          />

          <Text
            style={{
              color: theme.color.textMuted,

              fontSize: theme.fontSize.sm,

              fontFamily: theme.fontFamily.light,
            }}
          >
            {participants}
          </Text>

          {roomId && (
            <>
              <View
                style={{
                  width: 4,
                  height: 4,

                  borderRadius: theme.borderRadius.full,

                  backgroundColor: theme.color.textMuted,
                }}
              />

              <Text
                style={{
                  color: theme.color.textMuted,

                  fontSize: theme.fontSize.sm,

                  fontFamily: theme.fontFamily.light,
                }}
              >
                {roomId}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Right Side Column */}
    <View
  style={{
    position: 'absolute',
    right: theme.space.md,
    top: theme.space.md,
    bottom: theme.space.md,

    justifyContent: 'space-between',
    alignItems: 'flex-end',
  }}
>
        {timeAgo ? (
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {timeAgo}
          </Text>
        ) : (
          <View />
        )}

        {unreadCount > 0 ? (
          <View
            style={{
              minWidth: theme.space.xl,
              height: theme.space.xl,

              paddingHorizontal: theme.space.xs,

              justifyContent: 'center',
              alignItems: 'center',

              borderRadius: theme.borderRadius.full,

              backgroundColor: theme.color.accent,
            }}
          >
            <Text
              style={{
                color: theme.color.textInverse,

                fontSize: theme.fontSize.xs,

                fontWeight:
                  theme.fontWeight.bold.toString() as any,

                fontFamily: theme.fontFamily.regular,
              }}
            >
              {unreadCount}
            </Text>
          </View>
        ) : (
          <View />
        )}
      </View>
    </TouchableOpacity>
  );
}