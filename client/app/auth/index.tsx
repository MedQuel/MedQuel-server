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
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, Check, ChevronRight } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { signInWithEmail } from '../../common/firebase/firebase';

import { AuthCard } from '../../components/auth/AuthCard';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { SocialButton } from '../../components/auth/SocialButton';


function mapFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'Network error — check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const handleSignIn = async () => {
    setFormError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      setFormError(mapFirebaseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: wire up once Google OAuth client IDs exist.
    setFormError('Google sign-in is coming soon — use email for now.');
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
        <AuthHeader subtitle={theme.i18n.t('auth.login.welcomeBack')} />

        <AuthCard>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xxl,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('auth.login.title')}
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
            {theme.i18n.t('auth.login.subtitle')}
          </Text>

          <AuthInput
            label={theme.i18n.t('auth.fields.email')}
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            placeholder='johndoe@gmail.com'
            keyboardType='email-address'
          />

          <AuthInput
            label={theme.i18n.t('auth.fields.password')}
            icon={Lock}
            value={password}
            onChangeText={setPassword}
            placeholder='••••••••'
            secureTextEntry={!showPassword}
            rightLabel={{
              text: theme.i18n.t('auth.login.forgot'),
              onPress: () => router.push('/auth/forgotPassword'),
            }}
            rightElement={
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                {showPassword ? (
                  <EyeOff size={theme.space.md * 1.15} color={theme.color.textMuted} />
                ) : (
                  <Eye size={theme.space.md * 1.15} color={theme.color.textMuted} />
                )}
              </Pressable>
            }
          />

          <Pressable
            onPress={() => setRememberMe((v) => !v)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: theme.space.lg,
            }}
          >
            <View
              style={{
                width: theme.space.md * 1.1,
                height: theme.space.md * 1.1,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: theme.space.sm,
                borderWidth: 1.5,
                borderRadius: theme.borderRadius.sm,
                borderColor: rememberMe ? theme.color.accent : theme.color.border,
                backgroundColor: rememberMe ? theme.color.accent : 'transparent',
              }}
            >
              {rememberMe && (
                <Check
                  size={theme.space.sm * 1.6}
                  color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
                />
              )}
            </View>

            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t('auth.login.rememberMe')}
            </Text>
          </Pressable>

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

          <Pressable onPress={handleSignIn} disabled={!canSubmit}>
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
                boxShadow: `0 6px 20px ${theme.color.accent}55`,
                opacity: canSubmit ? 1 : 0.6,
              }}
            >
              {submitting ? (
                <ActivityIndicator color='#FFFFFF' />
              ) : (
                <>
                  <Text
                    style={{
                      color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                      fontSize: theme.fontSize.md * 1.1,
                      fontFamily: theme.fontFamily.bold,
                      marginRight: theme.space.xs,
                    }}
                  >
                    {theme.i18n.t('auth.login.submit')}
                  </Text>
                  <ChevronRight
                    size={theme.space.md * 1.2}
                    color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: theme.space.lg,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: theme.color.border,
              }}
            />
            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.regular,
                marginHorizontal: theme.space.sm,
              }}
            >
              {theme.i18n.t('auth.login.or')}
            </Text>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: theme.color.border,
              }}
            />
          </View>

          <SocialButton
            label={theme.i18n.t('auth.login.google')}
            onPress={handleGoogleSignIn}
          />
        </AuthCard>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: theme.space.lg }}>
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('auth.login.newHere')}{' '}
          </Text>
          <Link href='/auth/signup' asChild>
            <Pressable>
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.md,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('auth.login.createAccount')}
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
