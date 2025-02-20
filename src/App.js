import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import "./App.css";

// Base piece values (scaled up for material evaluation)
const pieceValues = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional tables for each piece type
const pawnPosition = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const knightPosition = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 10, 10, 0, -20, -40],
  [-30, 0, 10, 20, 20, 10, 0, -30],
  [-30, 10, 20, 30, 30, 20, 10, -30],
  [-30, 10, 20, 30, 30, 20, 10, -30],
  [-30, 0, 10, 20, 20, 10, 0, -30],
  [-40, -20, 0, 10, 10, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const bishopPosition = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 10, 15, 15, 10, 5, -10],
  [-10, 5, 10, 15, 15, 10, 5, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const rookPosition = [
  [0, 0, 0, 5, 5, 0, 0, 0],
  [0, 0, 5, 10, 10, 5, 0, 0],
  [0, 5, 10, 15, 15, 10, 5, 0],
  [0, 10, 15, 20, 20, 15, 10, 0],
  [0, 10, 15, 20, 20, 15, 10, 0],
  [0, 5, 10, 15, 15, 10, 5, 0],
  [0, 0, 5, 10, 10, 5, 0, 0],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const queenPosition = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 5, 10, 15, 15, 10, 5, -10],
  [-10, 5, 10, 15, 15, 10, 5, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const kingPosition = [
  [-30, -40, -50, -50, -50, -50, -40, -30],
  [-40, -60, -70, -70, -70, -70, -60, -40],
  [-50, -70, -80, -90, -90, -80, -70, -50],
  [-50, -70, -90, -100, -100, -90, -70, -50],
  [-50, -70, -80, -90, -90, -80, -70, -50],
  [-50, -60, -70, -70, -70, -70, -60, -50],
  [-40, -50, -60, -60, -60, -60, -50, -40],
  [-30, -40, -50, -50, -50, -50, -40, -30],
];

// Returns the positional bonus/penalty for a given piece at coordinates (x, y)
const piecePositionValue = (piece, x, y) => {
  if (!piece) return 0;
  if (piece.type === "p") {
    return piece.color === "w" ? pawnPosition[y][x] : -pawnPosition[7 - y][7 - x];
  }
  if (piece.type === "n") {
    return piece.color === "w" ? knightPosition[y][x] : -knightPosition[7 - y][7 - x];
  }
  if (piece.type === "b") {
    return piece.color === "w" ? bishopPosition[y][x] : -bishopPosition[7 - y][7 - x];
  }
  if (piece.type === "r") {
    return piece.color === "w" ? rookPosition[y][x] : -rookPosition[7 - y][7 - x];
  }
  if (piece.type === "q") {
    return piece.color === "w" ? queenPosition[y][x] : -queenPosition[7 - y][7 - x];
  }
  if (piece.type === "k") {
    return piece.color === "w" ? kingPosition[y][x] : -kingPosition[7 - y][7 - x];
  }
  return 0;
};

// Evaluate board state by summing material and positional values.
const evaluateBoard = (gameInstance) => {
  const board = gameInstance.board();
  let total = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece) {
        // For white pieces, add value; for black pieces, subtract value.
        total += piece.color === "w"
          ? pieceValues[piece.type] + piecePositionValue(piece, x, y)
          : -(pieceValues[piece.type] + piecePositionValue(piece, x, y));
      }
    }
  }
  console.log(total)
  return total;
};

// Minimax algorithm to simulate moves and choose the best evaluation.
const minimax = (gameInstance, depth, isMaximizing) => {
  const currentGame = new Chess(gameInstance.fen()); console.log(currentGame)
  if (depth === 0 || currentGame.isGameOver()) {
    return evaluateBoard(currentGame);
  }
  const moves = currentGame.moves(); console.log(moves)
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let move of moves) {
      const newGame = new Chess(currentGame.fen());
      newGame.move(move);
      const evalScore = minimax(newGame, depth - 1, false);
      maxEval = Math.max(maxEval, evalScore);
      console.log(maxEval)
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of moves) {
      const newGame = new Chess(currentGame.fen());
      newGame.move(move);
      const evalScore = minimax(newGame, depth - 1, true);
      minEval = Math.min(minEval, evalScore);
    }
    return minEval;
  }
};

// Determines the best move for the AI by using minimax.
const getBestMove = (gameInstance, depth) => {
  const currentGame = new Chess(gameInstance.fen());
  const moves = currentGame.moves();
  let bestMove = null;
  let bestEval = -Infinity;
  for (let move of moves) {
    const newGame = new Chess(currentGame.fen());
    newGame.move(move);
    // For the AI, we assume it's playing Black, so we look for moves that maximize evaluation for Black.
    const evalScore = minimax(newGame, depth - 1, false);
    if (evalScore > bestEval) {
      bestEval = evalScore;
      bestMove = move;
    }
  }
  return bestMove;
};

function App() {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState("");
  const [isWhiteTurn, setIsWhiteTurn] = useState(true); // White starts

  // AI move (assumed to be Black)
  const makeAIMove = () => {
    const currentGame = new Chess(game.fen());
    if (currentGame.isGameOver()) return;
    // Use depth 2 for faster AI moves; adjust for strength.
    const bestMove = getBestMove(currentGame, 2);
    if (!bestMove) return;
    currentGame.move(bestMove);
    setGame(new Chess(currentGame.fen())); // Update state
    setIsWhiteTurn(true); // Change turn to White after AI move
    checkGameOver(currentGame);
  };

  // Check if the game is over and update result.
  const checkGameOver = (gameInstance) => {
    const currentGame = new Chess(gameInstance.fen());
    if (currentGame.isCheckmate()) {
      setGameOver(true);
      setResult(
        currentGame.turn() === "w"
          ? "Black wins by checkmate!"
          : "White wins by checkmate!"
      );
    } else if (
      currentGame.isDraw() ||
      currentGame.isStalemate() ||
      currentGame.isThreefoldRepetition()
    ) {
      setGameOver(true);
      setResult("Draw!");
    }
  };

  // Handle human (White) moves.
  const onDrop = (sourceSquare, targetSquare) => {
    if (game.isGameOver() || game.turn() !== "w") return false;
    const currentGame = new Chess(game.fen());
    const move = currentGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // Always promote to queen for simplicity
    });
    if (move === null) return false;
    setGame(new Chess(currentGame.fen())); // Update state
    setIsWhiteTurn(false); // It's now Black's turn (AI)
    checkGameOver(currentGame);
    return true;
  };

  const handleResign = () => {
    const currentGame = new Chess(game.fen());
    setGameOver(true);
    setResult(
      currentGame.turn() === "w"
        ? "White resigned. Black wins!"
        : "Black resigned. White wins!"
    );
  };

  const handleRestart = () => {
    setGame(new Chess());
    setGameOver(false);
    setResult("");
    setIsWhiteTurn(true); // White starts
  };

  // When it's Black's turn, let the AI move after a short delay.
  useEffect(() => {
    if (!game.isGameOver() && !isWhiteTurn) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isWhiteTurn, game]);

  return (
    <div className="App">
      <h1>Recursive Chess Bot</h1>
      <div className="chessboard-container">
        <Chessboard position={game.fen()} onPieceDrop={onDrop} boardWidth={400} />
      </div>
      {gameOver && <h2>Game Over: {result}</h2>}
      <div className="controls">
        <button onClick={handleResign} className="resign" disabled={gameOver}>
          Resign
        </button>
        <button onClick={handleRestart} disabled={!gameOver}>
          Restart Game
        </button>
      </div>
    </div>
  );
}

export default App;
