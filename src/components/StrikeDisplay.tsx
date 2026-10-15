import React from 'react';

interface StrikeDisplayProps {
  strikes: number;
  maxStrikes: number;
}

export const StrikeDisplay: React.FC<StrikeDisplayProps> = ({ strikes, maxStrikes }) => {
  return (
    <div className="bg-[#181a22] border-2 border-[#333748] rounded-lg px-4 py-2 flex flex-col items-center justify-between">
      <div className="text-[10px] font-mono font-bold tracking-widest text-amber-500/90 uppercase flex items-center gap-1">
        <span>STRIKES</span>
      </div>
      <div className="flex gap-2.5 mt-2">
        {Array.from({ length: maxStrikes }).map((_, idx) => {
          const isTriggered = idx < strikes;
          return (
            <div
              key={`strike-${idx}`}
              className={`w-7 h-7 rounded border-2 flex items-center justify-center font-mono font-bold text-sm transition-all duration-200 ${
                isTriggered
                  ? 'bg-red-600/40 border-red-500 text-red-500 shadow-[0_0_12px_#ef4444]'
                  : 'bg-[#0f1118] border-[#313647] text-gray-700'
              }`}
            >
              X
            </div>
          );
        })}
      </div>
    </div>
  );
};
