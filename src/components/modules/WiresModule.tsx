import React from 'react';
import { WiresModuleState } from '../../types/game';
import { ModuleContainer } from './ModuleContainer';
import { soundManager } from '../../utils/audio';

interface WiresModuleProps {
  module: WiresModuleState;
  onCut: (index: number) => void;
}

const WIRE_COLOR_MAP: Record<string, { bg: string; border: string; glow: string }> = {
  red: { bg: 'bg-red-600', border: 'border-red-400', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
  blue: { bg: 'bg-blue-600', border: 'border-blue-400', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
  yellow: { bg: 'bg-amber-400', border: 'border-amber-200', glow: 'shadow-[0_0_8px_rgba(251,191,36,0.5)]' },
  white: { bg: 'bg-gray-100', border: 'border-gray-300', glow: 'shadow-[0_0_8px_rgba(243,244,246,0.5)]' },
  black: { bg: 'bg-gray-900', border: 'border-gray-700', glow: 'shadow-[0_0_8px_rgba(0,0,0,0.5)]' },
};

export const WiresModule: React.FC<WiresModuleProps> = ({ module, onCut }) => {
  const handleCut = (index: number) => {
    if (module.isSolved || module.wires[index].isCut) return;
    soundManager.playWireCut();
    onCut(index);
  };

  return (
    <ModuleContainer title="導線モジュール" isSolved={module.isSolved}>
      <div className="w-full h-48 bg-[#12141a] border border-[#2b2e3b] rounded flex flex-col justify-around py-3 px-4 relative overflow-hidden">
        {/* Terminal blocks on left and right */}
        <div className="absolute left-1 top-2 bottom-2 w-3 bg-[#242733] border-r border-[#3a3f52] flex flex-col justify-around py-2 items-center">
          {module.wires.map((_, i) => (
            <div key={`term-l-${i}`} className="w-2 h-2 rounded-full bg-yellow-600 border border-yellow-400" />
          ))}
        </div>
        <div className="absolute right-1 top-2 bottom-2 w-3 bg-[#242733] border-l border-[#3a3f52] flex flex-col justify-around py-2 items-center">
          {module.wires.map((_, i) => (
            <div key={`term-r-${i}`} className="w-2 h-2 rounded-full bg-yellow-600 border border-yellow-400" />
          ))}
        </div>

        {/* Wires */}
        {module.wires.map((wire, idx) => {
          const style = WIRE_COLOR_MAP[wire.color] || WIRE_COLOR_MAP.red;
          return (
            <div
              key={wire.id}
              className="relative w-full h-6 flex items-center justify-center group cursor-pointer"
              onClick={() => handleCut(idx)}
            >
              {wire.isCut ? (
                // Cut wire representation
                <div className="w-full flex items-center justify-between px-2">
                  <div
                    className={`h-2.5 rounded-l flex-1 mr-6 ${style.bg} ${style.border} border-t border-b`}
                    style={{ transform: 'rotate(-4deg)' }}
                  />
                  <span className="text-[10px] text-red-500 font-bold font-mono">✂ CUT</span>
                  <div
                    className={`h-2.5 rounded-r flex-1 ml-6 ${style.bg} ${style.border} border-t border-b`}
                    style={{ transform: 'rotate(4deg)' }}
                  />
                </div>
              ) : (
                // Uncut wire
                <div
                  className={`w-full h-2.5 rounded-full ${style.bg} ${style.border} border-t border-b transition-all duration-150 group-hover:scale-y-125 ${
                    module.isSolved ? '' : style.glow
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow">
                      切断
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-gray-500 font-mono mt-2 text-center">
        {module.isSolved ? '解除完了' : 'クリックして導線を切断'}
      </div>
    </ModuleContainer>
  );
};
