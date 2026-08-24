import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, PanResponder } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { SubjectId, SubjectIcon, subjectCatalog } from '../../common/constants/subject';
import { api } from '../../common/api/api';
import { normalizeError } from '../../common/api/api.errors';
import type { Difficulty, StartQuizSessionInput } from '../../common/types/types';

const DIFFICULTY_OPTIONS: Difficulty[] = ['easy', 'medium', 'hard'];
const ALL_TOPICS = null;

const MIN_QUESTIONS = 2;
const MAX_QUESTIONS = 50;

const MIN_TIME_MINS = 5;
const MAX_TIME_MINS = 60;

export default function AllSubjectsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const [expandedSubject, setExpandedSubject] = useState<SubjectId | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(ALL_TOPICS);
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [sliderWidth, setSliderWidth] = useState(0);

  const [timeLimitMins, setTimeLimitMins] = useState(15);
  const [timeSliderWidth, setTimeSliderWidth] = useState(0);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const topicCacheRef = useRef<Record<string, string[]>>({});

  const allSubjectIds = Object.keys(subjectCatalog) as SubjectId[];

  const getDifficultyColor = (d: Difficulty) => {
    switch (d) {
      case 'easy':
        return theme.color.success;
      case 'medium':
        return theme.color.warning;
      case 'hard':
        return theme.color.error;
      default:
        return theme.color.accent;
    }
  };

  const handleToggleSubject = async (id: SubjectId) => {
    if (expandedSubject === id) {
      setExpandedSubject(null);
      return;
    }
    setExpandedSubject(id);
    setSelectedTopic(ALL_TOPICS);
    setIsTopicDropdownOpen(false);
    setDifficulty('medium');
    setQuestionCount(10);
    setTimeLimitMins(15);
    setStartError(null);

    const subjectTitle = subjectCatalog[id].title;
    if (topicCacheRef.current[subjectTitle]) {
      setTopics(topicCacheRef.current[subjectTitle]);
      setTopicsError(null);
      return;
    }
    setTopicsLoading(true);
    setTopicsError(null);
    try {
      const result = await api.quiz.getTopicsForSubject(subjectTitle);
      const fetchedTopics = result ?? [];
      topicCacheRef.current[subjectTitle] = fetchedTopics;
      setTopics(fetchedTopics);
    } catch (err) {
      const apiErr = normalizeError(err);
      setTopicsError(apiErr.message);
    } finally {
      setTopicsLoading(false);
    }
  };

  // Question Count Handlers
  const handleDecrementQuestions = () => {
    setQuestionCount((prev) => Math.max(MIN_QUESTIONS, prev - 1));
  };

  const handleIncrementQuestions = () => {
    setQuestionCount((prev) => Math.min(MAX_QUESTIONS, prev + 1));
  };

  const handleQuestionSliderTouch = (locationX: number) => {
    if (sliderWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, locationX / sliderWidth));
    const value = Math.round(MIN_QUESTIONS + ratio * (MAX_QUESTIONS - MIN_QUESTIONS));
    setQuestionCount(value);
  };

  const questionPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => handleQuestionSliderTouch(evt.nativeEvent.locationX),
    onPanResponderMove: (evt) => handleQuestionSliderTouch(evt.nativeEvent.locationX),
  });

  // Time Limit Handlers
  const handleDecrementTime = () => {
    setTimeLimitMins((prev) => Math.max(MIN_TIME_MINS, prev - 5));
  };

  const handleIncrementTime = () => {
    setTimeLimitMins((prev) => Math.min(MAX_TIME_MINS, prev + 5));
  };

  const handleTimeSliderTouch = (locationX: number) => {
    if (timeSliderWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, locationX / timeSliderWidth));
    const value = Math.round(MIN_TIME_MINS + ratio * (MAX_TIME_MINS - MIN_TIME_MINS));
    setTimeLimitMins(value);
  };

  const timePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => handleTimeSliderTouch(evt.nativeEvent.locationX),
    onPanResponderMove: (evt) => handleTimeSliderTouch(evt.nativeEvent.locationX),
  });

  const handleStartPractice = async (subjectId: SubjectId) => {
    if (starting) return;
    setStarting(true);
    setStartError(null);

    try {
      const subjectTitle = subjectCatalog[subjectId].title;
      const input: StartQuizSessionInput = {
        quizType: 'subject',
        subject: subjectTitle,
        ...(selectedTopic ? { topic: selectedTopic } : {}),
        difficulty,
        questionCount,
        timeLimitSecs: timeLimitMins * 60,
      };

      const result = await api.quiz.startQuizSession(input);
      const encodedSessionData = encodeURIComponent(JSON.stringify(result));

      router.push({
        pathname: '/contests/[quizId]',
        params: {
          quizId: result.sessionId,
          mode: 'subject',
          subject: subjectTitle,
          ...(selectedTopic ? { topic: selectedTopic } : {}),
          sessionData: encodedSessionData,
        },
      });
    } catch (err) {
      const apiErr = normalizeError(err);
      setStartError(apiErr.message);
    } finally {
      setStarting(false);
    }
  };

  const selectedTopicLabel =
    selectedTopic === ALL_TOPICS
      ? theme.i18n.t('home.practiceBySubject.all_topics')
      : selectedTopic;

  const dropdownOptions = [
    { label: theme.i18n.t('home.practiceBySubject.all_topics'), value: ALL_TOPICS },
    ...topics.map((t) => ({ label: t, value: t })),
  ];

  const questionSliderPercent = ((questionCount - MIN_QUESTIONS) / (MAX_QUESTIONS - MIN_QUESTIONS)) * 100;
  const timeSliderPercent = ((timeLimitMins - MIN_TIME_MINS) / (MAX_TIME_MINS - MIN_TIME_MINS)) * 100;

  return (
    <View style={{ flex: 1, paddingHorizontal: theme.space.md, backgroundColor: theme.color.background }}>
      {/* Header */}
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
          onPress={() => (router.canGoBack() ? router.back() : router.push('/home'))}
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
          <Feather name="chevron-left" size={theme.fontSize.xl} color={theme.color.textPrimary} />
        </TouchableOpacity>

        <View style={{ flexDirection: 'column', gap: theme.space.xs * 0.5 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg * 1.1,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('home.practiceBySubject.title')}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm * 1.05,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {theme.i18n.t('home.practiceBySubject.subtitle')}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: theme.space.sm,
          paddingBottom: theme.space.xl,
        }}
      >
        <View style={{ gap: theme.space.sm * 1.1 }}>
          {allSubjectIds.map((id) => {
            const def = subjectCatalog[id];
            const iconColor = theme.color[def?.variant ?? 'accent'];
            const isExpanded = expandedSubject === id;

            return (
              <View
                key={id}
                style={{
                  borderWidth: 1,
                  borderColor: isExpanded ? theme.color.accent : theme.color.border,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: theme.color.card,
                  overflow: 'hidden',
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleToggleSubject(id)}
                  style={{
                    gap: theme.space.sm * 1.25,
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: theme.space.sm,
                  }}
                >
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: theme.space.md * 0.75,
                      borderWidth: 1,
                      borderColor: `${iconColor}35`,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: `${iconColor}12`,
                    }}
                  >
                    <SubjectIcon id={id} color={iconColor} size={theme.space.lg * 0.9} />
                  </View>

                  <Text
                    style={{
                      flex: 1,
                      color: theme.color.textPrimary,
                      fontSize: theme.fontSize.md,
                      fontFamily: theme.fontFamily.regular,
                    }}
                    numberOfLines={1}
                  >
                    {theme.i18n.t(def?.title ?? id)}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                    size={theme.space.md}
                    color={isExpanded ? theme.color.accent : theme.color.textSecondary}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View
                    style={{
                      paddingHorizontal: theme.space.md,
                      paddingBottom: theme.space.md,
                      paddingTop: theme.space.xs,
                      gap: theme.space.md,
                      borderTopWidth: 1,
                      borderTopColor: theme.color.border + '60',
                    }}
                  >
                    {/* Sub-topic Dropdown */}
                    <View style={{ gap: theme.space.xs, zIndex: 10 }}>
                      <Text
                        style={{
                          color: theme.color.textSecondary,
                          fontSize: theme.fontSize.sm,
                          fontFamily: theme.fontFamily.regular,
                        }}
                      >
                        {theme.i18n.t('home.practiceBySubject.select_topic')}
                      </Text>

                      {topicsLoading ? (
                        <ActivityIndicator size="small" color={theme.color.accent} />
                      ) : topicsError ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
                          <Feather name="alert-circle" size={theme.fontSize.sm} color={theme.color.error} />
                          <Text
                            style={{
                              color: theme.color.error,
                              fontSize: theme.fontSize.xs,
                              fontFamily: theme.fontFamily.regular,
                            }}
                          >
                            {topicsError}
                          </Text>
                        </View>
                      ) : (
                        <View style={{ position: 'relative' }}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setIsTopicDropdownOpen((prev) => !prev)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingVertical: theme.space.sm,
                              paddingHorizontal: theme.space.md,
                              borderWidth: 1.5,
                              borderRadius: theme.borderRadius.md,
                              borderColor: theme.color.border,
                              backgroundColor: theme.color.surface,
                            }}
                          >
                            <Text
                              style={{
                                color: theme.color.textPrimary,
                                fontSize: theme.fontSize.sm,
                                fontFamily: theme.fontFamily.regular,
                              }}
                              numberOfLines={1}
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
                                marginTop: theme.space.xs,
                                borderWidth: 1,
                                borderColor: theme.color.border,
                                borderRadius: theme.borderRadius.md,
                                backgroundColor: theme.color.surface,
                                maxHeight: 180,
                                overflow: 'hidden',
                                elevation: 4,
                              }}
                            >
                              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                                {dropdownOptions.map((opt, index) => {
                                  const isSelected = selectedTopic === opt.value;
                                  return (
                                    <TouchableOpacity
                                      key={opt.value ?? `opt-${index}`}
                                      activeOpacity={0.7}
                                      onPress={() => {
                                        setSelectedTopic(opt.value);
                                        setIsTopicDropdownOpen(false);
                                      }}
                                      style={{
                                        paddingVertical: theme.space.sm,
                                        paddingHorizontal: theme.space.md,
                                        backgroundColor: isSelected
                                          ? theme.color.accent + '15'
                                          : 'transparent',
                                        borderBottomWidth:
                                          index < dropdownOptions.length - 1 ? 0.5 : 0,
                                        borderBottomColor: theme.color.border,
                                      }}
                                    >
                                      <Text
                                        style={{
                                          color: isSelected
                                            ? theme.color.accent
                                            : theme.color.textPrimary,
                                          fontSize: theme.fontSize.sm,
                                          fontWeight: isSelected
                                            ? (theme.fontWeight.bold as any)
                                            : (theme.fontWeight.regular as any),
                                          fontFamily: theme.fontFamily.regular,
                                        }}
                                        numberOfLines={1}
                                      >
                                        {opt.label}
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

                    {/* Difficulty Selection in One Line (No Heading) */}
                    <View style={{ flexDirection: 'row', gap: theme.space.xs }}>
                      {DIFFICULTY_OPTIONS.map((d) => {
                        const selected = difficulty === d;
                        const diffColor = getDifficultyColor(d);
                        return (
                          <TouchableOpacity
                            key={d}
                            activeOpacity={0.8}
                            onPress={() => setDifficulty(d)}
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              paddingVertical: theme.space.xs * 1.5,
                              borderWidth: 1.5,
                              borderRadius: theme.borderRadius.md,
                              borderColor: selected ? diffColor : theme.color.border,
                              backgroundColor: selected ? diffColor + '18' : theme.color.surface,
                            }}
                          >
                            <Text
                              style={{
                                color: selected ? diffColor : theme.color.textSecondary,
                                fontSize: theme.fontSize.xs,
                                fontFamily: theme.fontFamily.regular,
                                fontWeight: selected
                                  ? (theme.fontWeight.bold as any)
                                  : (theme.fontWeight.regular as any),
                              }}
                            >
                              {theme.i18n.t(`common.${d}`)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Question Count Slider */}
                    <View style={{ gap: theme.space.xs }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: theme.color.textSecondary,
                            fontSize: theme.fontSize.sm,
                            fontFamily: theme.fontFamily.regular,
                          }}
                        >
                          {theme.i18n.t('home.practiceBySubject.question_count')}
                        </Text>
                        <Text
                          style={{
                            color: theme.color.accent,
                            fontSize: theme.fontSize.md,
                            fontWeight: theme.fontWeight.bold as any,
                            fontFamily: theme.fontFamily.bold,
                          }}
                        >
                          {questionCount}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: theme.space.sm,
                        }}
                      >
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={handleDecrementQuestions}
                          disabled={questionCount <= MIN_QUESTIONS}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: theme.borderRadius.full,
                            borderWidth: 1.5,
                            borderColor: theme.color.border,
                            backgroundColor: theme.color.surface,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: questionCount <= MIN_QUESTIONS ? 0.4 : 1,
                          }}
                        >
                          <Feather
                            name="minus"
                            size={theme.fontSize.md}
                            color={theme.color.textPrimary}
                          />
                        </TouchableOpacity>

                        <View
                          {...questionPanResponder.panHandlers}
                          onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                          style={{ flex: 1, height: 36, justifyContent: 'center' }}
                        >
                          <View
                            style={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.color.border,
                              width: '100%',
                              overflow: 'hidden',
                            }}
                          >
                            <View
                              style={{
                                height: '100%',
                                width: `${questionSliderPercent}%`,
                                backgroundColor: theme.color.accent,
                              }}
                            />
                          </View>
                          <View
                            style={{
                              position: 'absolute',
                              left: `${questionSliderPercent}%`,
                              marginLeft: -10,
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              backgroundColor: theme.color.accent,
                              elevation: 3,
                            }}
                          />
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={handleIncrementQuestions}
                          disabled={questionCount >= MAX_QUESTIONS}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: theme.borderRadius.full,
                            borderWidth: 1.5,
                            borderColor: theme.color.border,
                            backgroundColor: theme.color.surface,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: questionCount >= MAX_QUESTIONS ? 0.4 : 1,
                          }}
                        >
                          <Feather
                            name="plus"
                            size={theme.fontSize.md}
                            color={theme.color.textPrimary}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs }}>
                          {MIN_QUESTIONS}
                        </Text>
                        <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs }}>
                          {MAX_QUESTIONS}
                        </Text>
                      </View>
                    </View>

                    {/* Time Limit Slider */}
                    <View style={{ gap: theme.space.xs }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: theme.color.textSecondary,
                            fontSize: theme.fontSize.sm,
                            fontFamily: theme.fontFamily.regular,
                          }}
                        >
                          {theme.i18n.t('home.practiceBySubject.time_limit')}
                        </Text>
                        <Text
                          style={{
                            color: theme.color.accent,
                            fontSize: theme.fontSize.md,
                            fontWeight: theme.fontWeight.bold as any,
                            fontFamily: theme.fontFamily.bold,
                          }}
                        >
                          {timeLimitMins} {theme.i18n.t('common.min')}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: theme.space.sm,
                        }}
                      >
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={handleDecrementTime}
                          disabled={timeLimitMins <= MIN_TIME_MINS}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: theme.borderRadius.full,
                            borderWidth: 1.5,
                            borderColor: theme.color.border,
                            backgroundColor: theme.color.surface,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: timeLimitMins <= MIN_TIME_MINS ? 0.4 : 1,
                          }}
                        >
                          <Feather
                            name="minus"
                            size={theme.fontSize.md}
                            color={theme.color.textPrimary}
                          />
                        </TouchableOpacity>

                        <View
                          {...timePanResponder.panHandlers}
                          onLayout={(e) => setTimeSliderWidth(e.nativeEvent.layout.width)}
                          style={{ flex: 1, height: 36, justifyContent: 'center' }}
                        >
                          <View
                            style={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.color.border,
                              width: '100%',
                              overflow: 'hidden',
                            }}
                          >
                            <View
                              style={{
                                height: '100%',
                                width: `${timeSliderPercent}%`,
                                backgroundColor: theme.color.accent,
                              }}
                            />
                          </View>
                          <View
                            style={{
                              position: 'absolute',
                              left: `${timeSliderPercent}%`,
                              marginLeft: -10,
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              backgroundColor: theme.color.accent,
                              elevation: 3,
                            }}
                          />
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={handleIncrementTime}
                          disabled={timeLimitMins >= MAX_TIME_MINS}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: theme.borderRadius.full,
                            borderWidth: 1.5,
                            borderColor: theme.color.border,
                            backgroundColor: theme.color.surface,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: timeLimitMins >= MAX_TIME_MINS ? 0.4 : 1,
                          }}
                        >
                          <Feather
                            name="plus"
                            size={theme.fontSize.md}
                            color={theme.color.textPrimary}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs }}>
                          {MIN_TIME_MINS} {theme.i18n.t('common.min')}
                        </Text>
                        <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs }}>
                          {MAX_TIME_MINS} {theme.i18n.t('common.min')}
                        </Text>
                      </View>
                    </View>

                    {startError && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: theme.space.xs,
                        }}
                      >
                        <Feather
                          name="alert-circle"
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
                      onPress={() => handleStartPractice(id)}
                      disabled={starting}
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: theme.space.sm,
                        borderRadius: theme.borderRadius.lg,
                        backgroundColor: theme.color.accent,
                        opacity: starting ? 0.5 : 1,
                        marginTop: theme.space.xs,
                      }}
                    >
                      {starting ? (
                        <ActivityIndicator size="small" color={theme.color.textInverse} />
                      ) : (
                        <Text
                          style={{
                            color: theme.color.textInverse,
                            fontSize: theme.fontSize.md,
                            fontWeight: theme.fontWeight.bold as any,
                            fontFamily: theme.fontFamily.bold,
                          }}
                        >
                          {theme.i18n.t('home.practiceBySubject.start_practice')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}