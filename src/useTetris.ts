
import { useState, useCallback, useEffect, useRef } from 'react';
import { createGrid, randomPiece, isCollision, rotateMatrix, clearLines, ROWS, COLS } from './gameLogic';
import type { Matrix, Piece } from './gameLogic';

export const useTetris = () => {
  const [matrix, setMatrix] = useState<Matrix>(createGrid());
  const [piece, setPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece>(randomPiece());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  const spawnPiece = useCallback(() => {
    const newPiece = nextPiece;
    if (isCollision(matrix, newPiece)) {
      setGameOver(true);
      return;
    }
    setPiece(newPiece);
    setNextPiece(randomPiece());
  }, [matrix, nextPiece]);

  const lockPiece = useCallback(() => {
    if (!piece) return;
    const newMatrix = matrix.map(row => [...row]);
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          const rowIdx = piece.pos.y + y;
          const colIdx = piece.pos.x + x;
          if (rowIdx >= 0 && rowIdx < ROWS && colIdx >= 0 && colIdx < COLS) {
            newMatrix[rowIdx][colIdx] = cell;
          }
        }
      });
    });

    const { newGrid: clearedGrid, linesCleared } = clearLines(newMatrix);
    setMatrix(clearedGrid);
    setScore(prev => prev + linesCleared * 100);
    spawnPiece();
  }, [piece, matrix, spawnPiece]);

  const movePiece = (dx: number, dy: number) => {
    if (!piece || gameOver || isPaused) return;
    if (!isCollision(matrix, piece, dx, dy)) {
      setPiece(prev => prev ? { ...prev, pos: { x: prev.pos.x + dx, y: prev.pos.y + dy } } : null);
      return true;
    } else if (dy > 0) {
      lockPiece();
      return false;
    }
    return false;
  };

  const rotatePiece = () => {
    if (!piece || gameOver || isPaused) return;
    const rotatedShape = rotateMatrix(piece.shape);
    const rotatedPiece = { ...piece, shape: rotatedShape };
    
    // Simple wall kick - try to shift if rotation hits a wall
    let offset = 0;
    if (isCollision(matrix, rotatedPiece)) {
      offset = 1;
      if (isCollision(matrix, rotatedPiece, offset, 0)) {
        offset = -1;
        if (isCollision(matrix, rotatedPiece, offset, 0)) {
          return; // Can't rotate
        }
      }
    }
    setPiece(prev => prev ? { ...prev, shape: rotatedShape, pos: { ...prev.pos, x: prev.pos.x + offset } } : null);
  };

  const dropPiece = () => {
    if (!piece || gameOver || isPaused) return;
    let dy = 0;
    while (!isCollision(matrix, piece, 0, dy + 1)) {
      dy++;
    }
    setPiece(prev => prev ? { ...prev, pos: { ...prev.pos, y: prev.pos.y + dy } } : null);
    // Directly lock in next tick to show the drop/locking.
    setTimeout(() => lockPiece(), 0);
  };

  useEffect(() => {
    if (!piece && !gameOver) {
      spawnPiece();
    }
  }, [piece, gameOver, spawnPiece]);

  useEffect(() => {
    if (gameOver || isPaused) return;
    const interval = Math.max(100, 800 - Math.floor(score / 500) * 100);
    const id = window.setInterval(() => {
      movePiece(0, 1);
    }, interval);
    timerRef.current = id;
    return () => clearInterval(id);
  }, [piece, gameOver, isPaused, score, lockPiece]);

  const resetGame = () => {
    setMatrix(createGrid());
    setPiece(null);
    setNextPiece(randomPiece());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  return {
    matrix,
    piece,
    nextPiece,
    score,
    gameOver,
    isPaused,
    setIsPaused,
    movePiece,
    rotatePiece,
    dropPiece,
    resetGame
  };
};
