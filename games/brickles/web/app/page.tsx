"use client";

import dynamic from "next/dynamic";

const Game = dynamic(() => import("./components/Game"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      <p className="text-xl font-mono">Loading...</p>
    </div>
  ),
});

export default function Home() {
  return <Game />;
}
