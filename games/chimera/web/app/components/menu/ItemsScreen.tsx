"use client";

import { useState, useCallback, useEffect } from "react";
import { useGameStore } from "../../stores/gameStore";
import { getRarityColor, isConsumable } from "../../data/items";
import { getEffectDescription } from "../../types/item";
import type { Item, Character, InventorySlot } from "../../types";

type ItemsMode = "list" | "use" | "target";

export default function ItemsScreen() {
  const { inventory, party, useItem } = useGameStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<ItemsMode>("list");
  const [selectedItem, setSelectedItem] = useState<InventorySlot | null>(null);
  const [targetIndex, setTargetIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  // Filter to only show items with quantity > 0
  const itemSlots = inventory.items.filter((slot) => slot.quantity > 0);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Clear message on any key
      if (message) {
        setMessage(null);
      }

      if (mode === "list") {
        // Navigate item list
        if (e.key === "ArrowUp" || e.key === "w") {
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : itemSlots.length - 1));
        }
        if (e.key === "ArrowDown" || e.key === "s") {
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => (prev < itemSlots.length - 1 ? prev + 1 : 0));
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          if (itemSlots[selectedIndex]) {
            const slot = itemSlots[selectedIndex];
            if (isConsumable(slot.item) && slot.item.usableInField) {
              setSelectedItem(slot);
              setMode("use");
            }
          }
        }
      } else if (mode === "use") {
        // Confirm use or cancel
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          if (selectedItem && party.length > 0) {
            setTargetIndex(0);
            setMode("target");
          }
        }
        if (e.key === "Escape" || e.key === "Backspace") {
          e.preventDefault();
          e.stopPropagation();
          setMode("list");
          setSelectedItem(null);
        }
      } else if (mode === "target") {
        // Select target party member
        if (e.key === "ArrowUp" || e.key === "w") {
          e.preventDefault();
          e.stopPropagation();
          setTargetIndex((prev) => (prev > 0 ? prev - 1 : party.length - 1));
        }
        if (e.key === "ArrowDown" || e.key === "s") {
          e.preventDefault();
          e.stopPropagation();
          setTargetIndex((prev) => (prev < party.length - 1 ? prev + 1 : 0));
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          if (selectedItem && party[targetIndex]) {
            // Use the item
            const result = useItem(selectedItem.item.id, party[targetIndex].id);
            if (result) {
              setMessage(result);
            }
            setMode("list");
            setSelectedItem(null);
          }
        }
        if (e.key === "Escape" || e.key === "Backspace") {
          e.preventDefault();
          e.stopPropagation();
          setMode("use");
        }
      }
    },
    [mode, itemSlots, selectedIndex, selectedItem, party, targetIndex, useItem, message]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Get item type label
  const getItemTypeLabel = (item: Item): string => {
    switch (item.type) {
      case "consumable":
        return "Consumable";
      case "key":
        return "Key Item";
      case "treasure":
        return "Treasure";
      default:
        return item.type;
    }
  };

  if (itemSlots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No items in inventory.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message display */}
      {message && (
        <div className="mb-2 p-2 bg-green-900/30 border border-green-500/30 rounded text-green-400 text-sm">
          {message}
        </div>
      )}

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Item list */}
        <div className="flex-1 overflow-auto">
          <div className="space-y-1">
            {itemSlots.map((slot, index) => {
              const isSelected = index === selectedIndex && mode === "list";
              const rarityColor = getRarityColor(slot.item.rarity);

              return (
                <button
                  key={slot.item.id}
                  onClick={() => {
                    setSelectedIndex(index);
                    if (isConsumable(slot.item) && slot.item.usableInField) {
                      setSelectedItem(slot);
                      setMode("use");
                    }
                  }}
                  className={`
                    w-full px-3 py-2 text-left rounded transition-colors flex items-center justify-between
                    ${isSelected ? "bg-amber-700/30 border border-amber-500/50" : "hover:bg-gray-700/30 border border-transparent"}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && <span className="text-amber-400">▸</span>}
                    <span className={rarityColor}>{slot.item.name}</span>
                  </div>
                  <span className="text-gray-500 text-sm">x{slot.quantity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Item details panel */}
        <div className="w-56 bg-gray-800/30 rounded p-3 flex flex-col">
          {itemSlots[selectedIndex] && (
            <>
              <h3
                className={`font-bold mb-1 ${getRarityColor(itemSlots[selectedIndex].item.rarity)}`}
              >
                {itemSlots[selectedIndex].item.name}
              </h3>
              <p className="text-gray-500 text-xs mb-2">
                {getItemTypeLabel(itemSlots[selectedIndex].item)}
              </p>
              <p className="text-gray-300 text-sm">
                {itemSlots[selectedIndex].item.description}
              </p>
              {getEffectDescription(itemSlots[selectedIndex].item) && (
                <p className="text-cyan-400 text-sm mt-1 font-medium flex-1">
                  {getEffectDescription(itemSlots[selectedIndex].item)}
                </p>
              )}

              {/* Use prompt */}
              {mode === "use" && selectedItem && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-amber-400 text-sm mb-2">Use this item?</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-400">[Enter] Confirm</span>
                    <span className="text-gray-400">[Esc] Cancel</span>
                  </div>
                </div>
              )}

              {/* Target selection */}
              {mode === "target" && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-amber-400 text-sm mb-2">Select target:</p>
                  <div className="space-y-1">
                    {party.map((member, index) => (
                      <div
                        key={member.id}
                        className={`
                          px-2 py-1 rounded text-sm flex items-center justify-between
                          ${index === targetIndex ? "bg-amber-700/30 text-amber-300" : "text-gray-400"}
                        `}
                      >
                        <span>
                          {index === targetIndex && "▸ "}
                          {member.name}
                        </span>
                        <span className="text-xs">
                          {member.stats.hp}/{member.stats.maxHp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usability hint */}
              {mode === "list" && isConsumable(itemSlots[selectedIndex].item) && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  {itemSlots[selectedIndex].item.usableInField ? (
                    <span className="text-green-400 text-xs">[Enter] Use</span>
                  ) : (
                    <span className="text-gray-500 text-xs">Battle use only</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation hint */}
      <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-500">
        [↑/↓] Navigate • [Enter] Select • [Esc] Back
      </div>
    </div>
  );
}
