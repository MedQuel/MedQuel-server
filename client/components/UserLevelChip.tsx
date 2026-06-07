import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type LevelBadgesProps = {
    level: number;
};
export function UserLevelChip(props: LevelBadgesProps) {
    return (
        <View style={{
            
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#0F1E4D',
            borderRadius: 50,
            paddingHorizontal: 18,
            paddingVertical: 10,
            
            borderWidth: 3,
            borderColor: '#1E3ABA',
            alignSelf: 'flex-start',
        }}><Ionicons name="star" size={24} color="gold" />
            <Text style={{
                fontSize: 20,
                marginRight: 8

            }} ></Text>
            <Text style={{
                color: '#3b82fc', fontSize: 24,
                fontWeight: '700',
            }}>Lv {props.level}</Text>
        </View>
    )
}



