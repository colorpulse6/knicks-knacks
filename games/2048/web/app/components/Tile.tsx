"use client";

import type { Tile as TileType } from "./use2048";

interface TileProps {
  tile: TileType;
}

const tileColors: Record<number, { bg: string; text: string }> = {
  2: { bg: "bg-tile-2", text: "text-text-dark" },
  4: { bg: "bg-tile-4", text: "text-text-dark" },
  8: { bg: "bg-tile-8", text: "text-text-light" },
  16: { bg: "bg-tile-16", text: "text-text-light" },
  32: { bg: "bg-tile-32", text: "text-text-light" },
  64: { bg: "bg-tile-64", text: "text-text-light" },
  128: { bg: "bg-tile-128", text: "text-text-light" },
  256: { bg: "bg-tile-256", text: "text-text-light" },
  512: { bg: "bg-tile-512", text: "text-text-light" },
  1024: { bg: "bg-tile-1024", text: "text-text-light" },
  2048: { bg: "bg-tile-2048", text: "text-text-light" },
};

const CELL_SIZE = 100;
const GAP = 12;

export default function Tile({ tile }: TileProps) {
  const { bg, text } = tileColors[tile.value] || {
    bg: "bg-tile-super",
    text: "text-text-light",
  };

  const fontSize =
    tile.value < 100
      ? "text-5xl"
      : tile.value < 1000
        ? "text-4xl"
        : tile.value < 10000
          ? "text-3xl"
          : "text-2xl";

  const x = tile.col * (CELL_SIZE + GAP);
  const y = tile.row * (CELL_SIZE + GAP);

  return (
    <div
      className={`
        absolute w-[100px] h-[100px] rounded-md
        flex items-center justify-center
        font-bold select-none
        transition-all duration-150 ease-in-out
        ${bg} ${text} ${fontSize}
        ${tile.isNew ? "animate-tile-pop" : ""}
        ${tile.isMerged ? "animate-tile-merge" : ""}
      `}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {tile.value}
    </div>
  );
}
