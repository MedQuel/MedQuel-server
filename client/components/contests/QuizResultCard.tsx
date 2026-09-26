import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../theme/ThemeContext';


type QuizResultCardProps = {
  scorePercent: number;
};

const SIZE = 160;
const STROKE_WIDTH = 10;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function QuizResultCard({ scorePercent }: QuizResultCardProps) {
  const { theme } = useTheme();

  const clamped = Math.max(0, Math.min(100, scorePercent));

  const radius = (SIZE - STROKE_WIDTH) / 2;
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
  const progressColor = theme.isDark ? theme.color.info : '#FFFFFF';
  const trackColor = theme.isDark ? theme.color.surface : 'rgba(255,255,255,0.25)';

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: theme.fontSize.xxxl,
            fontWeight: theme.fontWeight.bold as any,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {Math.round(animatedPercent)}%
        </Text>
        <Text
          style={{
            color: theme.isDark ? theme.color.textSecondary : 'rgba(255,255,255,0.75)',
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