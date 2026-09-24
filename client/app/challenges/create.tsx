import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PanResponder, TouchableOpacity, ActivityIndicator } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { hasValidPhoto } from '../../common/utils/imageUrl';
import { getInitials } from '../../common/utils/getInitials';
import { normalizeError } from '../../common/api/api.errors';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import type { Difficulty, FriendSummary } from '../../common/types/types';
import { SubjectIcon, subjectCatalog, type SubjectId } from '../../common/constants/subject';


const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 40;
const MIN_TIME_MINS = 1;
const MAX_TIME_MINS = 30;
const DEFAULT_QUESTIONS = 15;
const DEFAULT_TIME_MINS = 10;
const DIFFICULTY_OPTIONS: Difficulty[] = ['easy', 'medium', 'hard'];

export default function CreateChallengeScreen() {
  const { user } = useAppContext();
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState(false);
  const [selectedFriendUid, setSelectedFriendUid] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(user?.quizPrefs.defaultDifficulty ?? 'medium');
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTIONS);
  const [timeLimitMins, setTimeLimitMins] = useState(DEFAULT_TIME_MINS);
  const [questionSliderWidth, setQuestionSliderWidth] = useState(0);
  const [timeSliderWidth, setTimeSliderWidth] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  useBottomBar(false);

  useEffect(() => {
    let isActive = true;
    setFriendsLoading(true);
    api.friends
      .getFriends()
      .then((result) => {
        if (isActive) setFriends(result);
      })
      .catch(() => {
        if (isActive) setFriendsError(true);
      })
      .finally(() => {
        if (isActive) setFriendsLoading(false);
      });

    return () => { isActive = false };
  }, []);

  const updateQuestionCount = (value: number) =>
    setQuestionCount(Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, Math.round(value))));
  const updateTimeLimit = (value: number) =>
    setTimeLimitMins(Math.max(MIN_TIME_MINS, Math.min(MAX_TIME_MINS, Math.round(value))));

  const questionPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) =>
      questionSliderWidth > 0 &&
      updateQuestionCount(MIN_QUESTIONS + (e.nativeEvent.locationX/questionSliderWidth) * (MAX_QUESTIONS-MIN_QUESTIONS)),
    onPanResponderMove: (e) =>
      questionSliderWidth > 0 &&
      updateQuestionCount(MIN_QUESTIONS + (e.nativeEvent.locationX/questionSliderWidth) * (MAX_QUESTIONS-MIN_QUESTIONS)),
    }),
    [questionSliderWidth]
  );
  const timePanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) =>
      timeSliderWidth > 0 &&
      updateTimeLimit(MIN_TIME_MINS + (e.nativeEvent.locationX/timeSliderWidth) * (MAX_TIME_MINS-MIN_TIME_MINS)),
    onPanResponderMove: (e) =>
      timeSliderWidth > 0 &&
      updateTimeLimit(MIN_TIME_MINS + (e.nativeEvent.locationX/timeSliderWidth) * (MAX_TIME_MINS-MIN_TIME_MINS)),
    }),
    [timeSliderWidth]
  );

  const questionPercent = ((questionCount-MIN_QUESTIONS) / (MAX_QUESTIONS-MIN_QUESTIONS)) * 100;
  const timePercent = ((timeLimitMins-MIN_TIME_MINS) / (MAX_TIME_MINS-MIN_TIME_MINS)) * 100;
  const subjectIds = useMemo(
    () => Object.keys(subjectCatalog) as SubjectId[],
    []
  );
  const canSubmit = Boolean(selectedFriendUid && selectedSubjectId) && !submitting;

  const renderSlider = (panHandlers: any, onLayout: any, percent: number) => (
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
        <View
          style={{
            height: '100%',
            width: `${percent}%`,
            backgroundColor: theme.color.accent,
          }}
        />
      </View>

      <View
        style={{
          position: 'absolute',
          left: `${percent}%`,
          width: 20,
          height: 20,
          marginLeft: -10,
          borderRadius: theme.space.lg,
          backgroundColor: theme.color.accent,
          elevation: 3,
        }}
      />
    </View>
  );

  const renderStepper = (
    value: number,
    min: number,
    max: number,
    onChange: (n: number) => void,
    slider: React.ReactNode
  ) => (
    <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onChange(value - 1)}
        disabled={value <= min}
        style={{
          width: theme.space.lg * 1.25,
          height: theme.space.lg * 1.25,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.color.surface,
          opacity: value <= min ? 0.4 : 1,
        }}
      >
        <Feather
          name='minus'
          size={theme.fontSize.sm}
          color={theme.color.textPrimary}
        />
      </TouchableOpacity>

      {slider}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onChange(value + 1)}
        disabled={value >= max}
        style={{
          width: theme.space.lg * 1.25,
          height: theme.space.lg * 1.25,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.color.surface,
          opacity: value >= max ? 0.4 : 1,
        }}
      >
        <Feather
          name='plus'
          size={theme.fontSize.sm}
          color={theme.color.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );

  const handleSubmit = async () => {
    if (!canSubmit || !selectedFriendUid || !selectedSubjectId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.challenge.createChallenge({
        toUid: selectedFriendUid,
        subject: subjectCatalog[selectedSubjectId].title,
        difficulty,
        questionCount,
        timeLimitSecs: Math.min(1800, Math.max(60, timeLimitMins*60)),
      });
      router.replace('/challenges');
    } catch (err) {
      setSubmitError(normalizeError(err).message);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScreenHeader
        title={theme.i18n.t('challenges.create.title')}
        subtitle={theme.i18n.t('challenges.create.subtitle')}
      />

      <ScrollView
        contentContainerStyle={{
          gap: theme.space.lg,
          paddingVertical: theme.space.sm,
          paddingHorizontal: theme.space.md,
          paddingBottom: insets.bottom + theme.space.xxl,
        }}
      >
        <View style={{ gap: theme.space.sm }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm * 1.05,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('challenges.create.pickOpponent')}
          </Text>

          {friendsLoading ? (
            <ActivityIndicator color={theme.color.accent} />
          ) : friendsError ? (
            <Text style={{ color: theme.color.error, fontFamily: theme.fontFamily.regular }}>
              {theme.i18n.t('challenges.create.friendsLoadError')}
            </Text>
          ) : friends.length === 0 ? (
            <View
              style={{
                gap: theme.space.sm,
                alignItems: 'center',
                padding: theme.space.md,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.card,
              }}
            >
              <Feather name='users' size={theme.space.lg * 1.25} color={theme.color.textMuted} />
              <Text
                style={{
                  textAlign: 'center',
                  color: theme.color.textMuted,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t('challenges.create.noFriends')}
              </Text>

              <TouchableOpacity onPress={() => router.push('/friends')}>
                <Text style={{ color: theme.color.accent, fontFamily: theme.fontFamily.bold }}>
                  {theme.i18n.t('challenges.create.findFriends')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: theme.space.md, paddingVertical: theme.space.xs }}
            >
              {friends.map((friend) => {
                const selected = selectedFriendUid === friend.uid;
                return (
                  <TouchableOpacity
                    key={friend.uid}
                    activeOpacity={0.8}
                    onPress={() => setSelectedFriendUid(friend.uid)}
                    style={{ width: 68, gap: theme.space.xs, alignItems: 'center' }}
                  >
                    <View
                      style={{
                        position: 'relative',
                        padding: selected ? theme.space.xs * 0.5 : 0,
                        borderWidth: selected ? 2 : 0,
                        borderColor: theme.color.accent,
                        borderRadius: theme.borderRadius.full,
                      }}
                    >
                      {hasValidPhoto(friend.photoURL) ? (
                        <Image
                          source={{ uri: friend.photoURL! }}
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: theme.borderRadius.full,
                          }}
                        />
                      ) : (
                        <LinearGradient
                          colors={['#5B7FFF', '#6D4CFF']}
                          style={{
                            width: 56,
                            height: 56,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: theme.borderRadius.full,
                          }}
                        >
                          <Text style={{ color: theme.color.textInverse, fontFamily: theme.fontFamily.bold }}>
                            {getInitials(friend.displayName)}
                          </Text>
                        </LinearGradient>
                      )}

                      {selected && (
                        <View
                          style={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 20,
                            height: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: theme.color.background,
                            borderRadius: theme.borderRadius.full,
                            backgroundColor: theme.color.accent,
                          }}
                        >
                          <Feather
                            name='check'
                            size={theme.space.sm * 1.5}
                            color={theme.color.textInverse}
                          />
                        </View>
                      )}
                    </View>

                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: theme.fontSize.xs,
                        fontFamily: theme.fontFamily.regular,
                        color: selected ? theme.color.accent : theme.color.textSecondary,
                      }}
                    >
                      {friend.displayName.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={{ gap: theme.space.sm }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm * 1.05,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('challenges.create.pickSubject')}
          </Text>

          <View style={{ flexWrap: 'wrap', gap: theme.space.sm, flexDirection: 'row' }}>
            {subjectIds.map((id) => {
              const def = subjectCatalog[id];
              const selected = selectedSubjectId === id;
              const color = theme.color[def.variant];
              return (
                <TouchableOpacity
                  key={id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedSubjectId(id)}
                  style={{
                    gap: theme.space.xs,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: theme.space.xs * 1.5,
                    paddingHorizontal: theme.space.sm,
                    borderWidth: 1.5,
                    borderRadius: theme.borderRadius.md,
                    borderColor: selected ? color : theme.color.border,
                    backgroundColor: selected ? `${color}18` : theme.color.surface,
                  }}
                >
                  <SubjectIcon
                    id={id}
                    size={theme.fontSize.md}
                    color={selected ? color : theme.color.textSecondary}
                  />
                  <Text
                    style={{
                      fontSize: theme.fontSize.xs,
                      fontFamily: theme.fontFamily.regular,
                      color: selected ? color : theme.color.textSecondary,
                    }}
                  >
                    {theme.i18n.t(def.title)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ gap: theme.space.xs }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm * 1.05,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('challenges.create.pickDifficulty')}
          </Text>

          <View style={{ gap: theme.space.xs, flexDirection: 'row' }}>
            {DIFFICULTY_OPTIONS.map((option) => {
              const selected = difficulty === option;
              const color = option === 'easy'
                ? theme.color.success
                : option === 'medium' ? theme.color.warning : theme.color.error;
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
                      fontSize: theme.fontSize.xs,
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
        </View>

        <View style={{ gap: theme.space.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontSize: theme.fontSize.sm * 1.05,
                color: theme.color.textSecondary,
                fontFamily: theme.fontFamily.bold,
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
              (e: any) => setQuestionSliderWidth(e.nativeEvent.layout.width),
              questionPercent
            )
          )}
        </View>

        <View style={{ gap: theme.space.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontSize: theme.fontSize.sm * 1.05,
                color: theme.color.textSecondary,
                fontFamily: theme.fontFamily.bold,
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
              (e: any) => setTimeSliderWidth(e.nativeEvent.layout.width),
              timePercent
            )
          )}
        </View>

        {submitError && (
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
              {submitError}
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          paddingTop: theme.space.sm,
          paddingBottom: insets.bottom * 1.25,
          paddingHorizontal: theme.space.lg,
          backgroundColor: theme.color.background,
        }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.sm * 1.5,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.accent,
            opacity: canSubmit ? 1 : 0.4,
          }}
        >
          {submitting ? (
            <ActivityIndicator
              size='small'
              color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
            />
          ) : (
            <Text
              style={{
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.bold,
                color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
              }}
            >
              {theme.i18n.t('challenges.create.send')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
