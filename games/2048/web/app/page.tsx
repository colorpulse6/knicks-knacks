"use client";

import { useEffect, useRef, useCallback } from "react";
import { use2048 } from "./components/use2048";
import GameBoard from "./components/GameBoard";

export default function Home() {
  const {
    tiles,
    score,
    bestScore,
    gameOver,
    won,
    keepPlaying,
    move,
    initGame,
    continueGame,
  } = use2048();

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowUp":
          move("up");
          break;
        case "ArrowDown":
          move("down");
          break;
        case "ArrowLeft":
          move("left");
          break;
        case "ArrowRight":
          move("right");
          break;
      }
    },
    [move]
  );

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      const minSwipeDistance = 30;

      if (
        Math.abs(deltaX) < minSwipeDistance &&
        Math.abs(deltaY) < minSwipeDistance
      ) {
        return;
      }

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        move(deltaX > 0 ? "right" : "left");
      } else {
        move(deltaY > 0 ? "down" : "up");
      }

      touchStartRef.current = null;
    },
    [move]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleKeyDown, handleTouchStart, handleTouchEnd]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#faf8ef]">
      {/* Header */}
      <div className="w-full max-w-[460px] mb-4">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-6xl font-bold text-text-dark">2048</h1>

          <div className="flex gap-2">
            <div className="bg-board-bg rounded px-4 py-2 text-center min-w-[80px]">
              <div className="text-xs uppercase text-tile-2 font-bold">
                Score
              </div>
              <div className="text-xl font-bold text-white">{score}</div>
            </div>
            <div className="bg-board-bg rounded px-4 py-2 text-center min-w-[80px]">
              <div className="text-xs uppercase text-tile-2 font-bold">
                Best
              </div>
              <div className="text-xl font-bold text-white">{bestScore}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-text-dark">
            Join the tiles, get to <strong>2048!</strong>
          </p>
          <button
            onClick={initGame}
            className="bg-[#8f7a66] text-white font-bold px-4 py-2 rounded hover:bg-[#9f8b77] transition-colors"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative">
        <GameBoard tiles={tiles} />

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-[#eee4da]/80 rounded-md flex flex-col items-center justify-center">
            <h2 className="text-5xl font-bold text-text-dark mb-4">
              Game Over!
            </h2>
            <button
              onClick={initGame}
              className="bg-[#8f7a66] text-white font-bold px-6 py-3 rounded hover:bg-[#9f8b77] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Win Overlay */}
        {won && !keepPlaying && (
          <div className="absolute inset-0 bg-[#edc22e]/80 rounded-md flex flex-col items-center justify-center">
            <h2 className="text-5xl font-bold text-white mb-4">You Win!</h2>
            <div className="flex gap-4">
              <button
                onClick={continueGame}
                className="bg-[#8f7a66] text-white font-bold px-6 py-3 rounded hover:bg-[#9f8b77] transition-colors"
              >
                Keep Going
              </button>
              <button
                onClick={initGame}
                className="bg-[#8f7a66] text-white font-bold px-6 py-3 rounded hover:bg-[#9f8b77] transition-colors"
              >
                New Game
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-text-dark max-w-[460px]">
        <p className="mb-2">
          <strong>How to play:</strong> Use your <strong>arrow keys</strong> or{" "}
          <strong>swipe</strong> to move the tiles.
        </p>
        <p>
          Tiles with the same number <strong>merge into one</strong> when they
          touch. Add them up to reach <strong>2048!</strong>
        </p>
      </div>
    </main>
  );
}
