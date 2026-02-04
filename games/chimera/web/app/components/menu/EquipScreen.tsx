"use client";

import { useState, useCallback, useEffect } from "react";
import { useGameStore } from "../../stores/gameStore";
import { getRarityColor } from "../../data/items";
import { getShardById, getShardColorClasses } from "../../data/shards";
import type { Item, EquipmentSlot, Equipment, Shard } from "../../types";

type EquipMode = "slots" | "items" | "shards";

const EQUIPMENT_SLOTS: { id: EquipmentSlot; label: string }[] = [
  { id: "weapon", label: "Weapon" },
  { id: "armor", label: "Armor" },
  { id: "helmet", label: "Helmet" },
  { id: "accessory", label: "Accessory" },
];

// Helper to check if equipment is an Item (has rarity) or Equipment (simpler type)
function isItem(equip: Equipment | Item | null | undefined): equip is Item {
  return equip !== null && equip !== undefined && "rarity" in equip;
}

// Helper to get stats from either Equipment or Item
function getEquipStats(equip: Equipment | Item | null | undefined) {
  if (!equip) return null;

  if ("equipStats" in equip && equip.equipStats) {
    return equip.equipStats;
  }

  return {
    attack: (equip as Equipment).attack,
    defense: (equip as Equipment).defense,
    magicAttack: (equip as Equipment).magicAttack,
    magicDefense: (equip as Equipment).magicDefense,
    speed: (equip as Equipment).speed,
  };
}

// Render shard slot indicators
function ShardSlotIndicator({ item }: { item: Item | null | undefined }) {
  if (!item || !isItem(item)) return null;

  const maxSlots = item.shardSlots ?? 0;
  const socketedShards = item.socketedShards ?? [];

  if (maxSlots === 0) return null;

  return (
    <span className="ml-2 text-xs">
      {Array.from({ length: maxSlots }).map((_, i) => {
        const shardId = socketedShards[i];
        const shard = shardId ? getShardById(shardId) : null;

        if (shard) {
          const colors = getShardColorClasses(shard.color);
          return (
            <span key={i} className={`${colors.text} mr-0.5`}>
              ◆
            </span>
          );
        }
        return (
          <span key={i} className="text-gray-600 mr-0.5">
            ·
          </span>
        );
      })}
    </span>
  );
}

