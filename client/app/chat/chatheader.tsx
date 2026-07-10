import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomSearchBar } from '../../components/CustomSearchBar';

type Theme = any; 
type ChatHeaderProps = {
  theme: Theme;
  searchVisible: boolean;
  setSearchVisible: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};

export default function ChatHeader({
  theme,
  searchVisible,
  setSearchVisible,
  search,
  setSearch,
}: ChatHeaderProps) {
  return (
    <>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.md,
          paddingBottom: theme.space.sm,
        }}
      >
        <View style={{ flex: 1, marginRight: theme.space.sm }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xl ?? theme.fontSize.lg,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('Discussion Rooms')}
          </Text>
          <Text
            style={{
              marginTop: theme.space.xs * 0.5,
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('Join, discuss & learn together')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSearchVisible((v) => !v)}
            style={{
              width: theme.space.xl + theme.space.xs,
              height: theme.space.xl + theme.space.xs,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.color.border,
              backgroundColor: theme.color.card,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="search" size={theme.fontSize.md} color={theme.color.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Search input (toggled) */}
      {searchVisible && (
        <View
          style={{
            marginHorizontal: theme.space.md,
            marginBottom: theme.space.sm,
          }}
        >
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