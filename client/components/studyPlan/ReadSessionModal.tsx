import { Feather } from '@expo/vector-icons';
import { View, Text, ScrollView } from 'react-native';
import { Modal, TouchableOpacity, ActivityIndicator } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { StudyPlanSession } from '../../common/types/types';


interface ReadSessionModalProps {
  session: StudyPlanSession | null;
  onClose: () => void;
  onMarkComplete: () => void;
  completing: boolean;
}

export function ReadSessionModal({ session, onClose, onMarkComplete, completing }: ReadSessionModalProps) {
  const { theme } = useTheme();
  if (!session) return null;

  return (
    <Modal visible transparent animationType='slide' onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          style={{
            maxHeight: '80%',
            padding: theme.space.lg,
            borderTopLeftRadius: theme.borderRadius.lg,
            borderTopRightRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.card,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: theme.space.md,
            }}
          >
            <View style={{ flex: 1, marginRight: theme.space.sm }}>
              <Text
                style={{
                  color: theme.color.textMuted,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {session.subject}
              </Text>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.lg,
                  fontFamily: theme.fontFamily.bold,
                  marginTop: theme.space.xs * 0.5,
                }}
              >
                {session.title}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Feather
                name='x'
                size={theme.space.md * 1.2}
                color={theme.color.textMuted}
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.sm + 1,
                fontFamily: theme.fontFamily.regular,
                lineHeight: theme.fontSize.sm * 1.6,
              }}
            >
              {session.content}
            </Text>

            <View
              style={{
                marginTop: theme.space.md,
                padding: theme.space.sm,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.color.warning + '15',
              }}
            >
              <Text
                style={{
                  fontStyle: 'italic',
                  color: theme.color.textMuted,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {session.disclaimer}
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={onMarkComplete}
            disabled={session.status === 'completed' || completing}
            style={{
              alignItems: 'center',
              marginTop: theme.space.md,
              paddingVertical: theme.space.sm * 1.25,
              borderRadius: theme.borderRadius.md,
              backgroundColor: session.status === 'completed' ? theme.color.success + '20' : theme.color.accent,
              opacity: completing ? 0.6 : 1,
            }}
          >
            {completing ? (
              <ActivityIndicator color={theme.color.textPrimary} />
            ) : (
              <Text
                style={{
                  color: session.status === 'completed' ? theme.color.success : theme.color.textPrimary,
                  fontSize: theme.fontSize.sm + 1,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {session.status === 'completed'
                  ? theme.i18n.t('studyPlan.readModal.alreadyComplete')
                  : theme.i18n.t('studyPlan.readModal.markComplete', {xp: session.xpReward })}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
