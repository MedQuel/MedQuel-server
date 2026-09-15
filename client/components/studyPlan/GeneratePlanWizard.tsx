import { useMemo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { View, ScrollView, Text, TextInput } from 'react-native';
import { Modal, TouchableOpacity, ActivityIndicator } from 'react-native';

import { WeekdayChips } from './WeekdayChips';
import { useTheme } from '../../theme/ThemeContext';
import { MultiSelectChips } from '../common/MultiSelectChips';
import { SPECIALTY_OPTIONS } from '../../common/context/OnboardingContext';
import type { StudyPlan, GenerateStudyPlanInput, DailyCommitment, StudyPlanWeekday, Specialty } from '../../common/types/types';
import { DAILY_COMMITMENT_OPTIONS, EXAM_DATE_PRESETS, MIN_DAYS_PER_WEEK, MAX_SUBJECT_PRIORITY } from '../../common/constants/studyPlanOptions';


const STEP_COUNT = 4;

interface GeneratePlanWizardProps {
  visible: boolean;
  initialPlan: StudyPlan | null;
  onClose: () => void;
  onSubmit: (input: GenerateStudyPlanInput) => Promise<void>;
  submitting: boolean;
  submitError: string | null;
}

export function GeneratePlanWizard({ visible, initialPlan, onClose, onSubmit, submitting, submitError }: GeneratePlanWizardProps) {
  const [hasExamDate, setHasExamDate] = useState(!!initialPlan?.examDate);
  const [examDate, setExamDate] = useState<string | null>(initialPlan?.examDate?.slice(0, 10) ?? null);
  const [dailyCommitment, setDailyCommitment] = useState<DailyCommitment>(initialPlan?.dailyCommitment ?? 'moderate');
  const [daysPerWeek, setDaysPerWeek] = useState<StudyPlanWeekday[]>(initialPlan?.daysPerWeek ?? ['mon', 'wed', 'fri']);
  const [subjectPriority, setSubjectPriority] = useState<Specialty[]>((initialPlan?.subjectPriority as Specialty[]) ?? []);

  const { theme } = useTheme();
  const [step, setStep] = useState(0);

  const canContinue = useMemo(() => {
    if (step === 1) return daysPerWeek.length >= MIN_DAYS_PER_WEEK;
    return true;
  }, [step, daysPerWeek]);

  function toggleDay(day: StudyPlanWeekday) {
    setDaysPerWeek((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }
  function pickPreset(months: number) {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setExamDate(d.toISOString().slice(0, 10));
  }

  async function handleSubmit() {
    await onSubmit({
      examDate: hasExamDate && examDate ? examDate : undefined,
      dailyCommitment,
      daysPerWeek,
      subjectPriority: subjectPriority.length > 0 ? subjectPriority : undefined,
    });
  }

  function reset() {
    setStep(0);
    onClose();
  }


  return (
    <Modal visible={visible} animationType='slide' onRequestClose={reset}>
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.space.lg,
          }}
        >
          <TouchableOpacity onPress={reset}>
            <Feather
              name='x'
              size={theme.space.md * 1.2}
              color={theme.color.textMuted}
            />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: theme.space.xs }}>
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 20,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: i <= step ? theme.color.accent : theme.color.border,
                }}
              />
            ))}
          </View>
          <View style={{ width: theme.space.md * 1.2 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: theme.space.lg, flexGrow: 1 }}
          keyboardShouldPersistTaps='handled'
        >
          {step === 0 && (
            <View>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.xl,
                  fontFamily: theme.fontFamily.bold,
                  marginBottom: theme.space.xs,
                }}
              >
                {theme.i18n.t('studyPlan.wizard.examDateTitle')}
              </Text>
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                  marginBottom: theme.space.lg,
                }}
              >
                {theme.i18n.t('studyPlan.wizard.examDateSubtitle')}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setHasExamDate(false);
                  setExamDate(null);
                }}
                style={{
                  padding: theme.space.md,
                  borderRadius: theme.borderRadius.lg,
                  borderWidth: 1.5,
                  borderColor: !hasExamDate ? theme.color.accent : theme.color.border,
                  backgroundColor: !hasExamDate ? theme.color.accent + '10' : theme.color.card,
                  marginBottom: theme.space.sm,
                }}
              >
                <Text style={{ color: theme.color.textPrimary, fontFamily: theme.fontFamily.bold }}>
                  {theme.i18n.t('studyPlan.wizard.noExamDateOption')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setHasExamDate(true)}
                style={{
                  padding: theme.space.md,
                  borderRadius: theme.borderRadius.lg,
                  borderWidth: 1.5,
                  borderColor: hasExamDate ? theme.color.accent : theme.color.border,
                  backgroundColor: hasExamDate ? theme.color.accent + '10' : theme.color.card,
                  marginBottom: theme.space.md,
                }}
              >
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {theme.i18n.t('studyPlan.wizard.hasExamDateOption')}
                </Text>
              </TouchableOpacity>

              {hasExamDate && (
                <View>
                  <View
                    style={{
                      flexWrap: 'wrap',
                      flexDirection: 'row',
                      gap: theme.space.sm,
                      marginBottom: theme.space.md,
                    }}
                  >
                    {EXAM_DATE_PRESETS.map((p) => (
                      <TouchableOpacity
                        key={p.months}
                        onPress={() => pickPreset(p.months)}
                        style={{
                          paddingVertical: theme.space.sm,
                          paddingHorizontal: theme.space.md,
                          borderWidth: 1,
                          borderColor: theme.color.border,
                          borderRadius: theme.borderRadius.full,
                          backgroundColor: theme.color.card,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: theme.fontSize.sm,
                            color: theme.color.textSecondary,
                            fontFamily: theme.fontFamily.bold,
                          }}
                        >
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text
                    style={{
                      color: theme.color.textMuted,
                      fontSize: theme.fontSize.xs,
                      marginBottom: theme.space.xs,
                    }}
                  >
                    {theme.i18n.t('studyPlan.wizard.orCustomDate')}
                  </Text>
                  <TextInput
                    value={examDate ?? ''}
                    onChangeText={setExamDate}
                    placeholder='YYYY-MM-DD'
                    placeholderTextColor={theme.color.textMuted}
                    style={{
                      borderWidth: 1,
                      borderColor: theme.color.border,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.space.sm,
                      color: theme.color.textPrimary,
                      fontFamily: theme.fontFamily.bold,
                    }}
                  />
                </View>
              )}
            </View>
          )}

          {step === 1 && (
            <View>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.xl,
                  fontFamily: theme.fontFamily.bold,
                  marginBottom: theme.space.xs,
                }}
              >
                {theme.i18n.t('studyPlan.wizard.commitmentTitle')}
              </Text>
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                  marginBottom: theme.space.lg,
                }}
              >
                {theme.i18n.t('studyPlan.wizard.commitmentSubtitle')}
              </Text>

              {DAILY_COMMITMENT_OPTIONS.map((opt) => {
                const active = dailyCommitment === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setDailyCommitment(opt.value)}
                    style={{
                      padding: theme.space.md,
                      marginBottom: theme.space.sm,
                      borderWidth: 1.5,
                      borderRadius: theme.borderRadius.lg,
                      borderColor: active ? theme.color.accent : theme.color.border,
                      backgroundColor: active ? theme.color.accent + '10' : theme.color.card,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.fontSize.md,
                        color: theme.color.textPrimary,
                        fontFamily: theme.fontFamily.bold,
                      }}
                    >
                      {opt.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.fontSize.sm,
                        color: theme.color.textMuted,
                        fontFamily: theme.fontFamily.regular,
                        marginTop: theme.space.xs * 0.5,
                      }}
                    >
                      {opt.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.md,
                  fontFamily: theme.fontFamily.bold,
                  marginTop: theme.space.lg,
                  marginBottom: theme.space.sm,
                }}
              >
                {theme.i18n.t('studyPlan.wizard.daysPerWeekTitle')}
              </Text>
              <WeekdayChips selected={daysPerWeek} onToggle={toggleDay} />
              {daysPerWeek.length < MIN_DAYS_PER_WEEK && (
                <Text
                  style={{
                    color: theme.color.error,
                    fontSize: theme.fontSize.xs,
                    fontFamily: theme.fontFamily.regular,
                    marginTop: theme.space.sm,
                  }}
                >
                  {theme.i18n.t('studyPlan.wizard.minDaysWarning', { min: MIN_DAYS_PER_WEEK })}
                </Text>
              )}
            </View>
          )}

          {step === 2 && (
            <View>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.xl,
                  fontFamily: theme.fontFamily.bold,
                  marginBottom: theme.space.xs,
                }}
              >
                {theme.i18n.t('studyPlan.wizard.subjectsTitle')}
              </Text>
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                  marginBottom: theme.space.lg,
                }}
              >
                {theme.i18n.t('studyPlan.wizard.subjectsSubtitle')}
              </Text>
              <MultiSelectChips
                options={SPECIALTY_OPTIONS}
                selected={subjectPriority}
                max={MAX_SUBJECT_PRIORITY}
                onToggle={(s) =>
                  setSubjectPriority((prev) => prev.includes(s)
                    ? prev.filter((x) => x !== s)
                    : [...prev, s]
                  )
                }
              />
            </View>
          )}

          {step === 3 && (
            <View>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.xl,
                  fontFamily: theme.fontFamily.bold,
                  marginBottom: theme.space.md,
                }}
              >
                {theme.i18n.t('studyPlan.wizard.reviewTitle')}
              </Text>

              <View
                style={{
                  gap: theme.space.sm,
                  padding: theme.space.md,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: theme.color.card,
                }}
              >
                <Text style={{ color: theme.color.textSecondary }}>
                  {theme.i18n.t('studyPlan.wizard.reviewExam')}:{' '}
                  {hasExamDate && examDate ? examDate : theme.i18n.t('studyPlan.wizard.noExamDateOption')}
                </Text>
                <Text style={{ color: theme.color.textSecondary }}>
                  {theme.i18n.t('studyPlan.wizard.reviewCommitment')}:{' '}{dailyCommitment}
                </Text>
                <Text style={{ color: theme.color.textSecondary }}>
                  {theme.i18n.t('studyPlan.wizard.reviewDays')}:{' '}{daysPerWeek.join(', ')}
                </Text>
                <Text style={{ color: theme.color.textSecondary }}>
                  {theme.i18n.t('studyPlan.wizard.reviewSubjects')}:{' '}
                  {subjectPriority.length ? subjectPriority.join(', ') : theme.i18n.t('studyPlan.wizard.autoDetect')}
                </Text>
              </View>

              {submitError && (
                <Text style={{ color: theme.color.error, fontSize: theme.fontSize.sm, marginTop: theme.space.md }}>
                  {submitError}
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={{ gap: theme.space.sm, flexDirection: 'row', padding: theme.space.lg }}>
          {step > 0 && (
            <TouchableOpacity
              onPress={() => setStep((s) => s-1)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: theme.space.sm * 1.25,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.md,
              }}
            >
              <Text style={{ color: theme.color.textPrimary, fontFamily: theme.fontFamily.bold }}>
                {theme.i18n.t('studyPlan.wizard.back')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => step < STEP_COUNT-1 ? setStep((s) => s+1) : handleSubmit()}
            disabled={!canContinue || submitting}
            style={{
              flex: 2,
              alignItems: 'center',
              paddingVertical: theme.space.sm * 1.25,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.color.accent,
              opacity: !canContinue || submitting ? 0.6 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color={theme.color.textPrimary} />
            ) : (
              <Text style={{ color: theme.color.textPrimary, fontFamily: theme.fontFamily.bold }}>
                {step < STEP_COUNT-1
                  ? theme.i18n.t('studyPlan.wizard.continue')
                  : theme.i18n.t('studyPlan.wizard.generate')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
