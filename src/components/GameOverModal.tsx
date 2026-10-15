import React from 'react';
import { Skull, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  onRestart: () => void;
  reason: string;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRestart, reason }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#180a0a] border-4 border-red-600 rounded-xl max-w-md w-full p-6 text-center shadow-[0_0_50px_rgba(239,68,68,0.5)]">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-950/60 border-2 border-red-500 flex items-center justify-center text-red-500">
          <Skull size={44} className="animate-bounce" />
        </div>

        <h2 className="text-3xl font-extrabold font-mono text-red-500 tracking-wider mb-2">
          DETONATION!
        </h2>
        <p className="text-lg font-bold text-gray-200 mb-1">作戦失敗：起爆しました</p>
        <p className="text-sm text-red-400 font-mono mb-6">{reason}</p>

        <button
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold tracking-wider text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          再挑戦する
        </button>
      </div>
    </div>
  );
};
