import React from 'react';
import { Battery } from 'lucide-react';

interface BombCasingProps {
  serialNumber: string;
  batteries: number;
  litIndicator: string;
  ports: string[];
}

export const BombCasing: React.FC<BombCasingProps> = ({
  serialNumber,
  batteries,
  litIndicator,
  ports
}) => {
  return (
    <div className="bg-[#15171f] border-2 border-[#2f3342] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md">
      {/* Serial Number Plate */}
      <div className="relative bg-[#d1d5db] text-gray-900 border-2 border-[#9ca3af] px-3 py-1 rounded flex items-center gap-2 shadow font-bold tracking-wider">
        {/* Plate screws */}
        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 absolute top-1 left-1" />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 absolute top-1 right-1" />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 absolute bottom-1 left-1" />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 absolute bottom-1 right-1" />
        <span className="text-[10px] text-gray-600 pl-1">S/N:</span>
        <span className="text-sm font-extrabold tracking-widest">{serialNumber}</span>
      </div>

      {/* Batteries */}
      <div className="flex items-center gap-2 bg-[#1f222d] border border-[#33384a] px-3 py-1.5 rounded">
        <Battery size={16} className="text-amber-400" />
        <span className="text-gray-400 text-[11px]">BATTERY:</span>
        <span className="text-amber-300 font-bold">{batteries}本</span>
        <div className="flex gap-1 ml-1">
          {Array.from({ length: batteries }).map((_, i) => (
            <div key={`bat-${i}`} className="w-2.5 h-4 bg-amber-500/80 rounded-sm border border-amber-300" />
          ))}
        </div>
      </div>

      {/* Lit Indicator */}
      <div className="flex items-center gap-2 bg-[#1f222d] border border-[#33384a] px-3 py-1.5 rounded">
        <span className="text-gray-400 text-[11px]">INDICATOR:</span>
        {litIndicator !== 'NONE' ? (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-emerald-300 font-bold tracking-wider">{litIndicator}</span>
            <span className="text-[9px] text-emerald-500 uppercase">(点灯)</span>
          </div>
        ) : (
          <span className="text-gray-500 font-medium">なし</span>
        )}
      </div>

      {/* Ports */}
      <div className="flex items-center gap-2 bg-[#1f222d] border border-[#33384a] px-3 py-1.5 rounded">
        <span className="text-gray-400 text-[11px]">PORTS:</span>
        <div className="flex gap-1.5">
          {ports.map((port, idx) => (
            <span
              key={`port-${idx}`}
              className="px-1.5 py-0.5 rounded bg-[#2b2f3d] text-gray-300 border border-[#40465a] text-[10px]"
            >
              {port}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
