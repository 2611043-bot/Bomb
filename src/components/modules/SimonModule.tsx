import React, { useState, useEffect, useRef } from 'react';
import { SimonModuleState, SimonColor } from '../../types/game';
import { ModuleContainer } from './ModuleContainer';
import { soundManager } from '../../utils/audio';

interface SimonModuleProps {
  module: SimonModuleState;
  onColorClick: (color: SimonColor) => void;
}

export const SimonModule: React.FC<SimonModuleProps> = ({ module, onColorClick }) => {
  const [activeFlash, setActiveFlash] = useState<SimonColor | null>(null);
  const isPlayingSeqRef = useRef(false);

  // Play sequence loop
  useEffect(() => {
    if (module.isSolved) {
      setActiveFlash(null);
      return;
    }

    let isMounted = true;
    let timeoutId: any = null;

    const runSequence = async () => {
      if (!isMounted || module.isSolved) return;
      isPlayingSeqRef.current = true;

      const subSeq = module.flashSequence.slice(0, module.currentStage);
      for (const color of subSeq) {
        if (!isMounted || module.isSolved) return;
        setActiveFlash(color);
        soundManager.playSimonTone(color);
        await new Promise(r => setTimeout(r, 450));
        setActiveFlash(null);
        await new Promise(r => setTimeout(r, 200));
      }

      isPlayingSeqRef.current = false;
      // Pause 2.5 seconds between sequence repeats
      timeoutId = setTimeout(runSequence, 2500);
    };

    timeoutId = setTimeout(runSequence, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [module.currentStage, module.isSolved, module.flashSequence]);

  const handleQuadrantClick = (color: SimonColor) => {
    if (module.isSolved) return;
    soundManager.playSimonTone(color);
    onColorClick(color);
  };

  return (
    <ModuleContainer title="カラーシーケンス (サイモン)" isSolved={module.isSolved}>
      <div className="w-full h-48 bg-[#12141a] border border-[#2b2e3b] rounded flex flex-col items-center justify-center p-2 relative">
        <div className="relative w-36 h-36 rounded-full bg-[#1e2029] border-4 border-[#333748] p-1 flex items-center justify-center overflow-hidden shadow-2xl">
          {/* Top (Red) */}
          <button
            disabled={module.isSolved}
            onClick={() => handleQuadrantClick('red')}
            className={`absolute top-0 left-0 right-0 h-1/2 rounded-t-full transition-all border-b-2 border-black/60
              ${
                activeFlash === 'red'
                  ? 'bg-red-400 shadow-[0_0_20px_#ef4444]'
                  : 'bg-red-800 hover:bg-red-700 active:bg-red-500'
              }
              ${module.isSolved ? 'opacity-50' : 'cursor-pointer'}
            `}
          />

          {/* Bottom (Yellow) */}
          <button
            disabled={module.isSolved}
            onClick={() => handleQuadrantClick('yellow')}
            className={`absolute bottom-0 left-0 right-0 h-1/2 rounded-b-full transition-all border-t-2 border-black/60
              ${
                activeFlash === 'yellow'
                  ? 'bg-yellow-300 shadow-[0_0_20px_#fde047]'
                  : 'bg-yellow-700 hover:bg-yellow-600 active:bg-yellow-400'
              }
              ${module.isSolved ? 'opacity-50' : 'cursor-pointer'}
            `}
          />

          {/* Left (Blue) - clipped diagonally */}
          <button
            disabled={module.isSolved}
            onClick={() => handleQuadrantClick('blue')}
            className={`absolute top-0 bottom-0 left-0 w-1/2 rounded-l-full transition-all border-r-2 border-black/60
              ${
                activeFlash === 'blue'
                  ? 'bg-blue-400 shadow-[0_0_20px_#60a5fa]'
                  : 'bg-blue-800 hover:bg-blue-700 active:bg-blue-500'
              }
              ${module.isSolved ? 'opacity-50' : 'cursor-pointer'}
            `}
            style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
          />

          {/* Right (Green) - clipped diagonally */}
          <button
            disabled={module.isSolved}
            onClick={() => handleQuadrantClick('green')}
            className={`absolute top-0 bottom-0 right-0 w-1/2 rounded-r-full transition-all border-l-2 border-black/60
              ${
                activeFlash === 'green'
                  ? 'bg-emerald-400 shadow-[0_0_20px_#34d399]'
                  : 'bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-500'
              }
              ${module.isSolved ? 'opacity-50' : 'cursor-pointer'}
            `}
            style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}
          />

          {/* Center Hub */}
          <div className="absolute w-12 h-12 rounded-full bg-[#181a22] border-2 border-[#383d4e] flex items-center justify-center shadow-lg pointer-events-none">
            <span className="text-[10px] font-mono text-gray-400 font-bold">
              {module.isSolved ? 'OK' : `S${module.currentStage}`}
            </span>
          </div>
        </div>
      </div>
      <div className="text-[10px] text-gray-500 font-mono mt-2 text-center">
        {module.isSolved
          ? '解除完了'
          : `ステージ ${module.currentStage}/${module.flashSequence.length} (入力: ${module.playerInput.length})`}
      </div>
    </ModuleContainer>
  );
};
