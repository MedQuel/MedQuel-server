import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import {
  Heart,
  Activity,
  Microscope,
  Pill,
  Scissors,
  Brain,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { LevelProgressCard } from '../../components/LevelProgressCard';
import { StatsOverviewCard } from '../../components/StatsOverviewCard';
import { DailyChallengeCard } from '../../components/DailyChallengeCard';
import { ActiveContestsCard } from '../../components/ActiveContestsCard';
import { PerformanceTrendCard } from '../../components/PerformanceTrendCard';

function BellIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 8.5C6 5.46 8.46 3 11.5 3C14.54 3 17 5.46 17 8.5V12.2L18.5 15.2C18.7 15.6 18.4 16 17.95 16H5.05C4.6 16 4.3 15.6 4.5 15.2L6 12.2V8.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 18C9.9 19.1 10.6 19.5 11.5 19.5C12.4 19.5 13.1 19.1 13.5 18"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function StarIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
      />
    </Svg>
  );
}

function FlameIcon({ size }: { size: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <Path
        d="M20.5 2C20.5 2 22 6.5 22 10C22 11.2 21.7 12.2 21.3 13.1C22.8 11.5 23.5 9.2 23.3 7C26.5 9.8 29 14.2 29 18.5C29 25.4 24.1 31 18 31C11.9 31 7 25.9 7 20C7 16 9.2 13 11.5 10.5C11.3 12.8 12.1 15 13.5 16.3C13.2 14.5 13.4 12.5 14.3 10.8C15.7 8.1 18.2 6 20.5 2Z"
        fill="#FF6723"
      />
      <Path
        d="M18 31C22.5 31 26 27.6 26 23.3C26 20.6 24.5 18.3 22.7 16.6C22.9 18 22.5 19.4 21.6 20.5C21.8 18.3 21 16.1 19.4 14.6C19.6 16.8 19 19 17.7 20.7C16.5 22.2 15.6 23.9 15.6 25.7C15.6 28.6 17 31 18 31Z"
        fill="#FFB02E"
      />
      <Path
        d="M18 31C20.5 31 22.5 29 22.5 26.5C22.5 25 21.8 23.7 20.8 22.7C20.9 23.6 20.6 24.4 20 25C20 23.8 19.5 22.6 18.6 21.7C18.6 23 18.2 24.2 17.4 25.2C16.7 26.1 16.2 27.1 16.2 28.2C16.2 29.7 17 31 18 31Z"
        fill="#FFD983"
      />
    </Svg>
  );
}

function Header({
  name, streak, level, initial,
}: {
  name: string; streak: number; level: number; initial: string;
}) {
  
  const {theme}=useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.space.md,
        paddingVertical: theme.space.md,
        paddingBottom: theme.space.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <LinearGradient
          colors={theme.isDark ? ['#4F7CFF', '#7C3AED'] : ['#5B7FFF', '#6D4CFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: theme.space.xxl,
            height: theme.space.xxl,
            borderRadius: theme.borderRadius.full,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.lg, fontFamily: theme.fontFamily.bold }}>
            {initial}
          </Text>
        </LinearGradient>
        <View style={{ marginLeft: theme.space.sm }}>
          <Text numberOfLines={1} style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.lg, fontFamily: theme.fontFamily.bold }}>
            {name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.space.xs * 0.5 }}>
            <FlameIcon size={theme.fontSize.sm} />
            <Text style={{ marginLeft: theme.space.xs * 0.5, color: theme.color.warning, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
              {`${streak} ${theme.i18n.t('Day Streak')}`}
            </Text>
            
          </View>
        </View>
      </View>

     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
 
  {/* Notification */}
  <TouchableOpacity
    activeOpacity={0.8}
    style={{
      width: theme.space.xl + theme.space.xs,
      height: theme.space.xl + theme.space.xs,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.color.border,
      backgroundColor: theme.color.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.space.sm,
    }}
  >
    <BellIcon
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
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.color.error,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.color.background,
      }}
    />
  </TouchableOpacity>

  {/* Level */}
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.space.sm,
      paddingVertical: theme.space.xs,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.color.border,
      backgroundColor: theme.color.surface,
    }}
  >
    <StarIcon
      size={theme.fontSize.sm}
      color={theme.color.warning}
    />
    <Text
      style={{
        marginLeft: theme.space.xs,
        color: theme.color.accent,
        fontSize: theme.fontSize.sm,
        fontFamily: theme.fontFamily.bold,
      }}
    >
      {`${theme.i18n.t('Lv')} ${level}`}
    </Text>
  </View>
      </View>
    </View>
  );
}

