
export const COLS = 10;
export const ROWS = 20;

export type Matrix = number[][];

export type Piece = {
  shape: Matrix;
  color: string;
  pos: { x: number; y: number };
};

export const SHAPES: { [key: string]: { shape: Matrix; color: string } } = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#00f0f0", // Cyan
  },
  J: {
    shape: [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0],
    ],
    color: "#0000f0", // Blue
  },
  L: {
    shape: [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ],
    color: "#f0a000", // Orange
  },
  O: {
    shape: [
      [4, 4],
      [4, 4],
    ],
    color: "#f0f000", // Yellow
  },
  S: {
    shape: [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ],
    color: "#00f000", // Green
  },
  T: {
    shape: [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0],
    ],
    color: "#a000f0", // Purple
  },
  Z: {
    shape: [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ],
    color: "#f00000", // Red
  },
};

export const createGrid = (): Matrix =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

export const randomPiece = (): Piece => {
  const keys = Object.keys(SHAPES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  const { shape, color } = SHAPES[type];
  return {
    shape,
    color,
    pos: { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 },
  };
};

export const isCollision = (grid: Matrix, piece: Piece, moveX = 0, moveY = 0): boolean => {
  const { shape, pos } = piece;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const newX = pos.x + x + moveX;
        const newY = pos.y + y + moveY;
        if (
          newX < 0 || 
          newX >= COLS || 
          newY >= ROWS || 
          (newY >= 0 && grid[newY][newX] !== 0)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

export const rotateMatrix = (matrix: Matrix): Matrix => {
  // Transpose the matrix
  const transposed = matrix[0].map((_, i) => matrix.map(row => row[i]));
  // Reverse each row for clockwise rotation
  return transposed.map(row => [...row].reverse());
};

export const clearLines = (grid: Matrix): { newGrid: Matrix; linesCleared: number } => {
  let linesCleared = 0;
  const newGrid = grid.reduce((acc, row) => {
    if (row.every(cell => cell !== 0)) {
      linesCleared++;
      acc.unshift(Array(COLS).fill(0));
    } else {
      acc.push(row);
    }
    return acc;
  }, [] as Matrix);
  return { newGrid, linesCleared };
};

export const getGhostPosition = (grid: Matrix, piece: Piece): { x: number; y: number } => {
  let moveY = 0;
  while (!isCollision(grid, piece, 0, moveY + 1)) {
    moveY++;
  }
  return { x: piece.pos.x, y: piece.pos.y + moveY };
};
