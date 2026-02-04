"use client";

import { useGameStore } from "../../stores/gameStore";

export default function HUD() {
  const { party, currentMap, playerPosition, inventory } = useGameStore();

  // Get active party members
  const activeParty = party.slice(0, 4);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Location name (top center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div className="bg-black/60 px-4 py-2 rounded text-sm">
          {currentMap?.name ?? "Unknown Location"}
        </div>
      </div>

      {/* Party status (top left) */}
      <div className="absolute top-4 left-4 space-y-2">
        {activeParty.map((char) => (
          <div
            key={char.id}
            className="rpg-box py-2 px-3 min-w-[180px] pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold">{char.name}</span>
              <span className="text-xs text-gray-400">Lv.{char.level}</span>
            </div>

            {/* HP Bar */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs w-8 text-green-400">HP</span>
              <div className="hp-bar flex-1">
                <div
                  className={`hp-bar-fill ${
                    char.stats.hp / char.stats.maxHp < 0.25 ? "hp-bar-low" : ""
                  }`}
                  style={{
                    width: `${(char.stats.hp / char.stats.maxHp) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs w-16 text-right">
                {char.stats.hp}/{char.stats.maxHp}
              </span>
            </div>

            {/* MP Bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs w-8 text-blue-400">MP</span>
              <div className="hp-bar flex-1">
                <div
                  className="mp-bar-fill"
                  style={{
                    width: `${(char.stats.mp / char.stats.maxMp) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs w-16 text-right">
                {char.stats.mp}/{char.stats.maxMp}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Gold (top right) */}
      <div className="absolute top-4 right-4">
        <div className="rpg-box py-2 px-4 pointer-events-auto">
          <span className="text-gold">💰</span>
          <span className="ml-2 text-sm">{inventory.gold} G</span>
        </div>
      </div>

      {/* Mini-map (bottom right) */}
      <div className="absolute bottom-4 right-4">
        <div className="rpg-box p-2 pointer-events-auto">
          <div
            className="relative bg-gray-900 rounded"
            style={{ width: 120, height: 90 }}
          >
            {/* Simple minimap representation */}
            {currentMap && (
              <>
                {/* Map outline */}
                <div
                  className="absolute bg-gray-700/50 rounded"
                  style={{
                    left: 4,
                    top: 4,
                    width: 112,
                    height: 82,
                  }}
                />

                {/* Player position indicator */}
                <div
                  className="absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  style={{
                    left: 4 + (playerPosition.x / currentMap.width) * 112,
                    top: 4 + (playerPosition.y / currentMap.height) * 82,
                    transform: "translate(-50%, -50%)",
                  }}
                />

                {/* NPCs on minimap */}
                {currentMap.npcs.map((npc) => (
                  <div
                    key={npc.id}
                    className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
                    style={{
                      left: 4 + (npc.x / currentMap.width) * 112,
                      top: 4 + (npc.y / currentMap.height) * 82,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}

                {/* Save points on minimap */}
                {currentMap.events
                  .filter((e) => e.type === "save_point")
                  .map((event) => (
                    <div
                      key={event.id}
                      className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"
                      style={{
                        left: 4 + (event.x / currentMap.width) * 112,
                        top: 4 + (event.y / currentMap.height) * 82,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controls hint (bottom center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="bg-black/60 px-4 py-2 rounded text-xs text-gray-400">
          Arrow Keys: Move • M: Menu • P: Pause
        </div>
      </div>
    </div>
  );
}
