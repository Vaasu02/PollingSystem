export const formatTime = (seconds: number): string => {
  if (seconds < 0) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

