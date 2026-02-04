"use client";

import { useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import SaveScreen from "../menu/SaveScreen";

export default function TitleScreen() {
  const { newGame } = useGameStore();
  const [showLoadScreen, setShowLoadScreen] = useState(false);

  // Check if any save data exists
  const hasSaveData = typeof window !== "undefined" &&
    Array.from({ length: 4 }, (_, i) => localStorage.getItem(`chimera-save-${i + 1}`))
      .some(Boolean);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black">
      <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-8">
        CHIMERA
      </h1>
      <p className="text-gray-500 mb-12">A world of digital illusions</p>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => newGame()}
          className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded transition-colors"
        >
          New Game
        </button>
        <button
          onClick={() => setShowLoadScreen(true)}
          disabled={!hasSaveData}
          className={`px-8 py-3 font-bold rounded transition-colors ${
            hasSaveData
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}
        >
          Load Game
        </button>
      </div>

      <p className="absolute bottom-8 text-gray-600 text-sm">
        Press ENTER to start
      </p>

      {showLoadScreen && (
        <SaveScreen
          mode="load"
          onClose={() => setShowLoadScreen(false)}
          onComplete={() => setShowLoadScreen(false)}
        />
      )}
    </div>
  );
}
