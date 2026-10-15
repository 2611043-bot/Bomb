import React, { useState } from 'react';
import { MazeModuleState } from '../../types/game';
import { ModuleContainer } from './ModuleContainer';
import { soundManager } from '../../utils/audio';
import { canMove } from '../../utils/mazes';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Star } from 'lucide-react';

interface MazeModuleProps {
  module: MazeModuleState;
  onMove: (newPos: [number, number], isGoal: boolean, hitWall: boolean) => void;
}

export const MazeModule: React.FC<MazeModuleProps> = ({ module, onMove }) => {
  const [playerPos, setPlayerPos] = useState<[number, number]>(module.playerPos);

  const handleDirection = (dx: number, dy: number) => {
    if (module.isSolved) return;
    const [x, y] = playerPos;
    const nx = x + dx;
    const ny = y + dy;

    if (!canMove(module.mazeId, x, y, nx, ny)) {
      // Hit invisible wall -> Strike!
      soundManager.playStrike();
      onMove(playerPos, false, true);
      return;
    }

    soundManager.playDialTick();
    const isGoal = nx === module.goalPos[0] && ny === module.goalPos[1];
    setPlayerPos([nx, ny]);

    if (isGoal) {
      soundManager.playModuleDefused();
    }
    onMove([nx, ny], isGoal, false);
  };

  return (
    <ModuleContainer title="迷路モジュール" isSolved={module.isSolved}>
      <div className="w-full h-48 bg-[#12141a] border border-[#2b2e3b] rounded p-2 flex items-center justify-between">
        {/* 6x6 Grid Display */}
        <div className="w-36 h-36 bg-[#0a0c10] border-2 border-[#2b2f3d] p-1 grid grid-cols-6 grid-rows-6 gap-0.5 relative rounded">
          {Array.from({ length: 36 }).map((_, idx) => {
            const x = idx % 6;
            const y = Math.floor(idx / 6);
            const isMarker = module.markers.some(m => m[0] === x && m[1] === y);
            const isPlayer = playerPos[0] === x && playerPos[1] === y;
            const isGoal = module.goalPos[0] === x && module.goalPos[1] === y;

            return (
              <div
                key={`cell-${x}-${y}`}
                className="relative bg-[#161922] flex items-center justify-center rounded-[2px]"
              >
                {/* Marker (green hollow circle) */}
                {isMarker && (
                  <div className="w-3 h-3 rounded-full border-2 border-emerald-400" />
                )}

                {/* Goal indicator (red star) */}
                {isGoal && (
                  <Star size={10} className="text-red-500 fill-red-500" />
                )}

                {/* Player dot (bright red glowing circle) */}
                {isPlayer && (
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] z-10 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Directional Pad */}
        <div className="flex flex-col items-center justify-center pr-2">
          <button
            disabled={module.isSolved}
            onClick={() => handleDirection(0, -1)}
            className="w-8 h-8 rounded bg-[#242838] hover:bg-[#2f354a] border border-[#3f4760] flex items-center justify-center text-gray-200 active:scale-95 disabled:opacity-40"
          >
            <ArrowUp size={16} />
          </button>
          <div className="flex gap-2 my-1">
            <button
              disabled={module.isSolved}
              onClick={() => handleDirection(-1, 0)}
              className="w-8 h-8 rounded bg-[#242838] hover:bg-[#2f354a] border border-[#3f4760] flex items-center justify-center text-gray-200 active:scale-95 disabled:opacity-40"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              disabled={module.isSolved}
              onClick={() => handleDirection(1, 0)}
              className="w-8 h-8 rounded bg-[#242838] hover:bg-[#2f354a] border border-[#3f4760] flex items-center justify-center text-gray-200 active:scale-95 disabled:opacity-40"
            >
              <ArrowRight size={16} />
            </button>
          </div>
          <button
            disabled={module.isSolved}
            onClick={() => handleDirection(0, 1)}
            className="w-8 h-8 rounded bg-[#242838] hover:bg-[#2f354a] border border-[#3f4760] flex items-center justify-center text-gray-200 active:scale-95 disabled:opacity-40"
          >
            <ArrowDown size={16} />
          </button>
        </div>
      </div>
      <div className="text-[10px] text-gray-500 font-mono mt-2 text-center">
        {module.isSolved ? '解除完了' : '緑の円から迷路を特定し、星印へ進め'}
      </div>
    </ModuleContainer>
  );
};
