"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import type { BattleState, BattleAction } from "../../types/battle";
import type { AnimationEvent } from "../../types/animation";
import {
  initializeBattle,
  updateATB,
  getReadyActor,
  isPartyMember,
  queueCommand,
  executeNextCommand,
  processEnemyTurn,
  startBattle,
  checkBattleEnd,
} from "../../engine/battleEngine";
import { getRandomEncounter } from "../../data/enemies";
import { getBattleBackground } from "../../data/battleBackgrounds";
import {
  getStealableItems,
  selectItemToSteal,
  calculateStealChance,
} from "../../data/items";
import { useGameStore } from "../../stores/gameStore";
import PartyStatus from "./PartyStatus";
import CommandMenu from "./CommandMenu";
import BattleLog from "./BattleLog";
import DamageNumbers, { useDamageNumbers } from "./DamageNumbers";
import BattleAnimator, { useBattleAnimations } from "./BattleAnimator";
import EnemyDisplay from "./EnemyDisplay";
import VictoryScreen from "./VictoryScreen";
import { BATTLE_POSITIONS } from "../../data/animations";

interface BattleScreenProps {
  onBattleEnd: (victory: boolean) => void;
}

// Sprite size used for positioning (matches TARGET_SPRITE_SIZE in BattleAnimator)
const SPRITE_HEIGHT = 120;

/**
 * Get position for a damage number based on target
 * Places number above the sprite with slight random horizontal offset
 */
function getDamageNumberPosition(
  targetId: string,
  battleState: BattleState | null,
  isHeal: boolean = false
): { x: number; y: number } {
  // Small random horizontal offset to prevent perfect stacking
  const offsetX = (Math.random() - 0.5) * 40;

  if (!battleState) {
    return { x: 400 + offsetX, y: 80 };
  }

  // Find if target is a party member or enemy
  const partyIndex = battleState.party.findIndex(p => p.character.id === targetId);
  if (partyIndex >= 0) {
    const pos = BATTLE_POSITIONS.party[partyIndex] ?? { x: 100, y: 200 };
    // Position above sprite (sprite center - half height - buffer)
    return {
      x: pos.x + offsetX,
      y: pos.y - SPRITE_HEIGHT / 2 - 20
    };
  }

  const enemyIndex = battleState.enemies.findIndex(e => e.id === targetId);
  if (enemyIndex >= 0) {
    const pos = BATTLE_POSITIONS.enemies[enemyIndex] ?? { x: 500, y: 200 };
    // Position above sprite
    return {
      x: pos.x + offsetX,
      y: pos.y - SPRITE_HEIGHT / 2 - 20
    };
  }

  // Fallback for unknown targets
  return {
    x: isHeal ? 150 + offsetX : 500 + offsetX,
    y: 80
  };
}

