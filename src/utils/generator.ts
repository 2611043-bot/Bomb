import {
  BombState,
  BombModule,
  WiresModuleState,
  BigButtonModuleState,
  KeypadModuleState,
  SimonModuleState,
  MorseModuleState,
  PasswordModuleState,
  MazeModuleState,
  WireColor,
  ButtonColor,
  ButtonLabel,
  StripColor,
  SimonColor,
  Difficulty
} from '../types/game';
import { MAZES, canMove } from './mazes';

export const KEYPAD_COLUMNS = [
  ['Ϙ', 'Ψ', 'λ', 'Ϟ', 'Ѭ', 'ϗ', 'Ͽ'],
  ['Ӭ', 'Ϙ', 'Ͽ', 'Ҩ', '★', 'ϗ', '¿'],
  ['©', 'Ѽ', 'Ҩ', 'Ж', 'ƛ', 'λ', '★'],
  ['б', '¶', 'Ѣ', 'Ѭ', 'Ж', '¿', '☺'],
  ['Ψ', '☺', 'Ѣ', 'Ͼ', '¶', 'Ѯ', '★'],
  ['б', 'Ӭ', '҂', 'æ', 'Ψ', 'Ҋ', 'Ω']
];

export const MORSE_WORDS: { word: string; freq: number }[] = [
  { word: 'SHELL', freq: 3.505 },
  { word: 'HALLS', freq: 3.515 },
  { word: 'SLICK', freq: 3.522 },
  { word: 'TRICK', freq: 3.532 },
  { word: 'BOXES', freq: 3.535 },
  { word: 'LEAKS', freq: 3.542 },
  { word: 'STROBE', freq: 3.545 },
  { word: 'BISTRO', freq: 3.552 },
  { word: 'FLICK', freq: 3.555 },
  { word: 'BOMBS', freq: 3.565 },
  { word: 'BREAK', freq: 3.572 },
  { word: 'BRICK', freq: 3.575 },
  { word: 'STEAK', freq: 3.582 },
  { word: 'STING', freq: 3.592 },
  { word: 'VECTOR', freq: 3.595 },
  { word: 'BEATS', freq: 3.600 },
];

export const MORSE_ALPHABET: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..'
};

