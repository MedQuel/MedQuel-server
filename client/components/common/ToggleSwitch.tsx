import { useRef, useEffect } from 'react';
import { Animated, Pressable } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


type Size = 'small' | 'medium' | 'large';
type ToggleSwitchProps = {
  isOn: boolean;
  onColor: string;
  offColor: string;
  size?: Size;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
};

const SIZES: Record<Size, { width: number; height: number; thumb: number }> = {
  small: { width: 38, height: 20, thumb: 16 },
  medium: { width: 55, height: 26, thumb: 22 },
  large: { width: 60, height: 32, thumb: 28 },
};

export function ToggleSwitch({
  isOn,
  onColor,
  offColor,
  size = 'medium',
  onToggle,
  disabled = false,
}: ToggleSwitchProps) {
  const { theme } = useTheme();
  const { width, height, thumb } = SIZES[size];
  const anim = useRef(new Animated.Value(isOn ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isOn ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [anim, isOn]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, width-thumb-2],
  });
  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [offColor, onColor],
  });


  return (
    <Pressable disabled={disabled} onPress={() => onToggle(!isOn)}>
      <Animated.View
        style={{
          width,
          height,
          justifyContent: 'center',
          paddingHorizontal: theme.space.xs * 0.5,
          borderRadius: height / 2,
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Animated.View
          style={{
            width: thumb,
            height: thumb,
            borderRadius: thumb / 2,
            backgroundColor: '#fff',
            transform: [{ translateX }],
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
