import { Feather } from '@expo/vector-icons';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { StudyLevel, TargetExam, YearOfStudy } from '../../common/types/types';


const STUDY_LEVELS: StudyLevel[] = ['MBBS Year 1-5', 'Postgraduate', 'Practitioner', 'Nursing / Allied'];
const YEARS_OF_STUDY: YearOfStudy[] = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Final Year', 'Intern'];
const TARGET_EXAMS: TargetExam[] = ['USMLE', 'NEET-PG', 'INI-CET', 'PLAB', 'MRCP', 'FMGE', 'Clinical Mastery'];

export interface ProfileFormValues {
  displayName: string;
  studyLevel: StudyLevel | '';
  yearOfStudy: YearOfStudy | '';
  targetExam: TargetExam | '';
  institution: string;
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
}

function Label({ children }: { children: string }) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        fontSize: theme.fontSize.sm,
        color: theme.color.textSecondary,
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
              borderRadius: theme.borderRadius.full,
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
      <Label>{label}</Label>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.color.textMuted}
        style={{
          fontSize: theme.fontSize.sm + 1,
          color: theme.color.textPrimary,
          fontFamily: theme.fontFamily.bold,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.md,
          paddingVertical: theme.space.sm,
          paddingHorizontal: theme.space.sm * 1.5,
          backgroundColor: theme.color.background,
        }}
      />
    </View>
  );
}


export function UpdateProfileFields({ values, examDropdownOpen, onChange, onToggleExam, onSelectExam }: UpdateProfileFieldsProps) {
  const { theme } = useTheme();

  return (
    <>
      <TextField
        label={theme.i18n.t('profile.updateProfile.updateProfileFields.displayName')}
        value={values.displayName}
        placeholder={theme.i18n.t('profile.updateProfile.updateProfileFields.yourName')}
        onChangeText={(value) => onChange('displayName', value)}
      />

      <View style={{ marginBottom: theme.space.md }}>
        <Label>
          {theme.i18n.t('profile.updateProfile.updateProfileFields.studyLevel')}
        </Label>
        <ChoiceList
          values={STUDY_LEVELS}
          selected={values.studyLevel}
          onSelect={(value) => onChange('studyLevel', value)}
        />
      </View>

      {values.studyLevel === 'MBBS Year 1-5' && (
        <View style={{ marginBottom: theme.space.md }}>
          <Label>
            {theme.i18n.t('profile.updateProfile.updateProfileFields.yearOfStudy')}
          </Label>
          <ChoiceList
            values={YEARS_OF_STUDY}
            selected={values.yearOfStudy}
            onSelect={(value) => onChange('yearOfStudy', value)}
          />
        </View>
      )}

      <View style={{ marginBottom: theme.space.md, zIndex: 10 }}>
        <Label>
          {theme.i18n.t('profile.updateProfile.updateProfileFields.yourGoal')}
        </Label>
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
            {TARGET_EXAMS.map((exam, index) => (
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
    </>
  );
}
