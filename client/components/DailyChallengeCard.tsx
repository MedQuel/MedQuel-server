import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme  } from "../theme/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
export type DailyChallengeCardProps = {
  title: string;
  questions?: number;
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  hoursLeft: String;
  epReward: number;
  onStart?: () => void;
};

export function DailyChallengeCard({
  title, questions, duration, difficulty, hoursLeft, epReward, onStart,
}: DailyChallengeCardProps) {
  const { theme } = useTheme();
  const {isDark}  = theme
  

  return (
    <View
      style={{
       backgroundColor: isDark ? theme.color.border : '#064cb5',           
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.space.md,
        paddingHorizontal: theme.space.md,
        overflow: "hidden",
      }}
    >

      
      <View style={{
        position: "absolute",
        width: 110, height: 110,
        borderRadius: 65,
        backgroundColor: "rgba(0,0,0,0.1)",          
        top: -30, right: -20,
      }} />
      <View style={{
        position: "absolute",
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(0,0,0,0.1)",           
        top: 30, right: 30,
      }} />

      
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: theme.space.sm,                
      }}>
        <View style={{
          width: theme.space.sm, height: theme.space.sm,
          borderRadius: theme.borderRadius.sm,
          backgroundColor: theme.color.success,       
          marginRight: theme.space.xs,                
        }} />
        <Text style={{
          color: isDark ?theme.color.info:theme.color.textPrimary,                   
          fontSize: theme.fontSize.xs,               
          fontWeight: 'bold',
          letterSpacing:theme.space.sm - 5,
        }}>
          {theme.i18n.t('DailyChallenge')}
        </Text>
      </View>

      {/* Title */}
      <Text style={{
        color:isDark? theme.color.textPrimary : theme.color.textPrimary,                     
        fontSize: theme.fontSize.xl,                 
        fontWeight: 'bold',       
        letterSpacing: theme.space.xs-4,
        paddingBottom: theme.space.xs,                
      }}>
        {title}
      </Text>

      
      <Text style={{
        color: theme.color.textSecondary,               
        fontSize: theme.fontSize.sm,                  
        fontWeight: 'regular',         
        paddingBottom: theme.space.lg,                
      }}>
        {questions} questions · {duration} min · {difficulty}
      </Text>

      
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>

        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space.sm }}>

          
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space.sm }}>
            <View style={{
              width:theme.space.md-2, height: theme.space.md-2,
              borderRadius: 7,
              borderWidth: 1.5,
              borderColor: theme.color.textSecondary,   
              alignItems: "center",
              justifyContent: "center",
            }}>
              <View style={{
                width: 1.5, height: 4,
                backgroundColor: theme.color.textSecondary,
                position: "absolute", top: 1,
              }} />
              <View style={{
                width: 3, height: 1.5,
                backgroundColor: theme.color.textSecondary,
                position: "absolute", right: 2, top: 5.5,
              }} />
            </View>
            <Text style={{
              color: theme.color.textSecondary,         
              fontSize: theme.fontSize.sm,            
              fontWeight: 'regular',    
            }}>
              {hoursLeft}{theme.i18n.t('hoursLeft')}
            </Text>
          </View>

          
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ?theme.color.info + '45' :theme.color.accent,       
            borderRadius: theme.borderRadius.md,   
            paddingVertical: theme.space.xs,         
            paddingHorizontal: theme.space.sm,        
            gap: theme.space.xs-2,                      
          }}>
            <Text style={{ fontSize: theme.fontSize.xs }}><Ionicons name="flash" size={theme.space.sm + 2} color={isDark?theme.color.info: '#7da2f0'} /></Text>
            <Text style={{
              color: isDark ?theme.color.info:theme.color.textPrimary,               
              fontSize: theme.fontSize.xs,           
              fontWeight: 'bold',      
            }}>
              +{epReward} EP
            </Text>
          </View>
        </View>

        {/* Start button */}
        <TouchableOpacity
          onPress={onStart}
          activeOpacity={0.85}
          style={{
            backgroundColor: isDark ?theme.color.info: '#fcfcfd',       
            borderRadius: theme.borderRadius.md + 2,      
            paddingVertical: theme.space.sm,          
            paddingHorizontal: theme.space.md,        
          }}
        >
          <Text style={{
            color: isDark ?theme.color.textInverse:'#3e3eda',               
            fontSize: theme.fontSize.md,            
            fontWeight: 'bold',       
            letterSpacing: 0.2,
          }}>
             {theme.i18n.t('Start')} →
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}