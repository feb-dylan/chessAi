import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import "./App.css";

function App() {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState("");

  const pieceValues = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
  };

  const evaluateBoard = (gameInstance) => {
    const board = gameInstance.board();
    let total = 0;
    board.forEach((row) =>
      row.forEach((piece) => {
        if (piece) {
          total += piece.color === "w" ? pieceValues[piece.type] : -pieceValues[piece.type];
        }
      })
    );
    return total;
  };

  const minimax = (gameInstance, depth, isMaximizing) => {
    const currentGame = new Chess(gameInstance.fen());
    if (depth === 0 || currentGame.isGameOver()) {
      return evaluateBoard(currentGame);
    }
    const moves = currentGame.moves();
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let move of moves) {
        const newGame = new Chess(currentGame.fen());
        newGame.move(move);
        const evalScore = minimax(newGame, depth - 1, false);
        maxEval = Math.max(maxEval, evalScore);
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

  const getBestMove = (gameInstance, depth) => {
    const currentGame = new Chess(gameInstance.fen());
    const moves = currentGame.moves();
    let bestMove = null;
    let bestEval = Infinity;
    for (let move of moves) {
      const newGame = new Chess(currentGame.fen());
      newGame.move(move);
      const evalScore = minimax(newGame, depth - 1, true);
      if (evalScore < bestEval) {
        bestEval = evalScore;
        bestMove = move;
      }
    }
    return bestMove;
  };

  const makeAIMove = () => {
    const currentGame = new Chess(game.fen());
    if (currentGame.isGameOver()) return;
    const bestMove = getBestMove(currentGame, 2); // Reduced depth to 2 for faster AI moves.
    if (!bestMove) return;
    currentGame.move(bestMove);
    setGame(new Chess(currentGame.fen())); // Update game state
    checkGameOver(currentGame);
  };

  const checkGameOver = (gameInstance) => {
    const currentGame = new Chess(gameInstance.fen());
    if (currentGame.isCheckmate()) {
      setGameOver(true);
      setResult(currentGame.turn() === "w" ? "Black wins by checkmate!" : "White wins by checkmate!");
    } else if (currentGame.isDraw() || currentGame.isStalemate() || currentGame.isThreefoldRepetition()) {
      setGameOver(true);
      setResult("Draw!");
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    if (game.isGameOver() || game.turn() !== "w") return false;
    const currentGame = new Chess(game.fen());
    const move = currentGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    if (move === null) return false;
    setGame(new Chess(currentGame.fen())); // Update game state
    checkGameOver(currentGame);
    return true;
  };

  useEffect(() => {
    if (!game.isGameOver() && game.turn() === "b") {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [game]);

  return (
    <div className="App">
      <h1>Human vs. AI Chess</h1>
      <div className="chessboard-container">
        <Chessboard position={game.fen()} onPieceDrop={onDrop} boardWidth={400} />
      </div>
      {gameOver && <h2>Game Over: {result}</h2>}
      <p>FEN: {game.fen()}</p>
    </div>
  );
}

export default App;
