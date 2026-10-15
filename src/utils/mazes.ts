// 9 Mazes definition matching official manual specs (6x6 grid)
// Coordinates: x from 0 to 5 (left to right), y from 0 to 5 (top to bottom)

export interface MazeDefinition {
  id: number;
  markers: [number, number][]; // 2 circle markers [x, y]
  walls: Set<string>; // "x1,y1-x2,y2" sorted representation of walls
}

function makeWallKey(x1: number, y1: number, x2: number, y2: number): string {
  if (x1 > x2 || (x1 === x2 && y1 > y2)) {
    return `${x2},${y2}-${x1},${y1}`;
  }
  return `${x1},${y1}-${x2},${y2}`;
}

// Helper to define walls from horizontal (H) and vertical (V) segments
// H wall at (x, y) means between (x, y) and (x, y+1)
// V wall at (x, y) means between (x, y) and (x+1, y)
function createMaze(
  id: number,
  markers: [number, number][],
  vWalls: [number, number][], // [x, y] wall to the right of cell (x, y)
  hWalls: [number, number][]  // [x, y] wall below cell (x, y)
): MazeDefinition {
  const walls = new Set<string>();

  for (const [x, y] of vWalls) {
    walls.add(makeWallKey(x, y, x + 1, y));
  }
  for (const [x, y] of hWalls) {
    walls.add(makeWallKey(x, y, x, y + 1));
  }

  return { id, markers, walls };
}

export const MAZES: MazeDefinition[] = [
  // Maze 1: Markers at (0,1) and (5,2)
  createMaze(
    0,
    [[0, 1], [5, 2]],
    // V-walls
    [[1,0], [2,0], [1,1], [4,1], [1,2], [3,2], [4,2], [0,3], [2,3], [4,3], [1,4], [3,4], [2,5], [4,5]],
    // H-walls
    [[1,0], [3,0], [5,0], [0,1], [2,1], [3,1], [2,2], [3,2], [0,3], [1,3], [3,3], [5,3], [1,4], [2,4], [4,4]]
  ),

  // Maze 2: Markers at (4,1) and (1,3)
  createMaze(
    1,
    [[4, 1], [1, 3]],
    // V-walls
    [[1,0], [3,0], [4,0], [0,1], [2,1], [4,1], [1,2], [3,2], [0,3], [2,3], [4,3], [1,4], [3,4], [0,5], [3,5]],
    // H-walls
    [[0,0], [2,0], [5,0], [1,1], [3,1], [0,2], [2,2], [4,2], [1,3], [3,3], [5,3], [0,4], [2,4], [4,4]]
  ),

  // Maze 3: Markers at (3,3) and (5,3)
  createMaze(
    2,
    [[3, 3], [5, 3]],
    // V-walls
    [[0,0], [3,0], [1,1], [3,1], [4,1], [0,2], [2,2], [4,2], [1,3], [3,3], [0,4], [2,4], [4,4], [1,5], [3,5]],
    // H-walls
    [[1,0], [2,0], [4,0], [0,1], [2,1], [5,1], [1,2], [3,2], [0,3], [2,3], [4,3], [1,4], [3,4], [5,4]]
  ),

  // Maze 4: Markers at (0,0) and (0,3)
  createMaze(
    3,
    [[0, 0], [0, 3]],
    // V-walls
    [[1,0], [2,0], [4,0], [0,1], [3,1], [1,2], [4,2], [2,3], [3,3], [0,4], [3,4], [4,4], [1,5], [2,5]],
    // H-walls
    [[0,0], [3,0], [5,0], [1,1], [2,1], [4,1], [0,2], [3,2], [5,2], [1,3], [4,3], [0,4], [2,4], [3,4], [5,4]]
  ),

  // Maze 5: Markers at (4,2) and (3,5)
  createMaze(
    4,
    [[4, 2], [3, 5]],
    // V-walls
    [[2,0], [4,0], [0,1], [1,1], [3,1], [2,2], [4,2], [1,3], [3,3], [0,4], [2,4], [4,4], [1,5], [4,5]],
    // H-walls
    [[0,0], [1,0], [3,0], [5,0], [2,1], [4,1], [0,2], [1,2], [3,2], [5,2], [2,3], [4,3], [0,4], [3,4], [5,4]]
  ),

  // Maze 6: Markers at (4,0) and (2,4)
  createMaze(
    5,
    [[4, 0], [2, 4]],
    // V-walls
    [[0,0], [2,0], [3,0], [1,1], [4,1], [0,2], [2,2], [3,2], [1,3], [4,3], [0,4], [2,4], [3,4], [1,5], [4,5]],
    // H-walls
    [[1,0], [4,0], [5,0], [0,1], [2,1], [3,1], [1,2], [4,2], [5,2], [0,3], [2,3], [3,3], [1,4], [4,4], [5,4]]
  ),

  // Maze 7: Markers at (1,0) and (1,5)
  createMaze(
    6,
    [[1, 0], [1, 5]],
    // V-walls
    [[1,0], [3,0], [4,0], [0,1], [2,1], [4,1], [1,2], [3,2], [2,3], [4,3], [0,4], [3,4], [1,5], [3,5]],
    // H-walls
    [[0,0], [2,0], [5,0], [1,1], [3,1], [0,2], [2,2], [4,2], [5,2], [0,3], [1,3], [3,3], [2,4], [4,4], [5,4]]
  ),

  // Maze 8: Markers at (3,0) and (3,4)
  createMaze(
    7,
    [[3, 0], [3, 4]],
    // V-walls
    [[2,0], [4,0], [0,1], [3,1], [1,2], [2,2], [4,2], [0,3], [3,3], [1,4], [2,4], [4,4], [0,5], [3,5]],
    // H-walls
    [[0,0], [1,0], [3,0], [5,0], [2,1], [4,1], [0,2], [3,2], [5,2], [1,3], [2,3], [4,3], [0,4], [3,4], [5,4]]
  ),

  // Maze 9: Markers at (2,1) and (0,4)
  createMaze(
    8,
    [[2, 1], [0, 4]],
    // V-walls
    [[0,0], [3,0], [4,0], [1,1], [2,1], [0,2], [3,2], [4,2], [1,3], [2,3], [0,4], [3,4], [4,4], [1,5], [2,5]],
    // H-walls
    [[1,0], [2,0], [5,0], [0,1], [3,1], [4,1], [1,2], [2,2], [5,2], [0,3], [3,3], [4,3], [1,4], [2,4], [5,4]]
  )
];

export function canMove(
  mazeId: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  // Boundary check
  if (x2 < 0 || x2 > 5 || y2 < 0 || y2 > 5) return false;
  const maze = MAZES[mazeId];
  if (!maze) return false;

  const key = makeWallKey(x1, y1, x2, y2);
  return !maze.walls.has(key);
}
