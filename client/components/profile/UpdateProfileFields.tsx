import { Feather } from '@expo/vector-icons';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import {
  ROLE_HAS_YEAR,
  ROLE_HAS_SPECIALTY,
  SPECIALTY_OPTIONS,
  MAX_SPECIALTIES,
  MAX_FOCUS_SUBJECTS,
  YEAR_OF_STUDY_OPTIONS,
  targetExamsFor,
} from '../../common/constants/onboardingOptions';
import { useTheme } from '../../theme/ThemeContext';
import { MultiSelectChips } from '../common/MultiSelectChips';
import { OnboardingRolePicker } from '../OnboardingRolePicker';
import type { Specialty, ContentScope } from '../../common/types/types';
import type { DescribesYou, TargetExam, YearOfStudy } from '../../common/types/types';


export interface ProfileFormValues {
  displayName: string;
  describesYou: DescribesYou | '';
  yearOfStudy: YearOfStudy | '';
  specialties: Specialty[];
  targetExam: TargetExam | '';
  institution: string;
  contentScope: ContentScope | '';
  focusSubjects: Specialty[];
}
interface UpdateProfileFieldsProps {
  values: ProfileFormValues;
  examDropdownOpen: boolean;
  onChange: <K extends keyof ProfileFormValues>(
    name: K,
    value: ProfileFormValues[K]
  ) => void;
  onToggleExam: () => void;
  onSelectExam: (exam: TargetExam) => void;
  onToggleSpecialty: (specialty: Specialty) => void;
  onToggleFocusSubject: (subject: Specialty) => void;
}

function SectionTitle({ children }: { children: string }) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        fontSize: theme.fontSize.md * 0.95,
        color: theme.color.textPrimary,
        fontFamily: theme.fontFamily.bold,
        marginBottom: theme.space.sm,
      }}
    >
      {children}
    </Text>
  );
}
function SubsectionTitle({ children }: { children: string }) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        color: theme.color.textSecondary,
        fontSize: theme.fontSize.sm,
        fontFamily: theme.fontFamily.bold,
        marginBottom: theme.space.sm,
      }}
    >
      {children}
    </Text>
  );
}

function ChoiceList<T extends string>({ values, selected, onSelect }: {
  values: T[];
  selected: string;
  onSelect: (value: T) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.space.sm, flexDirection: 'row', flexWrap: 'wrap' }}>
      {values.map((value) => {
        const active = selected === value;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => onSelect(value)}
            style={{
              paddingVertical: theme.space.sm - 1,
              paddingHorizontal: theme.space.sm * 1.5,
              borderWidth: 1,
              borderRadius: theme.borderRadius.md,
              borderColor: active ? theme.color.accent : theme.color.border,
              backgroundColor: active ? theme.color.accent : theme.color.card,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: active ? theme.color.textPrimary : theme.color.textSecondary,
                fontWeight: active ? theme.fontWeight.medium : theme.fontWeight.regular,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {value}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TextField({ label, value, placeholder, onChangeText }: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: theme.space.md }}>
      <SectionTitle>
        {label}
      </SectionTitle>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.color.textMuted}
        style={{
          fontSize: theme.fontSize.sm + 1,
          color: theme.color.textPrimary,
          fontFamily: theme.fontFamily.bold,
          paddingVertical: theme.space.sm,
          paddingHorizontal: theme.space.sm * 1.5,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.color.background,
        }}
      />
    </View>
  );
}


