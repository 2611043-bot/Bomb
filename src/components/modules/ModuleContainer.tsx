import React from 'react';

interface ModuleContainerProps {
  title: string;
  isSolved: boolean;
  children: React.ReactNode;
}

export const ModuleContainer: React.FC<ModuleContainerProps> = ({
  title,
  isSolved,
  children
}) => {
  return (
    <div className="relative bg-[#1a1c23] border-2 border-[#333745] rounded-lg p-3 shadow-xl flex flex-col justify-between select-none">
      {/* Corner screws */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#4a4f60] flex items-center justify-center">
        <div className="w-1.5 h-0.5 bg-[#252833] transform rotate-45" />
      </div>
      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4a4f60] flex items-center justify-center">
        <div className="w-1.5 h-0.5 bg-[#252833] transform -rotate-12" />
      </div>
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-[#4a4f60] flex items-center justify-center">
        <div className="w-1.5 h-0.5 bg-[#252833] transform rotate-90" />
      </div>
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4a4f60] flex items-center justify-center">
        <div className="w-1.5 h-0.5 bg-[#252833] transform rotate-30" />
      </div>

      {/* Header with Title & Solved LED */}
      <div className="flex items-center justify-between mb-2 px-3 pt-1">
        <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase font-mono">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">
            {isSolved ? 'DEFUSED' : 'ACTIVE'}
          </span>
          <div
            className={`w-3.5 h-3.5 rounded-full border border-gray-700 transition-all duration-300 ${
              isSolved
                ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                : 'bg-emerald-950/40 opacity-40'
            }`}
          />
        </div>
      </div>

      {/* Module Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-1 py-1">
        {children}
      </div>
    </div>
  );
};
