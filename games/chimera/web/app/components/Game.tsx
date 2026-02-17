"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useGameStore } from "../stores/gameStore";
import MapView from "./world/MapView";
import TitleScreen from "./screens/TitleScreen";
import IntroCinematic from "./screens/IntroCinematic";
import SystemBootScreen from "./screens/SystemBootScreen";
import ExecutionScene from "./screens/ExecutionScene";
import DesertAwakening from "./screens/DesertAwakening";
import DesertCollapse from "./screens/DesertCollapse";
import GardenAwakeningOverlay from "./screens/GardenAwakeningOverlay";
import BattleScreen from "./combat/BattleScreen";
import BattleTransition from "./BattleTransition";
import MapTransition from "./MapTransition";
import { GameMenu } from "./menu";
import LevelUpNotification from "./ui/LevelUpNotification";
import { initializeBattle } from "../engine/battleEngine";
import {
  canInteract,
  getEventPlayerIsFacing,
  getInteractionPrompt,
  getNpcPlayerIsFacing,
} from "../engine/interactionEngine";
import DialogueBox from "./ui/DialogueBox";
import QuestCompleteScreen from "./ui/QuestCompleteScreen";
import { ShopScreen } from "./shop";
import SaveScreen from "./menu/SaveScreen";
import { InnScreen } from "./inn";
import VillageMap from "./map/VillageMap";
import MiniMap from "./map/MiniMap";
import MapTitleCard from "./ui/MapTitleCard";

