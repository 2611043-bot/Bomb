import React from 'react';

interface TimerDisplayProps {
  remainingTime: number; // in seconds
  isRunning: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ remainingTime, isRunning }) => {
  const mins = Math.floor(Math.max(0, remainingTime) / 60);
  const secs = Math.floor(Math.max(0, remainingTime) % 60);

  const minsStr = mins.toString().padStart(2, '0');
  const secsStr = secs.toString().padStart(2, '0');

  const isUrgent = remainingTime <= 60 && remainingTime > 0;

  return (
    <div className="bg-[#110505] border-4 border-[#331111] rounded-lg px-5 py-2 shadow-inner flex flex-col items-center">
      <div className="text-[10px] font-mono font-bold tracking-widest text-red-500/80 uppercase">
        TIME REMAINING
      </div>
      <div className="relative font-mono font-bold text-5xl tracking-widest flex items-center justify-center select-none">
        {/* Ghost background digits (for digital clock aesthetic) */}
        <div className="absolute inset-0 text-red-950/30 flex items-center justify-center tracking-widest pointer-events-none">
          88:88
        </div>
        {/* Active digital clock digits */}
        <div
          className={`relative z-10 transition-colors ${
            isUrgent
              ? 'text-red-500 drop-shadow-[0_0_15px_#ef4444] animate-pulse'
              : 'text-red-500 drop-shadow-[0_0_8px_#ef4444]'
          }`}
        >
          <span>{minsStr}</span>
          <span className={isRunning ? 'animate-pulse' : ''}>:</span>
          <span>{secsStr}</span>
        </div>
      </div>
    </div>
  );
};
