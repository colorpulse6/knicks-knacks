"use client";

import type { Tile as TileType } from "./use2048";
import Tile from "./Tile";

interface GameBoardProps {
  tiles: TileType[];
}

export default function GameBoard({ tiles }: GameBoardProps) {
  return (
    <div className="relative bg-board-bg rounded-md p-3">
      {/* Background grid */}
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="w-[100px] h-[100px] bg-cell-bg rounded-md"
          />
        ))}
      </div>

      {/* Tiles layer */}
      <div className="absolute top-3 left-3">
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </div>
    </div>
  );
}
