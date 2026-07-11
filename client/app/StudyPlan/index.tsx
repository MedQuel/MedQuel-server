import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBottomBar } from '../../common/context/useBottomBar';
import { useTheme } from '../../theme/ThemeContext';
import { StudyHeader } from './StudyHeader';
import { GoalProgressCard } from '../../components/GoalProgressCard';
import { WeeklyProgressCard } from '../../components/WeeklyTrackerCard';
import { StudyTimelineCard } from '../../components/StudySessionItem';
import { ProjectionCard } from '../../components/ProjectionCard';

// Edit modal — exam name aur date edit karne ke liye
function EditPlanModal({
  visible,
  onClose,
  onSave,
  initialExamName,
  initialExamDate,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (examName: string, examDate: string) => void;
  initialExamName: string;
  initialExamDate: string;
}) {
  const { theme } = useTheme();
  const [examName, setExamName] = useState(initialExamName);
  const [examDate, setExamDate] = useState(initialExamDate);

  const handleSave = () => {
    onSave(examName, examDate);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={{
              backgroundColor: theme.color.card,
              borderTopLeftRadius: theme.borderRadius.lg,
              borderTopRightRadius: theme.borderRadius.lg,
              padding: theme.space.lg,
            }}
          >
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.fontSize.lg,
                color: theme.color.textPrimary,
                marginBottom: theme.space.md,
              }}
            >
              {theme.i18n.t('Edit Study Plan')}
            </Text>

            <Text
              style={{
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.sm,
                color: theme.color.textSecondary,
                marginBottom: theme.space.xs,
              }}
            >
              {theme.i18n.t('Exam Name')}
            </Text>
            <TextInput
              value={examName}
              onChangeText={setExamName}
              style={{
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.md,
                paddingHorizontal: theme.space.md,
                paddingVertical: theme.space.sm,
                color: theme.color.textPrimary,
                marginBottom: theme.space.md,
              }}
              placeholder="e.g. USMLE Step 1"
              placeholderTextColor={theme.color.textSecondary}
            />

            <Text
              style={{
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.sm,
                color: theme.color.textSecondary,
                marginBottom: theme.space.xs,
              }}
            >
              {theme.i18n.t('Exam Date')}
            </Text>
            <TextInput
              value={examDate}
              onChangeText={setExamDate}
              style={{
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.md,
                paddingHorizontal: theme.space.md,
                paddingVertical: theme.space.sm,
                color: theme.color.textPrimary,
                marginBottom: theme.space.lg,
              }}
              placeholder="e.g. Aug 15, 2026"
              placeholderTextColor={theme.color.textSecondary}
            />

            <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.md,
                  paddingVertical: theme.space.sm,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: theme.fontFamily.bold,
                    color: theme.color.textPrimary,
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
                  backgroundColor: theme.color.textPrimary ?? theme.color.textPrimary,
                  borderRadius: theme.borderRadius.md,
                  paddingVertical: theme.space.sm,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: theme.fontFamily.bold,
                    color: theme.color.background,
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
  const { theme } = useTheme();
  useBottomBar(true, 'studyPlan');

  const router = useRouter();
  const goBack = () => router.back();

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [examName, setExamName] = useState('USMLE Step 1');
  const [examDate, setExamDate] = useState('Aug 15, 2026');

  const handleSavePlan = (newExamName: string, newExamDate: string) => {
    setExamName(newExamName);
    setExamDate(newExamDate);
    // yahan par API call / persist logic add kar sakte ho
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <StudyHeader
        onBack={goBack}
        onEdit={() => setEditModalVisible(true)}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.sm,
          paddingBottom: 120, // BottomBar ke liye
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            gap: theme.space.lg,
          }}
        >
          <GoalProgressCard
            examName={examName}
            examDate={examDate}
            preparationPercent={68}
            daysLeft={42}
          />
          <WeeklyProgressCard
            title="This Week"
            date="July 6 - July 12"
            completedDays={[0, 1, 2]}
            currentDay={3}
            reward={150}
          />
          <StudyTimelineCard
            sessions={[
              {
                id: '1',
                time: '09:00',
                title: 'Cardiology Revision',
                subject: 'Cardiology',
                questionsCount: 25,
                reward: 50,
                status: 'completed',
                iconName: 'book-open',
              },
              {
                id: '2',
                time: '11:00',
                title: 'Practice Questions',
                subject: 'Physiology',
                questionsCount: 30,
                reward: 75,
                status: 'current',
                iconName: 'edit-3',
              },
              {
                id: '3',
                time: '02:00',
                title: 'Mock Test',
                subject: 'Pathology',
                questionsCount: 50,
                reward: 100,
                status: 'upcoming',
                iconName: 'clipboard',
              },
            ]}
            onPress={(session) => {
              console.log(session);
            }}
          />
          <ProjectionCard
            title="Weekly Projection"
            subtitle="Keep your current pace to maximize rewards"
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