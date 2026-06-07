import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export type DailyChallengeCardProps = {
  title: string;
  questions?: number;
  duration: number;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  hoursLeft?: number;
  epReward: number;
  onStart?: () => void;
}

export  function DailyChallengeCard(
 {title, questions, duration, difficulty, hoursLeft, epReward, onStart}: DailyChallengeCardProps) {
  return (
    <View
      style={{
        backgroundColor: "#2B4EFF",
        borderRadius: 20,
        paddingVertical:14,
        paddingHorizontal:12,
        overflow: "hidden",
       
      }}
    >
      
      <View
        style={{
          position: "absolute",
          width: 110,
          height: 110,
          borderRadius: 65,
          backgroundColor: "rgba(52, 51, 51, 0.1)",
          top: 0,
          right: 0,
        }}
      />

      
      <View
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "rgba(52, 51, 51, 0.1)",
          top: 30,
          right: 30,
        }}
      />

      
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingBottom: 10,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#4FFFB0",
            marginRight: 6,
          }}
        />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.4,
          }}
        >
          DAILY CHALLENGE
        </Text>
      </View>

    
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 22,
          fontWeight: "800",
          letterSpacing: -0.3,
          paddingBottom: 6,
        }}
      >
        {title}
      </Text>

      
      <Text
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 13,
          fontWeight: "400",
          paddingBottom: 20,
        }}
      >
        {questions} questions · {duration} min · {difficulty}
      </Text>

     
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
         
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.6)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 1.5,
                  height: 4,
                  backgroundColor: "rgba(255,255,255,0.6)",
                  position: "absolute",
                  top: 1,
                }}
              />
              <View
                style={{
                  width: 3,
                  height: 1.5,
                  backgroundColor: "rgba(255,255,255,0.6)",
                  position: "absolute",
                  right: 2,
                  top: 5.5,
                }}
              />
            </View>

            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              {hoursLeft}h left
            </Text>
          </View>

         
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1A3ADB",
              borderRadius: 20,
              paddingVertical: 5,
              paddingHorizontal: 10,
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 11 }}>⚡</Text>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              +{epReward} EP
            </Text>
          </View>
        </View>

      
        <TouchableOpacity
          onPress={onStart}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 15,
            paddingVertical: 12,
            paddingHorizontal: 22,
          }}
        >
          <Text
            style={{
              color: "#0826bc",
              fontSize: 15,
              fontWeight: "700",
              letterSpacing: 0.2,
            }}
          >
            Start →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}