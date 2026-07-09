import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MailCheck, RefreshCw, LogOut } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';
import { AuthCard } from '../../components/auth/AuthCard';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { auth, sendVerificationEmail } from '../../common/firebase/firebase';


function mapFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a bit before trying again.';
    case 'auth/network-request-failed':
      return 'Network error, check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function VerifyEmailScreen() {
  const [checking, setChecking] = useState<boolean>(false);
  const [signingOut, setSigningOut] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const { recheckEmailVerification, logout } = useAppContext();
  const email = auth.currentUser?.email ?? '';

  const { theme } = useTheme();
  useBottomBar(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResend = async () => {
    setFormError(null);
    try {
      await sendVerificationEmail();
      setResendCooldown(30);
    } catch (err) {
      setFormError(mapFirebaseError(err));
    }
  };

  const handleCheckVerified = async () => {
    setFormError(null);
    setChecking(true);
    try {
      const verified = await recheckEmailVerification();
      if (!verified) setFormError('Not verified yet, check your inbox and try again.');
    } catch (err) {
      setFormError(mapFirebaseError(err));
    } finally {
      setChecking(false);
    }
  };

  const handleUseDifferentEmail = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };


  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: theme.space.lg,
        backgroundColor: theme.color.background,
      }}
    >
      <AuthCard>
        <View style={{ alignItems: 'center', paddingVertical: theme.space.sm }}>
          <View
            style={{
              width: theme.space.xxl * 1.4,
              height: theme.space.xxl * 1.4,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.space.md,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.surface,
            }}
          >
            <MailCheck size={theme.space.xl} color={theme.color.accent} />
          </View>

          <Text
            style={{
              textAlign: 'center',
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xl,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('auth.verifyEmail.title')}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.xs,
            }}
          >
            {theme.i18n.t('auth.verifyEmail.body')} {email}
          </Text>

          {formError && (
            <Text
              style={{
                textAlign: 'center',
                color: theme.color.error,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                marginTop: theme.space.md,
              }}
            >
              {formError}
            </Text>
          )}

          <Pressable
            onPress={handleCheckVerified}
            disabled={checking}
            style={{ width: '100%', marginTop: theme.space.lg }}
          >
            <LinearGradient
              colors={['#4378eb', '#2161eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: theme.space.md * 0.9,
                borderRadius: theme.borderRadius.lg,
                opacity: checking ? 0.7 : 1,
                boxShadow: `0 6px 20px ${theme.color.accent}55`,
              }}
            >
              {checking ? (
                <ActivityIndicator color='#FFFFFF' />
              ) : (
                <Text
                  style={{
                    color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                    fontSize: theme.fontSize.md,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {theme.i18n.t('auth.verifyEmail.checkVerified')}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={handleResend}
            disabled={resendCooldown > 0}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: theme.space.md,
              opacity: resendCooldown > 0 ? 0.5 : 1,
            }}
          >
            <RefreshCw size={theme.space.md} color={theme.color.accent} />
            <Text
              style={{
                color: theme.color.accent,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.bold,
                marginLeft: theme.space.xs,
              }}
            >
              {resendCooldown > 0
                ? `${theme.i18n.t('auth.verifyEmail.resendIn')} ${resendCooldown}s`
                : theme.i18n.t('auth.verifyEmail.resend')}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleUseDifferentEmail}
            disabled={signingOut}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: theme.space.lg,
              opacity: signingOut ? 0.5 : 1,
            }}
          >
            <LogOut size={theme.space.md} color={theme.color.textMuted} />
            <Text
              style={{
                color: theme.color.textMuted,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                marginLeft: theme.space.xs,
              }}
            >
              {theme.i18n.t('auth.verifyEmail.useDifferentEmail')}
            </Text>
          </Pressable>
        </View>
      </AuthCard>
    </ScrollView>
  );
}
