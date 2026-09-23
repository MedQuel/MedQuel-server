import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { View, Text, ScrollView, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { normalizeError } from '../../common/api/api.errors';
import { useAppContext } from '../../common/context/AppContext';
import { SubjectId, subjectCatalog } from '../../common/constants/subject';
import type { Difficulty, StartQuizSessionInput } from '../../common/types/types';


const MIN_QUESTIONS = 2;
const MAX_QUESTIONS = 50;
const MIN_TIME_MINS = 1;
const MAX_TIME_MINS = 60;
const DIFFICULTY_OPTIONS: Difficulty[] = ['easy', 'medium', 'hard'];
const QUESTION_COUNT_STORAGE_KEY = 'medquel:practice-question-count:';

function calculateDefaultTimeMins(questionCount: number): number {
  if (questionCount <= MIN_QUESTIONS) return MIN_TIME_MINS;
  return Math.min(MAX_TIME_MINS, Math.max(MIN_TIME_MINS, Math.ceil((questionCount*30) / 60)));
}

export function SubjectQuizWizard({ subjectId }: { subjectId: SubjectId }) {
  const { user } = useAppContext();
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>(user?.quizPrefs.defaultDifficulty ?? 'medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [questionCountLoaded, setQuestionCountLoaded] = useState(false);
  const [timeLimitMins, setTimeLimitMins] = useState(calculateDefaultTimeMins(10));
  const [questionSliderWidth, setQuestionSliderWidth] = useState(0);
  const [timeSliderWidth, setTimeSliderWidth] = useState(0);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const topicCacheRef = useRef<Record<string, string[]>>({});
  const topicRequestRef = useRef(0);

  const router = useRouter();
  const { theme } = useTheme();

  const subjectTitle = subjectCatalog[subjectId].title;

  useEffect(() => {
    if (!startError) return;
    const timeoutId = setTimeout(() => setStartError(null), 4000);

    return () => clearTimeout(timeoutId);
  }, [startError]);

  useEffect(() => {
    setDifficulty(user?.quizPrefs.defaultDifficulty ?? 'medium');
  }, [user?.quizPrefs.defaultDifficulty]);

  useEffect(() => {
    let isActive = true;
    const storageKey = `${QUESTION_COUNT_STORAGE_KEY}${user?.uid ?? 'anonymous'}`;

    AsyncStorage.getItem(storageKey)
      .then((storedCount) => {
        if (!isActive || !storedCount) return;
        const parsedCount = Number(storedCount);

        if (Number.isInteger(parsedCount) && parsedCount >= MIN_QUESTIONS && parsedCount <= MAX_QUESTIONS) {
          setQuestionCount(parsedCount);
          setTimeLimitMins(calculateDefaultTimeMins(parsedCount));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isActive) setQuestionCountLoaded(true);
      });

    return () => { isActive = false };
  }, [user?.uid]);

  useEffect(() => {
    if (!questionCountLoaded) return;
    AsyncStorage.setItem(
      `${QUESTION_COUNT_STORAGE_KEY}${user?.uid ?? 'anonymous'}`,
      String(questionCount)
    ).catch(() => {});
  }, [questionCount, questionCountLoaded, user?.uid]);

  useEffect(() => {
    const requestId = ++topicRequestRef.current;
    setTopicsLoading(true);
    setTopics([]);
    setSelectedTopic(null);
    setIsTopicDropdownOpen(false);
    setStartError(null);

    const cachedTopics = topicCacheRef.current[subjectTitle];
    if (cachedTopics) {
      setTopics(cachedTopics);
      setTopicsLoading(false);
      return;
    }

    api.quiz
      .getTopicsForSubject(subjectTitle)
      .then((result) => {
        if (topicRequestRef.current !== requestId) return;
        const fetchedTopics = result ?? [];
        topicCacheRef.current[subjectTitle] = fetchedTopics;
        setTopics(fetchedTopics);
      })
      .catch(() => {
        if (topicRequestRef.current !== requestId) return;
        topicCacheRef.current[subjectTitle] = [];
        setTopics([]);
      })
      .finally(() => {
        if (topicRequestRef.current === requestId) setTopicsLoading(false);
      });
  }, [subjectTitle]);

  const getDifficultyColor = (value: Difficulty) => {
    switch (value) {
      case 'easy':
        return theme.color.success;
      case 'medium':
        return theme.color.warning;
      case 'hard':
        return theme.color.error;
    }
  };

  const updateQuestionCount = (value: number) => {
    const next = Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, Math.round(value)));
    setQuestionCount(next);
    setTimeLimitMins(calculateDefaultTimeMins(next));
  };

  const updateTimeLimit = (value: number) => {
    setTimeLimitMins(Math.max(MIN_TIME_MINS, Math.min(MAX_TIME_MINS, Math.round(value))));
  };

  const questionPanResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        if (questionSliderWidth > 0) {
          updateQuestionCount(
            MIN_QUESTIONS + (event.nativeEvent.locationX/questionSliderWidth) * (MAX_QUESTIONS-MIN_QUESTIONS)
          );
        }
      },
      onPanResponderMove: (event) => {
        if (questionSliderWidth > 0) {
          updateQuestionCount(
            MIN_QUESTIONS + (event.nativeEvent.locationX/questionSliderWidth) * (MAX_QUESTIONS-MIN_QUESTIONS)
          );
        }
      },
    }),
    [questionSliderWidth]
  );

  const timePanResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        if (timeSliderWidth > 0) {
          updateTimeLimit(
            MIN_TIME_MINS + (event.nativeEvent.locationX/timeSliderWidth) * (MAX_TIME_MINS-MIN_TIME_MINS)
          );
        }
      },
      onPanResponderMove: (event) => {
        if (timeSliderWidth > 0) {
          updateTimeLimit(
            MIN_TIME_MINS + (event.nativeEvent.locationX/timeSliderWidth) * (MAX_TIME_MINS-MIN_TIME_MINS)
          );
        }
      },
    }),
    [timeSliderWidth]
  );

  const questionSliderPercent = ((questionCount-MIN_QUESTIONS) / (MAX_QUESTIONS-MIN_QUESTIONS)) * 100;
  const timeSliderPercent = ((timeLimitMins-MIN_TIME_MINS) / (MAX_TIME_MINS-MIN_TIME_MINS)) * 100;
  const dropdownOptions = [
    { label: theme.i18n.t('home.practiceBySubject.all_topics'), value: null },
    ...topics.map((topic) => ({ label: topic, value: topic })),
  ];
  const selectedTopicLabel = selectedTopic ?? theme.i18n.t('home.practiceBySubject.all_topics');
  const isStartDisabled = starting || topicsLoading || !questionCountLoaded || topics.length === 0;

  const startPractice = async () => {
    if (isStartDisabled) return;
    setStarting(true);
    setStartError(null);
    try {
      const input: StartQuizSessionInput = {
        quizType: 'subject',
        subject: subjectTitle,
        ...(selectedTopic ? { topic: selectedTopic } : {}),
        difficulty,
        questionCount,
        timeLimitSecs: Math.min(7200, Math.max(60, timeLimitMins*60)),
      };
      const result = await api.quiz.startQuizSession(input);

      router.push({
        pathname: '/contests/[quizId]',
        params: {
          quizId: result.sessionId,
          mode: 'subject',
          subject: subjectTitle,
          ...(selectedTopic ? { topic: selectedTopic } : {}),
          sessionData: encodeURIComponent(JSON.stringify(result)),
        },
      });
    } catch (error) {
      setStartError(normalizeError(error).message);
    } finally {
      setStarting(false);
    }
  };

  const renderSlider = (
    panHandlers: ReturnType<typeof PanResponder.create>['panHandlers'],
    onLayout: (event: { nativeEvent: { layout: { width: number } } }) => void,
    percent: number
  ) => (
    <View
      {...panHandlers}
      onLayout={onLayout}
      style={{ flex: 1, height: theme.space.xl, justifyContent: 'center' }}
    >
      <View
        style={{
          overflow: 'hidden',
          width: '100%',
          height: theme.space.sm,
          borderRadius: theme.borderRadius.sm,
          backgroundColor: theme.color.border,
        }}
      >
        <View style={{ height: '100%', width: `${percent}%`, backgroundColor: theme.color.accent }} />
      </View>

      <View
        style={{
          position: 'absolute',
          left: `${percent}%`,
          marginLeft: -10,
          width: 20,
          height: 20,
          borderRadius: theme.space.lg,
          backgroundColor: theme.color.accent,
          elevation: 3,
        }}
      />
    </View>
  );

  const renderStepper = (
    value: number,
    minimum: number,
    maximum: number,
    onChange: (next: number) => void,
    slider: React.ReactNode
  ) => (
    <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onChange(value - 1)}
        disabled={value <= minimum}
        style={{
          width: theme.space.lg * 1.25,
          height: theme.space.lg * 1.25,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.color.surface,
          opacity: value <= minimum ? 0.4 : 1,
        }}
      >
        <Feather name='minus' size={theme.fontSize.sm} color={theme.color.textPrimary} />
      </TouchableOpacity>

      {slider}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onChange(value + 1)}
        disabled={value >= maximum}
        style={{
          width: theme.space.lg * 1.25,
          height: theme.space.lg * 1.25,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.color.surface,
          opacity: value >= maximum ? 0.4 : 1,
        }}
      >
        <Feather name='plus' size={theme.fontSize.sm} color={theme.color.textPrimary} />
      </TouchableOpacity>
    </View>
  );


  return (
    <View
      style={{
        gap: theme.space.md,
        paddingTop: theme.space.xs,
        paddingBottom: theme.space.md,
        paddingHorizontal: theme.space.md,
        borderTopWidth: 1,
        borderTopColor: `${theme.color.border}60`,
      }}
    >
      <View style={{ zIndex: 10, gap: theme.space.xs }}>
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            color: theme.color.textSecondary,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {theme.i18n.t('home.practiceBySubject.select_topic')}
        </Text>

        {topicsLoading ? (
          <ActivityIndicator size='small' color={theme.color.accent} />
        ) : (
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={topics.length === 0}
              onPress={() => setIsTopicDropdownOpen((open) => !open)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: theme.space.sm,
                paddingHorizontal: theme.space.md,
                borderWidth: 1.5,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.color.surface,
                opacity: topics.length === 0 ? 0.7 : 1,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.color.textPrimary,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {selectedTopicLabel}
              </Text>
              <Feather
                name={isTopicDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={theme.fontSize.md}
                color={theme.color.textSecondary}
              />
            </TouchableOpacity>

            {isTopicDropdownOpen && (
              <View
                style={{
                  overflow: 'hidden',
                  maxHeight: 180,
                  marginTop: theme.space.xs,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.color.surface,
                  elevation: 4,
                }}
              >
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                  {dropdownOptions.map((option, index) => {
                    const isSelected = selectedTopic === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value ?? `all-${index}`}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedTopic(option.value);
                          setIsTopicDropdownOpen(false);
                        }}
                        style={{
                          paddingVertical: theme.space.sm,
                          paddingHorizontal: theme.space.md,
                          borderBottomColor: theme.color.border,
                          borderBottomWidth: index < dropdownOptions.length-1 ? 0.5 : 0,
                          backgroundColor: isSelected ? `${theme.color.accent}15` : 'transparent',
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: theme.fontSize.sm,
                            color: isSelected ? theme.color.accent : theme.color.textPrimary,
                            fontWeight: isSelected ? theme.fontWeight.bold : theme.fontWeight.regular,
                            fontFamily: theme.fontFamily.regular,
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={{ gap: theme.space.xs, flexDirection: 'row' }}>
        {DIFFICULTY_OPTIONS.map((option) => {
          const selected = difficulty === option;
          const color = getDifficultyColor(option);
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.8}
              onPress={() => setDifficulty(option)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: theme.space.xs * 1.5,
                borderWidth: 1.5,
                borderRadius: theme.borderRadius.md,
                borderColor: selected ? color : theme.color.border,
                backgroundColor: selected ? `${color}18` : theme.color.surface,
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.xs * 1.15,
                  color: selected ? color : theme.color.textSecondary,
                  fontWeight: selected ? theme.fontWeight.bold : theme.fontWeight.regular,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t(`common.${option}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ gap: theme.space.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('home.practiceBySubject.question_count')}
          </Text>
          <Text
            style={{
              color: theme.color.accent,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.numberBold,
            }}
          >
            {questionCount}
          </Text>
        </View>

        {renderStepper(
          questionCount,
          MIN_QUESTIONS,
          MAX_QUESTIONS,
          updateQuestionCount,
          renderSlider(
            questionPanResponder.panHandlers,
            (event) => setQuestionSliderWidth(event.nativeEvent.layout.width),
            questionSliderPercent
          )
        )}
      </View>

      <View style={{ gap: theme.space.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('home.practiceBySubject.time_limit')}
          </Text>
          <Text
            style={{
              color: theme.color.accent,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.numberBold,
            }}
          >
            {timeLimitMins} {theme.i18n.t('common.min')}
          </Text>
        </View>

        {renderStepper(
          timeLimitMins,
          MIN_TIME_MINS,
          MAX_TIME_MINS,
          updateTimeLimit,
          renderSlider(
            timePanResponder.panHandlers,
            (event) => setTimeSliderWidth(event.nativeEvent.layout.width),
            timeSliderPercent
          )
        )}
      </View>

      {startError && (
        <View
          style={{
            gap: theme.space.xs,
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.space.sm,
            borderWidth: 1,
            borderColor: theme.color.error,
            borderRadius: theme.borderRadius.md,
            backgroundColor: `${theme.color.error}15`,
          }}
        >
          <Feather
            name='alert-circle'
            size={theme.fontSize.sm}
            color={theme.color.error}
          />
          <Text
            style={{
              flex: 1,
              color: theme.color.error,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {startError}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={startPractice}
        disabled={isStartDisabled}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: theme.space.xs,
          paddingVertical: theme.space.sm,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.accent,
          opacity: isStartDisabled ? 0.4 : 1,
        }}
      >
        {starting ? (
          <ActivityIndicator
            size='small' 
            color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
          />
        ) : (
          <Text
            style={{
              fontSize: theme.fontSize.md,
              color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('home.practiceBySubject.start_practice')}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
