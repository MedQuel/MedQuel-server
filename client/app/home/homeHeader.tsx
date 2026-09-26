import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TouchableOpacity, Image } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { isSameDay } from '../../common/utils/dateUtils';
import { hasValidPhoto } from '../../common/utils/imageUrl';
import { getInitials } from '../../common/utils/getInitials';
import { UserLevelChip } from '../../components/home/UserLevelChip';
import { computeLevelFromXp } from '../../common/utils/computeLevelXP';


export default function HomeHeader({
  name,
  streak,
  xpPoints,
  lastActiveDate,
  photoURL,
  onNotificationsPress,
  onAvatarPress,
}: {
  name: string;
  streak: number;
  xpPoints: number;
  lastActiveDate?: string | Date | null;
  photoURL?: string | null;
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
}) {
  const { theme } = useTheme();
  const isActiveToday = lastActiveDate ? isSameDay(new Date(lastActiveDate), new Date()) : false;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: theme.space.xs,
        paddingBottom: theme.space.sm,
        paddingHorizontal: theme.space.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <TouchableOpacity activeOpacity={0.85} onPress={onAvatarPress}>
          {hasValidPhoto(photoURL) ? (
            <Image
              source={{ uri: photoURL! }}
              style={{
                width: theme.space.xxl,
                height: theme.space.xxl,
                borderRadius: theme.borderRadius.full,
              }}
            />
          ) : (
            <LinearGradient
              colors={theme.isDark ? ['#4F7CFF', '#7C3AED'] : ['#5B7FFF', '#6D4CFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: theme.space.xxl,
                height: theme.space.xxl,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.full,
              }}
            >
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.lg,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {getInitials(name)}
              </Text>
            </LinearGradient>
          )}
        </TouchableOpacity>

        <View style={{ marginLeft: theme.space.sm }}>
          <Text
            numberOfLines={1}
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {name}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.space.xs * 0.5 }}>
            <Ionicons
              name={isActiveToday ? 'flame' : 'flame-outline'}
              size={theme.fontSize.md}
              color={'#FF6723'}
            />
            <Text
              style={{
                color: theme.color.warning,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                marginLeft: theme.space.xs * 0.5,
              }}
            >
              {theme.i18n.t('home.dayStreak', { streak: streak })}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNotificationsPress}
          style={{
            width: theme.space.xl + theme.space.xs,
            height: theme.space.xl + theme.space.xs,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.space.sm,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.card,
          }}
        >
          <Ionicons
            name='notifications-outline'
            size={theme.fontSize.md}
            color={theme.color.textSecondary}
          />
          <View
            style={{
              position: 'absolute',
              top: -(theme.space.xs * 0.5),
              right: -(theme.space.xs * 0.5),
              width: theme.space.sm,
              height: theme.space.sm,
              borderWidth: 1,
              borderColor: theme.color.background,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.error,
            }}
          />
        </TouchableOpacity>

        <UserLevelChip
          level={computeLevelFromXp(xpPoints)}
          size='sm'
          style={{
            height: theme.space.xl + theme.space.xs,
            borderColor: theme.color.border,
            backgroundColor: theme.color.card,
          }}
        />
      </View>
    </View>
  );
}
