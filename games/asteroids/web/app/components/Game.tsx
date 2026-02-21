"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  GameState,
  Keys,
  createInitialState,
  updateGame,
  drawGame,
  loadHighScore,
  saveHighScore,
  getPlayerName,
} from "./gameEngine";

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [playerName, setPlayerName] = useState("Guest");

  const keysRef = useRef<Keys>({
    left: false,
    right: false,
    up: false,
    space: false,
  });
  const shootPressedRef = useRef(false);
  const lastShootRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setShowStartScreen(false);
    setGameState(createInitialState(canvas.width, canvas.height, 1));
    setHighScore(loadHighScore());
  }, []);

  const restartGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (gameState) {
      saveHighScore(gameState.score);
      setHighScore(loadHighScore());
    }

    setGameState(createInitialState(canvas.width, canvas.height, 1));
  }, [gameState]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowLeft":
        case "a":
          keysRef.current.left = true;
          break;
        case "ArrowRight":
        case "d":
          keysRef.current.right = true;
          break;
        case "ArrowUp":
        case "w":
          keysRef.current.up = true;
          break;
        case " ":
          keysRef.current.space = true;
          break;
        case "Enter":
          if (showStartScreen) {
            startGame();
          } else if (gameState?.gameOver) {
            restartGame();
          }
          break;
        case "p":
          if (gameState && !gameState.gameOver) {
            setGameState((prev) =>
              prev ? { ...prev, paused: !prev.paused } : null
            );
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
          keysRef.current.left = false;
          break;
        case "ArrowRight":
        case "d":
          keysRef.current.right = false;
          break;
        case "ArrowUp":
        case "w":
          keysRef.current.up = false;
          break;
        case " ":
          keysRef.current.space = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showStartScreen, gameState, startGame, restartGame]);

  // Game loop
  useEffect(() => {
    if (!gameState || showStartScreen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = () => {
      const now = Date.now();
      const canShoot = keysRef.current.space && now - lastShootRef.current > 200;
      if (canShoot) {
        shootPressedRef.current = true;
        lastShootRef.current = now;
      } else {
        shootPressedRef.current = false;
      }

      const newState = updateGame(
        gameState,
        keysRef.current,
        canvas.width,
        canvas.height,
        shootPressedRef.current
      );

      setGameState(newState);
      drawGame(ctx, newState, canvas.width, canvas.height, keysRef.current.up);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, showStartScreen]);

  // Save high score on game over
  useEffect(() => {
    if (gameState?.gameOver) {
      saveHighScore(gameState.score);
      setHighScore(loadHighScore());
    }
  }, [gameState?.gameOver, gameState?.score]);

  // Initial high score and player name load
  useEffect(() => {
    setHighScore(loadHighScore());
    setPlayerName(getPlayerName());
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-white/20"
      />

      {/* HUD */}
      {gameState && !showStartScreen && (
        <div className="absolute top-4 left-0 right-0 flex justify-between px-8 text-white font-mono">
          <div className="flex gap-8">
            <div>
              <span className="text-gray-400 text-sm">{playerName}</span>
            </div>
            <div>
              <span className="text-gray-400">SCORE: </span>
              <span className="text-xl">{gameState.score}</span>
            </div>
            <div>
              <span className="text-gray-400">HIGH: </span>
              <span className="text-xl">
                {Math.max(highScore, gameState.score)}
              </span>
            </div>
          </div>
          <div className="flex gap-8">
            <div>
              <span className="text-gray-400">LEVEL: </span>
              <span className="text-xl">{gameState.level}</span>
            </div>
            <div>
              <span className="text-gray-400">LIVES: </span>
              <span className="text-xl">{"▲".repeat(gameState.lives)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {showStartScreen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white">
          <h1 className="text-6xl font-bold mb-8 tracking-widest">ASTEROIDS</h1>
          <div className="text-center mb-8 text-gray-400">
            <p className="mb-2">Arrow Keys or WASD to move</p>
            <p className="mb-2">SPACE to shoot</p>
            <p>P to pause</p>
          </div>
          <button
            onClick={startGame}
            className="px-8 py-4 border-2 border-white text-xl hover:bg-white hover:text-black transition-colors"
          >
            PRESS ENTER OR CLICK TO START
          </button>
        </div>
      )}

      {/* Paused Screen */}
      {gameState?.paused && !gameState.gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">PAUSED</h2>
            <p className="text-gray-400">Press P to resume</p>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState?.gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white">
          <h2 className="text-5xl font-bold mb-4">GAME OVER</h2>
          <div className="text-center mb-8">
            <p className="text-2xl mb-2">
              Score: <span className="text-yellow-400">{gameState.score}</span>
            </p>
            <p className="text-xl text-gray-400">
              High Score: {Math.max(highScore, gameState.score)}
            </p>
          </div>
          <button
            onClick={restartGame}
            className="px-8 py-4 border-2 border-white text-xl hover:bg-white hover:text-black transition-colors"
          >
            PRESS ENTER OR CLICK TO PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
