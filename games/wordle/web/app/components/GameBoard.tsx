"use client";

import { TileData } from "./useWordle";
import Tile from "./Tile";

interface GameBoardProps {
  board: TileData[][];
  shake: boolean;
  currentRow: number;
}

export default function GameBoard({ board, shake, currentRow }: GameBoardProps) {
  return (
    <div className="flex flex-col gap-[5px]">
      {board.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`flex gap-[5px] ${
            shake && rowIndex === currentRow ? "animate-shake" : ""
          }`}
        >
          {row.map((tile, colIndex) => (
            <Tile
              key={colIndex}
              letter={tile.letter}
              state={tile.state}
              position={colIndex}
              isCurrentRow={rowIndex === currentRow}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