export function UpdateProfileFields({
  values,
  examDropdownOpen,
  onChange,
  onToggleExam,
  onSelectExam,
  onToggleSpecialty,
  onToggleFocusSubject,
}: UpdateProfileFieldsProps) {
  const { theme } = useTheme();

  const showYearPicker = values.describesYou !== '' && ROLE_HAS_YEAR[values.describesYou];
  const showSpecialtyPicker = values.describesYou !== '' && ROLE_HAS_SPECIALTY[values.describesYou];
  const targetExamOptions = values.describesYou !== '' ? targetExamsFor(values.describesYou) : [];

  return (
    <>
      <TextField
        label={theme.i18n.t('profile.updateProfile.updateProfileFields.displayName')}
        value={values.displayName}
        placeholder={theme.i18n.t('profile.updateProfile.updateProfileFields.yourName')}
        onChangeText={(value) => onChange('displayName', value)}
      />

      <View style={{ marginBottom: theme.space.md }}>
        <SectionTitle>
          {theme.i18n.t('profile.updateProfile.updateProfileFields.describesYou')}
        </SectionTitle>
        <OnboardingRolePicker
          value={values.describesYou as DescribesYou}
          onChange={(value) => onChange('describesYou', value)}
        />

        {(showYearPicker || showSpecialtyPicker) && (
          <View style={{ marginTop: theme.space.xs, paddingTop: theme.space.sm, paddingLeft: theme.space.sm }}>
            {showYearPicker && (
              <View style={{ marginBottom: showSpecialtyPicker ? theme.space.md : 0 }}>
                <SubsectionTitle>
                  {theme.i18n.t('profile.updateProfile.updateProfileFields.yearOfStudy')}
                </SubsectionTitle>
                <ChoiceList
                  values={[...YEAR_OF_STUDY_OPTIONS]}
                  selected={values.yearOfStudy}
                  onSelect={(value) => onChange('yearOfStudy', value)}
                />
              </View>
            )}

            {showSpecialtyPicker && (
              <View>
                <SubsectionTitle>
                  {theme.i18n.t('profile.updateProfile.updateProfileFields.specialties')}
                </SubsectionTitle>
                <MultiSelectChips
                  options={SPECIALTY_OPTIONS}
                  selected={values.specialties}
                  max={MAX_SPECIALTIES}
                  onToggle={onToggleSpecialty}
                />
              </View>
            )}
          </View>
        )}
      </View>

      <View style={{ marginBottom: theme.space.md, zIndex: 10 }}>
        <SectionTitle>
          {theme.i18n.t('profile.updateProfile.updateProfileFields.yourGoal')}
        </SectionTitle>
        <TouchableOpacity
          onPress={onToggleExam}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.sm * 1.5,
            borderWidth: 1,
            borderColor: examDropdownOpen ? theme.color.accent : theme.color.border,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.color.background,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.sm + 1,
              fontFamily: theme.fontFamily.bold,
              color: values.targetExam ? theme.color.textPrimary : theme.color.textMuted,
            }}
          >
            {values.targetExam || theme.i18n.t('profile.updateProfile.updateProfileFields.selectYourGoal')}
          </Text>
          <Feather
            name={examDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={theme.space.md}
            color={theme.color.textMuted}
          />
        </TouchableOpacity>

        {examDropdownOpen && (
          <View
            style={{
              overflow: 'hidden',
              marginTop: theme.space.sm * 0.5,
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.color.card,
            }}
          >
            {targetExamOptions.map((exam, index) => (
              <TouchableOpacity
                key={exam}
                onPress={() => onSelectExam(exam)}
                style={{
                  paddingVertical: theme.space.sm * 1.25,
                  paddingHorizontal: theme.space.sm * 1.5,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: theme.color.border,
                  backgroundColor: values.targetExam === exam ? theme.color.accent : theme.color.card,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm + 1,
                    color: values.targetExam === exam ? theme.color.textPrimary : theme.color.textSecondary,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {exam}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TextField
        label={theme.i18n.t('profile.updateProfile.updateProfileFields.institution')}
        value={values.institution}
        placeholder={theme.i18n.t('profile.updateProfile.updateProfileFields.yourInstitution')}
        onChangeText={(value) => onChange('institution', value)}
      />

      <View
        style={{
          padding: theme.space.md,
          marginBottom: theme.space.md,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.card,
        }}
      >
        <SectionTitle>
          {theme.i18n.t('profile.updateProfile.updateProfileFields.contentScope')}
        </SectionTitle>
        <ChoiceList
          values={['all', 'focused'] as ContentScope[]}
          selected={values.contentScope}
          onSelect={(value) => onChange('contentScope', value)}
        />
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            marginTop: theme.space.xs,
          }}
        >
          {values.contentScope === 'focused'
            ? theme.i18n.t('profile.updateProfile.updateProfileFields.contentScopeFocusedHint')
            : theme.i18n.t('profile.updateProfile.updateProfileFields.contentScopeAllHint')}
        </Text>

        {values.contentScope === 'focused' && (
          <View
            style={{
              paddingTop: theme.space.sm,
              paddingLeft: theme.space.sm,
              marginTop: theme.space.md,
              borderLeftWidth: 2,
              borderLeftColor: theme.color.accent,
            }}
          >
            <SubsectionTitle>
              {theme.i18n.t('profile.updateProfile.updateProfileFields.focusSubjects')}
            </SubsectionTitle>
            <MultiSelectChips
              options={SPECIALTY_OPTIONS}
              selected={values.focusSubjects}
              max={MAX_FOCUS_SUBJECTS}
              onToggle={onToggleFocusSubject}
            />
          </View>
        )}
      </View>
    </>
  );
}
