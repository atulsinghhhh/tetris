
import React, { useEffect } from 'react';
import { useTetris } from './useTetris';
import { getGhostPosition, ROWS, COLS } from './gameLogic';
import './Tetris.css';

const Tetris: React.FC = () => {
  const {
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
  } = useTetris();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case 'ArrowLeft': movePiece(-1, 0); break;
        case 'ArrowRight': movePiece(1, 0); break;
        case 'ArrowDown': movePiece(0, 1); break;
        case 'ArrowUp': rotatePiece(); break;
        case ' ': dropPiece(); e.preventDefault(); break;
        case 'p': setIsPaused(!isPaused); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePiece, rotatePiece, dropPiece, gameOver, isPaused, setIsPaused]);

  // Calculate the board data including active and ghost pieces for rendering
  const renderBoard = () => {
    const displayGrid = matrix.map(row => [...row]);
    
    // 1. Draw Ghost Piece
    if (piece && !gameOver) {
      const ghostPos = getGhostPosition(matrix, piece);
      piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== 0) {
            const gy = ghostPos.y + y;
            const gx = ghostPos.x + x;
            if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
               // Special value for ghost
               if (displayGrid[gy][gx] === 0) displayGrid[gy][gx] = -1; 
            }
          }
        });
      });
    }

    // 2. Draw Active Piece
    if (piece && !gameOver) {
      piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== 0) {
            const ay = piece.pos.y + y;
            const ax = piece.pos.x + x;
            if (ay >= 0 && ay < ROWS && ax >= 0 && ax < COLS) {
              displayGrid[ay][ax] = cell;
            }
          }
        });
      });
    }

    return displayGrid;
  };

  const boardToRender = renderBoard();

  return (
    <div className="tetris-container">
      <div className="game-layout">
        {/* Main Board */}
        <div className="board-container">
          <div className="board">
            {boardToRender.map((row, y) => 
               row.map((cell, x) => (
                 <div 
                   key={`${y}-${x}`} 
                   className={`cell ${cell > 0 ? `cell-${cell}` : cell === -1 ? 'cell-ghost' : ''}`}
                 />
               ))
            )}
          </div>
          
          {gameOver && (
            <div className="game-over-overlay">
              <h2>GAME OVER</h2>
              <div className="info-value">{score}</div>
              <button className="btn-primary" onClick={resetGame}>PLAY AGAIN</button>
            </div>
          )}
          
          {isPaused && !gameOver && (
             <div className="game-over-overlay">
               <h2>PAUSED</h2>
               <button className="btn-primary" onClick={() => setIsPaused(false)}>RESUME</button>
             </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="side-panel">
          <div className="info-card">
            <div className="info-label">SCORE</div>
            <div className="info-value">{score}</div>
          </div>

          <div className="info-card">
            <div className="info-label">NEXT</div>
            <div className="preview-grid">
              {(() => {
                const previewRows = Array.from({ length: 4 }, () => Array(4).fill(0));
                nextPiece.shape.forEach((row, y) => {
                  row.forEach((cell, x) => {
                    if (cell !== 0) previewRows[y][x] = cell;
                  });
                });
                return previewRows.map((row, y) => 
                  row.map((cell, x) => (
                    <div 
                      key={`p-${y}-${x}`} 
                      className={`preview-cell ${cell > 0 ? `cell-${cell}` : ''}`}
                    />
                  ))
                );
              })()}
            </div>
          </div>

          <div className="info-card controls-hint">
             <div className="info-label">CONTROLS</div>
             <div className="hint-item"><span>Move</span><span>&larr; &rarr;</span></div>
             <div className="hint-item"><span>Rotate</span><span>&uarr;</span></div>
             <div className="hint-item"><span>Drop</span><span>Space</span></div>
             <div className="hint-item"><span>Pause</span><span>P</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tetris;