export const PASSWORD_WORDS = [
  'ABOUT', 'AFTER', 'AGAIN', 'BELOW', 'COULD',
  'EVERY', 'FIRST', 'FOUND', 'GREAT', 'HOUSE',
  'LARGE', 'LEARN', 'NEVER', 'OTHER', 'PLACE',
  'PLANT', 'POINT', 'RIGHT', 'SMALL', 'SOUND',
  'SPELL', 'STILL', 'STUDY', 'THEIR', 'THERE',
  'THESE', 'THING', 'THINK', 'THREE', 'WATER',
  'WHERE', 'WHICH', 'WORLD', 'WOULD', 'WRITE'
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateSerialNumber(): string {
  const letters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ'; // omit O to avoid confusion with 0
  const digits = '0123456789';
  let serial = '';
  for (let i = 0; i < 4; i++) {
    serial += randomChoice(letters.split(''));
  }
  for (let i = 0; i < 2; i++) {
    serial += randomChoice(digits.split(''));
  }
  return serial;
}

export function isLastDigitOdd(serial: string): boolean {
  for (let i = serial.length - 1; i >= 0; i--) {
    const char = serial[i];
    if (char >= '0' && char <= '9') {
      return parseInt(char, 10) % 2 === 1;
    }
  }
  return false;
}

export function hasVowel(serial: string): boolean {
  return /[AEIOU]/i.test(serial);
}

// Generate Wires module
export function generateWiresModule(serial: string): WiresModuleState {
  const wireCount = Math.floor(Math.random() * 4) + 3; // 3, 4, 5, or 6
  const colors: WireColor[] = ['red', 'blue', 'yellow', 'white', 'black'];
  const wires = Array.from({ length: wireCount }, (_, i) => ({
    id: i,
    color: randomChoice(colors),
    isCut: false
  }));

  const redCount = wires.filter(w => w.color === 'red').length;
  const blueCount = wires.filter(w => w.color === 'blue').length;
  const yellowCount = wires.filter(w => w.color === 'yellow').length;
  const whiteCount = wires.filter(w => w.color === 'white').length;
  const blackCount = wires.filter(w => w.color === 'black').length;
  const lastOdd = isLastDigitOdd(serial);

  let correctCutIndex = 0;

  if (wireCount === 3) {
    if (redCount === 0) {
      correctCutIndex = 1; // 2nd wire
    } else if (wires[2].color === 'white') {
      correctCutIndex = 2; // last wire
    } else if (blueCount > 1) {
      // cut last blue wire
      for (let i = wires.length - 1; i >= 0; i--) {
        if (wires[i].color === 'blue') {
          correctCutIndex = i;
          break;
        }
      }
    } else {
      correctCutIndex = 2; // last wire
    }
  } else if (wireCount === 4) {
    if (redCount > 1 && lastOdd) {
      for (let i = wires.length - 1; i >= 0; i--) {
        if (wires[i].color === 'red') {
          correctCutIndex = i;
          break;
        }
      }
    } else if (wires[3].color === 'yellow' && redCount === 0) {
      correctCutIndex = 0; // 1st wire
    } else if (blueCount === 1) {
      correctCutIndex = 0; // 1st wire
    } else if (yellowCount > 1) {
      correctCutIndex = 3; // last wire
    } else {
      correctCutIndex = 1; // 2nd wire
    }
  } else if (wireCount === 5) {
    if (wires[4].color === 'black' && lastOdd) {
      correctCutIndex = 3; // 4th wire
    } else if (redCount === 1 && yellowCount > 1) {
      correctCutIndex = 0; // 1st wire
    } else if (blackCount === 0) {
      correctCutIndex = 1; // 2nd wire
    } else {
      correctCutIndex = 0; // 1st wire
    }
  } else if (wireCount === 6) {
    if (yellowCount === 0 && lastOdd) {
      correctCutIndex = 2; // 3rd wire
    } else if (yellowCount === 1 && whiteCount > 1) {
      correctCutIndex = 3; // 4th wire
    } else if (redCount === 0) {
      correctCutIndex = 5; // last wire
    } else {
      correctCutIndex = 3; // 4th wire
    }
  }

  return {
    type: 'wires',
    id: `wires-${Math.random().toString(36).substring(2, 7)}`,
    isSolved: false,
    wires,
    correctCutIndex
  };
}

// Generate Big Button module
export function generateBigButtonModule(
  batteries: number,
  litIndicator: string
): BigButtonModuleState {
  const colors: ButtonColor[] = ['red', 'blue', 'yellow', 'white'];
  const labels: ButtonLabel[] = ['中止', '起爆', '保持', '押す'];
  const stripColors: StripColor[] = ['blue', 'white', 'yellow', 'red'];

  const color = randomChoice(colors);
  const label = randomChoice(labels);
  const stripColor = randomChoice(stripColors);

  let shouldHold = true;

  if (color === 'blue' && label === '中止') {
    shouldHold = true;
  } else if (batteries > 1 && label === '起爆') {
    shouldHold = false;
  } else if (color === 'white' && litIndicator === 'CAR') {
    shouldHold = true;
  } else if (batteries > 2 && litIndicator === 'FRK') {
    shouldHold = false;
  } else if (color === 'yellow') {
    shouldHold = true;
  } else if (color === 'red' && label === '保持') {
    shouldHold = false;
  } else {
    shouldHold = true;
  }

  let requiredDigit: number | null = null;
  if (shouldHold) {
    if (stripColor === 'blue') requiredDigit = 4;
    else if (stripColor === 'white') requiredDigit = 1;
    else if (stripColor === 'yellow') requiredDigit = 5;
    else requiredDigit = 1;
  }

  return {
    type: 'big_button',
    id: `button-${Math.random().toString(36).substring(2, 7)}`,
    isSolved: false,
    color,
    label,
    stripColor,
    shouldHold,
    requiredDigit
  };
}

// Generate Keypad module
export function generateKeypadModule(): KeypadModuleState {
  const column = randomChoice(KEYPAD_COLUMNS);
  const chosenIndices: number[] = [];
  while (chosenIndices.length < 4) {
    const idx = Math.floor(Math.random() * column.length);
    if (!chosenIndices.includes(idx)) {
      chosenIndices.push(idx);
    }
  }

  // Sort chosen indices to establish correct order
  chosenIndices.sort((a, b) => a - b);
  const correctOrder = chosenIndices.map(i => column[i]);

  // Display shuffled symbols
  const symbols = shuffle(correctOrder);

  return {
    type: 'keypad',
    id: `keypad-${Math.random().toString(36).substring(2, 7)}`,
    isSolved: false,
    symbols,
    correctOrder,
    pressedSymbols: []
  };
}

// Generate Simon Says module
export function generateSimonModule(): SimonModuleState {
  const colors: SimonColor[] = ['red', 'blue', 'green', 'yellow'];
  const sequenceLength = 3;
  const flashSequence: SimonColor[] = Array.from(
    { length: sequenceLength },
    () => randomChoice(colors)
  );

  return {
    type: 'simon',
    id: `simon-${Math.random().toString(36).substring(2, 7)}`,
    isSolved: false,
    flashSequence,
    currentStage: 1,
    playerInput: []
  };
}

export function getSimonCorrectAnswer(
  color: SimonColor,
  hasVowel: boolean,
  strikes: number
): SimonColor {
  const s = Math.min(strikes, 2);
  if (hasVowel) {
    if (s === 0) {
      if (color === 'red') return 'blue';
      if (color === 'blue') return 'red';
      if (color === 'green') return 'yellow';
      return 'green';
    } else if (s === 1) {
      if (color === 'red') return 'yellow';
      if (color === 'blue') return 'green';
      if (color === 'green') return 'blue';
      return 'red';
    } else {
      if (color === 'red') return 'green';
      if (color === 'blue') return 'red';
      if (color === 'green') return 'yellow';
      return 'blue';
    }
  } else {
    if (s === 0) {
      if (color === 'red') return 'blue';
      if (color === 'blue') return 'yellow';
      if (color === 'green') return 'green';
      return 'red';
    } else if (s === 1) {
      if (color === 'red') return 'red';
      if (color === 'blue') return 'blue';
      if (color === 'green') return 'yellow';
      return 'green';
    } else {
      if (color === 'red') return 'yellow';
      if (color === 'blue') return 'green';
      if (color === 'green') return 'blue';
      return 'red';
    }
  }
}

// Generate Morse module
export function generateMorseModule(): MorseModuleState {
  const entry = randomChoice(MORSE_WORDS);
  const pattern = entry.word
    .split('')
    .map(c => MORSE_ALPHABET[c] || '')
    .join(' ');

  return {
    type: 'morse',
    id: `morse-${Math.random().toString(36).substring(2, 7)}`,
    isSolved: false,
    word: entry.word,
    targetFrequency: entry.freq,
    morsePattern: pattern,
    selectedFrequency: 3.505
  };
}

// Generate Password module
export function generatePasswordModule(): PasswordModuleState {
  const word = randomChoice(PASSWORD_WORDS);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Build 5 columns of 6 letters each
  // Ensure the target word is possible, but NO OTHER word from PASSWORD_WORDS can be formed
  let columns: string[][] = [];
  let attempts = 0;

  while (attempts < 200) {
    attempts++;
    columns = [];
    for (let i = 0; i < 5; i++) {
      const colLetters = new Set<string>();
      colLetters.add(word[i]);
      while (colLetters.size < 6) {
        colLetters.add(randomChoice(alphabet));
      }
      columns.push(shuffle(Array.from(colLetters)));
    }

    // Verify uniqueness against dictionary
    const validMatches = PASSWORD_WORDS.filter(w => {
      for (let i = 0; i < 5; i++) {
        if (!columns[i].includes(w[i])) return false;
      }
      return true;
    });

    if (validMatches.length === 1 && validMatches[0] === word) {
      break;
    }
  }

  // Randomize initial displayed indices
  const currentIndices = columns.map(() => Math.floor(Math.random() * 6));

  return {
    type: 'password',
    id: `password-${Math.random().toString(36).substring(2, 7)}`,
    isSolved: false,
    word,
    columns,
    currentIndices
  };
}

// Generate Maze module
export function generateMazeModule(): MazeModuleState {
  const mazeId = Math.floor(Math.random() * MAZES.length);
  const maze = MAZES[mazeId];

  // Pick player position and goal position
  let startX = 0, startY = 0, goalX = 5, goalY = 5;
  let found = false;

  for (let trial = 0; trial < 100; trial++) {
    startX = Math.floor(Math.random() * 6);
    startY = Math.floor(Math.random() * 6);
    goalX = Math.floor(Math.random() * 6);
    goalY = Math.floor(Math.random() * 6);

    const dist = Math.abs(startX - goalX) + Math.abs(startY - goalY);
    if (dist >= 3) {
      found = true;
      break;
    }
  }

  return {
    type: 'maze',
    id: `maze-${Math.random().toString(36).substring(2, 7)}`,
    isSolved: false,
    mazeId,
    markers: maze.markers,
    playerPos: [startX, startY],
    goalPos: [goalX, goalY]
  };
}

export function generateBomb(difficulty: Difficulty = 'normal'): BombState {
  const serialNumber = generateSerialNumber();
  const batteries = Math.floor(Math.random() * 4) + 1; // 1 to 4
  const indicators: ('FRK' | 'CAR' | 'SND' | 'NSA' | 'NONE')[] = ['FRK', 'CAR', 'SND', 'NSA', 'NONE'];
  const litIndicator = randomChoice(indicators);
  const allPorts = ['DVI-D', 'Parallel', 'PS/2', 'RJ-45', 'Serial', 'RCA'];
  const ports = shuffle(allPorts).slice(0, Math.floor(Math.random() * 3) + 1);

  let totalTime = 300; // 5 minutes
  let maxStrikes = 3;
  let modulePool: (() => BombModule)[] = [];

  if (difficulty === 'easy') {
    totalTime = 360; // 6 mins
    maxStrikes = 3;
    modulePool = [
      () => generateWiresModule(serialNumber),
      () => generateBigButtonModule(batteries, litIndicator),
      () => generateKeypadModule()
    ];
  } else if (difficulty === 'normal') {
    totalTime = 300; // 5 mins
    maxStrikes = 3;
    modulePool = [
      () => generateWiresModule(serialNumber),
      () => generateBigButtonModule(batteries, litIndicator),
      () => generateKeypadModule(),
      () => generateSimonModule(),
      () => generateMorseModule()
    ];
  } else if (difficulty === 'hard') {
    totalTime = 300; // 5 mins
    maxStrikes = 3;
    modulePool = [
      () => generateWiresModule(serialNumber),
      () => generateBigButtonModule(batteries, litIndicator),
      () => generateKeypadModule(),
      () => generateSimonModule(),
      () => generateMorseModule(),
      () => generatePasswordModule()
    ];
  } else {
    // nightmare
    totalTime = 240; // 4 mins
    maxStrikes = 1;
    modulePool = [
      () => generateWiresModule(serialNumber),
      () => generateBigButtonModule(batteries, litIndicator),
      () => generateKeypadModule(),
      () => generateSimonModule(),
      () => generateMorseModule(),
      () => generatePasswordModule(),
      () => generateMazeModule()
    ];
  }

  const modules = modulePool.map(fn => fn());

  return {
    id: `bomb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    serialNumber,
    batteries,
    litIndicator,
    ports,
    totalTime,
    remainingTime: totalTime,
    strikes: 0,
    maxStrikes,
    status: 'waiting',
    modules
  };
}
