import React from 'react';
import {
  BombState,
  WiresModuleState,
  BigButtonModuleState,
  KeypadModuleState,
  SimonModuleState,
  MorseModuleState,
  PasswordModuleState,
  MazeModuleState
} from '../types/game';
import { TimerDisplay } from './TimerDisplay';
import { StrikeDisplay } from './StrikeDisplay';
import { BombCasing } from './BombCasing';
import { WiresModule } from './modules/WiresModule';
import { BigButtonModule } from './modules/BigButtonModule';
import { KeypadModule } from './modules/KeypadModule';
import { SimonModule } from './modules/SimonModule';
import { MorseModule } from './modules/MorseModule';
import { PasswordModule } from './modules/PasswordModule';
import { MazeModule } from './modules/MazeModule';
import { getSimonCorrectAnswer, hasVowel } from '../utils/generator';

interface DefuserViewProps {
  bomb: BombState;
  onUpdateBomb: (bomb: BombState) => void;
  onStrike: () => void;
  onExplode: () => void;
  onDefuse: () => void;
}

export const DefuserView: React.FC<DefuserViewProps> = ({
  bomb,
  onUpdateBomb,
  onStrike,
  onExplode,
  onDefuse
}) => {
  // Check if all modules are solved
  const checkAllSolved = (modules: typeof bomb.modules) => {
    return modules.every(m => m.isSolved);
  };

  // 1. Wires Handler
  const handleCutWire = (moduleIndex: number, wireIndex: number) => {
    const mod = bomb.modules[moduleIndex] as WiresModuleState;
    if (mod.isSolved || mod.wires[wireIndex].isCut) return;

    const newWires = [...mod.wires];
    newWires[wireIndex] = { ...newWires[wireIndex], isCut: true };

    const isCorrect = wireIndex === mod.correctCutIndex;
    const isSolved = isCorrect;

    const updatedModule: WiresModuleState = {
      ...mod,
      wires: newWires,
      isSolved
    };

    const newModules = [...bomb.modules];
    newModules[moduleIndex] = updatedModule;

    if (!isCorrect) {
      onStrike();
    }

    if (checkAllSolved(newModules)) {
      onDefuse();
    } else {
      onUpdateBomb({ ...bomb, modules: newModules });
    }
  };

  // 2. Big Button Handler
  const handleButtonPress = (moduleIndex: number, success: boolean) => {
    const mod = bomb.modules[moduleIndex] as BigButtonModuleState;
    if (mod.isSolved) return;

    if (success) {
      const updatedModule: BigButtonModuleState = {
        ...mod,
        isSolved: true
      };
      const newModules = [...bomb.modules];
      newModules[moduleIndex] = updatedModule;

      if (checkAllSolved(newModules)) {
        onDefuse();
      } else {
        onUpdateBomb({ ...bomb, modules: newModules });
      }
    } else {
      onStrike();
    }
  };

  // 3. Keypad Handler
  const handleKeypadPress = (moduleIndex: number, symbol: string) => {
    const mod = bomb.modules[moduleIndex] as KeypadModuleState;
    if (mod.isSolved || mod.pressedSymbols.includes(symbol)) return;

    const nextExpected = mod.correctOrder[mod.pressedSymbols.length];
    if (symbol === nextExpected) {
      const newPressed = [...mod.pressedSymbols, symbol];
      const isSolved = newPressed.length === 4;

      const updatedModule: KeypadModuleState = {
        ...mod,
        pressedSymbols: newPressed,
        isSolved
      };
      const newModules = [...bomb.modules];
      newModules[moduleIndex] = updatedModule;

      if (checkAllSolved(newModules)) {
        onDefuse();
      } else {
        onUpdateBomb({ ...bomb, modules: newModules });
      }
    } else {
      // Wrong symbol -> Strike & reset pressed symbols!
      onStrike();
      const updatedModule: KeypadModuleState = {
        ...mod,
        pressedSymbols: []
      };
      const newModules = [...bomb.modules];
      newModules[moduleIndex] = updatedModule;
      onUpdateBomb({ ...bomb, modules: newModules });
    }
  };

  // 4. Simon Handler
  const handleSimonClick = (moduleIndex: number, color: any) => {
    const mod = bomb.modules[moduleIndex] as SimonModuleState;
    if (mod.isSolved) return;

    const vowel = hasVowel(bomb.serialNumber);
    const stepIdx = mod.playerInput.length;
    const flashColor = mod.flashSequence[stepIdx];
    const expectedColor = getSimonCorrectAnswer(flashColor, vowel, bomb.strikes);

    if (color === expectedColor) {
      const newInput = [...mod.playerInput, color];
      if (newInput.length === mod.currentStage) {
        if (mod.currentStage === mod.flashSequence.length) {
          // Module solved!
          const updatedModule: SimonModuleState = {
            ...mod,
            playerInput: newInput,
            isSolved: true
          };
          const newModules = [...bomb.modules];
          newModules[moduleIndex] = updatedModule;
          if (checkAllSolved(newModules)) {
            onDefuse();
          } else {
            onUpdateBomb({ ...bomb, modules: newModules });
          }
        } else {
          // Next stage
          const updatedModule: SimonModuleState = {
            ...mod,
            currentStage: mod.currentStage + 1,
            playerInput: []
          };
          const newModules = [...bomb.modules];
          newModules[moduleIndex] = updatedModule;
          onUpdateBomb({ ...bomb, modules: newModules });
        }
      } else {
        // Correct step in progress
        const updatedModule: SimonModuleState = {
          ...mod,
          playerInput: newInput
        };
        const newModules = [...bomb.modules];
        newModules[moduleIndex] = updatedModule;
        onUpdateBomb({ ...bomb, modules: newModules });
      }
    } else {
      // Strike & reset current stage inputs
      onStrike();
      const updatedModule: SimonModuleState = {
        ...mod,
        playerInput: []
      };
      const newModules = [...bomb.modules];
      newModules[moduleIndex] = updatedModule;
      onUpdateBomb({ ...bomb, modules: newModules });
    }
  };

  // 5. Morse Handler
  const handleMorseTransmit = (moduleIndex: number, freq: number) => {
    const mod = bomb.modules[moduleIndex] as MorseModuleState;
    if (mod.isSolved) return;

    if (Math.abs(freq - mod.targetFrequency) < 0.001) {
      const updatedModule: MorseModuleState = {
        ...mod,
        selectedFrequency: freq,
        isSolved: true
      };
      const newModules = [...bomb.modules];
      newModules[moduleIndex] = updatedModule;

      if (checkAllSolved(newModules)) {
        onDefuse();
      } else {
        onUpdateBomb({ ...bomb, modules: newModules });
      }
    } else {
      onStrike();
    }
  };

  // 6. Password Handler
  const handlePasswordSubmit = (moduleIndex: number, word: string) => {
    const mod = bomb.modules[moduleIndex] as PasswordModuleState;
    if (mod.isSolved) return;

    if (word.toUpperCase() === mod.word.toUpperCase()) {
      const updatedModule: PasswordModuleState = {
        ...mod,
        isSolved: true
      };
      const newModules = [...bomb.modules];
      newModules[moduleIndex] = updatedModule;

      if (checkAllSolved(newModules)) {
        onDefuse();
      } else {
        onUpdateBomb({ ...bomb, modules: newModules });
      }
    } else {
      onStrike();
    }
  };

  // 7. Maze Handler
  const handleMazeMove = (
    moduleIndex: number,
    newPos: [number, number],
    isGoal: boolean,
    hitWall: boolean
  ) => {
    const mod = bomb.modules[moduleIndex] as MazeModuleState;
    if (mod.isSolved) return;

    if (hitWall) {
      onStrike();
      return;
    }

    const updatedModule: MazeModuleState = {
      ...mod,
      playerPos: newPos,
      isSolved: isGoal
    };
    const newModules = [...bomb.modules];
    newModules[moduleIndex] = updatedModule;

    if (isGoal) {
      if (checkAllSolved(newModules)) {
        onDefuse();
      } else {
        onUpdateBomb({ ...bomb, modules: newModules });
      }
    } else {
      onUpdateBomb({ ...bomb, modules: newModules });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5">
      {/* Bomb Top Instrumentation Panel */}
      <div className="bg-[#181a23] border-4 border-[#2b3040] rounded-xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <TimerDisplay
            remainingTime={bomb.remainingTime}
            isRunning={bomb.status === 'running'}
          />
          <StrikeDisplay strikes={bomb.strikes} maxStrikes={bomb.maxStrikes} />
        </div>

        {/* Mission Status Header */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-mono font-bold tracking-wider text-sm uppercase">
              DEFUSAL IN PROGRESS
            </span>
          </div>
          <span className="text-gray-400 font-mono text-xs mt-1">
            残モジュール: {bomb.modules.filter(m => !m.isSolved).length} / {bomb.modules.length}
          </span>
        </div>
      </div>

      {/* Bomb Casing Info Plate (Serial Number, Batteries, Indicators, Ports) */}
      <BombCasing
        serialNumber={bomb.serialNumber}
        batteries={bomb.batteries}
        litIndicator={bomb.litIndicator}
        ports={bomb.ports}
      />

      {/* Modules Suitcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bomb.modules.map((module, idx) => {
          switch (module.type) {
            case 'wires':
              return (
                <WiresModule
                  key={module.id}
                  module={module}
                  onCut={wIdx => handleCutWire(idx, wIdx)}
                />
              );
            case 'big_button':
              return (
                <BigButtonModule
                  key={module.id}
                  module={module}
                  remainingTime={bomb.remainingTime}
                  onPress={success => handleButtonPress(idx, success)}
                />
              );
            case 'keypad':
              return (
                <KeypadModule
                  key={module.id}
                  module={module}
                  onPress={sym => handleKeypadPress(idx, sym)}
                />
              );
            case 'simon':
              return (
                <SimonModule
                  key={module.id}
                  module={module}
                  onColorClick={col => handleSimonClick(idx, col)}
                />
              );
            case 'morse':
              return (
                <MorseModule
                  key={module.id}
                  module={module}
                  onTransmit={freq => handleMorseTransmit(idx, freq)}
                />
              );
            case 'password':
              return (
                <PasswordModule
                  key={module.id}
                  module={module}
                  onSubmit={word => handlePasswordSubmit(idx, word)}
                />
              );
            case 'maze':
              return (
                <MazeModule
                  key={module.id}
                  module={module}
                  onMove={(newPos, isGoal, hitWall) =>
                    handleMazeMove(idx, newPos, isGoal, hitWall)
                  }
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};
