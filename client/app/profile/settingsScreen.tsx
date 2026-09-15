import { useRouter } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet } from 'react-native';
import { Modal, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

import { userApi } from '@/common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { sendPasswordReset } from '../../common/firebase/firebase';
import { Difficulty, QuizPrefs, NotifPrefs } from '@/common/types/types';

import { Loading } from '../../components/common/loading';
import { UserProfileCard } from '../../components/UserProfileCard';
import { ToggleSwitch } from '../../components/common/ToggleSwitch';


const DIFFICULTY_OPTIONS: Difficulty[] = ['easy', 'medium', 'hard'];
const DEFAULT_NOTIF_TOGGLES = {
  rank: false,
  push: false,
  email: false,
  contest: false,
  achievement: false,
};
const DEFAULT_QUIZ_TOGGLES: QuizPrefs = {
  defaultDifficulty: 'medium',
  timerSound: false,
  autoSubmit: false,
};

function SectionLabel({ text, theme }: any) {
  return (
    <Text
      style={{
        textTransform: 'capitalize',
        color: theme.color.textMuted,
        fontSize: theme.fontSize.md,
        fontFamily: theme.fontFamily.bold,
        marginTop: theme.space.sm * 1.25,
      }}
    >
      {text}
    </Text>
  );
}
function Card({ theme, children }: any) {
  return (
    <View style={{ justifyContent: 'center', paddingVertical: theme.space.sm }}>
      <View
        style={{
          overflow: 'hidden',
          paddingVertical: theme.space.xs,
          paddingHorizontal: theme.space.xs,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.card,
        }}
      >
        {children}
      </View>
    </View>
  );
}
function Divider({ theme }: any) {
  return (
    <View
      style={{
        height: 0.6,
        marginVertical: theme.space.xs,
        backgroundColor: theme.color.border,
      }}
    />
  );
}

function Row({
  theme,
  icon,
  iconLib: IconLib = MaterialCommunityIcons,
  iconBg,
  iconColor,
  title,
  titleColor,
  subtitle,
  onPress,
  right,
}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.space.sm,
        paddingHorizontal: theme.space.sm,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.space.sm,
          borderRadius: theme.borderRadius.md,
          backgroundColor: iconBg ?? theme.color.surface,
        }}
      >
        <IconLib name={icon} size={theme.space.md * 1.25} color={iconColor} />
      </View>

      <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
        <Text
          style={{
            color: titleColor ?? theme.color.textPrimary,
            fontSize: theme.fontSize.sm + 1,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.light,
              paddingTop: theme.space.xs * 0.75,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {right ?? (
        <MaterialCommunityIcons
          name='chevron-right'
          size={theme.space.lg}
          color={theme.color.textMuted}
        />
      )}
    </TouchableOpacity>
  );
}

function ToggleRight({ theme, value, onChange }: any) {
  return (
    <View style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}>
      <ToggleSwitch
        isOn={value}
        size='medium'
        onColor='#3B82F6'
        offColor={theme.isDark ? theme.color.border : theme.color.textMuted + '55'}
        onToggle={onChange}
      />
    </View>
  );
}
function UpdateButton({ theme, visible, onPress, saving }: any) {
  if (!visible) return null;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!!saving}
      onPress={onPress}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.space.xs,
        marginBottom: theme.space.sm,
        marginHorizontal: theme.space.sm,
        paddingVertical: theme.space.sm * 0.85,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.color.accent,
        opacity: saving ? 0.6 : 1,
      }}
    >
      <Text
        style={{
          color: '#fff',
          fontSize: theme.fontSize.sm + 1,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {saving ? 'Updating...' : 'Update'}
      </Text>
    </TouchableOpacity>
  );
}


