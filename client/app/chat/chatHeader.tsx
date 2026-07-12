import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { CustomSearchBar } from '../../components/CustomSearchBar';


type ChatHeaderProps = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  searchVisible: boolean;
  setSearchVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export function ChatHeader({ search, setSearch, searchVisible, setSearchVisible }: ChatHeaderProps) {
  const { theme } = useTheme();

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingTop: theme.space.md,
          paddingBottom: theme.space.sm,
          paddingHorizontal: theme.space.md,
        }}
      >
        <View style={{ flex: 1, marginRight: theme.space.sm }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xl,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('Discussion Rooms')}
          </Text>

          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.xs * 0.5,
            }}
          >
            {theme.i18n.t('Join, discuss & learn together')}
          </Text>
        </View>

        <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSearchVisible((v) => !v)}
            style={{
              width: theme.space.xl + theme.space.xs,
              height: theme.space.xl + theme.space.xs,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.card,
            }}
          >
            <Ionicons
              name='search'
              size={theme.fontSize.md}
              color={theme.color.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {searchVisible && (
        <View style={{ marginBottom: theme.space.sm, marginHorizontal: theme.space.md }}>
          <CustomSearchBar
            value={search}
            onChange={setSearch}
            onSubmit={setSearch}
            onClear={() => setSearch('')}
            placeholder={theme.i18n.t('Search discussion rooms...')}
            autoFocus
          />
        </View>
      )}
    </>
  );
}
