import { Feather } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import type { Challenge } from '../../common/types/types';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { useChallenges } from '../../common/hooks/useChallenges';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { isPendingInviteForMe } from '../../common/utils/challengeHelpers';
import { ChallengeMatchRow } from '../../components/home/ChallengeMatchRow';


type TabKey = 'invites' | 'active' | 'history';
const HISTORY_STATUSES = new Set(['completed', 'declined', 'expired', 'cancelled']);

export default function ChallengesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAppContext();
  const { data, loading, error, load } = useChallenges();
  const [tab, setTab] = useState<TabKey>('invites');
  useBottomBar(false);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const grouped = useMemo(() => {
    if (!user)
      return {
        invites: [] as Challenge[],
        active: [] as Challenge[],
        history: [] as Challenge[],
      };

    const invites: Challenge[] = [];
    const active: Challenge[] = [];
    const history: Challenge[] = [];

    for (const c of data.challenges) {
      if (c.status === 'pending') invites.push(c);
      else if (c.status === 'active') active.push(c);
      else if (HISTORY_STATUSES.has(c.status)) history.push(c);
    }

    invites.sort((a, b) => {
      const aMine = isPendingInviteForMe(a, user.uid) ? 0 : 1;
      const bMine = isPendingInviteForMe(b, user.uid) ? 0 : 1;
      if (aMine !== bMine) return aMine - bMine;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    active.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    history.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return { invites, active, history };
  }, [data.challenges, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <Loading message={theme.i18n.t('challenges.loading')} fullscreen />
      </View>
    );
  }

  if (!user) return null;

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: 'invites', label: theme.i18n.t('challenges.tabs.invites'), count: grouped.invites.length },
    { key: 'active', label: theme.i18n.t('challenges.tabs.active'), count: grouped.active.length },
    { key: 'history', label: theme.i18n.t('challenges.tabs.history'), count: 0 },
  ];
  const currentList = grouped[tab];


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScreenHeader
        title={theme.i18n.t('challenges.title')}
        subtitle={theme.i18n.t('challenges.subtitle')}
        onBack={() => router.canGoBack()
          ? router.back()
          : router.replace('/home')
        }
        rightActions={[
          {
            icon: 'plus',
            onPress: () => router.push('/challenges/create'),
            accessibilityLabel: theme.i18n.t('challenges.create.title'),
          },
        ]}
      />

      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          paddingTop: theme.space.md,
          paddingBottom: theme.space.sm,
          paddingHorizontal: theme.space.md,
        }}
      >
        {TABS.map((t) => {
          const selected = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                flex: 1,
                gap: theme.space.sm,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: theme.space.xs * 1.5,
                borderWidth: 1.5,
                borderRadius: theme.borderRadius.lg,
                borderColor: selected ? theme.color.accent : theme.color.border,
                backgroundColor: selected ? theme.color.accent + '18' : theme.color.card,
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.bold,
                  color: selected ? theme.color.accent : theme.color.textSecondary,
                }}
              >
                {t.label}
              </Text>

              {t.count > 0 && (
                <View
                  style={{
                    minWidth: theme.space.md,
                    height: theme.space.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: theme.space.xs,
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: selected ? theme.color.accent : theme.color.error,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.fontSize.xs,
                      color: theme.color.textInverse,
                      fontFamily: theme.fontFamily.numberBold,
                    }}
                  >
                    {t.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {error && (
        <Text
          style={{
            color: theme.color.error,
            fontFamily: theme.fontFamily.regular,
            paddingBottom: theme.space.sm,
            paddingHorizontal: theme.space.md,
          }}
        >
          {error}
        </Text>
      )}

      <FlatList
        data={currentList}
        keyExtractor={(item) => item.challengeId}
        contentContainerStyle={{
          flexGrow: 1,
          gap: theme.space.sm,
          padding: theme.space.md,
          paddingBottom: insets.bottom * 1.5,
        }}
        renderItem={({ item }) => (
          <ChallengeMatchRow
            challenge={item}
            currentUserId={user.uid}
            opponent={data.friendsById.get(item.participants.find((p) => p !== user.uid) ?? '')}
            onPress={() =>
              router.push({
                pathname: '/challenges/[challengeId]',
                params: { challengeId: item.challengeId },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              gap: theme.space.sm,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.xl * 2,
            }}
          >
            <Feather
              name={tab === 'invites' ? 'mail' : tab === 'active' ? 'zap' : 'clock'}
              size={theme.space.xl * 1.25}
              color={theme.color.textMuted}
            />
            <Text
              style={{
                textAlign: 'center',
                color: theme.color.textMuted,
                fontFamily: theme.fontFamily.regular,
                paddingHorizontal: theme.space.lg,
              }}
            >
              {theme.i18n.t(`challenges.empty.${tab}`)}
            </Text>

            {tab === 'invites' && (
              <TouchableOpacity
                onPress={() => router.push('/challenges/create')}
                style={{
                  marginTop: theme.space.sm,
                  paddingVertical: theme.space.sm,
                  paddingHorizontal: theme.space.lg,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: theme.color.accent,
                }}
              >
                <Text
                  style={{
                    color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                    fontFamily: theme.fontFamily.bold
                  }}
                >
                  {theme.i18n.t('challenges.createFirst')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}
