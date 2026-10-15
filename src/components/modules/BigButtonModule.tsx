import React, { useState, useRef, useEffect } from 'react';
import { BigButtonModuleState } from '../../types/game';
import { ModuleContainer } from './ModuleContainer';
import { soundManager } from '../../utils/audio';

interface BigButtonModuleProps {
  module: BigButtonModuleState;
  remainingTime: number; // in seconds
  onPress: (success: boolean) => void;
}

const BUTTON_COLOR_MAP: Record<string, { bg: string; ring: string; text: string }> = {
  red: { bg: 'bg-red-600 hover:bg-red-500 active:bg-red-700', ring: 'border-red-800', text: 'text-white' },
  blue: { bg: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700', ring: 'border-blue-800', text: 'text-white' },
  yellow: { bg: 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500', ring: 'border-amber-600', text: 'text-gray-900' },
  white: { bg: 'bg-gray-100 hover:bg-white active:bg-gray-200', ring: 'border-gray-400', text: 'text-gray-900' },
};

const STRIP_COLOR_MAP: Record<string, { bg: string; glow: string }> = {
  blue: { bg: 'bg-blue-500', glow: 'shadow-[0_0_14px_#3b82f6]' },
  white: { bg: 'bg-white', glow: 'shadow-[0_0_14px_#ffffff]' },
  yellow: { bg: 'bg-amber-400', glow: 'shadow-[0_0_14px_#fbbf24]' },
  red: { bg: 'bg-red-600', glow: 'shadow-[0_0_14px_#ef4444]' },
};

export const BigButtonModule: React.FC<BigButtonModuleProps> = ({
  module,
  remainingTime,
  onPress,
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [showStrip, setShowStrip] = useState(false);
  const pressStartTimeRef = useRef<number>(0);
  const holdTimerRef = useRef<any>(null);

  const buttonStyle = BUTTON_COLOR_MAP[module.color] || BUTTON_COLOR_MAP.red;
  const stripStyle = STRIP_COLOR_MAP[module.stripColor] || STRIP_COLOR_MAP.red;

  const handlePointerDown = () => {
    if (module.isSolved) return;
    setIsPressing(true);
    soundManager.playButtonClick();
    pressStartTimeRef.current = Date.now();

    // After 400ms, reveal the colored indicator strip (holding)
    holdTimerRef.current = setTimeout(() => {
      setShowStrip(true);
    }, 400);
  };

  const handlePointerUp = () => {
    if (!isPressing || module.isSolved) return;
    setIsPressing(false);
    clearTimeout(holdTimerRef.current);

    const pressDuration = Date.now() - pressStartTimeRef.current;
    const wasHeld = pressDuration >= 400;
    setShowStrip(false);

    if (module.shouldHold) {
      if (!wasHeld) {
        // Should have held, but only clicked -> Strike!
        soundManager.playStrike();
        onPress(false);
      } else {
        // Check if current timer contains requiredDigit
        const mins = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        const timeStr = `${mins}${secs < 10 ? '0' : ''}${secs}`;
        const hasReqDigit =
          module.requiredDigit !== null &&
          timeStr.includes(module.requiredDigit.toString());

        if (hasReqDigit) {
          soundManager.playModuleDefused();
          onPress(true);
        } else {
          soundManager.playStrike();
          onPress(false);
        }
      }
    } else {
      // should click & immediately release
      if (wasHeld) {
        // Held when shouldn't have -> Strike!
        soundManager.playStrike();
        onPress(false);
      } else {
        soundManager.playModuleDefused();
        onPress(true);
      }
    }
  };

  useEffect(() => {
    const handleGlobalUp = () => {
      if (isPressing) handlePointerUp();
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, [isPressing, remainingTime, module]);

  return (
    <ModuleContainer title="ビッグボタン" isSolved={module.isSolved}>
      <div className="w-full h-48 bg-[#12141a] border border-[#2b2e3b] rounded flex items-center justify-around px-4 relative">
        {/* Main Big Button */}
        <div className="relative">
          <div
            onPointerDown={handlePointerDown}
            className={`w-28 h-28 rounded-full border-4 ${buttonStyle.ring} ${buttonStyle.bg} ${buttonStyle.text}
              flex items-center justify-center font-bold text-xl tracking-wider shadow-2xl cursor-pointer select-none transition-transform
              ${isPressing ? 'scale-95 shadow-inner' : 'scale-100 hover:scale-102'}
              ${module.isSolved ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <span>{module.label}</span>
          </div>
        </div>

        {/* Right side LED Indicator Strip */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">
            STRIP
          </span>
          <div className="w-5 h-28 rounded bg-[#1f222d] border border-[#373c4d] flex items-center justify-center p-1">
            <div
              className={`w-full h-full rounded transition-all duration-150 ${
                showStrip
                  ? `${stripStyle.bg} ${stripStyle.glow}`
                  : 'bg-black/40 opacity-20'
              }`}
            />
          </div>
        </div>
      </div>
      <div className="text-[10px] text-gray-500 font-mono mt-2 text-center">
        {module.isSolved ? '解除完了' : isPressing ? 'ホールド中…' : 'クリックまたは長押し'}
      </div>
    </ModuleContainer>
  );
};
