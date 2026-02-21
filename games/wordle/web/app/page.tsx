"use client";

import { useEffect } from "react";
import { useWordle } from "./components/useWordle";
import GameBoard from "./components/GameBoard";
import Keyboard from "./components/Keyboard";

export default function Home() {
  const {
    board,
    letterStates,
    handleKeyPress,
    gameOver,
    won,
    stats,
    shake,
    message,
    playerName,
    currentRow,
  } = useWordle();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKeyPress(e.key.toUpperCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#121213]">
      {/* Header */}
      <header className="w-full border-b border-[#3a3a3c] py-3">
        <h1 className="text-3xl font-bold text-center text-white tracking-wider">
          Wordle
        </h1>
        <p className="text-center text-[#565758] text-xs mt-1">{playerName}</p>
      </header>

      {/* Message Toast */}
      {message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white text-black px-5 py-3 rounded font-bold z-50">
          {message}
        </div>
      )}

      {/* Game Container */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
        <GameBoard board={board} shake={shake} currentRow={currentRow} />
      </div>

      {/* Stats Modal (shows when game is over) */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="bg-[#121213] border border-[#3a3a3c] rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold text-center mb-4">
              {won ? "Congratulations!" : "Game Over"}
            </h2>

            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
                <div className="text-xs text-gray-400">Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {stats.gamesPlayed > 0
                    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
                    : 0}
                </div>
                <div className="text-xs text-gray-400">Win %</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.currentStreak}</div>
                <div className="text-xs text-gray-400">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.maxStreak}</div>
                <div className="text-xs text-gray-400">Max Streak</div>
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase mb-2">
              Guess Distribution
            </h3>
            <div className="space-y-1 mb-6">
              {stats.guessDistribution.map((count, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 text-sm">{i + 1}</span>
                  <div
                    className={`h-5 flex items-center justify-end px-2 text-sm font-bold ${
                      count > 0 ? "bg-correct" : "bg-[#3a3a3c]"
                    }`}
                    style={{
                      width: `${Math.max(
                        7,
                        (count /
                          Math.max(...stats.guessDistribution, 1)) *
                          100
                      )}%`,
                    }}
                  >
                    {count}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-400 text-sm">
              Come back tomorrow for a new word!
            </p>
          </div>
        </div>
      )}

      {/* Keyboard */}
      <div className="w-full px-2 pb-4">
        <Keyboard onKeyPress={handleKeyPress} letterStates={letterStates} />
      </div>
    </main>
  );
}
