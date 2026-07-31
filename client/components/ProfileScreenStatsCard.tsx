import { View, Text,ActivityIndicator,Button } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { useEffect, useState } from 'react';
import { userApi } from "@/common/api/api";


const stats = [
  { label: 'Level', value:'', color: '#F59E0B', icon: 'star' },
  { label: 'Rank',value:'#127', color: '#3B82F6', icon: 'trending-up' },
  { label: 'Streak', value: '24', color: '#EF4444', icon: 'fire' },
  { label: 'Accuracy', value: '87%', color: '#22C55E', icon: 'bullseye' },
];

export function ProfileScreenStatsCard() {
  const { theme } = useTheme();
  const [userData,setUserData] = useState<any>(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState<string|null>(null)

  const fetchData = async()=>{
    try {
      setError(null)
      setLoading(true)
      const response = await userApi.getMe()
      if(!response){
        console.log('no data found')
      }
      setUserData(response)
    } catch (error) {
      setError('Could not load profile. Pull to refresh.')
    }finally{
      setLoading(false)
    }
  }
  useEffect(()=>{
    fetchData()
  },[])

if (loading) {
  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.color.textMuted} />
    </View>
  );
}
if (error) {
  return (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <Text style={{ color: 'red', marginBottom: 10 }}>
        {error}
      </Text>

      <Button title="Retry" onPress={fetchData} />
    </View>
  );
}
  return (
   <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.space.lg,
        paddingHorizontal: theme.space.md + 6,
      }}
    >
      {stats.map((item, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: theme.space.sm + 8,
            marginHorizontal: theme.space.xs,
            borderWidth: 1.5,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.isDark ? theme.color.card : theme.color.card,
          }}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={theme.space.md + 6}
            color={item.color}
          />

          <Text
            style={{
              color: item.color,
              fontSize: theme.fontSize.md + 1,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
              marginTop: theme.space.xs * 0.5,
            }}
          >
            
            {item.label === "Level" && userData?.currentLevel}
            {item.label === "Streak" && userData?.currentStreak}
            {item.label === 'Accuracy' && item.value}
            {item.label === 'Rank' && item.value}
          </Text>

          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs + 1,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.xs * 0.5,
            }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
