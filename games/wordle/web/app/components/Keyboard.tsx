"use client";

import { LetterState } from "./useWordle";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  letterStates: Map<string, LetterState>;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

const stateStyles: Record<LetterState | "unused", string> = {
  correct: "bg-correct text-white",
  present: "bg-present text-white",
  absent: "bg-absent text-white",
  empty: "bg-key-bg text-black",
  tbd: "bg-key-bg text-black",
  unused: "bg-key-bg text-black",
};

export default function Keyboard({ onKeyPress, letterStates }: KeyboardProps) {
  const getKeyState = (key: string): LetterState | "unused" => {
    if (key === "ENTER" || key === "BACKSPACE") return "unused";
    return letterStates.get(key) || "unused";
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[500px]">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-[6px]">
          {row.map((key) => {
            const state = getKeyState(key);
            const isWide = key === "ENTER" || key === "BACKSPACE";

            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`
                  ${isWide ? "px-3 text-xs" : "w-[43px]"}
                  h-[58px] rounded font-bold uppercase
                  flex items-center justify-center
                  cursor-pointer select-none
                  transition-colors duration-100
                  ${stateStyles[state]}
                  hover:opacity-90 active:opacity-75
                `}
              >
                {key === "BACKSPACE" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    fill="currentColor"
                  >
                    <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z" />
                  </svg>
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