export default function Game() {
  const {
    phase,
    setPhase,
    newGame,
    completeIntroCinematic,
    completeSystemBoot,
    completeExecutionScene,
    completeDesertAwakening,
    completeDesertCollapse,
    movePlayer,
    toggleMenu,
    togglePause,
    endBattle,
    party,
    pendingEncounter,
    isTransitioning,
    clearPendingEncounter,
    startBattle,
    currentMap,
    playerPosition,
    loadMap,
    showMenu,
    showSaveScreen,
    closeSaveScreen,
    showInn,
    showVillageMap,
    toggleVillageMap,
    interact,
    openedChests,
    pendingMapTransition,
    executeMapTransition,
    clearMapTransition,
    adminMode,
    battlesPaused,
    toggleAdminMode,
    toggleBattlesPaused,
    toggleCollisionDebug,
    activeDialogue,
    pendingQuestComplete,
    clearQuestComplete,
    desertCollapsing,
    gardenAwakeningPhase,
    setGardenAwakeningPhase,
    completeGardenAwakening,
  } = useGameStore();

  // Local state for visual transition (battle)
  const [showTransition, setShowTransition] = useState(false);

  // Local state for map transition
  const [showMapTransition, setShowMapTransition] = useState(false);

  // Notification state for chest opening, etc.
  const [notification, setNotification] = useState<string | null>(null);

  // Compute interaction prompt if player is facing an interactable object or NPC
  const interactionPrompt = useMemo(() => {
    if (!currentMap || phase !== "exploring") return null;

    // Check for shop event at player's current position (standing on shop door)
    const shopEvent = currentMap.events.find(
      (e) => e.type === "shop" &&
             e.x === playerPosition.x &&
             e.y === playerPosition.y
    );
    if (shopEvent) {
      const data = shopEvent.data as { message?: string };
      return data.message || "Enter Shop";
    }

    // Check for NPC first
    const npc = getNpcPlayerIsFacing(
      currentMap,
      playerPosition.x,
      playerPosition.y,
      playerPosition.facing
    );

    if (npc) {
      return `Talk to ${npc.name}`;
    }

    const canInteractNow = canInteract(
      currentMap,
      playerPosition.x,
      playerPosition.y,
      playerPosition.facing
    );

    if (!canInteractNow) return null;

    const event = getEventPlayerIsFacing(
      currentMap,
      playerPosition.x,
      playerPosition.y,
      playerPosition.facing
    );

    if (!event) return null;

    // Check if chest is already opened
    if (event.type === "treasure" && (event.triggered || openedChests.has(event.id))) {
      return null; // Don't show prompt for opened chests
    }

    // Check if collectible is already collected
    if (event.type === "collectible" && (event.triggered || openedChests.has(event.id))) {
      return null;
    }

    return getInteractionPrompt(event);
  }, [currentMap, playerPosition, phase, openedChests]);

  // Watch for pending encounters and trigger transition
  useEffect(() => {
    if (pendingEncounter && isTransitioning && !showTransition) {
      setShowTransition(true);
    }
  }, [pendingEncounter, isTransitioning, showTransition]);

  // Watch for pending map transitions and trigger fade
  useEffect(() => {
    if (pendingMapTransition && !showMapTransition) {
      setShowMapTransition(true);
    }
  }, [pendingMapTransition, showMapTransition]);

  // Handle map transition midpoint - switch maps while screen is black
  const handleMapTransitionMidpoint = useCallback(() => {
    executeMapTransition();
  }, [executeMapTransition]);

  // Handle map transition complete - fade finished
  const handleMapTransitionComplete = useCallback(() => {
    setShowMapTransition(false);
    clearMapTransition();
  }, [clearMapTransition]);

  // Handle transition complete - start the battle
  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);

    // Get fresh state and start battle
    const state = useGameStore.getState();
    if (state.pendingEncounter && state.party.length > 0) {
      const battleState = initializeBattle(state.party, state.pendingEncounter);
      startBattle(battleState);
      clearPendingEncounter();
    }
  }, [startBattle, clearPendingEncounter]);

  // Handle battle end
  const handleBattleEnd = useCallback((victory: boolean) => {
    endBattle(victory);
  }, [endBattle]);

  // Handle map teleport (for traveling between areas)
  const handleTeleport = useCallback((targetMapId: string, targetX: number, targetY: number) => {
    loadMap(targetMapId);
    useGameStore.setState({
      playerPosition: {
        x: targetX,
        y: targetY,
        mapId: targetMapId,
        facing: "down",
      },
    });
  }, [loadMap]);

  // Input handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phase === "title") {
        if (e.key === "Enter" || e.key === " ") {
          newGame();
        }
        return;
      }

      // Don't accept input during transition, overlays, or desert collapse
      if (isTransitioning || showTransition || showMapTransition || showSaveScreen || showInn || showVillageMap || activeDialogue || pendingQuestComplete || desertCollapsing) return;

      // Garden awakening: pan/text phases block all game input (overlay has its own keyboard handler)
      // Wake phase: intercept movement keys to trigger wake-up
      if (gardenAwakeningPhase === "pan" || gardenAwakeningPhase === "text") return;
      if (gardenAwakeningPhase === "wake") {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
          e.preventDefault();
          completeGardenAwakening();
        }
        return;
      }

      if (phase === "exploring") {
        switch (e.key) {
          case "ArrowUp":
          case "w":
            movePlayer(0, -1);
            break;
          case "ArrowDown":
          case "s":
            movePlayer(0, 1);
            break;
          case "ArrowLeft":
          case "a":
            movePlayer(-1, 0);
            break;
          case "ArrowRight":
          case "d":
            movePlayer(1, 0);
            break;
          case "Escape":
          case "m":
            toggleMenu();
            break;
          case "Tab":
            e.preventDefault();
            toggleVillageMap();
            break;
          case "p":
            togglePause();
            break;
          case "Enter":
          case " ":
            // Interact with object in front of player
            if (currentMap) {
              const message = interact();
              if (message) {
                setNotification(message);
                // Auto-hide notification after 3 seconds
                setTimeout(() => setNotification(null), 3000);
              }
            }
            break;
          // Quick travel keys for testing
          case "1":
            handleTeleport("havenwood", 30, 24);
            break;
          case "2":
            handleTeleport("whispering_ruins", 5, 15);
            break;
          case "3":
            handleTeleport("havenwood_market", 24, 16);
            break;
          case "4":
            handleTeleport("havenwood_residential", 12, 8);
            break;
          case "5":
            handleTeleport("havenwood_waterfront", 12, 16);
            break;
          case "6":
            handleTeleport("havenwood_estate_road", 15, 30);
            break;
          case "7":
            handleTeleport("havenwood_outskirts", 17, 12);
            break;
          case "8":
            handleTeleport("lumina_estate", 20, 15);
            break;
          case "9":
            handleTeleport("rusted_cog_tavern", 7, 10);
            break;
          case "f":
            handleTeleport("bandit_camp", 15, 28);
            break;
          case "g":
            handleTeleport("bandit_tent", 5, 5);
            break;
          case "h":
            handleTeleport("bandit_cellar", 5, 5);
            break;
          case "j":
            handleTeleport("hidden_laboratory", 10, 10);
            break;
          case "k":
            handleTeleport("whispering_ruins_lower", 10, 10);
            break;
          // Desert & rooftop route
          case "l":
            handleTeleport("stranger_tent", 5, 8);
            break;
          case "n":
            handleTeleport("desert_plateau", 10, 10);
            break;
          case "o":
            handleTeleport("palace_garden", 10, 8);
            break;
          case "i":
            handleTeleport("havenwood_rooftops_west", 10, 8);
            break;
          case "t":
            handleTeleport("havenwood_rooftops_east", 10, 8);
            break;
          case "u":
            handleTeleport("havenwood_alley", 7, 10);
            break;
          // Test battle trigger (temporary - press 'b' to start battle)
          case "b":
            if (party.length > 0) {
              setPhase("combat");
            }
            break;
          // Admin mode toggle
          case "`":
            toggleAdminMode();
            break;
          // Collision debug overlay toggle
          case "0":
            toggleCollisionDebug();
            break;
        }
      }
    },
    [phase, newGame, movePlayer, toggleMenu, toggleVillageMap, togglePause, setPhase, party, isTransitioning, showTransition, showMapTransition, showSaveScreen, showInn, showVillageMap, activeDialogue, pendingQuestComplete, handleTeleport, currentMap, interact, toggleAdminMode, toggleCollisionDebug, desertCollapsing, gardenAwakeningPhase, completeGardenAwakening]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Render based on phase
  const renderContent = () => {
    switch (phase) {
      case "title":
        return <TitleScreen />;
      case "intro_cinematic":
        return <IntroCinematic onComplete={completeIntroCinematic} />;
      case "system_boot":
        return <SystemBootScreen onComplete={completeSystemBoot} />;
      case "execution_scene":
        return <ExecutionScene onComplete={completeExecutionScene} />;
      case "desert_awakening":
        return <DesertAwakening onComplete={completeDesertAwakening} />;
      case "desert_collapse":
        return <DesertCollapse onComplete={completeDesertCollapse} />;
      case "exploring":
        return (
          <div className="relative w-full h-screen bg-black">
            <MapView />

            {/* Garden awakening overlay */}
            {gardenAwakeningPhase && (
              <GardenAwakeningOverlay
                phase={gardenAwakeningPhase}
                onTextComplete={() => setGardenAwakeningPhase("wake")}
                onSkip={completeGardenAwakening}
              />
            )}

            {/* Area title card */}
            {!gardenAwakeningPhase && <MapTitleCard />}

            {/* HUD Overlay — hidden during garden awakening */}
            {!gardenAwakeningPhase && <div className="absolute top-4 left-4 text-white text-xs bg-black/80 p-3 rounded border border-gray-700 leading-relaxed" style={{ maxHeight: "90vh", overflowY: "auto" }}>
              <p className="font-bold text-yellow-400 mb-1 text-sm">
                {currentMap?.name ?? "Unknown Location"}
              </p>
              <div className="text-xs mb-1">
                <p>Position: ({playerPosition.x}, {playerPosition.y})</p>
                {currentMap?.encounters.length ? (
                  <p className={battlesPaused ? "text-yellow-400" : "text-red-400"}>
                    {battlesPaused ? "Encounters Paused" : "Encounter Zone Active"}
                  </p>
                ) : (
                  <p className="text-green-400">Safe Zone</p>
                )}
              </div>
              <div className="border-t border-gray-600 pt-1 space-y-2">
                <div>
                  <p className="text-blue-300 font-bold">Controls</p>
                  <p className="text-gray-400">Arrows/WASD - Move</p>
                  <p className="text-gray-400">Enter/Space - Interact</p>
                  <p className="text-gray-400">Esc/M - Menu &nbsp; P - Pause</p>
                </div>
                <div>
                  <p className="text-green-400 font-bold">Teleport</p>
                  {[
                    ["1", "Village Square", "havenwood"],
                    ["2", "Whispering Ruins", "whispering_ruins"],
                    ["3", "Market Row", "havenwood_market"],
                    ["4", "Residential Lane", "havenwood_residential"],
                    ["5", "Waterfront", "havenwood_waterfront"],
                    ["6", "Estate Road", "havenwood_estate_road"],
                    ["7", "Outskirts", "havenwood_outskirts"],
                    ["8", "Lumina Estate", "lumina_estate"],
                    ["9", "Rusted Cog Tavern", "rusted_cog_tavern"],
                    ["F", "Bandit Camp", "bandit_camp"],
                    ["G", "Bandit Tent", "bandit_tent"],
                    ["H", "Bandit Cellar", "bandit_cellar"],
                    ["J", "Hidden Laboratory", "hidden_laboratory"],
                    ["K", "Ruins Lower", "whispering_ruins_lower"],
                    ["L", "Stranger Tent", "stranger_tent"],
                    ["N", "Desert Plateau", "desert_plateau"],
                    ["O", "Palace Garden", "palace_garden"],
                    ["I", "Rooftops West", "havenwood_rooftops_west"],
                    ["T", "Rooftops East", "havenwood_rooftops_east"],
                    ["U", "Alley", "havenwood_alley"],
                  ].map(([key, name, mapId]) => (
                    <p key={key} className={currentMap?.id === mapId ? "text-yellow-400 font-bold" : "text-gray-400"}>
                      {key} - {name}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="text-yellow-500 font-bold">Debug</p>
                  <p className="text-gray-400">` - Admin Mode</p>
                  <p className="text-gray-400">0 - Collision Debug</p>
                  <p className="text-gray-400">B - Test Battle</p>
                  <p className="text-gray-400">E - Paint &nbsp; R - Layer &nbsp; X - Export</p>
                </div>
              </div>
            </div>}

            {/* Admin Panel (top right) */}
            {!gardenAwakeningPhase && adminMode && (
              <div className="absolute top-4 right-4 text-white text-sm bg-purple-900/80 p-3 rounded border border-purple-500">
                <p className="font-bold text-purple-300 mb-2">Admin Panel</p>
                <button
                  onClick={toggleBattlesPaused}
                  className={`w-full px-3 py-2 rounded text-xs font-bold transition-colors ${
                    battlesPaused
                      ? "bg-green-600 hover:bg-green-500 text-white"
                      : "bg-red-600 hover:bg-red-500 text-white"
                  }`}
                >
                  {battlesPaused ? "Resume Battles" : "Pause Battles"}
                </button>
                <p className="text-purple-400 text-xs mt-2">Press ` to close</p>
              </div>
            )}

            {/* Interaction Prompt */}
            {!gardenAwakeningPhase && interactionPrompt && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 px-6 py-3 rounded-lg border border-yellow-600 text-center animate-pulse">
                <p className="text-yellow-400 font-bold">{interactionPrompt}</p>
                <p className="text-gray-400 text-xs mt-1">Press [Enter] or [Space]</p>
              </div>
            )}

            {/* Notification (chest opened, etc.) */}
            {!gardenAwakeningPhase && notification && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-black/90 px-8 py-4 rounded-lg border-2 border-yellow-500 text-center">
                <p className="text-yellow-300 font-bold text-lg">{notification}</p>
              </div>
            )}

            {/* Mini-map (lower right) */}
            {!gardenAwakeningPhase && <MiniMap />}
          </div>
        );
      case "combat":
        return <BattleScreen onBattleEnd={handleBattleEnd} />;
      case "dialogue":
        return (
          <div className="relative w-full h-screen bg-black">
            <MapView />
            {/* Dialogue overlay */}
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
            <DialogueBox />
          </div>
        );
      case "shop":
        return <ShopScreen />;
      case "game_over":
        return (
          <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
            <h1 className="text-4xl font-bold text-red-500 mb-8">Game Over</h1>
            <button
              onClick={() => newGame()}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-bold"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return (
          <div className="w-full h-screen flex items-center justify-center bg-black text-white">
            Loading...
          </div>
        );
    }
  };

  return (
    <>
      {renderContent()}
      {showMenu && phase === "exploring" && (
        <GameMenu onClose={toggleMenu} />
      )}
      {showSaveScreen && phase === "exploring" && (
        <SaveScreen
          mode="save"
          onClose={closeSaveScreen}
          onComplete={closeSaveScreen}
        />
      )}
      {showInn && phase === "exploring" && <InnScreen />}
      {showVillageMap && phase === "exploring" && <VillageMap />}
      <BattleTransition
        isActive={showTransition}
        onComplete={handleTransitionComplete}
        type="glitch"
      />
      <MapTransition
        isActive={showMapTransition}
        onMidpoint={handleMapTransitionMidpoint}
        onComplete={handleMapTransitionComplete}
        duration={800}
      />
      <LevelUpNotification />
      {pendingQuestComplete && (
        <QuestCompleteScreen
          rewards={pendingQuestComplete}
          onComplete={clearQuestComplete}
        />
      )}
    </>
  );
}
