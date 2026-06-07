import react from "react";
import { View, Text} from "react-native";

export type XpProgressCardProps = {
  currentLevel: number;
  nextLevel: number;
  currentXP: number;
  totalXP: number;
  progress: number;
  remaining: number;
};

export function LevelProgressCard({
  currentLevel,
  nextLevel,
  currentXP,
  totalXP,
  progress,
  remaining,
}: XpProgressCardProps) {
  return (
    <View style={{ padding: 10 }}>
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 10,
          width: 320,
          shadowColor: "#a0aaff",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#5e5e63" }}>
            Level {currentLevel} → Level {nextLevel}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: "500", color: "#3355FF" }}>
            {currentXP.toLocaleString()} / {totalXP.toLocaleString()} XP
          </Text>
        </View>

        
        <View
          style={{
            height: 6,
            backgroundColor: "#E0E4FF",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              backgroundColor: "#3355FF",
              borderRadius: 10,
            }}
          />
        </View>

        
        <Text style={{ fontSize: 11, color: "#9099AA" }}>
          {remaining.toLocaleString()} XP to next level
        </Text>
      </View>
    </View>
  );
}