type Subject = {
  id: string;
  label: string;
};

type SubjectColorKey = 'error' | 'info' | 'warning' | 'success' | 'accent' | 'textSecondary';

const subjectColorKeys: Record<string, SubjectColorKey> = {
  anatomy: 'error',
  physiology: 'info',
  pathology: 'warning',
  pharma: 'success',
  surgery: 'accent',
  micro: 'textSecondary',
};

const SubjectIcon = ({ id, color, size }: { id: string; color: string; size: number }) => {
  const props = { size, color, strokeWidth: 1.8 };
  switch (id) {
    case 'anatomy':    return <Heart {...props} />;
    case 'physiology': return <Activity {...props} />;
    case 'pathology':  return <Microscope {...props} />;
    case 'pharma':     return <Pill {...props} />;
    case 'surgery':    return <Scissors {...props} />;
    case 'micro':      return <Brain {...props} />;
    default:           return null;
  }
};

function PracticeBySubject({
  subjects,
  onPress,
}: {
  subjects?: Subject[];
  onPress?: (id: string) => void;
}) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const defaultSubjects: Subject[] = [
    { id: 'anatomy', label: theme.i18n.t('Anatomy') },
    { id: 'physiology', label: theme.i18n.t('Physiology') },
    { id: 'pathology', label: theme.i18n.t('Pathology') },
    { id: 'pharma', label: theme.i18n.t('Pharma') },
    { id: 'surgery', label: theme.i18n.t('Surgery') },
    { id: 'micro', label: theme.i18n.t('Micro') },
  ];

  const finalSubjects = subjects ?? defaultSubjects;

  const itemWidth = `${100 / finalSubjects.length}%`;
  const iconSize = Math.min(width * 0.13, 58);
  const svgSize = iconSize * 0.45;

  const subjectColors: Record<string, string> = {
    error: theme.color.error,
    info: theme.color.accent,
    warning: theme.color.warning,
    success: theme.color.success,
    accent: theme.color.accent,
    textSecondary: theme.color.premium,
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: theme.space.sm,
      }}
    >
      {finalSubjects.map((subject) => {
        const colorKey = subjectColorKeys[subject.id] ?? 'accent';
        const iconColor = subjectColors[colorKey];
        return (
          <TouchableOpacity
            key={subject.id}
            activeOpacity={0.8}
            onPress={() => onPress?.(subject.id)}
          style={{
  width: itemWidth,
  alignItems: 'center',
  paddingHorizontal: 2, 
}}
          >
            <View
              style={{
                width: iconSize,
                height: iconSize,
                borderRadius: iconSize / 3,
                backgroundColor: `${iconColor}12`,
                borderWidth: 1,
                borderColor: `${iconColor}35`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.space.xs,
              }}
            >
              <SubjectIcon id={subject.id} color={iconColor} size={svgSize} />
            </View>
            <Text
              numberOfLines={1}
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontWeight.medium,
                textAlign: 'center',
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
  useBottomBar(true, 'home');

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <Header
        initial="M"
        name="Dr. Mohsin A."
        streak={24}
        level={12}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.md,
          paddingBottom: theme.space.xxl + theme.space.xl,
          gap: theme.space.md,
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
          title="Anatomy Essentials"
          questions={30}
          duration={45}
          difficulty="medium"
          endsAt="840"
          epReward={150}
          onStart={() => {}}
        />

        <View style={{ gap: theme.space.sm }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
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
            <TouchableOpacity onPress={() => {}}>
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
        <View style={{ gap: theme.space.sm }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
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
            <TouchableOpacity onPress={() => {}}>
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
          <PracticeBySubject
            onPress={(subjectId) => {
              console.log('Selected Subject:', subjectId);
            }}
          />
        </View>
        <PerformanceTrendCard
          accuracy={{
            mon: 72, tue: 78, wed: 75, thu: 82, fri: 88, sat: 85, sun: 90,
          }}
        />
      </ScrollView>
    </View>
  );
}