import { useState } from 'react';
import {
  View,
  Text,
  Platform,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ArrowLeft, MailCheck } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { sendPasswordReset } from '../../common/firebase/firebase';

import { AuthCard } from '../../components/auth/AuthCard';
import { AuthInput } from '../../components/auth/AuthInput';


function mapFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/user-not-found':
      return '';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'Network error — check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState<boolean>(false);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const canSubmit = email.trim().length > 0 && !submitting;

  const handleSendReset = async () => {
    setFormError(null);
    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      const message = mapFirebaseError(err);

      if (message) setFormError(message);
      else setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.color.background }}
      behavior={Platform.OS === 'android' ? 'height' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: theme.space.lg,
        }}
      >
        <AuthCard>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: theme.space.md,
            }}
          >
            <ArrowLeft size={theme.space.md * 1.25} color={theme.color.textSecondary} />
            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm * 1.05,
                fontFamily: theme.fontFamily.regular,
                marginLeft: theme.space.xs,
              }}
            >
              {theme.i18n.t('auth.forgotPassword.back')}
            </Text>
          </Pressable>

          {sent ? (
            <View style={{ alignItems: 'center', paddingVertical: theme.space.md }}>
              <View
                style={{
                  width: theme.space.xxl * 1.5,
                  height: theme.space.xxl * 1.5,
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
                {theme.i18n.t('auth.forgotPassword.sentTitle')}
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
                {theme.i18n.t('auth.forgotPassword.sentBody')}
              </Text>

              <Pressable onPress={() => router.replace('/auth')} style={{ marginTop: theme.space.lg }}>
                <Text
                  style={{
                    color: theme.color.accent,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {theme.i18n.t('auth.forgotPassword.backToSignIn')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.xl * 1.1,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('auth.forgotPassword.title')}
              </Text>
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm * 1.05,
                  fontFamily: theme.fontFamily.regular,
                  marginTop: theme.space.xs * 1.25,
                  marginBottom: theme.space.lg,
                }}
              >
                {theme.i18n.t('auth.forgotPassword.subtitle')}
              </Text>

              <AuthInput
                label={theme.i18n.t('auth.fields.email')}
                icon={Mail}
                value={email}
                onChangeText={setEmail}
                placeholder='johndoe@gmail.com'
                keyboardType='email-address'
              />

              {formError && (
                <Text
                  style={{
                    color: theme.color.error,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.regular,
                    marginBottom: theme.space.md,
                  }}
                >
                  {formError}
                </Text>
              )}

              <Pressable onPress={handleSendReset} disabled={!canSubmit}>
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
                    opacity: canSubmit ? 1 : 0.6,
                    boxShadow: `0 6px 20px ${theme.color.accent}55`,
                  }}
                >
                  {submitting ? (
                    <ActivityIndicator color='#FFFFFF' />
                  ) : (
                    <Text
                      style={{
                        color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                        fontSize: theme.fontSize.md * 1.1,
                        fontFamily: theme.fontFamily.bold,
                      }}
                    >
                      {theme.i18n.t('auth.forgotPassword.submit')}
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </>
          )}
        </AuthCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
