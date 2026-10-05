import { useEffect, useRef, useState } from 'react';


const LOW_TIME_THRESHOLD_RATIO = 0.2;

export interface UseQuizTimerOptions {
  totalSeconds: number;
  paused: boolean;
  onExpire: () => void;
  onLowTime?: () => void;
}
export interface UseQuizTimerResult {
  timeLeft: number;
  isLowTime: boolean;
}

export function useQuizTimer({ totalSeconds, paused, onExpire, onLowTime }: UseQuizTimerOptions): UseQuizTimerResult {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isLowTime, setIsLowTime] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  const onLowTimeRef = useRef(onLowTime);
  const lowTimeFiredRef = useRef(false);
  const thresholdRef = useRef(Math.floor(totalSeconds * LOW_TIME_THRESHOLD_RATIO));

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);
  useEffect(() => {
    onLowTimeRef.current = onLowTime;
  }, [onLowTime]);

  useEffect(() => {
    setTimeLeft(totalSeconds);
    setIsLowTime(false);
    lowTimeFiredRef.current = false;
    thresholdRef.current = Math.floor(totalSeconds * LOW_TIME_THRESHOLD_RATIO);
  }, [totalSeconds]);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;

        if (!lowTimeFiredRef.current && next > 0 && next <= thresholdRef.current) {
          lowTimeFiredRef.current = true;
          setIsLowTime(true);
          onLowTimeRef.current?.();
        }
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          onExpireRef.current();
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  return { timeLeft, isLowTime };
}
