"use client";

import { useCallback, useEffect } from "react";
import { useGameStore } from "../../stores/gameStore";

// Village region definitions for the SVG map
const VILLAGE_REGIONS = [
  {
    id: "havenwood",
    name: "Village Square",
    description: "Central fountain plaza",
    x: 300,
    y: 230,
    width: 100,
    height: 70,
    color: "#f4e4c1",
    shape: "rect" as const,
  },
  {
    id: "havenwood_market",
    name: "Market Row",
    description: "Shops & guardhouse",
    x: 110,
    y: 220,
    width: 90,
    height: 60,
    color: "#f0dca8",
    shape: "rect" as const,
  },
  {
    id: "havenwood_residential",
    name: "Residential Lane",
    description: "Inn & herb garden",
    x: 500,
    y: 220,
    width: 90,
    height: 60,
    color: "#e8dcc8",
    shape: "rect" as const,
  },
  {
    id: "havenwood_waterfront",
    name: "Waterfront",
    description: "Docks & marsh",
    x: 280,
    y: 360,
    width: 100,
    height: 55,
    color: "#c8dce8",
    shape: "rect" as const,
  },
  {
    id: "havenwood_estate_road",
    name: "Estate Road",
    description: "Path to Lumina Estate",
    x: 310,
    y: 110,
    width: 70,
    height: 60,
    color: "#d8ceb8",
    shape: "rect" as const,
  },
  {
    id: "lumina_estate",
    name: "Lumina Estate",
    description: "Lady Lyra's manor",
    x: 305,
    y: 30,
    width: 80,
    height: 50,
    color: "#e8dcc8",
    shape: "rect" as const,
  },
  {
    id: "rusted_cog_tavern",
    name: "The Rusted Cog",
    description: "Tavern",
    x: 430,
    y: 170,
    width: 70,
    height: 40,
    color: "#3d2817",
    shape: "rect" as const,
  },
  {
    id: "havenwood_outskirts",
    name: "Outskirts",
    description: "Wilderness road",
    x: 30,
    y: 310,
    width: 80,
    height: 50,
    color: "#8ba87a",
    shape: "rect" as const,
  },
];

// Path connections between regions
const CONNECTIONS = [
  { from: "havenwood", to: "havenwood_market", label: "W" },
  { from: "havenwood", to: "havenwood_residential", label: "E" },
  { from: "havenwood", to: "havenwood_waterfront", label: "S" },
  { from: "havenwood", to: "havenwood_estate_road", label: "N" },
  { from: "havenwood", to: "rusted_cog_tavern", label: "" },
  { from: "havenwood_estate_road", to: "lumina_estate", label: "" },
  { from: "havenwood_market", to: "havenwood_outskirts", label: "" },
];

function getRegionCenter(id: string): { x: number; y: number } {
  const region = VILLAGE_REGIONS.find((r) => r.id === id);
  if (!region) return { x: 0, y: 0 };
  return { x: region.x + region.width / 2, y: region.y + region.height / 2 };
}

export default function VillageMap() {
  const currentMapId = useGameStore((s) => s.currentMap?.id ?? "havenwood");
  const toggleVillageMap = useGameStore((s) => s.toggleVillageMap);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        toggleVillageMap();
      }
    },
    [toggleVillageMap]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={toggleVillageMap}
    >
      <div
        className="w-[700px] h-[500px] bg-gray-900/95 border-2 border-amber-700/50 rounded-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-amber-700/30">
          <h2 className="text-amber-200 text-lg font-bold tracking-wide">
            Havenwood Village
          </h2>
          <span className="text-amber-600/60 text-xs">
            Tab / Esc to close
          </span>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative p-4">
          <svg
            viewBox="0 0 700 430"
            className="w-full h-full"
            style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }}
          >
            {/* Background parchment texture feel */}
            <defs>
              <filter id="rough">
                <feTurbulence
                  baseFrequency="0.04"
                  numOctaves="4"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="1.5"
                />
              </filter>
              {/* Pulsing animation for current location */}
              <radialGradient id="playerGlow">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Connection paths */}
            {CONNECTIONS.map((conn) => {
              const from = getRegionCenter(conn.from);
              const to = getRegionCenter(conn.to);
              return (
                <line
                  key={`${conn.from}-${conn.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#78716c"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                  opacity="0.5"
                />
              );
            })}

            {/* Region shapes */}
            {VILLAGE_REGIONS.map((region) => {
              const isCurrent = region.id === currentMapId;
              const isHavenwood = region.id.startsWith("havenwood") || region.id === "lumina_estate" || region.id === "rusted_cog_tavern";

              return (
                <g key={region.id}>
                  {/* Region box */}
                  <rect
                    x={region.x}
                    y={region.y}
                    width={region.width}
                    height={region.height}
                    rx={6}
                    ry={6}
                    fill={region.color}
                    fillOpacity={isCurrent ? 0.9 : isHavenwood ? 0.4 : 0.25}
                    stroke={isCurrent ? "#fbbf24" : "#a8a29e"}
                    strokeWidth={isCurrent ? 2.5 : 1}
                    filter="url(#rough)"
                  />

                  {/* Region name */}
                  <text
                    x={region.x + region.width / 2}
                    y={region.y + region.height / 2 - 4}
                    textAnchor="middle"
                    fill={isCurrent ? "#fef3c7" : "#d6d3d1"}
                    fontSize="11"
                    fontWeight={isCurrent ? "bold" : "normal"}
                    fontFamily="serif"
                  >
                    {region.name}
                  </text>

                  {/* Description subtitle */}
                  <text
                    x={region.x + region.width / 2}
                    y={region.y + region.height / 2 + 10}
                    textAnchor="middle"
                    fill={isCurrent ? "#fde68a" : "#a8a29e"}
                    fontSize="8"
                    fontFamily="serif"
                  >
                    {region.description}
                  </text>

                  {/* Current location indicator */}
                  {isCurrent && (
                    <>
                      <circle
                        cx={region.x + region.width / 2}
                        cy={region.y - 12}
                        r="8"
                        fill="url(#playerGlow)"
                      >
                        <animate
                          attributeName="r"
                          values="6;10;6"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="1;0.6;1"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle
                        cx={region.x + region.width / 2}
                        cy={region.y - 12}
                        r="4"
                        fill="#fbbf24"
                        stroke="#92400e"
                        strokeWidth="1.5"
                      />
                      <text
                        x={region.x + region.width / 2}
                        y={region.y - 24}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="serif"
                      >
                        YOU ARE HERE
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Compass rose */}
            <g transform="translate(630, 50)">
              <circle r="20" fill="none" stroke="#78716c" strokeWidth="0.5" opacity="0.4" />
              <text y="-24" textAnchor="middle" fill="#a8a29e" fontSize="10" fontFamily="serif">N</text>
              <text y="32" textAnchor="middle" fill="#a8a29e" fontSize="10" fontFamily="serif">S</text>
              <text x="-28" y="4" textAnchor="middle" fill="#a8a29e" fontSize="10" fontFamily="serif">W</text>
              <text x="28" y="4" textAnchor="middle" fill="#a8a29e" fontSize="10" fontFamily="serif">E</text>
              <line y1="-18" y2="18" stroke="#a8a29e" strokeWidth="1" opacity="0.5" />
              <line x1="-18" x2="18" stroke="#a8a29e" strokeWidth="1" opacity="0.5" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
