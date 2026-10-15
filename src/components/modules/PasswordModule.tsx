import React, { useState } from 'react';
import { PasswordModuleState } from '../../types/game';
import { ModuleContainer } from './ModuleContainer';
import { soundManager } from '../../utils/audio';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface PasswordModuleProps {
  module: PasswordModuleState;
  onSubmit: (word: string) => void;
}

export const PasswordModule: React.FC<PasswordModuleProps> = ({ module, onSubmit }) => {
  const [indices, setIndices] = useState<number[]>(module.currentIndices || [0, 0, 0, 0, 0]);

  const cycleLetter = (colIdx: number, delta: number) => {
    if (module.isSolved) return;
    soundManager.playDialTick();
    setIndices(prev => {
      const next = [...prev];
      const len = module.columns[colIdx].length;
      next[colIdx] = (next[colIdx] + delta + len) % len;
      return next;
    });
  };

  const currentWord = indices.map((idx, col) => module.columns[col][idx]).join('');

  const handleSubmit = () => {
    if (module.isSolved) return;
    soundManager.playButtonClick();
    onSubmit(currentWord);
  };

  return (
    <ModuleContainer title="パスワード" isSolved={module.isSolved}>
      <div className="w-full h-48 bg-[#12141a] border border-[#2b2e3b] rounded p-2 flex flex-col justify-between items-center">
        {/* 5 Tumbler Columns */}
        <div className="flex gap-2 items-center justify-center pt-1">
          {module.columns.map((col, colIdx) => {
            const currentLetter = col[indices[colIdx]];
            return (
              <div key={`col-${colIdx}`} className="flex flex-col items-center">
                <button
                  disabled={module.isSolved}
                  onClick={() => cycleLetter(colIdx, -1)}
                  className="w-7 h-6 rounded-t bg-[#232736] hover:bg-[#2e3346] border border-[#3e455c] flex items-center justify-center text-gray-300 active:scale-95 disabled:opacity-40"
                >
                  <ChevronUp size={16} />
                </button>

                <div className="w-7 h-10 bg-[#0a0c10] border-x border-[#3e455c] flex items-center justify-center font-mono font-bold text-xl text-emerald-400 select-none shadow-inner">
                  {currentLetter}
                </div>

                <button
                  disabled={module.isSolved}
                  onClick={() => cycleLetter(colIdx, 1)}
                  className="w-7 h-6 rounded-b bg-[#232736] hover:bg-[#2e3346] border border-[#3e455c] flex items-center justify-center text-gray-300 active:scale-95 disabled:opacity-40"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Submit button */}
        <button
          disabled={module.isSolved}
          onClick={handleSubmit}
          className="w-36 py-2 rounded bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white font-mono font-bold text-xs active:scale-95 disabled:opacity-50 tracking-wider shadow-lg"
        >
          SUBMIT (確定)
        </button>
      </div>
      <div className="text-[10px] text-gray-500 font-mono mt-2 text-center">
        {module.isSolved ? '解除完了' : 'マニュアルにある有効な5文字単語を揃える'}
      </div>
    </ModuleContainer>
  );
};
