"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with canvas and game state
const Game = dynamic(() => import("./components/Game"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gold mb-4">CHIMERA</h1>
        <p className="text-gray-400 animate-pulse">Loading...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <Game />;
}
