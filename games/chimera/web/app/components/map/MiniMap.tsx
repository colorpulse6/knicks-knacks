"use client";

import { useMemo, useRef, useEffect } from "react";
import { useGameStore } from "../../stores/gameStore";

// Colors for the mini-map
const COLORS = {
  blocked: "#1a1a2e",    // dark navy for walls/blocked
  walkable: "#2d2d44",   // muted indigo for walkable ground
  player: "#fbbf24",     // amber player dot
  playerGlow: "#fde68a", // soft glow around player
  teleport: "#4ade80",   // green for exits/teleports
  shop: "#fb923c",       // orange for shops
  inn: "#f472b6",        // pink for inns
  treasure: "#facc15",   // gold for treasure chests
  savePoint: "#60a5fa",  // blue for save points
  npc: "#c084fc",        // purple for NPCs
  border: "#78716c",     // stone border
};

const MINI_MAP_SIZE = 160; // px — the container size
const PADDING = 4;         // px padding inside border

export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentMap = useGameStore((s) => s.currentMap);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const openedChests = useGameStore((s) => s.openedChests);

  // Compute pixel scale from map dimensions
  const scale = useMemo(() => {
    if (!currentMap) return { cellSize: 1, offsetX: 0, offsetY: 0 };
    const drawArea = MINI_MAP_SIZE - PADDING * 2;
    const cellW = drawArea / currentMap.width;
    const cellH = drawArea / currentMap.height;
    const cellSize = Math.min(cellW, cellH);
    // Center the map in the canvas
    const offsetX = PADDING + (drawArea - cellSize * currentMap.width) / 2;
    const offsetY = PADDING + (drawArea - cellSize * currentMap.height) / 2;
    return { cellSize, offsetX, offsetY };
  }, [currentMap]);

  // Animation frame for pulsing player dot
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentMap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = now - startTime;
      const pulse = 0.6 + 0.4 * Math.sin((elapsed / 600) * Math.PI);

      ctx.clearRect(0, 0, MINI_MAP_SIZE, MINI_MAP_SIZE);

      const { cellSize, offsetX, offsetY } = scale;
      const collision = currentMap.layers.collision;

      // Draw collision grid
      for (let y = 0; y < currentMap.height; y++) {
        for (let x = 0; x < currentMap.width; x++) {
          const walkable = collision[y]?.[x] ?? false;
          ctx.fillStyle = walkable ? COLORS.walkable : COLORS.blocked;
          ctx.fillRect(
            offsetX + x * cellSize,
            offsetY + y * cellSize,
            cellSize,
            cellSize
          );
        }
      }

      // Draw events as colored dots
      for (const event of currentMap.events) {
        let color: string | null = null;
        let dotScale = 1;

        switch (event.type) {
          case "teleport":
            color = COLORS.teleport;
            dotScale = 1.3;
            break;
          case "shop":
            color = COLORS.shop;
            break;
          case "inn":
            color = COLORS.inn;
            break;
          case "treasure":
            if (!event.triggered && !openedChests.has(event.id)) {
              color = COLORS.treasure;
            }
            break;
          case "save_point":
            color = COLORS.savePoint;
            break;
          case "collectible":
            if (!event.triggered && !openedChests.has(event.id)) {
              color = COLORS.treasure;
            }
            break;
        }

        if (color) {
          const cx = offsetX + (event.x + 0.5) * cellSize;
          const cy = offsetY + (event.y + 0.5) * cellSize;
          const r = Math.max(cellSize * 0.4 * dotScale, 1.5);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.85;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Draw NPCs as small purple dots
      for (const npc of currentMap.npcs) {
        const cx = offsetX + (npc.x + 0.5) * cellSize;
        const cy = offsetY + (npc.y + 0.5) * cellSize;
        const r = Math.max(cellSize * 0.3, 1);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.npc;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw player glow
      const px = offsetX + (playerPosition.x + 0.5) * cellSize;
      const py = offsetY + (playerPosition.y + 0.5) * cellSize;
      const glowR = Math.max(cellSize * 0.8 * pulse, 3);
      ctx.beginPath();
      ctx.arc(px, py, glowR, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.playerGlow;
      ctx.globalAlpha = 0.3 * pulse;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Draw player dot
      const playerR = Math.max(cellSize * 0.45, 2);
      ctx.beginPath();
      ctx.arc(px, py, playerR, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.player;
      ctx.fill();
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      animFrame = requestAnimationFrame(draw);
    };

    animFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrame);
  }, [currentMap, playerPosition, openedChests, scale]);

  if (!currentMap) return null;

  return (
    <div className="absolute bottom-4 right-4 z-30 pointer-events-none">
      <div
        className="rounded-lg overflow-hidden border border-amber-800/60 bg-black/70 backdrop-blur-sm"
        style={{ width: MINI_MAP_SIZE, height: MINI_MAP_SIZE + 28 }}
      >
        {/* Map name header */}
        <div className="px-2 py-1 text-center border-b border-amber-800/40">
          <span className="text-amber-300/80 text-[9px] font-bold tracking-wider uppercase">
            {currentMap.name}
          </span>
        </div>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={MINI_MAP_SIZE}
          height={MINI_MAP_SIZE}
          style={{ width: MINI_MAP_SIZE, height: MINI_MAP_SIZE }}
        />
      </div>
      {/* Legend */}
      <div className="flex gap-2 mt-1 justify-center flex-wrap">
        <LegendDot color={COLORS.teleport} label="Exit" />
        <LegendDot color={COLORS.shop} label="Shop" />
        <LegendDot color={COLORS.inn} label="Inn" />
        <LegendDot color={COLORS.savePoint} label="Save" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-0.5">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[8px] text-gray-400">{label}</span>
    </div>
  );
}
