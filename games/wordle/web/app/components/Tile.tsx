"use client";

import { LetterState } from "./useWordle";

interface TileProps {
  letter: string;
  state: LetterState;
  position: number;
  isCurrentRow: boolean;
}

const stateStyles: Record<LetterState, string> = {
  correct: "bg-correct border-correct",
  present: "bg-present border-present",
  absent: "bg-absent border-absent",
  empty: "bg-transparent border-[#3a3a3c]",
  tbd: "bg-transparent border-[#565758]",
};

export default function Tile({
  letter,
  state,
  position,
  isCurrentRow,
}: TileProps) {
  const hasLetter = letter !== "";
  const isRevealed = state !== "empty" && state !== "tbd";

  return (
    <div
      className={`
        w-[62px] h-[62px] border-2 flex items-center justify-center
        text-3xl font-bold uppercase select-none
        transition-all duration-100
        ${stateStyles[state]}
        ${hasLetter && !isRevealed ? "animate-pop" : ""}
        ${isRevealed ? "text-white" : "text-white"}
      `}
      style={{
        animationDelay: isRevealed ? `${position * 300}ms` : "0ms",
      }}
    >
      {letter}
    </div>
  );
}
