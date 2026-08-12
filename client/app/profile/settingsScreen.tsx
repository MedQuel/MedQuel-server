import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity  } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

import { userApi } from '@/common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import { UserProfileCard } from '../../components/UserProfileCard';
import { ToggleSwitch } from '../../components/common/ToggleSwitch';
import { PremiumUpsellCardFull } from '../../components/PremiumUpsellCardFull'; 
import {signOut} from '../../common/firebase/firebase';


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


export default function SettingsScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setUserData(await userApi.getMe());
      } catch {
        setError('Could not load profile. Pull to refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [toggles, setToggles] = useState({
    rank: false,
    push: false,
    email: false,
    contest: false,
    achievement: false,
    timerSound: false,
    autoSubmit: false,
  });
  const set = (key: string) => (val: boolean) => setToggles((t) => ({ ...t, [key]: val }));

  const countDays = (iso: string) => {
    const now = new Date();
    const past = new Date(iso);
    const diffTime = Math.abs(now.getTime() - past.getTime());
    return `${Math.floor(diffTime / (1000 * 60 * 60 * 24))} days`;
  };

  if (loading || error) {
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
        {loading ? <Loading /> : <Text>{error}</Text>}
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
            backgroundColor: theme.color.card,
            borderRadius: theme.borderRadius.lg,
            borderColor: theme.color.border,
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
          paddingBottom: theme.space.xxl * 1.5,
        }}
      >
        <UserProfileCard userData={userData} />

       <SectionLabel theme={theme} text={theme.i18n.t('profile.settings.section.account')}
         />
        <Card theme={theme} 
        >
          <Row
            theme={theme}
             right={<View />}
            icon='email-outline'
            iconBg='#5B9CF61A'
            iconColor='#5B9CF6'
            title={theme.i18n.t('profile.settings.account.email')}
            subtitle={userData?.email}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
              right={<View />}
            icon='lock-outline'
            iconBg='#5B9CF61A'
            iconColor='#5B9CF6'
            title={theme.i18n.t('profile.settings.account.changePassword')}
            subtitle={userData?.updatedAt
              ? theme.i18n.t('profile.settings.account.lastChanged', { date: countDays(userData.updatedAt) })
              : theme.i18n.t('profile.settings.account.changePassword')
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
             right={<View />}
            icon='school-outline'
            iconBg='#F6A0201A'
            iconColor='#F6A020'
            title={theme.i18n.t('profile.settings.account.targetExam')}
            subtitle={userData?.targetExam}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
             right={<View />}
            icon='book-open-outline'
            iconBg='#22C55E1A'
            iconColor='#22C55E'
            title={theme.i18n.t('profile.settings.account.studyLevel')}
            subtitle={userData?.studyLevel}
          />
          <Divider theme={theme} />
          <TouchableOpacity onPress={() => router.push('/profile/updateProfileScreen')}>
            <Row
              theme={theme}
              right={<View />}
              icon='account-edit-outline'
              iconBg={theme.color.premium + '1A'}
              iconColor={theme.color.premium}
              title={theme.i18n.t('profile.settings.account.updateProfile')}
              titleColor={theme.color.premium}
            />
          </TouchableOpacity>
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
              <ToggleRight theme={theme} value={toggles.push} onChange={set('push')} />
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
              <ToggleRight theme={theme} value={toggles.email} onChange={set('email')} />
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
              <ToggleRight theme={theme} value={toggles.rank} onChange={set('rank')} />
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
              <ToggleRight theme={theme} value={toggles.achievement} onChange={set('achievement')} />
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
              <ToggleRight theme={theme} value={toggles.contest} onChange={set('contest')} />
            }
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
            subtitle={theme.i18n.t('Medium')}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon='volume-high'
            iconBg={theme.color.accent + '22'}
            iconColor={theme.color.accent}
            title={theme.i18n.t('profile.settings.quizPreferences.timerSound')}
            right={
              <ToggleRight theme={theme} value={toggles.timerSound} onChange={set('timerSound')} />
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
              <ToggleRight theme={theme} value={toggles.autoSubmit} onChange={set('autoSubmit')} />
            }
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
              <ToggleRight theme={theme} value={theme.isDark} onChange={toggleTheme} />
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

        <View style={{ marginTop: theme.space.sm }}>
          <PremiumUpsellCardFull />
        </View>

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
          onPress={signOut}
            theme={theme}
            icon='logout'
            iconBg={theme.color.error + '22'}
            iconColor={theme.color.error}
            title={theme.i18n.t('profile.settings.signOut')}
            titleColor={theme.color.error}
          />
          {/* <Divider theme={theme} /> */}
          {/* <Row
            theme={theme}
            icon='trash-can-outline'
            iconBg={theme.color.error + '22'}
            iconColor={theme.color.error}
            title={theme.i18n.t('profile.settings.deleteAccount')}
            titleColor={theme.color.error}
          /> */}
        </Card>
      </ScrollView>
    </View>
  );
}
