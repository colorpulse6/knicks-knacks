"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useGameStore } from "../../stores/gameStore";
import ItemsScreen from "./ItemsScreen";
import StatusScreen from "./StatusScreen";
import EquipScreen from "./EquipScreen";
import LatticeScreen from "./LatticeScreen";
import QuestScreen from "./QuestScreen";
import SaveScreen from "./SaveScreen";
import ProfileScreen from "./ProfileScreen";

type MenuCategory = "profile" | "items" | "quests" | "equip" | "status" | "lattice" | "save";
type SaveMode = "save" | "load" | null;

interface GameMenuProps {
  onClose: () => void;
}

const MENU_CATEGORIES: { id: MenuCategory; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "items", label: "Items" },
  { id: "quests", label: "Quests" },
  { id: "equip", label: "Equip" },
  { id: "status", label: "Status" },
  { id: "lattice", label: "Lattice" },
  { id: "save", label: "Save" },
];

export default function GameMenu({ onClose }: GameMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>("profile");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [saveMode, setSaveMode] = useState<SaveMode>(null);
  const { party, inventory, playerPosition, currentMap } = useGameStore();

  // Check if player is at a save point
  const isAtSavePoint = currentMap?.events.some(
    (event) =>
      event.type === "save_point" &&
      event.x === playerPosition.x &&
      event.y === playerPosition.y
  ) ?? false;

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Close menu
      if (e.key === "Escape" || e.key === "m") {
        e.preventDefault();
        onClose();
        return;
      }

      // Navigate categories
      if (e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        setCategoryIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : MENU_CATEGORIES.length - 1;
          setSelectedCategory(MENU_CATEGORIES[newIndex].id);
          return newIndex;
        });
      }

      if (e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault();
        setCategoryIndex((prev) => {
          const newIndex = prev < MENU_CATEGORIES.length - 1 ? prev + 1 : 0;
          setSelectedCategory(MENU_CATEGORIES[newIndex].id);
          return newIndex;
        });
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Render content based on selected category
  const renderContent = () => {
    switch (selectedCategory) {
      case "profile":
        return <ProfileScreen />;
      case "items":
        return <ItemsScreen />;
      case "quests":
        return <QuestScreen />;
      case "equip":
        return <EquipScreen />;
      case "status":
        return <StatusScreen />;
      case "lattice":
        return <LatticeScreen />;
      case "save":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {isAtSavePoint ? (
              <>
                <p className="text-amber-400 mb-4">Temporal Distortion detected.</p>
                <p className="text-gray-400 text-sm mb-6">
                  This shimmering shrine allows you to record your journey.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSaveMode("save")}
                    className="px-6 py-3 bg-amber-700/50 hover:bg-amber-600/50 border border-amber-500/50 rounded flex items-center gap-2"
                  >
                    <Image
                      src="/sprites/ui/save_icon.png"
                      alt=""
                      width={24}
                      height={24}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <span className="text-lg hidden">💾</span>
                    <span>Save Game</span>
                  </button>
                  <button
                    onClick={() => setSaveMode("load")}
                    className="px-6 py-3 bg-cyan-700/50 hover:bg-cyan-600/50 border border-cyan-500/50 rounded flex items-center gap-2"
                  >
                    <Image
                      src="/sprites/ui/load_icon.png"
                      alt=""
                      width={24}
                      height={24}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <span className="text-lg hidden">📂</span>
                    <span>Load Game</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-2">No Temporal Distortion nearby.</p>
                <p className="text-gray-500 text-sm mb-6">
                  Find a shimmering shrine to save your progress.
                </p>
                <button
                  onClick={() => setSaveMode("load")}
                  className="px-6 py-3 bg-cyan-700/50 hover:bg-cyan-600/50 border border-cyan-500/50 rounded flex items-center gap-2"
                >
                  <Image
                    src="/sprites/ui/load_icon.png"
                    alt=""
                    width={24}
                    height={24}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <span className="text-lg hidden">📂</span>
                  <span>Load Game</span>
                </button>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Get party leader for display
  const partyLeader = party[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      {/* Save/Load screen overlay */}
      {saveMode && (
        <SaveScreen
          mode={saveMode}
          onClose={() => setSaveMode(null)}
          onComplete={() => setSaveMode(null)}
        />
      )}

      {/* Menu container */}
      <div className="w-[700px] h-[500px] bg-gray-900/95 border-2 border-amber-700/50 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-amber-700/30">
          <h2 className="text-amber-400 font-bold tracking-wide">MENU</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white px-2 py-1 text-sm"
          >
            [ESC]
          </button>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Categories */}
          <div className="w-32 bg-gray-800/30 border-r border-amber-700/30 py-2">
            {MENU_CATEGORIES.map((category, index) => {
              const isSelected = index === categoryIndex;
              const isDisabled = category.id === "save" && !isAtSavePoint;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    if (!isDisabled) {
                      setCategoryIndex(index);
                      setSelectedCategory(category.id);
                    }
                  }}
                  className={`
                    w-full px-4 py-2 text-left text-sm transition-colors
                    ${isSelected ? "bg-amber-700/30 text-amber-300" : ""}
                    ${isDisabled ? "text-gray-600 cursor-not-allowed" : "hover:bg-gray-700/30"}
                    ${!isSelected && !isDisabled ? "text-gray-300" : ""}
                  `}
                >
                  {isSelected && <span className="mr-2">▸</span>}
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Right content area */}
          <div className="flex-1 p-4 overflow-auto">{renderContent()}</div>
        </div>

        {/* Footer - Party status */}
        <div className="px-4 py-3 bg-gray-800/50 border-t border-amber-700/30">
          <div className="flex items-center justify-between">
            {/* Party member info */}
            <div className="flex items-center gap-4">
              {party.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm font-medium">
                    {member.name}
                  </span>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-red-400">HP</span>
                      <div className="w-16 h-1.5 bg-gray-700 rounded overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${(member.stats.hp / member.stats.maxHp) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-400 w-16">
                        {member.stats.hp}/{member.stats.maxHp}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-400">MP</span>
                      <div className="w-16 h-1.5 bg-gray-700 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(member.stats.mp / member.stats.maxMp) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-400 w-16">
                        {member.stats.mp}/{member.stats.maxMp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gold */}
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm">Gold:</span>
              <span className="text-white font-bold">{inventory.gold}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
