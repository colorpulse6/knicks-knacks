"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  type GameState,
  type Keys,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  POWER_UP_CONFIG,
  POWER_UP_DURATION,
  PowerUpType,
} from "./engine/types";
import { createInitialState, updateGame, togglePause } from "./engine/gameEngine";
import { drawGame } from "./engine/renderer";
import { AudioEngine } from "./engine/audio";
import { getLevelName } from "./engine/levels";

const STORAGE_KEY = "brickles-high-score";

function loadHighScore(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}

function saveHighScore(score: number): void {
  const current = loadHighScore();
  if (score > current) {
    localStorage.setItem(STORAGE_KEY, String(score));
  }
}

function updateBricklesProfile(score: number, level: number, maxCombo: number): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("knicks-knacks-profile");
    const profile = raw ? JSON.parse(raw) : null;
    if (!profile) return;
    const stats = profile.games?.brickles || { gamesPlayed: 0, highScore: 0, maxLevel: 0, maxCombo: 0, lastPlayed: null };
    stats.gamesPlayed += 1;
    if (score > stats.highScore) stats.highScore = score;
    if (level > stats.maxLevel) stats.maxLevel = level;
    if (maxCombo > stats.maxCombo) stats.maxCombo = maxCombo;
    stats.lastPlayed = new Date().toISOString();
    profile.games.brickles = stats;
    profile.lastPlayed = stats.lastPlayed;
    localStorage.setItem("knicks-knacks-profile", JSON.stringify(profile));
  } catch {}
}