export default function SettingsScreen() {
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const [notifToggles, setNotifToggles] = useState(DEFAULT_NOTIF_TOGGLES);
  const [quizToggles, setQuizToggles] = useState<QuizPrefs>(DEFAULT_QUIZ_TOGGLES);
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [savedNotifToggles, setSavedNotifToggles] = useState(DEFAULT_NOTIF_TOGGLES);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [savedQuizToggles, setSavedQuizToggles] = useState<QuizPrefs>(DEFAULT_QUIZ_TOGGLES);
  const [difficultyModalVisible, setDifficultyModalVisible] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const router = useRouter();
  useBottomBar(false, 'profile');
  const { theme, toggleTheme } = useTheme();
  const { user, userLoading, userError, refreshUser, logout } = useAppContext();

  const DIFFICULTY_LABELS = useMemo<Record<Difficulty, string>>(() => ({
    easy: theme.i18n.t('common.easy'),
    medium: theme.i18n.t('common.medium'),
    hard: theme.i18n.t('common.hard'),
  }), [theme]);

  const setNotif = (key: string) => (val: boolean) => setNotifToggles((t) => ({ ...t, [key]: val }));
  const setQuiz = (key: string) => (val: boolean) => setQuizToggles((t) => ({ ...t, [key]: val }));
  const handleSelectDifficulty = (value: Difficulty) => {
    setQuizToggles((t) => ({ ...t, defaultDifficulty: value }));
    setDifficultyModalVisible(false);
  };

  const isNotifDirty = JSON.stringify(notifToggles) !== JSON.stringify(savedNotifToggles);
  const isQuizDirty = JSON.stringify(quizToggles) !== JSON.stringify(savedQuizToggles);

  useEffect(() => {
    if (!user) return;

    const loadedNotif = {
      push: user.notifPrefs?.pushEnabled ?? DEFAULT_NOTIF_TOGGLES.push,
      email: user.notifPrefs?.emailDigest ?? DEFAULT_NOTIF_TOGGLES.email,
      rank: user.notifPrefs?.rankAlerts ?? DEFAULT_NOTIF_TOGGLES.rank,
      contest: user.notifPrefs?.contestReminders ?? DEFAULT_NOTIF_TOGGLES.contest,
      achievement: user.notifPrefs?.achievementAlerts ?? DEFAULT_NOTIF_TOGGLES.achievement,
    };
    const loadedQuiz: QuizPrefs = {
      defaultDifficulty: user.quizPrefs?.defaultDifficulty ?? DEFAULT_QUIZ_TOGGLES.defaultDifficulty,
      timerSound: user.quizPrefs?.timerSound ?? DEFAULT_QUIZ_TOGGLES.timerSound,
      autoSubmit: user.quizPrefs?.autoSubmit ?? DEFAULT_QUIZ_TOGGLES.autoSubmit,
    };

    setNotifToggles(loadedNotif);
    setSavedNotifToggles(loadedNotif);
    setQuizToggles(loadedQuiz);
    setSavedQuizToggles(loadedQuiz);
  }, [user]);

  const handleSaveNotif = async () => {
    try {
      setSavingNotif(true);
      setNotifError(null);

      const payload: NotifPrefs = {
        pushEnabled: notifToggles.push,
        emailDigest: notifToggles.email,
        rankAlerts: notifToggles.rank,
        contestReminders: notifToggles.contest,
        achievementAlerts: notifToggles.achievement,
      };

      await userApi.updateNotifPrefs(payload);
      await refreshUser();
      setSavedNotifToggles(notifToggles);
    } catch {
      setNotifError('Could not save notification settings. Try again.');
    } finally {
      setSavingNotif(false);
    }
  };

  const handleConfirmChangePassword = async () => {
    setChangePasswordModalVisible(false);
    if (!user?.email) return;

    try {
      setResettingPassword(true);
      await sendPasswordReset(user.email);
    } catch {
      // Handle error if needed
    } finally {
      setResettingPassword(false);
    }
  };

  const handleConfirmSignOut = () => {
    setSignOutModalVisible(false);
    logout();
  };

  const handleSaveQuiz = async () => {
    try {
      setSavingQuiz(true);
      setQuizError(null);

      await userApi.updateQuizPrefs(quizToggles);
      await refreshUser();
      setSavedQuizToggles(quizToggles);
    } catch {
      setQuizError('Could not save quiz preferences. Try again.');
    } finally {
      setSavingQuiz(false);
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.4)'
    },
    sheet: {
      padding: theme.space.sm,
      paddingVertical: theme.space.md,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg
    },
    option: {
      paddingVertical: theme.space.sm,
      paddingHorizontal: theme.space.sm,
      borderRadius: theme.borderRadius.md,
    },
  });

  if (userLoading || userError || !user) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.space.md,
          backgroundColor: theme.color.background,
        }}
      >
        {userLoading ? (
          <Loading />
        ) : (
          <Text>{userError?.message ?? 'Could not load your settings.'}</Text>
        )}
      </View>
    );
  }


  return (
    <View style={{ flex: 1, paddingHorizontal: theme.space.md, backgroundColor: theme.color.background }}>
      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.space.xs * 1.75,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.card,
          }}
        >
          <Feather
            name='chevron-left'
            size={theme.fontSize.xl}
            color={theme.color.textPrimary}
          />
        </TouchableOpacity>

        <View style={{ flexDirection: 'column', gap: theme.space.xs * 0.5 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg * 1.1,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('profile.settings.title')}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm * 1.05,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {theme.i18n.t('profile.settings.subtitle')}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: theme.space.sm,
          paddingBottom: theme.space.md,
        }}
      >
        <UserProfileCard userData={user} />

        <SectionLabel theme={theme} text={theme.i18n.t('profile.settings.section.account')} />
        <Card theme={theme}>
          <Row
            theme={theme}
            right={<View />}
            icon='email-outline'
            iconBg='#5B9CF61A'
            iconColor='#5B9CF6'
            title={theme.i18n.t('profile.settings.account.email')}
            subtitle={user.email}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            right={
              <Feather
                name='edit-3'
                size={theme.space.md * 1.3}
                color={theme.color.textMuted}
              />
            }
            icon='lock-outline'
            iconBg='#5B9CF61A'
            iconColor='#5B9CF6'
            title={theme.i18n.t('profile.settings.account.changePassword')}
            subtitle={resettingPassword
              ? 'Sending reset link...'
              : theme.i18n.t('profile.settings.account.changePasswordSubtitle')
            }
            onPress={() => setChangePasswordModalVisible(true)}
          />

          <Modal
            visible={changePasswordModalVisible}
            transparent
            animationType='fade'
            onRequestClose={() => setChangePasswordModalVisible(false)}
          >
            <Pressable style={styles.overlay} onPress={() => setChangePasswordModalVisible(false)}>
              <View style={[styles.sheet, { backgroundColor: theme.color.background }]}>
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.md,
                    fontFamily: theme.fontFamily.bold,
                    marginBottom: theme.space.xs,
                    paddingHorizontal: theme.space.sm,
                  }}
                >
                  {theme.i18n.t('profile.settings.account.changePassword')}
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.color.textMuted,
                    fontFamily: theme.fontFamily.regular,
                    marginBottom: theme.space.sm,
                    paddingHorizontal: theme.space.sm,
                  }}
                >
                  We'll send a password reset link to {user.email}.
                </Text>

                <Pressable style={styles.option} onPress={handleConfirmChangePassword}>
                  <Text style={{ color: theme.color.info, fontFamily: theme.fontFamily.bold }}>
                    {theme.i18n.t('common.continue')}
                  </Text>
                </Pressable>
                <Pressable style={styles.option} onPress={() => setChangePasswordModalVisible(false)}>
                  <Text style={{ color: theme.color.textPrimary, fontFamily: theme.fontFamily.regular }}>
                    {theme.i18n.t('common.cancel')}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>

          <Divider theme={theme} />
          <Row
            theme={theme}
            right={<View />}
            icon='school-outline'
            iconBg='#F6A0201A'
            iconColor='#F6A020'
            title={theme.i18n.t('profile.settings.account.goal')}
            subtitle={user.targetExam}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            right={<View />}
            icon='book-open-outline'
            iconBg='#22C55E1A'
            iconColor='#22C55E'
            title={theme.i18n.t('profile.settings.account.studyLevel')}
            subtitle={user.describesYou}
          />

          {user.specialties?.length > 0 && (
            <>
              <Divider theme={theme} />
              <Row
                theme={theme}
                right={<View />}
                icon='stethoscope'
                iconBg='#8B5CF61A'
                iconColor='#8B5CF6'
                title={theme.i18n.t('profile.settings.account.specialties')}
                subtitle={user.specialties.join(', ')}
              />
            </>
          )}

          {!!user.institution && (
            <>
              <Divider theme={theme} />
              <Row
                theme={theme}
                right={<View />}
                icon='map-marker-outline'
                iconBg={theme.color.surface}
                iconColor={theme.color.textMuted}
                title={theme.i18n.t('profile.settings.account.institution')}
                subtitle={user.institution}
              />
            </>
          )}
        </Card>

        <View style={{ overflow: 'hidden' }}>
          <LinearGradient
            colors={theme.isDark ? ['#05173d', '#071d4d', '#08205a'] : ['#2762f7', '#1a56f0', '#0f49db']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderWidth: 1.5,
              borderColor: theme.isDark ? theme.color.border : 'rgba(37,99,235,0.25)',
              borderRadius: theme.borderRadius.lg,
            }}
          >
            <Row
              theme={theme}
              onPress={() => router.push('/profile/updateProfile')}
              right={<View />}
              icon='account-edit-outline'
              iconBg='rgba(0,0,0,0)'
              iconColor={theme.isDark ? theme.color.info : theme.color.textInverse}
              title={theme.i18n.t('profile.settings.account.updateProfile')}
              titleColor={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
            />
          </LinearGradient>
          
          <Card theme={theme}>
            <Row
              theme={theme}
              onPress={() => router.push('/studyPlan')}
              right={<View />}
              icon="calendar-check-outline"
              iconBg={theme.color.accent + '1A'}
              iconColor={theme.color.accent}
              title={theme.i18n.t('profile.settings.account.studyPlan')}
              subtitle={theme.i18n.t('profile.settings.account.studyPlanSubtitle')}
            />
          </Card>
        </View>

        <SectionLabel theme={theme} text={theme.i18n.t('profile.settings.section.learningFocus')} />
        <Card theme={theme}>
          <Row
            theme={theme}
            icon='filter-variant'
            iconBg={theme.color.info + '1A'}
            iconColor={theme.color.info}
            title={user.contentScope === 'focused'
              ? theme.i18n.t('profile.settings.learningFocus.focused')
              : theme.i18n.t('profile.settings.learningFocus.all')
            }
            subtitle={user.contentScope === 'focused' && user.focusSubjects?.length > 0
              ? user.focusSubjects.join(', ')
              : theme.i18n.t('profile.settings.learningFocus.allSubtitle')
            }
            onPress={() => router.push('/profile/updateProfile')}
          />
        </Card>

        <SectionLabel theme={theme} text={theme.i18n.t('profile.settings.section.notifications')} />
        <Card theme={theme}>
          <Row
            theme={theme}
            icon='bell-outline'
            iconBg='#5B9CF61A'
            iconColor='#5B9CF6'
            title={theme.i18n.t('profile.settings.notifications.pushNotifications')}
            subtitle={theme.i18n.t('profile.settings.notifications.pushNotificationsSubtitle')}
            right={
              <ToggleRight
                theme={theme}
                value={notifToggles.push}
                onChange={setNotif('push')}
              />
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon='email-outline'
            iconBg='#5B9CF61A'
            iconColor='#5B9CF6'
            title={theme.i18n.t('profile.settings.notifications.emailDigest')}
            subtitle={theme.i18n.t('profile.settings.notifications.emailDigestSubtitle')}
            right={
              <ToggleRight
                theme={theme}
                value={notifToggles.email}
                onChange={setNotif('email')}
              />
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon='chart-bar'
            iconBg='#F6A0201A'
            iconColor='#F6A020'
            title={theme.i18n.t('profile.settings.notifications.rankChangeAlerts')}
            subtitle={theme.i18n.t('profile.settings.notifications.rankChangeAlertsSubtitle')}
            right={
              <ToggleRight
                theme={theme}
                value={notifToggles.rank}
                onChange={setNotif('rank')}
              />
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon='medal-outline'
            iconBg='#22C55E1A'
            iconColor='#22C55E'
            title={theme.i18n.t('profile.settings.notifications.achievementAlerts')}
            subtitle={theme.i18n.t('profile.settings.notifications.achievementAlertsSubtitle')}
            right={
              <ToggleRight
                theme={theme}
                value={notifToggles.achievement}
                onChange={setNotif('achievement')}
              />
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon='trophy-outline'
            iconBg={theme.color.error + '1A'}
            iconColor={theme.color.error}
            title={theme.i18n.t('profile.settings.notifications.contestReminders')}
            subtitle={theme.i18n.t('profile.settings.notifications.contestRemindersSubtitle')}
            right={
              <ToggleRight
                theme={theme}
                value={notifToggles.contest}
                onChange={setNotif('contest')}
              />
            }
          />

          {!!notifError && (
            <Text
              style={{
                color: theme.color.error,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                paddingTop: theme.space.xs,
                paddingHorizontal: theme.space.sm,
              }}
            >
              {notifError}
            </Text>
          )}
          <UpdateButton
            theme={theme}
            visible={isNotifDirty}
            saving={savingNotif}
            onPress={handleSaveNotif}
          />
        </Card>

        <SectionLabel theme={theme} text={theme.i18n.t('profile.settings.section.quizPreferences')} />
        <Card theme={theme}>
          <Row
            theme={theme}
            icon='tune-vertical'
            iconBg={theme.color.warning + '22'}
            iconColor={theme.color.warning}
            title={theme.i18n.t('profile.settings.quizPreferences.defaultDifficulty')}
            subtitle={DIFFICULTY_LABELS[quizToggles.defaultDifficulty]}
            onPress={() => setDifficultyModalVisible(true)}
          />

          <Modal
            visible={difficultyModalVisible}
            transparent
            animationType='fade'
            onRequestClose={() => setDifficultyModalVisible(false)}
          >
            <Pressable style={styles.overlay} onPress={() => setDifficultyModalVisible(false)}>
              <View style={[styles.sheet, { backgroundColor: theme.color.background }]}>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.option,
                      quizToggles.defaultDifficulty === option && { backgroundColor: theme.color.warning + '22' },
                    ]}
                    onPress={() => handleSelectDifficulty(option)}
                  >
                    <Text
                      style={{
                        color: quizToggles.defaultDifficulty === option ? theme.color.warning : theme.color.textPrimary,
                        fontWeight: quizToggles.defaultDifficulty === option ? '600' : '400',
                      }}
                    >
                      {DIFFICULTY_LABELS[option]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Modal>

          <Divider theme={theme} />
          <Row
            theme={theme}
            icon='volume-high'
            iconBg={theme.color.accent + '22'}
            iconColor={theme.color.accent}
            title={theme.i18n.t('profile.settings.quizPreferences.timerSound')}
            right={
              <ToggleRight
                theme={theme}
                value={quizToggles.timerSound}
                onChange={setQuiz('timerSound')}
              />
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon='clock-outline'
            iconBg={theme.color.error + '22'}
            iconColor={theme.color.error}
            title={theme.i18n.t('profile.settings.quizPreferences.autoSubmit')}
            right={
              <ToggleRight
                theme={theme}
                value={quizToggles.autoSubmit}
                onChange={setQuiz('autoSubmit')}
              />
            }
          />

          {!!quizError && (
            <Text
              style={{
                color: theme.color.error,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                paddingTop: theme.space.xs,
                paddingHorizontal: theme.space.sm,
              }}
            >
              {quizError}
            </Text>
          )}
          <UpdateButton
            theme={theme}
            visible={isQuizDirty}
            saving={savingQuiz}
            onPress={handleSaveQuiz}
          />
        </Card>

        <SectionLabel theme={theme} text={theme.i18n.t('profile.settings.section.appearance')} />
        <Card theme={theme}>
          <Row
            theme={theme}
            icon='moon-outline'
            iconLib={Ionicons}
            iconBg={theme.color.accent + '22'}
            iconColor={theme.color.accent}
            title={theme.isDark
              ? theme.i18n.t('profile.settings.appearance.darkMode')
              : theme.i18n.t('profile.settings.appearance.lightMode')
            }
            subtitle={theme.isDark
              ? theme.i18n.t('profile.settings.appearance.darkModeSubtitle')
              : theme.i18n.t('profile.settings.appearance.lightModeSubtitle')
            }
            right={
              <ToggleRight
                theme={theme}
                value={theme.isDark}
                onChange={toggleTheme}
              />
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon='web'
            iconBg={theme.color.success + '22'}
            iconColor={theme.color.success}
            title={theme.i18n.t('profile.settings.appearance.language')}
            subtitle={theme.i18n.t('profile.settings.appearance.english')}
          />
        </Card>

        <SectionLabel theme={theme} text={theme.i18n.t('profile.settings.section.helpAndSupport')} />
        <Card theme={theme}>
          <Row
            theme={theme}
            icon='help-circle-outline'
            iconBg='#5B9CF61A'
            iconColor='#5B9CF6'
            title={theme.i18n.t('profile.settings.helpAndSupport.helpCenter')}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon='message-outline'
            iconBg='#5B9CF61A'
            iconColor={theme.color.accent}
            title={theme.i18n.t('profile.settings.helpAndSupport.contactSupport')}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon='star-outline'
            iconBg={theme.color.warning + '22'}
            iconColor={theme.color.warning}
            title={theme.i18n.t('profile.settings.helpAndSupport.rateMedQuel')}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon='file-document-outline'
            iconBg={theme.color.surface}
            iconColor={theme.color.textMuted}
            title={theme.i18n.t('profile.settings.helpAndSupport.privacyPolicy')}
          />
        </Card>

        <Card theme={theme}>
          <Row
            onPress={() => setSignOutModalVisible(true)}
            theme={theme}
            icon='logout'
            iconBg={theme.color.error + '22'}
            iconColor={theme.color.error}
            title={theme.i18n.t('profile.settings.signOut')}
            titleColor={theme.color.error}
          />

          <Modal
            visible={signOutModalVisible}
            transparent
            animationType='fade'
            onRequestClose={() => setSignOutModalVisible(false)}
          >
            <Pressable style={styles.overlay} onPress={() => setSignOutModalVisible(false)}>
              <View style={[styles.sheet, { backgroundColor: theme.color.background }]}>
                <Text
                  style={{
                    fontSize: theme.fontSize.md,
                    fontFamily: theme.fontFamily.bold,
                    color: theme.color.textPrimary,
                    marginBottom: theme.space.xs,
                    paddingHorizontal: theme.space.sm,
                  }}
                >
                  {theme.i18n.t('profile.settings.signOutConfirmTitle')}
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.color.textMuted,
                    fontFamily: theme.fontFamily.regular,
                    marginBottom: theme.space.sm,
                    paddingHorizontal: theme.space.sm,
                  }}
                >
                  {theme.i18n.t('profile.settings.signOutConfirmBody')}
                </Text>

                <Pressable style={styles.option} onPress={handleConfirmSignOut}>
                  <Text style={{ color: theme.color.error, fontFamily: theme.fontFamily.bold }}>
                    {theme.i18n.t('profile.settings.signOutConfirm')}
                  </Text>
                </Pressable>
                <Pressable style={styles.option} onPress={() => setSignOutModalVisible(false)}>
                  <Text style={{ color: theme.color.textPrimary, fontFamily: theme.fontFamily.regular }}>
                    {theme.i18n.t('common.cancel')}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        </Card>
      </ScrollView>
    </View>
  );
}
