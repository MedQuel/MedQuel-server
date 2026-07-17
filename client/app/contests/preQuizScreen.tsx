import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '@/common/context/useBottomBar';
import { ContestDetailCard } from '../../components/ContestDetailCard';
import { ContestDifficultyCard } from '../../components/ContestDifficultyCard';

export type QuizRule = {
  id: string; points: number; description: string;
  icon: 'plus-circle' | 'minus-circle' | 'clock';
  color: 'success' | 'error' | 'textMuted' | 'info';
};

export type QuizTopic = { id: string; label: string };

export type PreQuizData = {
  subtitle: string; title: string; creator: string; creatorSpecialty: string;
  qCount: number; timeMinutes: number; epReward: number; passPercentage: number;
  bestScore: number; attempts: number; bestRank: number;
  difficulty: 'easy' | 'intermediate' | 'hard'; recommended: string;
  topics: QuizTopic[]; rules: QuizRule[];
};

export const preQuizMockData: PreQuizData = {
  subtitle: 'WEEKLY CONTEST',
  title: 'Cardiology Sprint',
  creator: 'MedQuel',
  creatorSpecialty: 'Cardiology',
  qCount: 30,
  timeMinutes: 45,
  epReward: 150,
  passPercentage: 70,
  bestScore: 83,
  attempts: 3,
  bestRank: 42,
  difficulty: 'intermediate',
  recommended: 'Year 4+ MBBS',
  topics: [{ id: '1', label: 'Heart Anatomy' }, { id: '2', label: 'ECG Interpretation' }, { id: '3', label: 'Heart Failure' }, { id: '4', label: 'Arrhythmias' }, { id: '5', label: 'MI Management' }, { id: '6', label: 'Valve Disorders' }],
  rules: [
    { id: '1', points: 4, description: 'points for correct answer', icon: 'plus-circle', color: 'success' },
    { id: '2', points: -1, description: 'point for wrong answer', icon: 'minus-circle', color: 'error' },
    { id: '3', points: 0, description: '0 points for skipped questions', icon: 'minus-circle', color: 'textMuted' },
    { id: '4', points: 0, description: 'Timer runs from the moment you enter', icon: 'clock', color: 'info' },
  ],
};

type StatItemProps = {
  value: string;
  label: string;
  color: string;
};

function StatItem({ value, label, color }: StatItemProps) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: theme.space.xs }}>
      <Text
        style={{
          color,
          fontSize: theme.fontSize.xl,
          fontWeight: theme.fontWeight.bold as any,
          fontFamily: theme.fontFamily.number,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: theme.color.textMuted,
          fontSize: theme.fontSize.xs,
          fontFamily: theme.fontFamily.light,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function PreQuizScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const data = preQuizMockData;
  const router = useRouter();
  useBottomBar(false);

  const ruleColor = (color: typeof data.rules[0]['color']): string => {
    if (color === 'success')  return theme.color.success;
    if (color === 'error')    return theme.color.error;
    if (color === 'info')     return theme.color.info;
    return theme.color.textMuted;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.sm,
          gap: theme.space.md,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/contests')}
          style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.card,
            borderWidth: 1,
            borderColor: theme.color.border,
          }}
        >
          <Feather name="chevron-left" size={theme.fontSize.xl} color={theme.color.textPrimary} />
        </TouchableOpacity>

        <View>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold as any,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            Contest Details
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.light,
            }}
          >
            Review before you start
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: theme.space.md, gap: theme.space.md, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <ContestDetailCard
          subtitle={data.subtitle}
          title={data.title}
          creator={data.creator}
          creatorSpecialty={data.creatorSpecialty}
          qCount={data.qCount}
          timeMinutes={data.timeMinutes}
          epReward={data.epReward}
          passPercentage={data.passPercentage}
        />

        <View
          style={{
            flexDirection: 'row',
            padding: theme.space.md,
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.card,
          }}
        >
          <StatItem
            value={`${data.bestScore}%`}
            label="Best Score"
            color={theme.color.success}
          />
          <View style={{ width: 1, backgroundColor: theme.color.border }} />
          <StatItem
            value={String(data.attempts)}
            label="Attempts"
            color={theme.color.textPrimary}
          />
          <View style={{ width: 1, backgroundColor: theme.color.border }} />
          <StatItem
            value={`#${data.bestRank}`}
            label="Best Rank"
            color={theme.color.warning}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: theme.space.md }}>
          <View style={{ flex: 1 }}>
            <ContestDifficultyCard difficulty={data.difficulty} />
          </View>
          <View
            style={{
              flex: 1,
              padding: theme.space.md,
              borderRadius: theme.borderRadius.xl,
              borderWidth: 1,
              borderColor: theme.color.border,
              backgroundColor: theme.color.card,
              gap: theme.space.sm,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              Recommended
            </Text>
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.bold as any,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {data.recommended}
            </Text>
          </View>
        </View>

        <View
          style={{
            padding: theme.space.md,
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.card,
            gap: theme.space.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
            <Feather name="book-open" size={theme.fontSize.md} color={theme.color.accent} />
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.bold as any,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              Topics Covered
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
            {data.topics.map((topic) => (
              <View
                key={topic.id}
                style={{
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.xs,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.color.surface,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                }}
              >
                <Text
                  style={{
                    color: theme.color.textSecondary,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {topic.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            padding: theme.space.md,
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.card,
            gap: theme.space.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
            <Feather name="info" size={theme.fontSize.md} color={theme.color.accent} />
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.bold as any,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              Rules
            </Text>
          </View>

          <View style={{ gap: theme.space.sm }}>
            {data.rules.map((rule) => (
              <View
                key={rule.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: theme.borderRadius.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: ruleColor(rule.color) + '18',
                  }}
                >
                  <Text
                    style={{
                      color: ruleColor(rule.color),
                      fontSize: theme.fontSize.xs,
                      fontWeight: theme.fontWeight.bold as any,
                      fontFamily: theme.fontFamily.number,
                    }}
                  >
                    {rule.points > 0 ? `+${rule.points}` : rule.points === 0 ? '0' : rule.points}
                  </Text>
                </View>
                <Text
                  style={{
                    flex: 1,
                    color: theme.color.textSecondary,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {rule.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: theme.space.md,
          paddingBottom: theme.space.md + insets.bottom,
          gap: theme.space.sm,
          backgroundColor: theme.color.background,
          borderTopWidth: 1,
          borderTopColor: theme.color.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/contests/quizScreen')}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.space.sm,
            paddingVertical: theme.space.md,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.accent,
          }}
        >
          <Feather name="zap" size={theme.fontSize.lg} color="#FFFFFF" />
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.bold as any,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            Start Contest
          </Text>
          <Feather name="chevron-right" size={theme.fontSize.lg} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push({ pathname: '/contests/quizScreen', params: { practice: '1' } })}
          activeOpacity={0.85}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.md,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.card,
          }}
        >
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            Practice Mode (No EP)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}