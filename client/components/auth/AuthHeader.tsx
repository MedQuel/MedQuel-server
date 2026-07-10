import { View, Text, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';


export function AuthHeader({ subtitle }: { subtitle: string }) {
  const { theme } = useTheme();

  return (
    <View style={{ alignItems: 'center', marginBottom: theme.space.xl }}>
      <Image
        source={require('../../assets/icons/splash-icon.png')}
        resizeMode='contain'
        style={{
          width: theme.space.xxl * 1.25,
          height: theme.space.xxl * 1.25,
          marginBottom: theme.space.sm,
        }}
      />

      <View style={{ flexDirection: 'row' }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xxl,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t('splash.brandPrefix')}
        </Text>
        <Text
          style={{
            color: theme.color.accent,
            fontSize: theme.fontSize.xxl,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t('splash.brandSuffix')}
        </Text>
      </View>

      <Text
        style={{
          color: theme.color.textMuted,
          fontSize: theme.fontSize.md,
          fontFamily: theme.fontFamily.regular,
          marginTop: theme.space.xs / 2,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
