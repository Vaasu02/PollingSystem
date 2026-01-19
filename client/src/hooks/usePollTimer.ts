import { useState, useEffect, useRef } from 'react';

export const usePollTimer = (remainingTime: number | null, isActive: boolean) => {
  const [time, setTime] = useState<number | null>(remainingTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (remainingTime !== null) {
      setTime(remainingTime);
    }
  }, [remainingTime]);

  useEffect(() => {
    if (!isActive || time === null || time <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev === null || prev <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, time]);

  const formatTime = (seconds: number | null): string => {
    if (seconds === null || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return {
    remainingTime: time,
    formattedTime: formatTime(time),
    isExpired: time !== null && time <= 0,
  };
};

