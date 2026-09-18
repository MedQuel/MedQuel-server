import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { SubjectIcon } from '../../common/constants/subject';
import { subjectNameToId } from '../../common/utils/subjectIcon';
import type { StudyPlanSession } from '../../common/types/types';


function formatDayLabel(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function SessionRow({ session, onPress }: { session: StudyPlanSession; onPress: (s: StudyPlanSession) => void; }) {
  const { theme } = useTheme();
  const todayKey = new Date().toISOString().slice(0, 10);
  const isMissed = session.status === 'pending' && session.scheduledDate < todayKey;
  const isCompleted = session.status === 'completed';
  const subjectId = subjectNameToId(session.subject);

  const borderColor = isCompleted
    ? theme.color.success
    : isMissed ? theme.color.error + '55' : theme.color.border;
  const iconBg = isCompleted ? theme.color.success + '15' : theme.color.accent + '12';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(session)}
      style={{
        gap: theme.space.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.space.sm,
        paddingHorizontal: theme.space.md,
        borderWidth: 1.5,
        borderColor,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      <View
        style={{
          width: theme.space.xl * 1.6,
          height: theme.space.xl * 1.6,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.borderRadius.lg,
          backgroundColor: iconBg,
        }}
      >
        {isCompleted ? (
          <Feather
            name='check-circle'
            size={theme.fontSize.lg}
            color={theme.color.success}
          />
        ) : session.sessionType === 'read' ? (
          <Feather
            name='book-open'
            size={theme.fontSize.lg}
            color={theme.color.accent}
          />
        ) : subjectId ? (
          <SubjectIcon
            id={subjectId}
            size={theme.fontSize.lg}
            color={theme.color.accent}
          />
        ) : (
          <Feather
            name='edit-3'
            size={theme.fontSize.lg}
            color={theme.color.accent}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: isCompleted ? theme.color.textMuted : theme.color.textPrimary,
            textDecorationLine: isCompleted ? 'line-through' : 'none',
            fontSize: theme.fontSize.md + 1,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {session.sessionType === 'read' ? session.title : session.topic}
        </Text>

        <View
          style={{
            gap: theme.space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.space.xs * 0.5,
          }}
        >
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {session.subject}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {session.sessionType === 'quiz'
              ? `${session.questionCount} Qs · ${session.difficulty}`
              : `${session.estimatedMinutes} min read`}
          </Text>

          {isMissed && (
            <Text
              style={{
                color: theme.color.error,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              MISSED
            </Text>
          )}
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Feather
          name='zap'
          size={theme.fontSize.md}
          color={theme.color.warning}
        />
        <Text
          style={{
            color: theme.color.warning,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.number,
          }}
        >
          +{session.xpReward}
        </Text>
      </View>
    </TouchableOpacity>
  );
}


export function SessionTimelineList({ sessions, onSessionPress }: {
  sessions: StudyPlanSession[];
  onSessionPress: (s: StudyPlanSession) => void;
}) {
  const { theme } = useTheme();
  const todayKey = new Date().toISOString().slice(0, 10);

  const today = sessions.filter((s) => s.scheduledDate === todayKey);
  const rest = sessions.filter((s) => s.scheduledDate !== todayKey);
  const restByDate = rest.reduce<Record<string, StudyPlanSession[]>>((acc, s) => {
    (acc[s.scheduledDate] ??= []).push(s);
    return acc;
  }, {});

  return (
    <View style={{ gap: theme.space.md }}>
      {today.length > 0 && (
        <View style={{ gap: theme.space.sm }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('studyPlan.timeline.today')}
          </Text>

          {today.map((s) => (
            <SessionRow
              key={s.sessionId}
              session={s}
              onPress={onSessionPress}
            />
          ))}
        </View>
      )}

      {Object.entries(restByDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, daySessions]) => (
          <View key={dateKey} style={{ gap: theme.space.sm }}>
            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {formatDayLabel(dateKey)}
            </Text>

            {daySessions.map((s) => (
              <SessionRow
                key={s.sessionId}
                session={s}
                onPress={onSessionPress}
              />
            ))}
          </View>
        ))}
    </View>
  );
}