export default function BattleScreen({ onBattleEnd }: BattleScreenProps) {
  const { party, removeItem, playerPosition, inventory, pendingBattleRewards, finalizeBattleRewards, updateBattle, battle: storeBattle } = useGameStore();

  // Check for boss battles that have custom backgrounds
  // Note: Enemy IDs are dynamically generated (e.g., "vorn_1738776000000_1"), so we check by name
  const vornEnemy = storeBattle?.enemies.find(e => e.name === "Bandit Chief Vorn");
  const bossId = vornEnemy ? "bandit_chief_vorn" : undefined;
  const battleBackground = getBattleBackground(playerPosition.mapId, bossId);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const { numbers, addNumber, removeNumber } = useDamageNumbers();
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const pendingAnimationsRef = useRef<AnimationEvent[]>([]);

  // Animation hooks
  const { triggerAttack, triggerMagic, triggerDamage, triggerDeath, triggerVictory, triggerCritical } = useBattleAnimations();

  // Track if battle has been initialized to prevent re-initialization
  const battleInitializedRef = useRef(false);

  // Initialize battle (sets up battleState, but doesn't start it yet)
  useEffect(() => {
    // Prevent re-initialization - this is crucial to avoid double battles
    // when endBattle updates party stats and clears storeBattle
    if (battleInitializedRef.current) {
      return;
    }

    // Wait until we have party data before initializing
    if (party.length === 0) {
      return;
    }

    // Check if there's a pre-initialized battle in the store (for boss/event battles)
    // Only use it if there are ALIVE enemies (hp > 0)
    const hasAliveEnemies = storeBattle &&
      storeBattle.enemies.length > 0 &&
      storeBattle.enemies.some(e => e.stats.hp > 0);

    if (hasAliveEnemies && storeBattle) {
      // Use the battle from the store (boss battles, scripted encounters)
      battleInitializedRef.current = true;
      setBattleState(storeBattle);
      return;
    }

    // Fallback: create random encounter (for random battles, test battles)
    const partyCharacters = party.map((char) => char);
    // Use varied encounters based on map area for enemy diversity
    const areaMap: Record<string, "forest" | "ruins" | "village" | "deep_ruins"> = {
      havenwood: "forest",
      havenwood_outskirts: "forest",
      bandit_camp: "forest",
      village: "village",
      ruins: "ruins",
      deep_ruins: "deep_ruins",
    };
    const area = areaMap[playerPosition.mapId] || "forest";
    // Use "normal" difficulty for more enemy variety
    const enemies = getRandomEncounter(area, "normal");

    // Safety check: if no enemies were generated, don't start a battle
    if (!enemies || enemies.length === 0) {
      console.warn("No enemies generated for battle, ending early");
      onBattleEnd(true);
      return;
    }

    battleInitializedRef.current = true;
    const initialState = initializeBattle(partyCharacters, enemies);
    setBattleState(initialState);
  }, [party, storeBattle, playerPosition.mapId, onBattleEnd]);

  // Separate effect to transition from intro to active phase
  // This is separate so it doesn't get cancelled by the initialization effect's cleanup
  useEffect(() => {
    if (battleState?.phase !== "intro") {
      return;
    }

    const introTimer = setTimeout(() => {
      setBattleState((prev) => prev ? startBattle(prev) : prev);
    }, 1000);

    return () => clearTimeout(introTimer);
  }, [battleState?.phase]);

  // Handle steal events from enemies
  useEffect(() => {
    if (!battleState?.pendingStealEvent) return;

    const stealEvent = battleState.pendingStealEvent;
    const stealableItems = getStealableItems(inventory);
    const selectedItem = selectItemToSteal(stealableItems);

    // Get actor name for log messages
    const thiefEnemy = battleState.enemies.find(e => e.id === stealEvent.thiefId);
    const thiefName = thiefEnemy?.name ?? "Enemy";
    const targetMember = battleState.party.find(p => p.character.id === stealEvent.targetId);
    const targetName = targetMember?.character.name ?? "the party";

    setBattleState(prev => {
      if (!prev) return prev;

      // Clear the pending event
      const newState = { ...prev, pendingStealEvent: undefined };

      // No items to steal
      if (!selectedItem) {
        return {
          ...newState,
          battleLog: [
            ...newState.battleLog,
            {
              timestamp: Date.now(),
              message: `${thiefName} tries to steal from ${targetName}... but finds nothing worth taking!`,
              type: "action" as const,
            }
          ]
        };
      }

      // Calculate steal success chance based on item rarity
      const successChance = calculateStealChance(
        selectedItem.rarity,
        stealEvent.thiefLuck,
        stealEvent.targetLuck
      );

      const roll = Math.random() * 100;
      const success = roll < successChance;

      if (success) {
        // Actually remove the item from inventory
        removeItem(selectedItem.id, 1);

        return {
          ...newState,
          battleLog: [
            ...newState.battleLog,
            {
              timestamp: Date.now(),
              message: `${thiefName} steals ${selectedItem.name} from ${targetName}!`,
              type: "action" as const,
            }
          ]
        };
      } else {
        // Steal failed
        return {
          ...newState,
          battleLog: [
            ...newState.battleLog,
            {
              timestamp: Date.now(),
              message: `${thiefName} tries to steal ${selectedItem.name}... but ${targetName} guards it well!`,
              type: "action" as const,
            }
          ]
        };
      }
    });
  }, [battleState?.pendingStealEvent, inventory, removeItem]);

  // Handle animation events (damage numbers are handled in setTimeout callbacks)
  const handleAnimationEvent = useCallback((_event: AnimationEvent) => {
    // Damage numbers are handled when parsing battle log after actions complete
    // This avoids duplicate numbers from animation events
  }, []);

  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!battleState || battleState.phase !== "active") {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Don't process commands while animating
    if (isAnimating) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
    lastTimeRef.current = timestamp;

    setBattleState((prev) => {
      if (!prev || prev.phase !== "active") return prev;

      // Update ATB gauges
      let newState = updateATB(prev, deltaTime);

      // Process command queue with animations
      if (newState.commandQueue.length > 0 && !isAnimating) {
        const command = newState.commandQueue[0];

        // Trigger animation based on action type
        if (command.action.type === "attack") {
          setIsAnimating(true);
          triggerAttack(command.actorId, command.action.targetId);

          // Process after animation completes
          setTimeout(() => {
            setBattleState(prevState => {
              if (!prevState) return prevState;
              const result = executeNextCommand(prevState);

              // Show damage numbers for attacks
              const lastLog = result.battleLog[result.battleLog.length - 1];
              if (lastLog && command.action.type === "attack") {
                const damageMatch = lastLog.message.match(/for (\d+) damage/);
                const isCritical = lastLog.message.includes("Critical hit!");

                if (damageMatch) {
                  const pos = getDamageNumberPosition(command.action.targetId, result);
                  addNumber(parseInt(damageMatch[1]), pos.x, pos.y, isCritical ? "critical" : "damage");
                }

                // Trigger critical visual effect
                if (isCritical) {
                  triggerCritical(command.action.targetId);
                }
              }

              // Check if target died
              result.enemies.forEach(e => {
                if (e.stats.hp <= 0 && prevState.enemies.find(pe => pe.id === e.id && pe.stats.hp > 0)) {
                  triggerDeath(e.id);
                }
              });

              return result;
            });
            setIsAnimating(false);
          }, 800);
        } else if (command.action.type === "magic") {
          setIsAnimating(true);
          const targetId = Array.isArray(command.action.targetId)
            ? command.action.targetId[0]
            : command.action.targetId;
          triggerMagic(command.actorId, targetId, command.action.abilityId);

          setTimeout(() => {
            setBattleState(prevState => {
              if (!prevState) return prevState;
              const result = executeNextCommand(prevState);

              // Show damage/heal numbers for magic
              const lastLog = result.battleLog[result.battleLog.length - 1];
              if (lastLog) {
                const damageMatch = lastLog.message.match(/for (\d+) damage/);
                const healMatch = lastLog.message.match(/Recovered (\d+) HP/);

                if (damageMatch) {
                  const pos = getDamageNumberPosition(targetId, result);
                  addNumber(parseInt(damageMatch[1]), pos.x, pos.y, "damage");
                } else if (healMatch) {
                  const pos = getDamageNumberPosition(targetId, result, true);
                  addNumber(parseInt(healMatch[1]), pos.x, pos.y, "heal");
                }
              }

              // Check if any enemies died
              result.enemies.forEach(e => {
                if (e.stats.hp <= 0 && prevState.enemies.find(pe => pe.id === e.id && pe.stats.hp > 0)) {
                  triggerDeath(e.id);
                }
              });

              return result;
            });
            setIsAnimating(false);
          }, 1000);
        } else if (command.action.type === "item") {
          // For items - consume from inventory and execute
          if (command.action.itemId) {
            removeItem(command.action.itemId, 1);
          }
          newState = executeNextCommand(newState);
        } else {
          // For defend, flee - execute immediately
          newState = executeNextCommand(newState);
        }
      }

      // Check for ready actors
      const readyActor = getReadyActor(newState);
      if (readyActor && !showCommandMenu && !isAnimating) {
        if (isPartyMember(newState, readyActor)) {
          // Player turn - show command menu
          setShowCommandMenu(true);
          return { ...newState, activeActorId: readyActor };
        } else {
          // Enemy turn - process AI
          newState = processEnemyTurn(newState, readyActor);
        }
      }

      return newState;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [battleState, showCommandMenu, isAnimating, triggerAttack, triggerMagic, triggerDeath, removeItem]);

  // Start game loop
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  // Toggle battle log with 'L' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "l" || e.key === "L") {
        setShowLogs(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track if victory has been processed to avoid re-running
  const victoryProcessedRef = useRef(false);

  // Handle battle end
  useEffect(() => {
    if (!battleState) return;

    if (battleState.phase === "victory" && !victoryProcessedRef.current) {
      victoryProcessedRef.current = true;

      // Trigger victory animation for all party members
      const aliveParty = battleState.party
        .filter(p => p.character.stats.hp > 0)
        .map(p => p.character.id);
      triggerVictory(aliveParty);

      // IMPORTANT: Sync local battle state to store before calculating rewards
      // This ensures endBattle gets the actual HP/MP values from the battle
      updateBattle({ party: battleState.party, enemies: battleState.enemies });

      // Calculate and store rewards ONCE when victory is detected
      // Pass enemies directly to avoid state sync timing issues
      finalizeBattleRewards(battleState.enemies);

      // Show victory screen after a brief delay for animations
      setTimeout(() => setShowVictoryScreen(true), 800);
    }
    if (battleState.phase === "defeat") {
      const timer = setTimeout(() => onBattleEnd(false), 2000);
      return () => clearTimeout(timer);
    }
    if (battleState.phase === "fled") {
      const timer = setTimeout(() => onBattleEnd(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [battleState, onBattleEnd, triggerVictory, finalizeBattleRewards, updateBattle]);

  // Handle victory screen completion
  const handleVictoryComplete = useCallback(() => {
    setShowVictoryScreen(false);
    onBattleEnd(true);
  }, [onBattleEnd]);

  // Handle player action selection
  const handleSelectAction = (action: BattleAction) => {
    if (!battleState || !battleState.activeActorId) return;

    setBattleState((prev) => {
      if (!prev || !prev.activeActorId) return prev;
      return queueCommand(prev, prev.activeActorId, action);
    });
    setShowCommandMenu(false);
  };

  if (!battleState) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <span className="text-white animate-pulse">Loading battle...</span>
      </div>
    );
  }

  const activePartyMember = battleState.party.find(
    (m) => m.character.id === battleState.activeActorId
  );

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: battleBackground.fallbackColor }}>
      {/* Battle Background */}
      <div className="absolute inset-0">
        {battleBackground.image ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${battleBackground.image})`,
              opacity: 1 - battleBackground.overlayOpacity,
            }}
          />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-gray-900 to-black opacity-30" />
        )}
        {/* Dark overlay for readability */}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: battleBackground.overlayOpacity }}
        />
      </div>

      {/* Glitch Effect Overlay */}
      {battleState.isGlitching && (
        <div className="absolute inset-0 bg-cyan-500/10 animate-pulse pointer-events-none" />
      )}

      {/* Damage Numbers */}
      <DamageNumbers numbers={numbers} onRemove={removeNumber} />

      {/* Battle Content */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Battle Phase Indicator */}
        {battleState.phase === "intro" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
            <h2 className="text-4xl font-bold text-white animate-pulse">
              Battle Start!
            </h2>
          </div>
        )}

        {battleState.phase === "victory" && showVictoryScreen && pendingBattleRewards && (
          <VictoryScreen
            rewards={pendingBattleRewards}
            onComplete={handleVictoryComplete}
          />
        )}

        {battleState.phase === "defeat" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
            <h2 className="text-4xl font-bold text-red-500">
              Game Over
            </h2>
          </div>
        )}

        {/* Enemy HP Display */}
        <div className="flex justify-center mb-2">
          <EnemyDisplay
            enemies={battleState.enemies}
            selectedEnemyId={null}
          />
        </div>

        {/* Battle Arena with Animated Characters */}
        <div className="flex-1 flex items-center justify-center">
          <BattleAnimator
            party={battleState.party}
            enemies={battleState.enemies}
            onAnimationEvent={handleAnimationEvent}
            onAnimationComplete={() => {}}
          />
        </div>

        {/* Battle UI */}
        <div className="flex gap-4 items-end">
          {/* Party Status */}
          <PartyStatus
            party={battleState.party}
            activeActorId={battleState.activeActorId}
          />

          {/* Command Menu */}
          <div className="flex-1">
            {showCommandMenu && activePartyMember && (
              <CommandMenu
                actor={activePartyMember}
                enemies={battleState.enemies}
                party={battleState.party}
                onSelectAction={handleSelectAction}
                onCancel={() => setShowCommandMenu(false)}
              />
            )}
          </div>
        </div>

        {/* Log Toggle Hint */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          Press [L] for battle log
        </div>
      </div>

      {/* Battle Log Overlay (toggleable) */}
      {showLogs && (
        <div className="absolute top-4 right-4 z-40 w-80 max-h-64 overflow-hidden">
          <div className="bg-black/80 border border-gray-700 rounded-lg p-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400 font-bold">Battle Log</span>
              <button
                onClick={() => setShowLogs(false)}
                className="text-gray-500 hover:text-white text-xs"
              >
                [L] Close
              </button>
            </div>
            <BattleLog entries={battleState.battleLog} />
          </div>
        </div>
      )}
    </div>
  );
}
