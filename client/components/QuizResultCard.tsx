import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../theme/ThemeContext';


type QuizResultCardProps = {
  scorePercent: number;
  size?: number;
  strokeWidth?: number;
  passThreshold?: number;
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function QuizResultCard({
  scorePercent,
  size = 160,
  strokeWidth = 10,
  passThreshold = 40,
}: QuizResultCardProps) {
  const { theme } = useTheme();

  const clamped = Math.max(0, Math.min(100, scorePercent));
  const passed = clamped >= passThreshold;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [animatedPercent, setAnimatedPercent] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setAnimatedPercent(0);
    const duration = 1200;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      setAnimatedPercent(easeOutCubic(t) * clamped);

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [clamped]);

  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;
  const progressColor = passed ? theme.color.success : theme.color.error;
  const trackColor = theme.color.border;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            color: progressColor,
            fontSize: theme.fontSize.xxxl,
            fontWeight: theme.fontWeight.bold as any,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {Math.round(animatedPercent)}%
        </Text>
        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.light,
          }}
        >
          {theme.i18n.t('components.QuizResultCard.score')}
        </Text>
      </View>
    </View>
  );
}

export default QuizResultCard;