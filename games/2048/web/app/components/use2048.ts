"use client";

import { useState, useCallback, useEffect } from "react";

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
}

export interface GameState {
  tiles: Tile[];
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
}

const GRID_SIZE = 4;
let tileIdCounter = 0;

function getEmptyCells(tiles: Tile[]): { row: number; col: number }[] {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const empty: { row: number; col: number }[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!occupied.has(`${row},${col}`)) {
        empty.push({ row, col });
      }
    }
  }

  return empty;
}

function addRandomTile(tiles: Tile[]): Tile[] {
  const emptyCells = getEmptyCells(tiles);
  if (emptyCells.length === 0) return tiles;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  return [
    ...tiles.map((t) => ({ ...t, isNew: false, isMerged: false })),
    {
      id: ++tileIdCounter,
      value,
      row: randomCell.row,
      col: randomCell.col,
      isNew: true,
      isMerged: false,
    },
  ];
}

function canMove(tiles: Tile[]): boolean {
  if (getEmptyCells(tiles).length > 0) return true;

  // Check for possible merges
  for (const tile of tiles) {
    const neighbors = [
      { row: tile.row - 1, col: tile.col },
      { row: tile.row + 1, col: tile.col },
      { row: tile.row, col: tile.col - 1 },
      { row: tile.row, col: tile.col + 1 },
    ];

    for (const neighbor of neighbors) {
      const neighborTile = tiles.find(
        (t) => t.row === neighbor.row && t.col === neighbor.col
      );
      if (neighborTile && neighborTile.value === tile.value) {
        return true;
      }
    }
  }

  return false;
}

type Direction = "up" | "down" | "left" | "right";

function moveTiles(
  tiles: Tile[],
  direction: Direction
): { tiles: Tile[]; score: number; moved: boolean } {
  let newTiles: Tile[] = tiles.map((t) => ({
    ...t,
    isNew: false,
    isMerged: false,
  }));
  let scoreGained = 0;
  let moved = false;

  const isVertical = direction === "up" || direction === "down";
  const isReverse = direction === "down" || direction === "right";

  for (let i = 0; i < GRID_SIZE; i++) {
    // Get tiles in this row/column
    let line = newTiles
      .filter((t) => (isVertical ? t.col === i : t.row === i))
      .sort((a, b) => {
        const aPos = isVertical ? a.row : a.col;
        const bPos = isVertical ? b.row : b.col;
        return isReverse ? bPos - aPos : aPos - bPos;
      });

    // Remove tiles from main array
    newTiles = newTiles.filter((t) =>
      isVertical ? t.col !== i : t.row !== i
    );

    // Process line: merge and compress
    const processed: Tile[] = [];
    let j = 0;

    while (j < line.length) {
      const current = line[j];
      const next = line[j + 1];

      if (next && current.value === next.value) {
        // Merge
        const newValue = current.value * 2;
        scoreGained += newValue;
        processed.push({
          ...current,
          value: newValue,
          isMerged: true,
        });
        j += 2;
        moved = true;
      } else {
        processed.push(current);
        j += 1;
      }
    }

    // Assign new positions
    processed.forEach((tile, index) => {
      const newPos = isReverse ? GRID_SIZE - 1 - index : index;
      const oldPos = isVertical ? tile.row : tile.col;

      if (oldPos !== newPos) moved = true;

      if (isVertical) {
        tile.row = newPos;
      } else {
        tile.col = newPos;
      }
    });

    newTiles = [...newTiles, ...processed];
  }

  return { tiles: newTiles, score: scoreGained, moved };
}

function loadBestScore(): number {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem("2048-best-score");
  return saved ? parseInt(saved, 10) : 0;
}

function saveBestScore(score: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("2048-best-score", score.toString());
}

function update2048Profile(score: number): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("knicks-knacks-profile");
    const profile = raw ? JSON.parse(raw) : null;
    if (!profile) return;
    const stats = profile.games?.["2048"] || { gamesPlayed: 0, highScore: 0, lastPlayed: null };
    stats.gamesPlayed += 1;
    if (score > stats.highScore) stats.highScore = score;
    stats.lastPlayed = new Date().toISOString();
    profile.games["2048"] = stats;
    profile.lastPlayed = stats.lastPlayed;
    localStorage.setItem("knicks-knacks-profile", JSON.stringify(profile));
  } catch {}
}

export function getPlayerName(): string {
  if (typeof window === "undefined") return "Guest";
  try {
    const raw = localStorage.getItem("knicks-knacks-profile");
    const profile = raw ? JSON.parse(raw) : null;
    return profile?.name || "Guest";
  } catch { return "Guest"; }
}

export function use2048() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const [playerName, setPlayerName] = useState("Guest");

  const initGame = useCallback(() => {
    tileIdCounter = 0;
    let newTiles: Tile[] = [];
    newTiles = addRandomTile(newTiles);
    newTiles = addRandomTile(newTiles);

    setTiles(newTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
    setBestScore(loadBestScore());
    setPlayerName(getPlayerName());
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const move = useCallback(
    (direction: Direction) => {
      if (gameOver) return;
      if (won && !keepPlaying) return;

      const result = moveTiles(tiles, direction);

      if (!result.moved) return;

      const newTiles = addRandomTile(result.tiles);
      const newScore = score + result.score;

      setTiles(newTiles);
      setScore(newScore);

      if (newScore > bestScore) {
        setBestScore(newScore);
        saveBestScore(newScore);
      }

      // Check for 2048 win
      if (!won && !keepPlaying && newTiles.some((t) => t.value >= 2048)) {
        setWon(true);
      }

      // Check for game over
      if (!canMove(newTiles)) {
        setGameOver(true);
        update2048Profile(newScore);
      }
    },
    [tiles, score, bestScore, gameOver, won, keepPlaying]
  );

  const continueGame = useCallback(() => {
    setKeepPlaying(true);
  }, []);

  return {
    tiles,
    score,
    bestScore,
    gameOver,
    won,
    keepPlaying,
    playerName,
    move,
    initGame,
    continueGame,
  };
}
