import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  onRestart: () => void;
  clearTimeStr: string;
  strikes: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  onRestart,
  clearTimeStr,
  strikes
}) => {
  useEffect(() => {
    // Confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#0b1b14] border-4 border-emerald-500 rounded-xl max-w-md w-full p-6 text-center shadow-[0_0_50px_rgba(16,185,129,0.4)]">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-950/60 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
          <Award size={44} className="animate-pulse" />
        </div>

        <h2 className="text-3xl font-extrabold font-mono text-emerald-400 tracking-wider mb-2">
          BOMB DEFUSED!
        </h2>
        <p className="text-lg font-bold text-gray-200 mb-1">任務完了：爆弾解除成功</p>
        <div className="my-4 py-3 bg-[#11281e] rounded-lg border border-emerald-800 flex justify-around font-mono text-xs text-gray-300">
          <div>
            <span className="block text-gray-500">クリア所要時間</span>
            <span className="text-base font-bold text-white">{clearTimeStr}</span>
          </div>
          <div>
            <span className="block text-gray-500">ミス（ストライク）</span>
            <span className="text-base font-bold text-amber-400">{strikes} 回</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold tracking-wider text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          次の任務を開始する
        </button>
      </div>
    </div>
  );
};
