export type ModuleType =
  | 'wires'
  | 'big_button'
  | 'keypad'
  | 'simon'
  | 'morse'
  | 'password'
  | 'maze';

export type WireColor = 'red' | 'blue' | 'yellow' | 'white' | 'black';

export interface WiresModuleState {
  type: 'wires';
  id: string;
  isSolved: boolean;
  wires: {
    id: number;
    color: WireColor;
    isCut: boolean;
  }[];
  correctCutIndex: number; // 0-indexed
}

export type ButtonColor = 'red' | 'blue' | 'yellow' | 'white';
export type ButtonLabel = '中止' | '起爆' | '保持' | '押す';
export type StripColor = 'blue' | 'white' | 'yellow' | 'red';

export interface BigButtonModuleState {
  type: 'big_button';
  id: string;
  isSolved: boolean;
  color: ButtonColor;
  label: ButtonLabel;
  stripColor: StripColor;
  shouldHold: boolean;
  requiredDigit: number | null; // e.g. 4 for blue, 1 for white/red, 5 for yellow
}

export interface KeypadModuleState {
  type: 'keypad';
  id: string;
  isSolved: boolean;
  symbols: string[]; // 4 symbols shown on keypad
  correctOrder: string[]; // 4 symbols in correct press order
  pressedSymbols: string[];
}

export type SimonColor = 'red' | 'blue' | 'green' | 'yellow';

export interface SimonModuleState {
  type: 'simon';
  id: string;
  isSolved: boolean;
  flashSequence: SimonColor[]; // Full sequence (length 3 or 4)
  currentStage: number; // 1 to sequence length
  playerInput: SimonColor[];
}

export interface MorseModuleState {
  type: 'morse';
  id: string;
  isSolved: boolean;
  word: string;
  targetFrequency: number; // e.g. 3.505
  morsePattern: string; // e.g. "... .... . .-.. .-.."
  selectedFrequency: number;
}

export interface PasswordModuleState {
  type: 'password';
  id: string;
  isSolved: boolean;
  word: string; // 5-letter word
  columns: string[][]; // 5 columns, each has 6 letters
  currentIndices: number[]; // 5 indices for displayed letters
}

export interface MazeModuleState {
  type: 'maze';
  id: string;
  isSolved: boolean;
  mazeId: number; // 0 to 8 (9 official mazes)
  markers: [number, number][]; // 2 marker coords [x, y] identifying the maze
  playerPos: [number, number]; // [x, y]
  goalPos: [number, number]; // [x, y]
}

export type BombModule =
  | WiresModuleState
  | BigButtonModuleState
  | KeypadModuleState
  | SimonModuleState
  | MorseModuleState
  | PasswordModuleState
  | MazeModuleState;

export interface BombState {
  id: string;
  serialNumber: string; // 6 characters, e.g. "E37K89"
  batteries: number; // 1 to 4
  litIndicator: 'FRK' | 'CAR' | 'SND' | 'NSA' | 'NONE';
  ports: string[]; // e.g. ["DVI", "Parallel", "PS/2"]
  totalTime: number; // in seconds, e.g. 300
  remainingTime: number; // in seconds
  strikes: number;
  maxStrikes: number;
  status: 'waiting' | 'running' | 'defused' | 'exploded';
  modules: BombModule[];
  startedAt?: number;
}

export type PlayerRole = 'defuser' | 'manual' | 'solo';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'nightmare';

export interface RoomState {
  roomId: string;
  bomb: BombState;
  players: {
    id: string;
    role: PlayerRole;
    name: string;
  }[];
  difficulty: Difficulty;
  chatMessages: {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
  }[];
}

export type SocketMessage =
  | { type: 'JOIN'; roomId: string; role: PlayerRole; name: string }
  | { type: 'STATE_UPDATE'; room: RoomState }
  | { type: 'START_GAME'; difficulty?: Difficulty }
  | { type: 'RESTART_GAME'; difficulty?: Difficulty }
  | { type: 'INTERACT'; moduleId: string; action: any }
  | { type: 'STRIKE' }
  | { type: 'EXPLODE' }
  | { type: 'DEFUSE' }
  | { type: 'CHAT'; text: string; sender: string };
