import {
  View,
  Text,
  Platform,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Lock, Eye, EyeOff, Check, ChevronRight } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { useBottomBar } from '../../common/context/useBottomBar';
import { signUpWithEmail, sendVerificationEmail } from '../../common/firebase/firebase';


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak - use at least 8 characters.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Network error - check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

function getPasswordScore(pw: string): number {
  let score = 0;
  if (pw.length >= 12) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  return score;
}


export default function SignupScreen() {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState<boolean>(false);

  const { theme } = useTheme();
  useBottomBar(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const passwordScore = getPasswordScore(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const strengthMeta = useMemo(() => {
    if (password.length === 0) return null;
    if (passwordScore <= 1) {
      return {
        filled: 1,
        color: theme.color.error,
        label: 'Weak, add numbers & symbols',
      };
    }
    if (passwordScore === 2) {
      return {
        filled: 2,
        color: theme.color.warning,
        label: 'Fair, add a symbol',
      };
    }
    return { filled: 3, color: theme.color.success, label: 'Strong' };
  }, [password, passwordScore, theme]);

  const formValid =
    fullName.trim().length > 1 &&
    emailValid &&
    password.length >= 12 &&
    passwordsMatch &&
    agreedToTerms;

  const handleCreateAccount = async () => {
    setTouched(true);
    if (!formValid) {
      if (!agreedToTerms) {
        setFormError('Please agree to the Terms of Service and Privacy Policy.');
      }
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await signUpWithEmail(email.trim(), password, fullName.trim());
      try {
        await sendVerificationEmail();
      } catch {
        // swallow — Resend covers this
      }
    } catch (err) {
      setFormError(mapFirebaseError(err));
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
        <AuthHeader subtitle={theme.i18n.t('auth.signup.subtitleBrand')} />

        <AuthCard>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xxl,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('auth.signup.title')}
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
            {theme.i18n.t('auth.signup.subtitle')}
          </Text>

          <AuthInput
            label={theme.i18n.t('auth.fields.fullName')}
            icon={User}
            value={fullName}
            onChangeText={setFullName}
            placeholder='Dr. John Doe'
            autoCapitalize='words'
            error={touched && fullName.trim().length <= 1}
          />

          <AuthInput
            label={theme.i18n.t('auth.fields.email')}
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            placeholder='dr.johndoe@gmail.com'
            keyboardType='email-address'
            error={touched && !emailValid}
          />

          <AuthInput
            label={theme.i18n.t('auth.fields.password')}
            icon={Lock}
            value={password}
            onChangeText={setPassword}
            placeholder='••••••••'
            secureTextEntry={!showPassword}
            error={touched && password.length < 12}
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

          {strengthMeta && (
            <View style={{ marginTop: -theme.space.sm, marginBottom: theme.space.md }}>
              <View style={{ gap: theme.space.xs, flexDirection: 'row' }}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: theme.space.xs,
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: i < strengthMeta.filled ? strengthMeta.color : theme.color.border,
                    }}
                  />
                ))}
              </View>
              <Text
                style={{
                  color: strengthMeta.color,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.regular,
                  marginTop: theme.space.xs * 0.75,
                }}
              >
                {strengthMeta.label}
              </Text>
            </View>
          )}

          <AuthInput
            label={theme.i18n.t('auth.fields.confirmPassword')}
            icon={Lock}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder='••••••••'
            secureTextEntry={!showConfirmPassword}
            error={touched && confirmPassword.length > 0 && !passwordsMatch}
            success={passwordsMatch}
            rightElement={
              passwordsMatch ? (
                <View
                  style={{
                    width: theme.space.md * 1.15,
                    height: theme.space.md * 1.15,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: theme.color.success,
                  }}
                >
                  <Check
                    size={theme.space.sm * 1.6}
                    color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
                  />
                </View>
              ) : (
                <Pressable onPress={() => setShowConfirmPassword((v) => !v)} hitSlop={8}>
                  {showConfirmPassword ? (
                    <EyeOff size={theme.space.md * 1.15} color={theme.color.textMuted} />
                  ) : (
                    <Eye size={theme.space.md * 1.15} color={theme.color.textMuted} />
                  )}
                </Pressable>
              )
            }
          />

          <Pressable
            onPress={() => setAgreedToTerms((v) => !v)}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
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
                borderColor: agreedToTerms ? theme.color.accent : theme.color.border,
                backgroundColor: agreedToTerms ? theme.color.accent : 'transparent',
              }}
            >
              {agreedToTerms && (
                <Check
                  size={theme.space.sm * 1.6}
                  color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
                />
              )}
            </View>

            <Text
              style={{
                flex: 1,
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t('auth.signup.termsPrefix')}{' '}
              {/* <Link href='/legal/terms' asChild> */}
              <Text
                style={{
                  color: theme.color.accent,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('auth.signup.termsOfService')}{' '}
              </Text>
              {/* </Link> */}
              {theme.i18n.t('auth.signup.and')}{' '}
              {/* <Link href='/legal/privacy' asChild> */}
              <Text
                style={{
                  color: theme.color.accent,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('auth.signup.privacyPolicy')}
              </Text>
              {/* </Link> */}
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

          <Pressable onPress={handleCreateAccount} disabled={submitting}>
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
                opacity: submitting ? 0.7 : 1,
                boxShadow: `0 6px 20px ${theme.color.accent}55`,
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
                    {theme.i18n.t('auth.signup.createAccount')}
                  </Text>
                  <ChevronRight
                    size={theme.space.md * 1.2}
                    color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: theme.space.lg }}>
            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t('auth.signup.alreadyHaveAccount')}{' '}
            </Text>
            
            <Link href='/auth' asChild>
              <Pressable>
                <Text
                  style={{
                    color: theme.color.accent,
                    fontSize: theme.fontSize.md,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {theme.i18n.t('auth.signup.signIn')}
                </Text>
              </Pressable>
            </Link>
          </View>
        </AuthCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
