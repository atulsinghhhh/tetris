import { describe, expect, test } from "bun:test";
import { COLS, ROWS, clearLines, createGrid, rotateMatrix } from "./gameLogic";

describe("gameLogic", () => {
  test("createGrid returns ROWS x COLS matrix of zeros", () => {
    const grid = createGrid();

    expect(grid).toHaveLength(ROWS);
    expect(grid.every((row) => row.length === COLS)).toBe(true);
    expect(grid.every((row) => row.every((cell) => cell === 0))).toBe(true);
  });

  test("rotateMatrix rotates a square matrix clockwise", () => {
    const input = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];

    const rotated = rotateMatrix(input);

    expect(rotated).toEqual([
      [7, 4, 1],
      [8, 5, 2],
      [9, 6, 3],
    ]);
  });

  test("clearLines removes full rows and returns linesCleared", () => {
    const grid = createGrid();
    grid[ROWS - 1] = Array(COLS).fill(1);

    const { newGrid, linesCleared } = clearLines(grid);

    expect(linesCleared).toBe(1);
    expect(newGrid).toHaveLength(ROWS);
    expect(newGrid[0].every((cell) => cell === 0)).toBe(true);
  });
});
