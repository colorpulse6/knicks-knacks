"use client";

import { useState } from "react";
import type { BattleCharacter, BattleAction, Enemy } from "../../types/battle";
import type { Ability, Item } from "../../types";
import { useGameStore } from "../../stores/gameStore";

interface CommandMenuProps {
  actor: BattleCharacter;
  enemies: Enemy[];
  party: BattleCharacter[];
  onSelectAction: (action: BattleAction) => void;
  onCancel?: () => void;
}

type MenuState = "main" | "magic" | "item" | "target_enemy" | "target_ally";

export default function CommandMenu({
  actor,
  enemies,
  party,
  onSelectAction,
  onCancel,
}: CommandMenuProps) {
  const [menuState, setMenuState] = useState<MenuState>("main");
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { inventory } = useGameStore();

  const aliveEnemies = enemies.filter((e) => e.stats.hp > 0);
  const aliveParty = party.filter((p) => p.character.stats.hp > 0);

  // Get battle-usable items from inventory
  const battleItems = inventory.items
    .filter((slot) => slot.quantity > 0 && slot.item?.usableInBattle);

  const handleMainCommand = (command: string) => {
    switch (command) {
      case "attack":
        setMenuState("target_enemy");
        break;
      case "magic":
        setMenuState("magic");
        break;
      case "item":
        setMenuState("item");
        break;
      case "defend":
        onSelectAction({ type: "defend" });
        break;
      case "flee":
        onSelectAction({ type: "flee" });
        break;
    }
  };

  const handleSelectAbility = (ability: Ability) => {
    if (ability.mpCost > actor.character.stats.mp) return;
    setSelectedAbility(ability);

    switch (ability.target) {
      case "single":
        setMenuState("target_enemy");
        break;
      case "all":
        // Target all enemies
        onSelectAction({
          type: "magic",
          abilityId: ability.id,
          targetId: aliveEnemies.map((e) => e.id),
        });
        break;
      case "ally":
      case "self":
        setMenuState("target_ally");
        break;
      case "all_allies":
        onSelectAction({
          type: "magic",
          abilityId: ability.id,
          targetId: aliveParty.map((p) => p.character.id),
        });
        break;
    }
  };

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    // Items typically target allies (healing) or self
    if (item.effect?.target === "all") {
      // Use on all allies
      onSelectAction({
        type: "item",
        itemId: item.id,
        targetId: aliveParty[0]?.character.id || actor.character.id,
      });
      resetMenu();
    } else {
      // Select target ally
      setMenuState("target_ally");
    }
  };

  const handleSelectTarget = (targetId: string) => {
    if (selectedAbility) {
      onSelectAction({
        type: "magic",
        abilityId: selectedAbility.id,
        targetId,
      });
    } else if (selectedItem) {
      onSelectAction({
        type: "item",
        itemId: selectedItem.id,
        targetId,
      });
    } else {
      onSelectAction({ type: "attack", targetId });
    }
    resetMenu();
  };

  const resetMenu = () => {
    setMenuState("main");
    setSelectedAbility(null);
    setSelectedItem(null);
  };

  const handleBack = () => {
    if (menuState === "main") {
      onCancel?.();
    } else {
      resetMenu();
    }
  };

  return (
    <div className="bg-gray-900/95 border border-cyan-600 rounded-lg p-4 min-w-64">
      {/* Header */}
      <div className="border-b border-gray-700 pb-2 mb-3">
        <span className="text-cyan-400 font-bold">{actor.character.name}</span>
        <span className="text-gray-400 text-sm ml-2">
          {menuState === "main" && "Select Action"}
          {menuState === "magic" && "Select Ability"}
          {menuState === "item" && "Select Item"}
          {menuState === "target_enemy" && "Select Target"}
          {menuState === "target_ally" && "Select Ally"}
        </span>
      </div>

      {/* Main Commands */}
      {menuState === "main" && (
        <div className="grid grid-cols-2 gap-2">
          <CommandButton onClick={() => handleMainCommand("attack")} color="red">
            Attack
          </CommandButton>
          <CommandButton onClick={() => handleMainCommand("magic")} color="blue">
            Magic
          </CommandButton>
          <CommandButton onClick={() => handleMainCommand("item")} color="green">
            Item
          </CommandButton>
          <CommandButton onClick={() => handleMainCommand("defend")} color="yellow">
            Defend
          </CommandButton>
          <CommandButton
            onClick={() => handleMainCommand("flee")}
            color="gray"
            className="col-span-2"
          >
            Flee
          </CommandButton>
        </div>
      )}

      {/* Magic Menu */}
      {menuState === "magic" && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {actor.character.abilities.length === 0 ? (
            <p className="text-gray-500 text-sm">No abilities available</p>
          ) : (
            actor.character.abilities.map((ability) => {
              const canAfford = ability.mpCost <= actor.character.stats.mp;
              return (
                <button
                  key={ability.id}
                  onClick={() => handleSelectAbility(ability)}
                  disabled={!canAfford}
                  className={`w-full text-left p-2 rounded transition-colors ${
                    canAfford
                      ? "bg-blue-900/50 hover:bg-blue-800/50"
                      : "bg-gray-800/50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="text-white">{ability.name}</span>
                    <span className="text-blue-400">{ability.mpCost} MP</span>
                  </div>
                  <p className="text-xs text-gray-400">{ability.description}</p>
                </button>
              );
            })
          )}
          <button
            onClick={handleBack}
            className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
          >
            Back
          </button>
        </div>
      )}

      {/* Item Menu */}
      {menuState === "item" && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {battleItems.length === 0 ? (
            <p className="text-gray-500 text-sm">No usable items</p>
          ) : (
            battleItems.map((slot) => (
              <button
                key={slot.item.id}
                onClick={() => handleSelectItem(slot.item)}
                className="w-full text-left p-2 bg-green-900/50 hover:bg-green-800/50 rounded"
              >
                <div className="flex justify-between">
                  <span className="text-white">{slot.item?.name}</span>
                  <span className="text-green-400">x{slot.quantity}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {slot.item?.description}
                </p>
              </button>
            ))
          )}
          <button
            onClick={handleBack}
            className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
          >
            Back
          </button>
        </div>
      )}

      {/* Enemy Target Selection */}
      {menuState === "target_enemy" && (
        <div className="space-y-2">
          {aliveEnemies.map((enemy) => (
            <button
              key={enemy.id}
              onClick={() => handleSelectTarget(enemy.id)}
              className="w-full text-left p-2 bg-red-900/50 hover:bg-red-800/50 rounded"
            >
              <div className="flex justify-between">
                <span className="text-white">{enemy.name}</span>
                <span className="text-red-400">
                  {enemy.stats.hp}/{enemy.stats.maxHp}
                </span>
              </div>
            </button>
          ))}
          <button
            onClick={handleBack}
            className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
          >
            Back
          </button>
        </div>
      )}

      {/* Ally Target Selection */}
      {menuState === "target_ally" && (
        <div className="space-y-2">
          {aliveParty.map((member) => (
            <button
              key={member.character.id}
              onClick={() => handleSelectTarget(member.character.id)}
              className="w-full text-left p-2 bg-green-900/50 hover:bg-green-800/50 rounded"
            >
              <div className="flex justify-between">
                <span className="text-white">{member.character.name}</span>
                <span className="text-green-400">
                  {member.character.stats.hp}/{member.character.stats.maxHp}
                </span>
              </div>
            </button>
          ))}
          <button
            onClick={handleBack}
            className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}

interface CommandButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  color: "red" | "blue" | "green" | "yellow" | "gray";
  className?: string;
}

function CommandButton({ onClick, children, color, className = "" }: CommandButtonProps) {
  const colorClasses = {
    red: "bg-red-900/50 hover:bg-red-800/50 border-red-600",
    blue: "bg-blue-900/50 hover:bg-blue-800/50 border-blue-600",
    green: "bg-green-900/50 hover:bg-green-800/50 border-green-600",
    yellow: "bg-yellow-900/50 hover:bg-yellow-800/50 border-yellow-600",
    gray: "bg-gray-800/50 hover:bg-gray-700/50 border-gray-600",
  };

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded border text-white font-bold transition-colors ${colorClasses[color]} ${className}`}
    >
      {children}
    </button>
  );
}
