import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  startTime: number;
  duration?: number; // in minutes, optional
}

export function Timer({ startTime, duration }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = () => {
    if (!duration) return null;
    const remainingMs = (duration * 60 * 1000) - elapsed;
    return remainingMs > 0 ? remainingMs : 0;
  };

  const timeRemaining = getTimeRemaining();
  const isTimeRunningOut = timeRemaining !== null && timeRemaining < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <div className="flex items-center space-x-2">
      <Clock className={`w-4 h-4 ${isTimeRunningOut ? 'text-red-500' : 'text-slate-400'}`} />
      <div className="text-right">
        <div className={`text-lg font-bold ${isTimeRunningOut ? 'text-red-600' : 'text-slate-700'}`} data-testid="timer-display">
          {timeRemaining !== null ? formatTime(timeRemaining) : formatTime(elapsed)}
        </div>
        <p className="text-xs text-slate-500">
          {timeRemaining !== null ? 'Time remaining' : 'Time elapsed'}
        </p>
      </div>
    </div>
  );
}
