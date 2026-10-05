import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useEffect, useRef, useState } from 'react';

import { useTheme } from '../../theme/ThemeContext';


const SIZE = 160;
const STROKE_WIDTH = 10;

export function QuizResultCard({ scorePercent }: { scorePercent: number }) {
  const { theme } = useTheme();
  
  const radius = (SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, scorePercent));

  const [animatedPercent, setAnimatedPercent] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setAnimatedPercent(0);
    const duration = 1200;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed/duration, 1);
      setAnimatedPercent((1 - Math.pow(1-t, 3)) * clamped);

      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [clamped]);

  const strokeDashoffset = circumference - (animatedPercent/100)*circumference;

  return (
    <View
      accessible
      accessibilityRole='progressbar'
      accessibilityLabel={`${theme.i18n.t('contests.postQuizScreen.score')}: ${Math.round(clamped)}%`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
      style={{
        width: SIZE,
        height: SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={radius}
          stroke={theme.isDark ? theme.color.surface : 'rgba(255,255,255,0.25)'}
          strokeWidth={STROKE_WIDTH}
          fill='transparent'
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={radius}
          stroke={theme.isDark ? theme.color.info : '#FFFFFF'}
          strokeWidth={STROKE_WIDTH}
          fill='transparent'
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`}
        />
      </Svg>

      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            fontSize: theme.fontSize.xxxl,
            fontFamily: theme.fontFamily.numberBold,
            color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
          }}
        >
          {Math.round(animatedPercent)}%
        </Text>
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.light,
            color: theme.isDark ? theme.color.textSecondary : 'rgba(255,255,255,0.75)',
          }}
        >
          {theme.i18n.t('contests.postQuizScreen.score')}
        </Text>
      </View>
    </View>
  );
}
