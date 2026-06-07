import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function PremiumContestCard() {
  return (
    <View
      style={{
        backgroundColor: '#081A3A',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#14396D',
        width: '100%',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1D2C5E',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Ionicons
              name="medical-outline"
              size={12}
              color="#B8C7FF"
            />
            <Text
              style={{
                color: '#B8C7FF',
                marginLeft: 4,
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              PRO
            </Text>
          </View>

          <Text
            style={{
              color: '#34C759',
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            Radiology
          </Text>

          <View
            style={{
              backgroundColor: '#3A1520',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: '#FF5A5F',
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              Hard
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: '#25C9FF',
            fontSize: 24,
            fontWeight: '700',
          }}
        >
          ⚡ +500
        </Text>
      </View>

      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 24,
          fontWeight: '700',
          marginBottom: 16,
        }}
      >
        Radiology Sprint
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#10244A',
            paddingVertical: 10,
            borderRadius: 10,
            marginRight: 6,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="file-document-outline"
            size={16}
            color="#8396BF"
          />
          <Text
            style={{
              color: '#8396BF',
              marginLeft: 6,
            }}
          >
            80 Qs
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: '#10244A',
            paddingVertical: 10,
            borderRadius: 10,
            marginHorizontal: 3,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color="#8396BF"
          />
          <Text
            style={{
              color: '#8396BF',
              marginLeft: 6,
            }}
          >
            90m
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: '#10244A',
            paddingVertical: 10,
            borderRadius: 10,
            marginLeft: 6,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color="#8396BF"
          />
          <Text
            style={{
              color: '#8396BF',
              marginLeft: 6,
            }}
          >
            1,205
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          height: 54,
          borderRadius: 14,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          backgroundColor: '#7C3AED',
        }}
      >
        <MaterialCommunityIcons
          name="crown-outline"
          size={18}
          color="#FFF"
        />

        <Text
          style={{
            color: '#FFF',
            fontSize: 18,
            fontWeight: '700',
            marginHorizontal: 8,
          }}
        >
          Unlock & Start
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#FFF"
        />
      </TouchableOpacity>
    </View>
  );
}