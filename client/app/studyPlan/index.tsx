import {
  View,
  Text,
  Modal,
  Platform,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { StudyHeader } from './studyPlanHeader';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { ProjectionCard } from '../../components/ProjectionCard';
import { GoalProgressCard } from '../../components/GoalProgressCard';
import { StudyTimelineCard } from '../../components/StudySessionItem';
import { WeeklyProgressCard } from '../../components/WeeklyTrackerCard';


function EditPlanModal({ visible, onSave, onClose, initialExamName, initialExamDate }: {
  visible: boolean;
  onSave: (examName: string, examDate: string) => void;
  onClose: () => void;
  initialExamName: string;
  initialExamDate: string;
}) {
  const [examName, setExamName] = useState(initialExamName);
  const [examDate, setExamDate] = useState(initialExamDate);

  const { theme } = useTheme();

  const handleSave = () => {
    onSave(examName, examDate);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType='slide'
      onRequestClose={onClose}
      transparent
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: theme.isDark ? theme.color.textInverse : theme.color.textPrimary,
        }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'height' : undefined}>
          <View
            style={{
              padding: theme.space.lg,
              borderTopLeftRadius: theme.borderRadius.lg,
              borderTopRightRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.card,
            }}
          >
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.lg,
                fontFamily: theme.fontFamily.bold,
                marginBottom: theme.space.md,
              }}
            >
              {theme.i18n.t('Edit Study Plan')}
            </Text>

            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                marginBottom: theme.space.xs,
              }}
            >
              {theme.i18n.t('Exam Name')}
            </Text>

            <TextInput
              value={examName}
              onChangeText={setExamName}
              placeholder='e.g. USMLE Step 1'
              placeholderTextColor={theme.color.textSecondary}
              style={{
                color: theme.color.textPrimary,
                marginBottom: theme.space.md,
                paddingVertical: theme.space.sm,
                paddingHorizontal: theme.space.md,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.md,
              }}
            />

            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                marginBottom: theme.space.xs,
              }}
            >
              {theme.i18n.t('Exam Date')}
            </Text>

            <TextInput
              value={examDate}
              onChangeText={setExamDate}
              placeholder='e.g. Aug 15, 2026'
              placeholderTextColor={theme.color.textSecondary}
              style={{
                color: theme.color.textPrimary,
                marginBottom: theme.space.lg,
                paddingVertical: theme.space.sm,
                paddingHorizontal: theme.space.md,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.md,
              }}
            />

            <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: theme.space.sm,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.md,
                }}
              >
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {theme.i18n.t('Cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.color.textPrimary,
                }}
              >
                <Text
                  style={{
                    color: theme.color.background,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {theme.i18n.t('Save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}


export default function StudyPlanScreen() {
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [examName, setExamName] = useState('USMLE Step 1');
  const [examDate, setExamDate] = useState('Aug 15, 2026');

  const router = useRouter();
  const { theme } = useTheme();
  useBottomBar(true, 'profile');

  const handleSavePlan = (newExamName: string, newExamDate: string) => {
    setExamName(newExamName);
    setExamDate(newExamDate);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <StudyHeader
        onBack={() => router.back()}
        onEdit={() => setEditModalVisible(true)}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: theme.space.sm,
          paddingBottom: 120,
          paddingHorizontal: theme.space.md,
        }}
      >
        <View style={{ gap: theme.space.lg }}>
          <GoalProgressCard
            examName={examName}
            examDate={examDate}
            preparationPercent={68}
            daysLeft={42}
          />

          <WeeklyProgressCard
            title='This Week'
            date='July 6 - July 12'
            completedDays={[0, 1, 2]}
            currentDay={3}
            reward={150}
          />

          <StudyTimelineCard
            sessions={[
              { id: '1', time: '09:00', title: 'Cardiology Revision', subject: 'Cardiology', questionsCount: 25, reward: 50, status: 'completed', iconName: 'book-open' },
              { id: '2', time: '11:00', title: 'Practice Questions', subject: 'Physiology', questionsCount: 30, reward: 75, status: 'current', iconName: 'edit-3' },
              { id: '3', time: '02:00', title: 'Mock Test', subject: 'Pathology', questionsCount: 50, reward: 100, status: 'upcoming', iconName: 'clipboard' },
            ]}
            onPress={() => {}}
          />

          <ProjectionCard
            title='Weekly Projection'
            subtitle='Keep your current pace to maximize rewards'
            projectedEP={450}
          />
        </View>
      </ScrollView>

      <EditPlanModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSavePlan}
        initialExamName={examName}
        initialExamDate={examDate}
      />
    </View>
  );
}
