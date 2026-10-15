import React from 'react';
import { KeypadModuleState } from '../../types/game';
import { ModuleContainer } from './ModuleContainer';
import { soundManager } from '../../utils/audio';

interface KeypadModuleProps {
  module: KeypadModuleState;
  onPress: (symbol: string) => void;
}

export const KeypadModule: React.FC<KeypadModuleProps> = ({ module, onPress }) => {
  const handleClick = (symbol: string) => {
    if (module.isSolved || module.pressedSymbols.includes(symbol)) return;
    soundManager.playButtonClick();
    onPress(symbol);
  };

  return (
    <ModuleContainer title="古代文字キーパッド" isSolved={module.isSolved}>
      <div className="w-full h-48 bg-[#12141a] border border-[#2b2e3b] rounded p-3 flex flex-col items-center justify-center">
        <div className="grid grid-cols-2 gap-3 w-44">
          {module.symbols.map((sym, idx) => {
            const isPressed = module.pressedSymbols.includes(sym);
            return (
              <button
                key={`sym-${idx}`}
                disabled={module.isSolved || isPressed}
                onClick={() => handleClick(sym)}
                className={`relative h-16 rounded border-2 flex items-center justify-center text-3xl font-serif transition-all
                  ${
                    isPressed
                      ? 'bg-[#1b2533] border-emerald-500/50 text-emerald-300'
                      : 'bg-[#222530] border-[#3e4456] text-gray-200 hover:bg-[#2b2f3e] hover:border-gray-400 active:scale-95'
                  }
                  ${module.isSolved ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Status LED on top right of key */}
                <div
                  className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-gray-900 transition-all ${
                    isPressed
                      ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                      : 'bg-gray-700/50'
                  }`}
                />
                <span>{sym}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="text-[10px] text-gray-500 font-mono mt-2 text-center">
        {module.isSolved
          ? '解除完了'
          : `入力順序: ${module.pressedSymbols.length}/4`}
      </div>
    </ModuleContainer>
  );
};
