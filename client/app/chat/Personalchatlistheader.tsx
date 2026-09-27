import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { CustomSearchBar } from '../../components/common/CustomSearchBar';


type PersonalChatListHeaderProps = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  searchVisible: boolean;
  setSearchVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function PersonalChatListHeader({ search, setSearch, searchVisible, setSearchVisible }: PersonalChatListHeaderProps) {
  const { theme } = useTheme();

  return (
    <>
      <View
        style={{
          minHeight: theme.space.xxl + theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
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
            {theme.i18n.t('Messages')}
          </Text>

          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.xs * 0.5,
            }}
          >
            {theme.i18n.t('Your direct conversations')}
          </Text>
        </View>

        <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSearchVisible((v) => !v)}
            style={{
              width: theme.space.xl,
              height: theme.space.xl,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.card,
            }}
          >
            <Ionicons name='search' size={theme.fontSize.md} color={theme.color.textSecondary} />
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
            placeholder={theme.i18n.t('Search conversations...')}
            autoFocus
          />
        </View>
      )}
    </>
  );
}