function getPlayerName(): string {
  if (typeof window === "undefined") return "Guest";
  try {
    const raw = localStorage.getItem("knicks-knacks-profile");
    const profile = raw ? JSON.parse(raw) : null;
    return profile?.name || "Guest";
  } catch { return "Guest"; }
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [muted, setMuted] = useState(false);
  const [playerName, setPlayerName] = useState("Guest");

  const keysRef = useRef<Keys>({ left: false, right: false, space: false });
  const mouseXRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<AudioEngine | null>(null);

  // Initialize audio engine lazily
  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new AudioEngine();
    }
    audioRef.current.init();
  }, []);

  const startGame = useCallback(() => {
    ensureAudio();
    setShowStartScreen(false);
    setGameState(createInitialState(1));
    setHighScore(loadHighScore());
  }, [ensureAudio]);

  const restartGame = useCallback(() => {
    ensureAudio();
    if (gameState) {
      saveHighScore(gameState.score);
      setHighScore(loadHighScore());
    }
    setGameState(createInitialState(1));
  }, [gameState, ensureAudio]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowLeft":
        case "a":
          keysRef.current.left = true;
          mouseXRef.current = null; // Switch to keyboard mode
          break;
        case "ArrowRight":
        case "d":
          keysRef.current.right = true;
          mouseXRef.current = null;
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
          if (gameState && !gameState.gameOver && !gameState.levelComplete) {
            setGameState((prev) => (prev ? togglePause(prev) : null));
          }
          break;
        case "m":
          if (audioRef.current) {
            const nowMuted = audioRef.current.toggleMute();
            setMuted(nowMuted);
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

  // Mouse input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      mouseXRef.current = (e.clientX - rect.left) * scaleX;
    };

    const handleClick = () => {
      if (showStartScreen) {
        startGame();
      } else if (gameState?.gameOver) {
        restartGame();
      } else {
        // Click to launch ball or release from magnet
        keysRef.current.space = true;
        setTimeout(() => {
          keysRef.current.space = false;
        }, 50);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
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
      const newState = updateGame(gameState, keysRef.current, mouseXRef.current);

      // Play audio events
      for (const event of newState.audioEvents) {
        audioRef.current?.play(event, { combo: newState.combo });
      }

      setGameState(newState);
      drawGame(ctx, newState);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, showStartScreen]);

  // Save high score and update profile on game over
  useEffect(() => {
    if (gameState?.gameOver) {
      saveHighScore(gameState.score);
      setHighScore(loadHighScore());
      updateBricklesProfile(gameState.score, gameState.level, gameState.maxCombo);
    }
  }, [gameState?.gameOver, gameState?.score, gameState?.level, gameState?.maxCombo]);

  // Initial high score and player name load
  useEffect(() => {
    setHighScore(loadHighScore());
    setPlayerName(getPlayerName());
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black select-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-white/20 cursor-none"
      />

      {/* HUD */}
      {gameState && !showStartScreen && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-6 text-white font-mono text-sm">
          <div>
            <span className="text-gray-500 text-xs">{playerName}</span>
          </div>
          <div>
            <span className="text-gray-500">SCORE </span>
            <span className="text-lg font-bold">{gameState.score}</span>
          </div>
          <div>
            <span className="text-gray-500">HIGH </span>
            <span className="text-lg">
              {Math.max(highScore, gameState.score)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">LEVEL </span>
            <span className="text-lg">{gameState.level}</span>
          </div>
          <div>
            <span className="text-gray-500">LIVES </span>
            <span className="text-lg text-cyan-400">
              {"●".repeat(Math.max(0, gameState.lives))}
            </span>
          </div>
          <button
            onClick={() => {
              if (audioRef.current) {
                const nowMuted = audioRef.current.toggleMute();
                setMuted(nowMuted);
              }
            }}
            className="text-gray-500 hover:text-white transition-colors ml-2"
            title="Toggle sound (M)"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      )}

      {/* Active Power-ups */}
      {gameState && !showStartScreen && gameState.activePowerUps.length > 0 && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-2">
          {gameState.activePowerUps.map((ap, i) => {
            const config = POWER_UP_CONFIG[ap.type];
            const pct = ap.remainingFrames / POWER_UP_DURATION;
            return (
              <div
                key={`${ap.type}-${i}`}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono"
                style={{
                  backgroundColor: config.color + "33",
                  borderLeft: `2px solid ${config.color}`,
                }}
              >
                <span style={{ color: config.color }}>{config.symbol}</span>
                <div className="w-12 h-1.5 bg-gray-800 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${pct * 100}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Start Screen */}
      {showStartScreen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white">
          <h1
            className="text-7xl font-bold mb-2 tracking-widest"
            style={{
              background: "linear-gradient(135deg, #00FFFF, #FF00FF, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            BRICKLES
          </h1>
          <p className="text-gray-600 mb-10 text-sm tracking-wider">
            CLASSIC BRICK BREAKER
          </p>
          <div className="text-center mb-10 text-gray-400 text-sm space-y-2">
            <p>Arrow Keys or Mouse to move paddle</p>
            <p>SPACE or Click to launch ball</p>
            <p>P to pause &middot; M to mute</p>
          </div>
          {highScore > 0 && (
            <p className="text-gray-600 mb-6 text-sm">
              High Score: {highScore}
            </p>
          )}
          <button
            onClick={startGame}
            className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 text-lg hover:bg-cyan-400 hover:text-black transition-colors tracking-wider"
          >
            START GAME
          </button>
        </div>
      )}

      {/* Level Transition */}
      {gameState?.levelComplete && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">LEVEL COMPLETE</p>
            <h2
              className="text-5xl font-bold mb-2"
              style={{
                background:
                  "linear-gradient(135deg, #FFD700, #FF6600)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              LEVEL {gameState.level + 1}
            </h2>
            <p className="text-gray-500 text-sm">
              {getLevelName(gameState.level + 1)}
            </p>
          </div>
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
          <h2 className="text-5xl font-bold mb-6 text-red-400">GAME OVER</h2>
          <div className="text-center mb-8 space-y-2">
            <p className="text-2xl">
              Score:{" "}
              <span className="text-yellow-400 font-bold">
                {gameState.score}
              </span>
            </p>
            <p className="text-lg text-gray-400">
              High Score: {Math.max(highScore, gameState.score)}
            </p>
            <p className="text-sm text-gray-500">
              Level Reached: {gameState.level} &middot; Max Combo:{" "}
              {gameState.maxCombo}x
            </p>
          </div>
          <button
            onClick={restartGame}
            className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 text-lg hover:bg-cyan-400 hover:text-black transition-colors tracking-wider"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
