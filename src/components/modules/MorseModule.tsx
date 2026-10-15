import React, { useState, useEffect, useRef } from 'react';
import { MorseModuleState } from '../../types/game';
import { ModuleContainer } from './ModuleContainer';
import { soundManager } from '../../utils/audio';
import { Volume2, VolumeX } from 'lucide-react';

interface MorseModuleProps {
  module: MorseModuleState;
  onTransmit: (freq: number) => void;
}

export const MorseModule: React.FC<MorseModuleProps> = ({ module, onTransmit }) => {
  const [isLightOn, setIsLightOn] = useState(false);
  const [freq, setFreq] = useState(module.selectedFrequency || 3.505);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  // Run Morse code flashing loop
  useEffect(() => {
    if (module.isSolved) {
      setIsLightOn(false);
      return;
    }

    let isMounted = true;
    let cancel = false;

    const playMorse = async () => {
      while (isMounted && !cancel && !module.isSolved) {
        // pattern: e.g. "... .... . .-.. .-.."
        const words = module.morsePattern.split(' ');
        for (const letter of words) {
          if (!isMounted || cancel || module.isSolved) break;
          for (const symbol of letter) {
            if (!isMounted || cancel || module.isSolved) break;
            const duration = symbol === '.' ? 200 : 600;

            setIsLightOn(true);
            if (soundEnabledRef.current) {
              soundManager.playMorseBeep(duration);
            }
            await new Promise(r => setTimeout(r, duration));

            setIsLightOn(false);
            await new Promise(r => setTimeout(r, 200)); // space between symbols
          }
          await new Promise(r => setTimeout(r, 600)); // space between letters
        }
        await new Promise(r => setTimeout(r, 2500)); // space between full loop
      }
    };

    playMorse();

    return () => {
      isMounted = false;
      cancel = true;
    };
  }, [module.morsePattern, module.isSolved]);

  const handleTune = (delta: number) => {
    if (module.isSolved) return;
    soundManager.playDialTick();
    setFreq(prev => {
      const next = Math.round((prev + delta) * 1000) / 1000;
      if (next < 3.500) return 3.500;
      if (next > 3.600) return 3.600;
      return next;
    });
  };

  const handleTransmit = () => {
    if (module.isSolved) return;
    soundManager.playButtonClick();
    onTransmit(freq);
  };

  return (
    <ModuleContainer title="モールス信号" isSolved={module.isSolved}>
      <div className="w-full h-48 bg-[#12141a] border border-[#2b2e3b] rounded p-2 flex flex-col justify-between items-center">
        {/* Signal Lamp & Audio Toggle */}
        <div className="w-full flex items-center justify-between px-3 pt-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded bg-[#20232e] text-gray-400 hover:text-gray-200 border border-[#353b4c]"
            title={soundEnabled ? 'モールス音声OFF' : 'モールス音声ON'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Glowing Signal Lamp */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-1">
              SIGNAL
            </span>
            <div
              className={`w-9 h-9 rounded-full border-2 border-[#454a5c] transition-all duration-100 flex items-center justify-center ${
                isLightOn
                  ? 'bg-amber-300 shadow-[0_0_24px_#fde047]'
                  : 'bg-amber-950/30'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full ${
                  isLightOn ? 'bg-white' : 'bg-transparent'
                }`}
              />
            </div>
          </div>

          <div className="w-6" />
        </div>

        {/* Digital Frequency Display */}
        <div className="w-44 bg-[#0a0c10] border-2 border-[#2c3040] rounded px-3 py-1 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-mono">FREQ</span>
          <span className="font-mono text-lg font-bold text-amber-400 tracking-wider">
            {freq.toFixed(3)} <span className="text-xs text-amber-600">MHz</span>
          </span>
        </div>

        {/* Controls: Tuning buttons and Transmit */}
        <div className="w-full flex items-center justify-between px-3 pb-1">
          <div className="flex items-center gap-1.5">
            <button
              disabled={module.isSolved}
              onClick={() => handleTune(-0.005)}
              className="w-8 h-8 rounded bg-[#242735] hover:bg-[#2e3244] border border-[#3f465c] font-mono text-gray-200 font-bold active:scale-95 disabled:opacity-50"
            >
              ◀
            </button>
            <button
              disabled={module.isSolved}
              onClick={() => handleTune(0.005)}
              className="w-8 h-8 rounded bg-[#242735] hover:bg-[#2e3244] border border-[#3f465c] font-mono text-gray-200 font-bold active:scale-95 disabled:opacity-50"
            >
              ▶
            </button>
          </div>

          <button
            disabled={module.isSolved}
            onClick={handleTransmit}
            className="px-4 py-1.5 rounded bg-red-700 hover:bg-red-600 border border-red-500 text-white font-mono font-bold text-xs active:scale-95 disabled:opacity-50 shadow-md tracking-wider"
          >
            TX (送信)
          </button>
        </div>
      </div>
      <div className="text-[10px] text-gray-500 font-mono mt-2 text-center">
        {module.isSolved ? '解除完了' : '点滅パターンから周波数を特定し送信'}
      </div>
    </ModuleContainer>
  );
};