export default function EquipScreen() {
  const {
    party,
    inventory,
    equipItem,
    unequipItem,
    socketShard,
    unsocketShard,
    getOwnedShards,
  } = useGameStore();
  const [characterIndex, setCharacterIndex] = useState(0);
  const [slotIndex, setSlotIndex] = useState(0);
  const [mode, setMode] = useState<EquipMode>("slots");
  const [itemIndex, setItemIndex] = useState(0);
  const [shardIndex, setShardIndex] = useState(0);

  const character = party[characterIndex];

  // Get available equipment for selected slot
  const getAvailableEquipment = (slot: EquipmentSlot): Item[] => {
    const slotTypeMap: Record<EquipmentSlot, Item["type"]> = {
      weapon: "weapon",
      armor: "armor",
      helmet: "helmet",
      accessory: "accessory",
    };

    const targetType = slotTypeMap[slot];

    const inventoryItems = inventory.items
      .filter((s) => s.item.type === targetType && s.quantity > 0)
      .map((s) => s.item);

    return inventoryItems;
  };

  const selectedSlot = EQUIPMENT_SLOTS[slotIndex];
  const availableItems = getAvailableEquipment(selectedSlot.id);
  const currentEquipped = character?.equipment?.[selectedSlot.id] as Item | undefined;

  // Get socketed shards for current equipment
  const socketedShardIds = (currentEquipped?.socketedShards ?? []) as string[];
  const socketedShards = socketedShardIds
    .map((id) => getShardById(id))
    .filter((s): s is Shard => s !== undefined);

  // Get available shards from inventory
  const ownedShards = getOwnedShards();
  const availableShards = ownedShards
    .map((s) => ({ shard: getShardById(s.shardId), quantity: s.quantity }))
    .filter((s): s is { shard: Shard; quantity: number } => s.shard !== undefined);

  // Can socket shards?
  const maxSlots = currentEquipped?.shardSlots ?? 0;
  const canSocketMore = socketedShardIds.length < maxSlots;

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (mode === "slots") {
        if (e.key === "ArrowUp" || e.key === "w") {
          e.preventDefault();
          e.stopPropagation();
          setSlotIndex((prev) => (prev > 0 ? prev - 1 : EQUIPMENT_SLOTS.length - 1));
        }
        if (e.key === "ArrowDown" || e.key === "s") {
          e.preventDefault();
          e.stopPropagation();
          setSlotIndex((prev) => (prev < EQUIPMENT_SLOTS.length - 1 ? prev + 1 : 0));
        }
        if (e.key === "ArrowLeft" || e.key === "a") {
          e.preventDefault();
          e.stopPropagation();
          if (party.length > 1) {
            setCharacterIndex((prev) => (prev > 0 ? prev - 1 : party.length - 1));
          }
        }
        if (e.key === "ArrowRight" || e.key === "d") {
          e.preventDefault();
          e.stopPropagation();
          if (party.length > 1) {
            setCharacterIndex((prev) => (prev < party.length - 1 ? prev + 1 : 0));
          }
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          setItemIndex(0);
          setMode("items");
        }
        // Tab to open shard management
        if (e.key === "Tab" && currentEquipped && maxSlots > 0) {
          e.preventDefault();
          e.stopPropagation();
          setShardIndex(0);
          setMode("shards");
        }
      } else if (mode === "items") {
        const totalItems = availableItems.length + (currentEquipped ? 1 : 0);

        if (e.key === "ArrowUp" || e.key === "w") {
          e.preventDefault();
          e.stopPropagation();
          setItemIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        }
        if (e.key === "ArrowDown" || e.key === "s") {
          e.preventDefault();
          e.stopPropagation();
          setItemIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();

          if (currentEquipped && itemIndex === 0) {
            unequipItem(character.id, selectedSlot.id);
          } else {
            const adjustedIndex = currentEquipped ? itemIndex - 1 : itemIndex;
            const item = availableItems[adjustedIndex];
            if (item) {
              equipItem(item.id, character.id, selectedSlot.id);
            }
          }
          setMode("slots");
        }
        if (e.key === "Escape" || e.key === "Backspace") {
          e.preventDefault();
          e.stopPropagation();
          setMode("slots");
        }
      } else if (mode === "shards") {
        // Shards mode: first section is socketed shards (remove), second is available (add)
        const totalSocketed = socketedShards.length;
        const totalAvailable = canSocketMore ? availableShards.length : 0;
        const totalItems = totalSocketed + totalAvailable;

        if (e.key === "ArrowUp" || e.key === "w") {
          e.preventDefault();
          e.stopPropagation();
          setShardIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, totalItems - 1)));
        }
        if (e.key === "ArrowDown" || e.key === "s") {
          e.preventDefault();
          e.stopPropagation();
          setShardIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();

          if (shardIndex < totalSocketed) {
            // Unsocket
            const shardId = socketedShardIds[shardIndex];
            if (shardId) {
              unsocketShard(character.id, selectedSlot.id, shardId);
            }
          } else {
            // Socket
            const availIndex = shardIndex - totalSocketed;
            const shardData = availableShards[availIndex];
            if (shardData && canSocketMore) {
              socketShard(character.id, selectedSlot.id, shardData.shard.id);
            }
          }
        }
        if (e.key === "Escape" || e.key === "Backspace" || e.key === "Tab") {
          e.preventDefault();
          e.stopPropagation();
          setMode("slots");
        }
      }
    },
    [
      mode,
      party.length,
      availableItems,
      currentEquipped,
      character,
      selectedSlot,
      equipItem,
      unequipItem,
      socketShard,
      unsocketShard,
      maxSlots,
      socketedShards,
      socketedShardIds,
      availableShards,
      canSocketMore,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!character) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No character selected.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Character selector */}
      {party.length > 1 && (
        <div className="flex gap-2 mb-4 pb-2 border-b border-gray-700/50">
          {party.map((member, index) => (
            <button
              key={member.id}
              onClick={() => setCharacterIndex(index)}
              className={`
                px-4 py-2 rounded text-sm transition-colors
                ${index === characterIndex ? "bg-amber-700/30 text-amber-300 border border-amber-500/50" : "text-gray-400 hover:bg-gray-700/30"}
              `}
            >
              {member.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Equipment slots */}
        <div className="w-56">
          <h4 className="text-gray-400 text-sm mb-2">Equipment Slots</h4>
          <div className="space-y-1">
            {EQUIPMENT_SLOTS.map((slot, index) => {
              const equipped = character.equipment?.[slot.id] as Item | undefined;
              const isSelected = index === slotIndex && mode === "slots";
              const rarityColor = isItem(equipped) ? getRarityColor(equipped.rarity) : "text-gray-300";

              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    setSlotIndex(index);
                    setMode("items");
                    setItemIndex(0);
                  }}
                  className={`
                    w-full px-3 py-2 text-left rounded transition-colors
                    ${isSelected ? "bg-amber-700/30 border border-amber-500/50" : "hover:bg-gray-700/30 border border-transparent"}
                  `}
                >
                  <div className="text-gray-500 text-xs">{slot.label}</div>
                  <div className={`flex items-center ${equipped ? rarityColor : "text-gray-600"}`}>
                    {isSelected && mode === "slots" && "▸ "}
                    {equipped?.name || "— Empty —"}
                    {equipped && <ShardSlotIndicator item={equipped} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Available items / selection / shards */}
        <div className="flex-1 bg-gray-800/30 rounded p-3">
          {mode === "items" ? (
            <>
              <h4 className="text-amber-400 text-sm mb-2">
                Select {selectedSlot.label}
              </h4>
              <div className="space-y-1 max-h-48 overflow-auto">
                {currentEquipped && (
                  <button
                    onClick={() => {
                      unequipItem(character.id, selectedSlot.id);
                      setMode("slots");
                    }}
                    className={`
                      w-full px-3 py-2 text-left rounded transition-colors
                      ${itemIndex === 0 ? "bg-amber-700/30 border border-amber-500/50" : "hover:bg-gray-700/30 border border-transparent"}
                    `}
                  >
                    <span className="text-red-400">
                      {itemIndex === 0 && "▸ "}Remove {currentEquipped.name}
                    </span>
                  </button>
                )}

                {availableItems.map((item, index) => {
                  const adjustedIndex = currentEquipped ? index + 1 : index;
                  const isSelected = adjustedIndex === itemIndex;
                  const isCurrentlyEquipped = currentEquipped?.id === item.id;
                  const stats = getEquipStats(item);
                  const slots = item.shardSlots ?? 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        equipItem(item.id, character.id, selectedSlot.id);
                        setMode("slots");
                      }}
                      className={`
                        w-full px-3 py-2 text-left rounded transition-colors
                        ${isSelected ? "bg-amber-700/30 border border-amber-500/50" : "hover:bg-gray-700/30 border border-transparent"}
                        ${isCurrentlyEquipped ? "opacity-50" : ""}
                      `}
                      disabled={isCurrentlyEquipped}
                    >
                      <div className="flex items-center justify-between">
                        <span className={getRarityColor(item.rarity)}>
                          {isSelected && "▸ "}
                          {item.name}
                          {slots > 0 && (
                            <span className="text-gray-500 ml-2">
                              [{Array(slots).fill("·").join("")}]
                            </span>
                          )}
                        </span>
                        {isCurrentlyEquipped && (
                          <span className="text-gray-500 text-xs">Equipped</span>
                        )}
                      </div>
                      {stats && (
                        <div className="text-xs text-gray-500 mt-1">
                          {stats.attack && `ATK +${stats.attack} `}
                          {stats.defense && `DEF +${stats.defense} `}
                          {stats.magicAttack && `MAG +${stats.magicAttack} `}
                          {stats.magicDefense && `MDEF +${stats.magicDefense} `}
                          {stats.speed && `SPD +${stats.speed} `}
                        </div>
                      )}
                    </button>
                  );
                })}

                {availableItems.length === 0 && !currentEquipped && (
                  <p className="text-gray-500 text-sm py-2">
                    No equipment available for this slot.
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-700/50 text-xs text-gray-500">
                [Enter] Select • [Esc] Cancel
              </div>
            </>
          ) : mode === "shards" ? (
            <>
              <h4 className="text-purple-400 text-sm mb-2">
                Manage Shards: {currentEquipped?.name}
              </h4>

              {/* Socketed shards section */}
              <div className="mb-3">
                <p className="text-gray-500 text-xs mb-1">
                  Socketed ({socketedShards.length}/{maxSlots}):
                </p>
                {socketedShards.length > 0 ? (
                  <div className="space-y-1">
                    {socketedShards.map((shard, index) => {
                      const isSelected = shardIndex === index;
                      const colors = getShardColorClasses(shard.color);

                      return (
                        <button
                          key={`socketed-${index}`}
                          onClick={() => unsocketShard(character.id, selectedSlot.id, shard.id)}
                          className={`
                            w-full px-3 py-2 text-left rounded transition-colors
                            ${isSelected ? "bg-purple-700/30 border border-purple-500/50" : "hover:bg-gray-700/30 border border-transparent"}
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span className={colors.text}>
                              {isSelected && "▸ "}◆ {shard.name}
                            </span>
                            <span className="text-red-400 text-xs">[Remove]</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {getShardEffectText(shard)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm px-3 py-2">No shards socketed</p>
                )}
              </div>

              {/* Available shards section */}
              {canSocketMore && availableShards.length > 0 && (
                <div className="border-t border-gray-700/50 pt-3">
                  <p className="text-gray-500 text-xs mb-1">Available Shards:</p>
                  <div className="space-y-1 max-h-32 overflow-auto">
                    {availableShards.map((shardData, index) => {
                      const adjustedIndex = socketedShards.length + index;
                      const isSelected = shardIndex === adjustedIndex;
                      const colors = getShardColorClasses(shardData.shard.color);

                      return (
                        <button
                          key={`available-${shardData.shard.id}`}
                          onClick={() =>
                            socketShard(character.id, selectedSlot.id, shardData.shard.id)
                          }
                          className={`
                            w-full px-3 py-2 text-left rounded transition-colors
                            ${isSelected ? "bg-purple-700/30 border border-purple-500/50" : "hover:bg-gray-700/30 border border-transparent"}
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span className={colors.text}>
                              {isSelected && "▸ "}◇ {shardData.shard.name}
                            </span>
                            <span className="text-gray-500 text-xs">x{shardData.quantity}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {getShardEffectText(shardData.shard)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!canSocketMore && maxSlots > 0 && (
                <p className="text-gray-500 text-sm mt-2">All shard slots are full.</p>
              )}

              {availableShards.length === 0 && canSocketMore && (
                <p className="text-gray-500 text-sm mt-2">No shards in inventory.</p>
              )}

              <div className="mt-3 pt-2 border-t border-gray-700/50 text-xs text-gray-500">
                [Enter] Socket/Remove • [Tab/Esc] Back
              </div>
            </>
          ) : (
            <>
              <h4 className="text-gray-400 text-sm mb-2">Current Equipment</h4>
              {currentEquipped ? (
                <div>
                  <p
                    className={`font-bold ${isItem(currentEquipped) ? getRarityColor(currentEquipped.rarity) : "text-gray-300"}`}
                  >
                    {currentEquipped.name}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">{currentEquipped.description}</p>

                  {/* Stats */}
                  {(() => {
                    const stats = getEquipStats(currentEquipped);
                    if (!stats) return null;
                    return (
                      <div className="mt-2 text-sm">
                        {stats.attack && <p className="text-green-400">ATK +{stats.attack}</p>}
                        {stats.defense && <p className="text-blue-400">DEF +{stats.defense}</p>}
                        {stats.magicAttack && (
                          <p className="text-purple-400">MAG +{stats.magicAttack}</p>
                        )}
                        {stats.magicDefense && (
                          <p className="text-cyan-400">MDEF +{stats.magicDefense}</p>
                        )}
                        {stats.speed && <p className="text-yellow-400">SPD +{stats.speed}</p>}
                      </div>
                    );
                  })()}

                  {/* Shard slots display */}
                  {maxSlots > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-700/50">
                      <p className="text-gray-500 text-xs mb-1">
                        Shard Slots ({socketedShards.length}/{maxSlots}):
                      </p>
                      {socketedShards.length > 0 ? (
                        <div className="space-y-1">
                          {socketedShards.map((shard, i) => {
                            const colors = getShardColorClasses(shard.color);
                            return (
                              <div key={i} className="flex items-center text-sm">
                                <span className={`${colors.text} mr-2`}>◆</span>
                                <span className={colors.text}>{shard.name}</span>
                                <span className="text-gray-500 ml-2">- {getShardEffectText(shard)}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">Empty - Press [Tab] to add shards</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No equipment in this slot.</p>
              )}

              <div className="mt-4 pt-2 border-t border-gray-700/50 text-xs text-gray-500">
                [Enter] Change equipment{maxSlots > 0 && " • [Tab] Manage shards"}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation hint */}
      <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-500">
        {mode === "slots" ? (
          <>
            [↑/↓] Select slot • [Enter] Change{maxSlots > 0 && " • [Tab] Shards"}
            {party.length > 1 && " • [←/→] Switch character"}
          </>
        ) : mode === "items" ? (
          <>[↑/↓] Select item • [Enter] Equip • [Esc] Cancel</>
        ) : (
          <>[↑/↓] Select shard • [Enter] Socket/Remove • [Tab/Esc] Back</>
        )}
      </div>
    </div>
  );
}

// Helper to get shard effect text
function getShardEffectText(shard: Shard): string {
  const { type, value } = shard.effect;
  switch (type) {
    case "attack_bonus":
      return `ATK +${value}`;
    case "defense_bonus":
      return `DEF +${value}`;
    case "magic_bonus":
      return `MAG +${value}`;
    case "speed_bonus":
      return `SPD +${value}`;
    case "hp_bonus":
      return `HP +${value}`;
    case "mp_bonus":
      return `MP +${value}`;
    case "crit_bonus":
      return `Crit +${value}%`;
    case "counter_chance":
      return `Counter ${value}%`;
    case "hp_regen":
      return `Regen ${value} HP/turn`;
    case "mp_regen":
      return `Regen ${value} MP/turn`;
    case "lifesteal":
      return `Lifesteal ${value}%`;
    case "status_resist":
      return `Status Resist ${value}%`;
    case "first_strike":
      return `First Strike ${value}%`;
    case "exp_bonus":
      return `EXP +${value}%`;
    case "gold_bonus":
      return `Gold +${value}%`;
    default:
      return `${type} +${value}`;
  }
}
