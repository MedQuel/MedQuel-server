import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { HomeHeader } from './homeHeader';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { LevelProgressCard } from '../../components/LevelProgressCard';
import { StatsOverviewCard } from '../../components/StatsOverviewCard';
import { DailyChallengeCard } from '../../components/DailyChallengeCard';
import { ActiveContestsCard } from '../../components/ActiveContestsCard';
import { PerformanceTrendCard } from '../../components/PerformanceTrendCard';
import { subjectCatalog, SubjectIcon, SubjectId } from '../../common/constants/subject';
type PracticeSubject = { id: SubjectId, label: string };
function PracticeBySubject({ subjects, onPress }: { subjects?: PracticeSubject[], onPress?: (id: SubjectId) => void }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const randomSubjects: PracticeSubject[] = useMemo(() => {
    const allIds = Object.keys(subjectCatalog) as SubjectId[];
    const shuffled: SubjectId[] = [...allIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const current = shuffled[i];
      const next = shuffled[j];
      if (current !== undefined && next !== undefined) {
        [shuffled[i], shuffled[j]] = [next, current];
      }
    }
    return shuffled.slice(0, 6).map((id) => ({
      id,
      label: theme.i18n.t(subjectCatalog[id].title),
    }));
  }, []);

  const iconSize = Math.min(width * 0.13, 58);
  const iconSizeValue = iconSize * 0.42;
  const finalSubjects = subjects ?? randomSubjects;
  const getIconSizeValue = (subjectId: SubjectId) => subjectId === 'anatomy' ? iconSizeValue * 1.35 : iconSizeValue;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: theme.space.sm,
      }}
    >
      {finalSubjects.map((subject) => {
        const definition = subjectCatalog[subject.id];
        const iconColor = theme.color[definition?.variant ?? 'accent'];
        return (
          <TouchableOpacity
            key={subject.id}
            activeOpacity={0.8}
            onPress={() => onPress?.(subject.id)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingHorizontal: theme.space.xs * 0.5,
            }}
          >
            <View
              style={{
                width: iconSize,
                height: iconSize,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.space.xs,
                borderWidth: 1,
                borderRadius: iconSize / 3,
                borderColor: `${iconColor}35`,
                backgroundColor: `${iconColor}12`,
              }}
            >
              <SubjectIcon
                id={subject.id}
                color={iconColor}
                size={getIconSizeValue(subject.id)}
              />
            </View>
            <Text
              numberOfLines={1}
              style={{
                textAlign: 'center',
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontWeight.medium,
              }}
            >
              {subject.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(true, 'home');
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <HomeHeader
        initial='M'
        name='Dr. Mohan.'
        streak={24}
        level={12}
        onNotificationsPress={() => router.push('/notifications')}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: theme.space.md,
          paddingTop: theme.space.md,
          paddingBottom: theme.space.xxl + theme.space.xl,
          paddingHorizontal: theme.space.md,
        }}
      >
        <LevelProgressCard
          currentLevel={12}
          nextLevel={13}
          currentEP={2847}
          nextLevelEP={3500}
          remainingEP={653}
        />
        <StatsOverviewCard
          rank={5}
          accuracy={87}
          quizzesTaken={42}
          earnedPoints={3240}
        />
        <DailyChallengeCard
          title='Anatomy Essentials'
          questions={30}
          duration={45}
          difficulty='medium'
          endsAt='840'
          epReward={150}
          onStart={() => {}}
        />
        <View style={{ gap: theme.space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('Active Contests')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/contests')}>
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t('View All')}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <ActiveContestsCard
              contests={[
                { title: theme.i18n.t('Cardiac Pathology Blitz'), subject: theme.i18n.t('Cardiology'), difficulty: 'hard', isLive: true, participantsCount: 2100, epReward: 250 },
                { title: theme.i18n.t('Neuroanatomy Challenge'), subject: theme.i18n.t('Neurology'), difficulty: 'hard', isLive: false, participantsCount: 1800, epReward: 220 },
                { title: theme.i18n.t('Drug Mechanisms Sprint'), subject: theme.i18n.t('Pharmacology'), difficulty: 'medium', isLive: true, participantsCount: 950, epReward: 160 },
                { title: theme.i18n.t('Respiratory System Quiz'), subject: theme.i18n.t('Pulmonology'), difficulty: 'medium', isLive: false, participantsCount: 740, epReward: 140 },
                { title: theme.i18n.t('Renal Physiology Basics'), subject: theme.i18n.t('Nephrology'), difficulty: 'easy', isLive: false, participantsCount: 430, epReward: 90 },
                { title: theme.i18n.t('GI Tract Anatomy'), subject: theme.i18n.t('Gastroenterology'), difficulty: 'easy', isLive: false, participantsCount: 380, epReward: 80 },
                { title: theme.i18n.t('Endocrine Disorders'), subject: theme.i18n.t('Endocrinology'), difficulty: 'medium', isLive: false, participantsCount: 610, epReward: 130 },
                { title: theme.i18n.t('Musculoskeletal MCQs'), subject: theme.i18n.t('Orthopedics'), difficulty: 'easy', isLive: false, participantsCount: 290, epReward: 75 },
              ]}
            />
          </View>
        </View>
        <View style={{ gap: theme.space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('Practice by Subject')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/home/practice-subjects')}>
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t('View All')}
              </Text>
            </TouchableOpacity>
          </View>
          <PracticeBySubject onPress={(subjectId) => { console.log('Selected Subject:', subjectId) }} />
        </View>
        <PerformanceTrendCard
          accuracy={{
            mon: 72,
            tue: 78,
            wed: 75,
            thu: 82,
            fri: 88,
            sat: 85,
            sun: 90,
          }}
        />
      </ScrollView>
    </View>
  );
}