import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GamePhase,
  Character,
  Inventory,
  PlayerPosition,
  BattleState,
  DialogueNode,
  StoryState,
  GameMap,
  Direction,
} from "../types";
import type { Enemy } from "../types/battle";
import type { LevelUpResult } from "../types/lattice";
import { KAI, LYRA } from "../data/characters";
import {
  createInitialInventory,
  getItemById,
  ITEMS,
  EQUIPMENT,
} from "../data/items";
import type { Item, EquipmentSlot } from "../types";
import { HAVENWOOD_MAP } from "../data/maps/havenwood";
import { WHISPERING_RUINS_MAP } from "../data/maps/whispering_ruins";
import { HAVENWOOD_OUTSKIRTS_MAP } from "../data/maps/havenwood_outskirts";
import { BANDIT_CAMP_MAP } from "../data/maps/bandit_camp";
import { BANDIT_CELLAR_MAP } from "../data/maps/bandit_cellar";
import { WHISPERING_RUINS_LOWER_MAP } from "../data/maps/whispering_ruins_lower";
import { HIDDEN_LABORATORY_MAP } from "../data/maps/hidden_laboratory";
import {
  checkForEncounter,
  createStepCounter,
  incrementSteps,
  shouldTriggerEncounter,
  resetStepCounter,
  isInEncounterZone,
  createEnemiesFromEncounter,
  type StepCounter,
} from "../engine/encounterEngine";
import { processAllLevelUps } from "../engine/levelingEngine";
import {
  getEventPlayerIsFacing,
  processTreasure,
  getNpcPlayerIsFacing,
} from "../engine/interactionEngine";
import {
  getDynamicDialogue,
  getDialogueById,
  type StoryState as DialogueStoryState
} from "../data/dialogues";
import type { TreasureContents, CollectibleContents } from "../types/map";
import type { QuestState, QuestProgress, QuestStatus } from "../types/quest";
import { createQuestProgress, areRequiredObjectivesComplete } from "../types/quest";
import { QUESTS, getQuestById } from "../data/quests";
import type { Shop, ShopState } from "../types/shop";
import { getShopById } from "../data/shops";

// Battle rewards tracking for victory screen
export interface BattleRewards {
  experience: number;
  gold: number;
  items: { itemId: string; name: string; quantity: number }[];
  levelUps: { characterName: string; newLevel: number }[];
}

export interface GameState {
  // Game phase
  phase: GamePhase;
  isPaused: boolean;

  // Party
  party: Character[];
  activePartyIds: string[]; // Up to 4 active party members

  // Inventory
  inventory: Inventory;

  // World state
  currentMap: GameMap | null;
  playerPosition: PlayerPosition;
  visitedMaps: Set<string>;
  openedChests: Set<string>; // Track opened treasure chests by event ID

  // Encounter system
  stepCounter: StepCounter;
  pendingEncounter: Enemy[] | null;
  isTransitioning: boolean;

  // Map transition
  pendingMapTransition: { mapId: string; x: number; y: number } | null;

  // Battle
  battle: BattleState | null;

  // Dialogue
  activeDialogue: DialogueNode | null;
  dialogueHistory: string[];

  // Story
  story: StoryState;

  // Quests
  quests: QuestState;

  // Shop
  shop: ShopState;

  // UI
  messageLog: string[];
  showMenu: boolean;
  showSaveScreen: boolean;
  showInn: boolean;

  // Admin/Debug
  adminMode: boolean;
  battlesPaused: boolean;

  // Level-up tracking
  pendingLevelUps: { characterId: string; results: LevelUpResult[] }[];

  // Battle rewards for victory screen
  pendingBattleRewards: BattleRewards | null;
}

export interface GameActions {
  // Phase management
  setPhase: (phase: GamePhase) => void;
  togglePause: () => void;
  completeSystemBoot: () => void;

  // Admin/Debug
  toggleAdminMode: () => void;
  toggleBattlesPaused: () => void;

  // Party management
  addPartyMember: (character: Character) => void;
  removePartyMember: (characterId: string) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  healParty: () => void;

  // Movement
  setPlayerPosition: (position: PlayerPosition) => void;
  movePlayer: (dx: number, dy: number) => void;

  // Map
  loadMap: (mapId: string) => void;

  // Battle
  startBattle: (battle: BattleState) => void;
  updateBattle: (updates: Partial<BattleState>) => void;
  finalizeBattleRewards: () => void; // Calculate rewards once when victory detected
  endBattle: (victory: boolean) => void;

  // Encounter
  triggerEncounter: (enemies: Enemy[]) => void;
  startTransition: () => void;
  endTransition: () => void;
  clearPendingEncounter: () => void;

  // Map transition
  triggerMapTransition: (mapId: string, x: number, y: number) => void;
  executeMapTransition: () => void;
  clearMapTransition: () => void;

  // Dialogue
  startDialogue: (dialogue: DialogueNode) => void;
  advanceDialogue: (nextNodeId?: string) => void;
  endDialogue: () => void;

  // Story
  setStoryFlag: (flag: string, value: boolean) => void;
  hasStoryFlag: (flag: string) => boolean;

  // Inventory
  addItem: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  addGold: (amount: number) => void;
  useItem: (itemId: string, targetCharacterId: string) => string | null;
  equipItem: (itemId: string, characterId: string, slot: EquipmentSlot) => void;
  unequipItem: (characterId: string, slot: EquipmentSlot) => void;

  // Shard management
  socketShard: (characterId: string, slot: EquipmentSlot, shardId: string) => boolean;
  unsocketShard: (characterId: string, slot: EquipmentSlot, shardId: string) => boolean;
  addShard: (shardId: string, quantity?: number) => void;
  getOwnedShards: () => { shardId: string; quantity: number }[];

  // Interactions
  interact: () => string | null; // Returns message if interaction occurred
  openChest: (eventId: string) => string | null; // Open a treasure chest
  collectItem: (eventId: string) => string | null; // Collect quest item from map

  // Quest management
  startQuest: (questId: string) => boolean;
  updateQuestProgress: (questId: string, objectiveId: string, progress: number) => void;
  completeObjective: (questId: string, objectiveId: string) => void;
  completeQuest: (questId: string) => void;
  failQuest: (questId: string) => void;
  getQuestStatus: (questId: string) => QuestStatus;
  getQuestProgress: (questId: string) => QuestProgress | null;
  hasActiveQuest: (questId: string) => boolean;
  checkQuestRequirements: (questId: string) => boolean;
  onItemCollected: (itemId: string, quantity: number) => void; // Auto-update collect objectives

  // Shop
  enterShop: (shopId: string) => void;
  exitShop: () => void;
  setShopCategory: (category: "buy" | "sell") => void;
  setShopSelectedIndex: (index: number) => void;
  setShopQuantity: (quantity: number) => void;
  buyItem: (itemId: string, quantity: number) => { success: boolean; message: string };
  sellItem: (itemId: string, quantity: number) => { success: boolean; message: string };

  // Messages
  addMessage: (message: string) => void;
  clearMessages: () => void;

  // Menu
  toggleMenu: () => void;
  openSaveScreen: () => void;
  closeSaveScreen: () => void;

  // Inn
  openInn: () => void;
  closeInn: () => void;
  restAtInn: (cost: number) => void;

  // Level-up and rewards
  clearLevelUps: () => void;
  clearBattleRewards: () => void;

  // Save/Load
  saveGame: (slot: number) => void;
  loadGame: (slot: number) => boolean;
  newGame: () => void;
}

const initialState: GameState = {
  phase: "title",
  isPaused: false,
  party: [],
  activePartyIds: [],
  inventory: createInitialInventory(),
  currentMap: null,
  playerPosition: {
    x: 5,
    y: 5,
    mapId: "havenwood",
    facing: "down",
  },
  visitedMaps: new Set(),
  openedChests: new Set(),
  stepCounter: createStepCounter(8, 20), // Encounter every 8-20 steps
  pendingEncounter: null,
  isTransitioning: false,
  pendingMapTransition: null,
  battle: null,
  activeDialogue: null,
  dialogueHistory: [],
  story: {
    flags: {},
    currentChapter: 1,
    playtime: 0,
  },
  quests: {
    active: [],
    completed: [],
    failed: [],
  },
  shop: {
    currentShop: null,
    selectedCategory: "buy",
    selectedIndex: 0,
    quantity: 1,
  },
  messageLog: [],
  showMenu: false,
  showSaveScreen: false,
  showInn: false,
  adminMode: false,
  battlesPaused: false,
  pendingLevelUps: [],
  pendingBattleRewards: null,
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Phase management
      setPhase: (phase) => set({ phase }),
      togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
      completeSystemBoot: () => set({ phase: "exploring" }),

      // Admin/Debug
      toggleAdminMode: () => set((state) => ({ adminMode: !state.adminMode })),
      toggleBattlesPaused: () => set((state) => ({ battlesPaused: !state.battlesPaused })),

      // Party management
      addPartyMember: (character) =>
        set((state) => {
          if (state.party.find((c) => c.id === character.id)) {
            return state; // Already in party
          }
          const newParty = [...state.party, character];
          const newActiveIds =
            state.activePartyIds.length < 4
              ? [...state.activePartyIds, character.id]
              : state.activePartyIds;
          return { party: newParty, activePartyIds: newActiveIds };
        }),

      removePartyMember: (characterId) =>
        set((state) => ({
          party: state.party.filter((c) => c.id !== characterId),
          activePartyIds: state.activePartyIds.filter(
            (id) => id !== characterId,
          ),
        })),

      updateCharacter: (characterId, updates) =>
        set((state) => ({
          party: state.party.map((c) =>
            c.id === characterId ? { ...c, ...updates } : c,
          ),
        })),

      healParty: () =>
        set((state) => ({
          party: state.party.map((c) => ({
            ...c,
            stats: {
              ...c.stats,
              hp: c.stats.maxHp,
              mp: c.stats.maxMp,
            },
          })),
        })),

      // Movement
      setPlayerPosition: (position) => set({ playerPosition: position }),

      movePlayer: (dx, dy) =>
        set((state) => {
          // Don't allow movement during transition
          if (state.isTransitioning || state.pendingEncounter) {
            return state;
          }

          const newX = state.playerPosition.x + dx;
          const newY = state.playerPosition.y + dy;

          // Check collision with current map
          if (state.currentMap) {
            const { width, height, layers, events, npcs } = state.currentMap;

            // Check map boundaries and terrain collision
            if (
              newX < 0 ||
              newY < 0 ||
              newX >= width ||
              newY >= height ||
              !layers.collision[newY]?.[newX]
            ) {
              // Can't move, just update facing
              const facing: Direction =
                dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
              return {
                playerPosition: { ...state.playerPosition, facing },
              };
            }

            // Check collision with events (chests, save points, collectibles, etc.)
            const blockingEvent = events.find((e) => {
              if (e.x !== newX || e.y !== newY) return false;

              // Treasure chests and save points always block
              if (e.type === "treasure" || e.type === "save_point") {
                // Only block if not already opened/triggered
                return !e.triggered && !state.openedChests.has(e.id);
              }

              // Collectibles block if not collected and quest is active
              if (e.type === "collectible") {
                if (e.triggered || state.openedChests.has(e.id)) return false;
                const data = e.data as unknown as CollectibleContents;
                if (data.requiredQuest) {
                  return get().hasActiveQuest(data.requiredQuest);
                }
                return true; // No quest required, always block if not collected
              }

              return false;
            });
            if (blockingEvent) {
              const facing: Direction =
                dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
              return {
                playerPosition: { ...state.playerPosition, facing },
              };
            }

            // Check collision with NPCs
            const blockingNpc = npcs.find(
              (n) => n.x === newX && n.y === newY
            );
            if (blockingNpc) {
              const facing: Direction =
                dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
              return {
                playerPosition: { ...state.playerPosition, facing },
              };
            }
          }

          const facing: Direction =
            dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";

          const newPosition: PlayerPosition = {
            ...state.playerPosition,
            x: newX,
            y: newY,
            facing,
          };

          // Check for teleport events on the tile we're stepping onto
          if (state.currentMap) {
            const teleportEvent = state.currentMap.events.find(
              (e) => e.type === "teleport" && e.x === newX && e.y === newY
            );
            if (teleportEvent && teleportEvent.data) {
              const data = teleportEvent.data as {
                targetMapId: string;
                targetX: number;
                targetY: number;
              };
              // Trigger map transition - player moves to the tile, then transition starts
              return {
                playerPosition: newPosition,
                pendingMapTransition: {
                  mapId: data.targetMapId,
                  x: data.targetX,
                  y: data.targetY,
                },
              };
            }

            // Shop events don't auto-trigger - require interaction (Enter/Space)
          }

          // Check for encounters (only if map has encounters and battles are not paused)
          if (state.currentMap && state.currentMap.encounters.length > 0 && !state.battlesPaused) {
            const newStepCounter = incrementSteps(state.stepCounter);
            const encounter = isInEncounterZone(
              newPosition,
              state.currentMap.encounters,
            );

            if (encounter && shouldTriggerEncounter(newStepCounter, true)) {
              // Trigger encounter!
              const enemies = createEnemiesFromEncounter(encounter);
              return {
                playerPosition: newPosition,
                stepCounter: resetStepCounter(newStepCounter),
                pendingEncounter: enemies,
                isTransitioning: true,
              };
            }

            return {
              playerPosition: newPosition,
              stepCounter: newStepCounter,
            };
          }

          return {
            playerPosition: newPosition,
          };
        }),

      // Map
      loadMap: (mapId) =>
        set((state) => {
          // Map registry
          const maps: Record<string, GameMap> = {
            havenwood: HAVENWOOD_MAP,
            whispering_ruins: WHISPERING_RUINS_MAP,
            havenwood_outskirts: HAVENWOOD_OUTSKIRTS_MAP,
            bandit_camp: BANDIT_CAMP_MAP,
            bandit_cellar: BANDIT_CELLAR_MAP,
            whispering_ruins_lower: WHISPERING_RUINS_LOWER_MAP,
            hidden_laboratory: HIDDEN_LABORATORY_MAP,
          };

          const map = maps[mapId];
          if (!map) return state;

          return {
            currentMap: map,
            visitedMaps: new Set([...state.visitedMaps, mapId]),
            stepCounter: resetStepCounter(state.stepCounter), // Reset encounters on map change
          };
        }),

      // Battle
      startBattle: (battle) => set({ battle, phase: "combat" }),

      updateBattle: (updates) =>
        set((state) => ({
          battle: state.battle ? { ...state.battle, ...updates } : null,
        })),

      // Calculate and store battle rewards without ending battle yet
      // Called when victory is detected, before showing VictoryScreen
      finalizeBattleRewards: () =>
        set((state) => {
          if (!state.battle || state.pendingBattleRewards) return {};

          const expGain = state.battle.enemies.reduce((sum, e) => sum + e.experience, 0);
          const goldGain = state.battle.enemies.reduce((sum, e) => sum + e.gold, 0);

          // Calculate item drops ONCE with Math.random()
          const droppedItems: { itemId: string; name: string; quantity: number }[] = [];
          state.battle.enemies.forEach((enemy) => {
            if (enemy.drops) {
              enemy.drops.forEach((drop) => {
                if (Math.random() < drop.chance) {
                  const item = getItemById(drop.itemId);
                  if (item) {
                    const existing = droppedItems.find(d => d.itemId === drop.itemId);
                    if (existing) {
                      existing.quantity += 1;
                    } else {
                      droppedItems.push({
                        itemId: drop.itemId,
                        name: item.name,
                        quantity: 1,
                      });
                    }
                  }
                }
              });
            }
          });

          return {
            pendingBattleRewards: {
              experience: expGain,
              gold: goldGain,
              items: droppedItems,
              levelUps: [], // Will be calculated in endBattle
            },
          };
        }),

      endBattle: (victory) =>
        set((state) => {
          if (victory && state.battle) {
            // Use pre-calculated rewards if available, otherwise calculate now
            const preCalculated = state.pendingBattleRewards;
            const expGain = preCalculated?.experience ?? state.battle.enemies.reduce(
              (sum, e) => sum + e.experience,
              0,
            );
            const goldGain = preCalculated?.gold ?? state.battle.enemies.reduce(
              (sum, e) => sum + e.gold,
              0,
            );

            // Use pre-calculated drops if available, otherwise calculate now
            let droppedItems: { itemId: string; name: string; quantity: number }[] = [];
            if (preCalculated?.items) {
              droppedItems = preCalculated.items;
            } else {
              state.battle.enemies.forEach((enemy) => {
                if (enemy.drops) {
                  enemy.drops.forEach((drop) => {
                    if (Math.random() < drop.chance) {
                      const item = getItemById(drop.itemId);
                      if (item) {
                        const existing = droppedItems.find(d => d.itemId === drop.itemId);
                        if (existing) {
                          existing.quantity += 1;
                        } else {
                          droppedItems.push({
                            itemId: drop.itemId,
                            name: item.name,
                            quantity: 1,
                          });
                        }
                      }
                    }
                  });
                }
              });
            }

            // Process level-ups for each party member
            // IMPORTANT: Use HP/MP from battle state, not original party state
            const levelUpResults: {
              characterId: string;
              results: LevelUpResult[];
            }[] = [];
            const levelUpSummary: { characterName: string; newLevel: number }[] = [];

            const updatedParty = state.party.map((c) => {
              // Get the battle character to preserve HP/MP from combat
              const battleChar = state.battle?.party.find(
                (bc) => bc.character.id === c.id,
              );
              const currentHp = battleChar?.character.stats.hp ?? c.stats.hp;
              const currentMp = battleChar?.character.stats.mp ?? c.stats.mp;

              // Start with preserved HP/MP and add XP
              const withBattleStats = {
                ...c,
                stats: {
                  ...c.stats,
                  hp: currentHp,
                  mp: currentMp,
                },
                experience: c.experience + expGain,
              };

              // Process any level-ups
              const { character: leveled, results } =
                processAllLevelUps(withBattleStats);

              if (results.length > 0) {
                levelUpResults.push({ characterId: c.id, results });
                // Track for victory screen
                levelUpSummary.push({
                  characterName: c.name,
                  newLevel: leveled.level,
                });
              }

              return leveled;
            });

            // Add dropped items to inventory
            let updatedInventory = { ...state.inventory, gold: state.inventory.gold + goldGain };
            droppedItems.forEach((drop) => {
              const item = getItemById(drop.itemId);
              if (item) {
                // Find existing slot or create new one
                const existingSlot = updatedInventory.items.find(
                  (slot) => slot.item.id === drop.itemId
                );
                if (existingSlot && item.stackable) {
                  updatedInventory = {
                    ...updatedInventory,
                    items: updatedInventory.items.map((slot) =>
                      slot.item.id === drop.itemId
                        ? { ...slot, quantity: Math.min(slot.quantity + drop.quantity, item.maxStack ?? 99) }
                        : slot
                    ),
                  };
                } else {
                  updatedInventory = {
                    ...updatedInventory,
                    items: [...updatedInventory.items, { item, quantity: drop.quantity }],
                  };
                }
              }
            });

            // Create battle rewards for victory screen
            const battleRewards: BattleRewards = {
              experience: expGain,
              gold: goldGain,
              items: droppedItems,
              levelUps: levelUpSummary,
            };

            return {
              battle: null,
              phase: "exploring",
              party: updatedParty,
              inventory: updatedInventory,
              pendingLevelUps: levelUpResults,
              pendingBattleRewards: battleRewards,
            };
          }
          return { battle: null, phase: victory ? "exploring" : "game_over", pendingBattleRewards: null };
        }),

      // Encounter
      triggerEncounter: (enemies) =>
        set({
          pendingEncounter: enemies,
          isTransitioning: true,
        }),

      startTransition: () => set({ isTransitioning: true }),

      endTransition: () => set({ isTransitioning: false }),

      clearPendingEncounter: () =>
        set({
          pendingEncounter: null,
          isTransitioning: false,
        }),

      // Map transition
      triggerMapTransition: (mapId, x, y) =>
        set({
          pendingMapTransition: { mapId, x, y },
        }),

      executeMapTransition: () => {
        const state = get();
        if (!state.pendingMapTransition) return;

        const { mapId, x, y } = state.pendingMapTransition;

        // Load the new map
        get().loadMap(mapId);

        // Set the new player position
        set({
          playerPosition: {
            x,
            y,
            mapId,
            facing: "down",
          },
          pendingMapTransition: null,
        });
      },

      clearMapTransition: () =>
        set({
          pendingMapTransition: null,
        }),

      // Dialogue
      startDialogue: (dialogue) =>
        set({
          activeDialogue: dialogue,
          phase: "dialogue",
        }),

      advanceDialogue: (nextNodeId) => {
        if (!nextNodeId) {
          get().endDialogue();
          return;
        }

        // Look up the next dialogue node from all dialogue records
        const nextNode = getDialogueById(nextNodeId);

        if (nextNode) {
          // Handle special quest actions based on node ID
          if (nextNodeId === "mira_quest_accept") {
            // Start the herbalist's request quest
            get().startQuest("herbalists_request");
          } else if (nextNodeId === "mira_turn_in") {
            // Complete the quest and remove flowers
            get().removeItem("moonpetal_flower", 3);
            get().completeQuest("herbalists_request");
          }
          // Morris quest triggers
          else if (nextNodeId === "morris_quest_accept") {
            get().startQuest("whispers_of_trouble");
          } else if (nextNodeId === "morris_bandit_accept") {
            get().startQuest("the_bandit_problem");
          } else if (nextNodeId === "morris_seeking_accept") {
            get().startQuest("seeking_answers");
          }
          // Bren dialogue triggers
          else if (nextNodeId === "bren_briefing") {
            get().setStoryFlag("talked_to_bren", true);
          }
          // Aldric quest triggers
          else if (nextNodeId === "aldric_shipment_accept") {
            get().startQuest("lost_shipment");
          } else if (nextNodeId === "aldric_lumina_info") {
            get().setStoryFlag("asked_about_scholars", true);
          }

          set({ activeDialogue: nextNode });
        } else {
          // Node not found, end dialogue
          get().endDialogue();
        }
      },

      endDialogue: () => {
        const state = get();
        const currentDialogue = state.activeDialogue;

        // Handle quest completion when ending turn-in dialogue
        if (currentDialogue?.id === "mira_turn_in") {
          const questStatus = get().getQuestStatus("herbalists_request");
          if (questStatus === "active") {
            // Complete the quest and remove flowers
            get().removeItem("moonpetal_flower", 3);
            get().completeQuest("herbalists_request");
          }
        }

        set({
          activeDialogue: null,
          phase: "exploring",
        });
      },

      // Story
      setStoryFlag: (flag, value) =>
        set((state) => ({
          story: {
            ...state.story,
            flags: { ...state.story.flags, [flag]: value },
          },
        })),

      hasStoryFlag: (flag) => get().story.flags[flag] ?? false,

      // Inventory
      addItem: (itemId, quantity = 1) => {
        const item = getItemById(itemId);
        if (!item) {
          console.warn(`Item not found: ${itemId}`);
          return;
        }

        set((state) => {
          // Check if item already exists in inventory
          const existingIndex = state.inventory.items.findIndex(
            (slot) => slot.item.id === itemId
          );

          if (existingIndex >= 0) {
            // Increase quantity of existing item
            const newItems = [...state.inventory.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            };
            return {
              inventory: { ...state.inventory, items: newItems },
            };
          } else {
            // Add new item slot (if space available)
            if (state.inventory.items.length >= state.inventory.maxSlots) {
              console.warn("Inventory full!");
              return state;
            }
            return {
              inventory: {
                ...state.inventory,
                items: [...state.inventory.items, { item, quantity }],
              },
            };
          }
        });

        // After adding item, check for quest progress updates
        get().onItemCollected(itemId, quantity);
      },

      removeItem: (itemId, quantity = 1) =>
        set((state) => {
          const existingIndex = state.inventory.items.findIndex(
            (slot) => slot.item.id === itemId
          );

          if (existingIndex < 0) return state;

          const newItems = [...state.inventory.items];
          const newQuantity = newItems[existingIndex].quantity - quantity;

          if (newQuantity <= 0) {
            // Remove item entirely
            newItems.splice(existingIndex, 1);
          } else {
            // Reduce quantity
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newQuantity,
            };
          }

          return {
            inventory: { ...state.inventory, items: newItems },
          };
        }),

      addGold: (amount) =>
        set((state) => ({
          inventory: {
            ...state.inventory,
            gold: state.inventory.gold + amount,
          },
        })),

      useItem: (itemId, targetCharacterId) => {
        const state = get();
        const itemSlot = state.inventory.items.find(
          (s) => s.item.id === itemId,
        );
        if (!itemSlot || itemSlot.quantity <= 0) return null;

        const item = itemSlot.item;
        if (item.type !== "consumable" || !item.usableInField) return null;

        const target = state.party.find((c) => c.id === targetCharacterId);
        if (!target) return null;

        let message: string | null = null;

        // Apply item effect
        if (item.effect) {
          switch (item.effect.type) {
            case "heal_hp": {
              const healAmount = Math.min(
                item.effect.power,
                target.stats.maxHp - target.stats.hp,
              );
              if (healAmount > 0) {
                set((s) => ({
                  party: s.party.map((c) =>
                    c.id === targetCharacterId
                      ? {
                          ...c,
                          stats: { ...c.stats, hp: c.stats.hp + healAmount },
                        }
                      : c,
                  ),
                  inventory: {
                    ...s.inventory,
                    items: s.inventory.items.map((slot) =>
                      slot.item.id === itemId
                        ? { ...slot, quantity: slot.quantity - 1 }
                        : slot,
                    ),
                  },
                }));
                message = `${target.name} recovered ${healAmount} HP.`;
              } else {
                message = `${target.name}'s HP is already full.`;
              }
              break;
            }
            case "heal_mp": {
              const mpHealAmount = Math.min(
                item.effect.power,
                target.stats.maxMp - target.stats.mp,
              );
              if (mpHealAmount > 0) {
                set((s) => ({
                  party: s.party.map((c) =>
                    c.id === targetCharacterId
                      ? {
                          ...c,
                          stats: { ...c.stats, mp: c.stats.mp + mpHealAmount },
                        }
                      : c,
                  ),
                  inventory: {
                    ...s.inventory,
                    items: s.inventory.items.map((slot) =>
                      slot.item.id === itemId
                        ? { ...slot, quantity: slot.quantity - 1 }
                        : slot,
                    ),
                  },
                }));
                message = `${target.name} recovered ${mpHealAmount} MP.`;
              } else {
                message = `${target.name}'s MP is already full.`;
              }
              break;
            }
            case "cure_status": {
              // For now, just consume the item
              set((s) => ({
                inventory: {
                  ...s.inventory,
                  items: s.inventory.items.map((slot) =>
                    slot.item.id === itemId
                      ? { ...slot, quantity: slot.quantity - 1 }
                      : slot,
                  ),
                },
              }));
              message = `Used ${item.name} on ${target.name}.`;
              break;
            }
            case "revive": {
              if (target.stats.hp <= 0) {
                const reviveHp = Math.max(
                  1,
                  Math.floor(target.stats.maxHp * (item.effect.power / 100)),
                );
                set((s) => ({
                  party: s.party.map((c) =>
                    c.id === targetCharacterId
                      ? { ...c, stats: { ...c.stats, hp: reviveHp } }
                      : c,
                  ),
                  inventory: {
                    ...s.inventory,
                    items: s.inventory.items.map((slot) =>
                      slot.item.id === itemId
                        ? { ...slot, quantity: slot.quantity - 1 }
                        : slot,
                    ),
                  },
                }));
                message = `${target.name} has been revived!`;
              } else {
                message = `${target.name} is not unconscious.`;
              }
              break;
            }
          }
        }

        return message;
      },

      equipItem: (itemId, characterId, slot) => {
        const state = get();
        const item = getItemById(itemId);
        if (!item || !item.equipStats) return;

        // Check if item is in inventory or available
        const hasItem = state.inventory.items.some(
          (s) => s.item.id === itemId && s.quantity > 0,
        );
        // For equipment from EQUIPMENT constant (might not be in inventory)
        const isEquipment = EQUIPMENT[itemId] !== undefined;

        if (!hasItem && !isEquipment) return;

        set((s) => ({
          party: s.party.map((c) => {
            if (c.id !== characterId) return c;

            // Get current equipped item to potentially return to inventory
            const currentEquipped = c.equipment?.[slot];

            return {
              ...c,
              equipment: {
                ...c.equipment,
                [slot]: item,
              },
            };
          }),
          // Remove from inventory if it was there
          inventory: {
            ...s.inventory,
            items: s.inventory.items.map((invSlot) =>
              invSlot.item.id === itemId
                ? { ...invSlot, quantity: invSlot.quantity - 1 }
                : invSlot,
            ),
          },
        }));
      },

      unequipItem: (characterId, slot) => {
        set((state) => {
          const character = state.party.find((c) => c.id === characterId);
          if (!character) return state;

          const currentEquipped = character.equipment?.[slot];
          if (!currentEquipped) return state;

          // Try to get the full item definition from items.ts
          // This handles cases where starting equipment is a simple object
          let itemToReturn: Item | null = null;

          if ("rarity" in currentEquipped) {
            // Already a full Item
            itemToReturn = currentEquipped as Item;
          } else {
            // Try to look up the full item by ID
            const fullItem = getItemById(currentEquipped.id);
            if (fullItem) {
              itemToReturn = fullItem;
            }
          }

          let newItems = state.inventory.items;
          if (itemToReturn) {
            const existingSlot = state.inventory.items.find(
              (s) => s.item.id === itemToReturn!.id,
            );
            if (existingSlot) {
              newItems = state.inventory.items.map((s) =>
                s.item.id === itemToReturn!.id
                  ? { ...s, quantity: s.quantity + 1 }
                  : s,
              );
            } else {
              newItems = [
                ...state.inventory.items,
                { item: itemToReturn, quantity: 1 },
              ];
            }
          }

          return {
            party: state.party.map((c) => {
              if (c.id !== characterId) return c;
              return {
                ...c,
                equipment: {
                  ...c.equipment,
                  [slot]: undefined,
                },
              };
            }),
            inventory: {
              ...state.inventory,
              items: newItems,
            },
          };
        });
      },

      // Shard management
      socketShard: (characterId, slot, shardId) => {
        const state = get();

        // Find character
        const character = state.party.find((c) => c.id === characterId);
        if (!character) return false;

        // Find equipped item
        const equipped = character.equipment?.[slot];
        if (!equipped) return false;

        // Check if item is a full Item with shard slots
        const item = equipped as Item;
        const maxSlots = item.shardSlots ?? 0;
        const currentShards = item.socketedShards ?? [];

        // Check if there's room
        if (currentShards.length >= maxSlots) return false;

        // Check if player owns this shard
        const shardInInventory = state.inventory.items.find(
          (s) => s.item.id === shardId && s.item.type === "shard" && s.quantity > 0
        );
        if (!shardInInventory) return false;

        // Socket the shard and remove from inventory
        set((s) => ({
          party: s.party.map((c) => {
            if (c.id !== characterId) return c;
            const equip = c.equipment?.[slot] as Item | undefined;
            if (!equip) return c;

            return {
              ...c,
              equipment: {
                ...c.equipment,
                [slot]: {
                  ...equip,
                  socketedShards: [...(equip.socketedShards ?? []), shardId],
                },
              },
            };
          }),
          inventory: {
            ...s.inventory,
            items: s.inventory.items
              .map((invSlot) =>
                invSlot.item.id === shardId
                  ? { ...invSlot, quantity: invSlot.quantity - 1 }
                  : invSlot
              )
              .filter((invSlot) => invSlot.quantity > 0),
          },
        }));

        return true;
      },

      unsocketShard: (characterId, slot, shardId) => {
        const state = get();

        // Find character
        const character = state.party.find((c) => c.id === characterId);
        if (!character) return false;

        // Find equipped item
        const equipped = character.equipment?.[slot];
        if (!equipped) return false;

        // Check if shard is socketed
        const item = equipped as Item;
        const currentShards = item.socketedShards ?? [];
        if (!currentShards.includes(shardId)) return false;

        // Import shard data to get the full shard info
        const { getShardById } = require("../data/shards");
        const shard = getShardById(shardId);
        if (!shard) return false;

        // Create a shard item for inventory
        const shardItem: Item = {
          id: shard.id,
          name: shard.name,
          description: shard.description,
          type: "shard",
          rarity: shard.rarity,
          value: shard.rarity === "legendary" ? 5000 : shard.rarity === "epic" ? 2000 : shard.rarity === "rare" ? 500 : 100,
          stackable: true,
          maxStack: 99,
          usableInBattle: false,
          usableInField: false,
        };

        // Unsocket and add back to inventory
        set((s) => {
          // Check if shard already in inventory
          const existingSlot = s.inventory.items.find((inv) => inv.item.id === shardId);

          const newItems = existingSlot
            ? s.inventory.items.map((inv) =>
                inv.item.id === shardId
                  ? { ...inv, quantity: inv.quantity + 1 }
                  : inv
              )
            : [...s.inventory.items, { item: shardItem, quantity: 1 }];

          return {
            party: s.party.map((c) => {
              if (c.id !== characterId) return c;
              const equip = c.equipment?.[slot] as Item | undefined;
              if (!equip) return c;

              return {
                ...c,
                equipment: {
                  ...c.equipment,
                  [slot]: {
                    ...equip,
                    socketedShards: (equip.socketedShards ?? []).filter(
                      (id) => id !== shardId
                    ),
                  },
                },
              };
            }),
            inventory: {
              ...s.inventory,
              items: newItems,
            },
          };
        });

        return true;
      },

      addShard: (shardId, quantity = 1) => {
        const { getShardById } = require("../data/shards");
        const shard = getShardById(shardId);
        if (!shard) return;

        // Create a shard item for inventory
        const shardItem: Item = {
          id: shard.id,
          name: shard.name,
          description: shard.description,
          type: "shard",
          rarity: shard.rarity,
          value: shard.rarity === "legendary" ? 5000 : shard.rarity === "epic" ? 2000 : shard.rarity === "rare" ? 500 : 100,
          stackable: true,
          maxStack: 99,
          usableInBattle: false,
          usableInField: false,
        };

        set((s) => {
          const existingSlot = s.inventory.items.find((inv) => inv.item.id === shardId);

          const newItems = existingSlot
            ? s.inventory.items.map((inv) =>
                inv.item.id === shardId
                  ? { ...inv, quantity: Math.min(99, inv.quantity + quantity) }
                  : inv
              )
            : [...s.inventory.items, { item: shardItem, quantity }];

          return {
            inventory: {
              ...s.inventory,
              items: newItems,
            },
          };
        });
      },

      getOwnedShards: () => {
        const state = get();
        return state.inventory.items
          .filter((slot) => slot.item.type === "shard" && slot.quantity > 0)
          .map((slot) => ({ shardId: slot.item.id, quantity: slot.quantity }));
      },

      // Interactions
      interact: () => {
        const state = get();
        if (!state.currentMap) return null;

        // Check for shop event at player's current position (standing on shop door)
        const shopEvent = state.currentMap.events.find(
          (e) => e.type === "shop" &&
                 e.x === state.playerPosition.x &&
                 e.y === state.playerPosition.y
        );
        if (shopEvent && shopEvent.data) {
          const data = shopEvent.data as { shopId: string; message?: string };
          const shop = getShopById(data.shopId);
          if (shop) {
            // Enter the shop
            set({
              phase: "shop" as const,
              shop: {
                currentShop: shop,
                selectedCategory: "buy" as const,
                selectedIndex: 0,
                quantity: 1,
              },
            });
            return data.message || `Entering ${shop.name}...`;
          }
        }

        // Check for NPC first
        const npc = getNpcPlayerIsFacing(
          state.currentMap,
          state.playerPosition.x,
          state.playerPosition.y,
          state.playerPosition.facing
        );

        if (npc) {
          // Build story state for dialogue system
          const storyState: DialogueStoryState = {
            flags: state.story.flags,
            quests: {
              active: state.quests.active.map((q) => q.questId),
              completed: state.quests.completed,
            },
          };

          // Get extra data needed for specific NPCs
          const extraData: Record<string, unknown> = {};
          if (npc.id === "herbalist_mira") {
            extraData.flowerCount = state.inventory.items.find(
              (slot) => slot.item.id === "moonpetal_flower"
            )?.quantity ?? 0;
          }

          // Get dynamic dialogue based on NPC and story state
          let dialogue = getDynamicDialogue(npc.id, storyState, extraData);

          // Fallback for NPCs without dynamic dialogue
          if (!dialogue) {
            dialogue = {
              id: `${npc.id}_dialogue`,
              speaker: npc.name,
              text: "Hello, traveler. Safe journeys to you.",
              portrait: npc.id,
            };
          }

          get().startDialogue(dialogue);
          return `Speaking with ${npc.name}...`;
        }

        // Find event player is facing
        const event = getEventPlayerIsFacing(
          state.currentMap,
          state.playerPosition.x,
          state.playerPosition.y,
          state.playerPosition.facing
        );

        if (!event) return null;

        // Handle different event types
        switch (event.type) {
          case "treasure":
            return get().openChest(event.id);
          case "collectible":
            return get().collectItem(event.id);
          case "save_point":
            get().openSaveScreen();
            return null;
          case "inn":
            get().openInn();
            return null;
          default:
            return null;
        }
      },

      openChest: (eventId) => {
        const state = get();
        if (!state.currentMap) return null;

        // Check if already opened
        if (state.openedChests.has(eventId)) {
          return "The chest is empty.";
        }

        // Find the event
        const event = state.currentMap.events.find((e) => e.id === eventId);
        if (!event || event.type !== "treasure") return null;

        // Process the treasure
        const result = processTreasure(event);

        if (!result.success && result.alreadyOpened) {
          return "The chest is empty.";
        }

        // Add items to inventory
        const data = event.data as TreasureContents;

        if (data.items) {
          for (const { itemId, quantity } of data.items) {
            get().addItem(itemId, quantity);
          }
        }

        // Add gold
        if (data.gold) {
          get().addGold(data.gold);
        }

        // Add shards
        if (data.shards) {
          for (const shardId of data.shards) {
            get().addShard(shardId);
          }
        }

        // Mark chest as opened
        set((s) => ({
          openedChests: new Set([...s.openedChests, eventId]),
        }));

        // Add to message log
        get().addMessage(result.message);

        return result.message;
      },

      collectItem: (eventId) => {
        const state = get();
        if (!state.currentMap) return null;

        // Check if already collected
        if (state.openedChests.has(eventId)) {
          return "There's nothing here.";
        }

        const event = state.currentMap.events.find((e) => e.id === eventId);
        if (!event || event.type !== "collectible") return null;

        const data = event.data as unknown as CollectibleContents;

        // Check quest requirement
        if (data.requiredQuest) {
          const questStatus = get().getQuestStatus(data.requiredQuest);
          if (questStatus !== "active") {
            return "You see something glimmering, but it feels irrelevant right now.";
          }
        }

        // Add item to inventory
        get().addItem(data.itemId, data.quantity);

        // Mark as collected (reuse openedChests Set)
        set((s) => ({
          openedChests: new Set([...s.openedChests, eventId]),
        }));

        const item = getItemById(data.itemId);
        const itemName = item?.name ?? data.itemId;
        const message = data.message ?? `Found ${itemName}!`;
        get().addMessage(message);

        return message;
      },

      // Quest management
      startQuest: (questId) => {
        const state = get();
        const questDef = getQuestById(questId);
        if (!questDef) return false;

        // Check if already started or completed
        if (state.quests.active.find((q) => q.questId === questId)) return false;
        if (state.quests.completed.includes(questId)) return false;

        // Check requirements
        if (!get().checkQuestRequirements(questId)) return false;

        // Create progress tracker
        const progress = createQuestProgress(questDef);

        set((s) => ({
          quests: {
            ...s.quests,
            active: [...s.quests.active, progress],
          },
        }));

        // Set quest started flag
        get().setStoryFlag(`quest_${questId}_started`, true);
        get().addMessage(`Quest Started: ${questDef.name}`);

        return true;
      },

      updateQuestProgress: (questId, objectiveId, progress) => {
        const questDef = getQuestById(questId);
        if (!questDef) return;

        set((s) => ({
          quests: {
            ...s.quests,
            active: s.quests.active.map((q) => {
              if (q.questId !== questId) return q;
              return {
                ...q,
                objectives: q.objectives.map((obj) => {
                  if (obj.objectiveId !== objectiveId) return obj;
                  const objDef = questDef.objectives.find((o) => o.id === objectiveId);
                  const target = objDef?.targetQuantity ?? 1;
                  const newProgress = Math.min(progress, target);
                  return {
                    ...obj,
                    currentProgress: newProgress,
                    isComplete: newProgress >= target,
                  };
                }),
              };
            }),
          },
        }));
      },

      completeObjective: (questId, objectiveId) => {
        const questDef = getQuestById(questId);
        if (!questDef) return;

        const objDef = questDef.objectives.find((o) => o.id === objectiveId);
        const target = objDef?.targetQuantity ?? 1;

        set((s) => ({
          quests: {
            ...s.quests,
            active: s.quests.active.map((q) => {
              if (q.questId !== questId) return q;
              return {
                ...q,
                objectives: q.objectives.map((obj) =>
                  obj.objectiveId === objectiveId
                    ? { ...obj, isComplete: true, currentProgress: target }
                    : obj
                ),
              };
            }),
          },
        }));

        // Check if all required objectives complete
        const updatedQuest = get().quests.active.find((q) => q.questId === questId);
        if (updatedQuest && areRequiredObjectivesComplete(questDef, updatedQuest)) {
          // Don't auto-complete - wait for turn-in dialogue
        }
      },

      completeQuest: (questId) => {
        const questDef = getQuestById(questId);
        if (!questDef) return;

        // Award rewards
        if (questDef.rewards.gold) {
          get().addGold(questDef.rewards.gold);
        }
        if (questDef.rewards.items) {
          for (const { itemId, quantity } of questDef.rewards.items) {
            get().addItem(itemId, quantity);
          }
        }
        if (questDef.rewards.shards) {
          for (const shardId of questDef.rewards.shards) {
            get().addShard(shardId);
          }
        }
        if (questDef.rewards.storyFlags) {
          for (const flag of questDef.rewards.storyFlags) {
            get().setStoryFlag(flag, true);
          }
        }

        // Move from active to completed
        set((s) => ({
          quests: {
            ...s.quests,
            active: s.quests.active.filter((q) => q.questId !== questId),
            completed: [...s.quests.completed, questId],
          },
        }));

        // Set completion flag
        get().setStoryFlag(`quest_${questId}_completed`, true);
        get().addMessage(`Quest Complete: ${questDef.name}!`);
      },

      failQuest: (questId) => {
        const questDef = getQuestById(questId);
        if (!questDef) return;

        set((s) => ({
          quests: {
            ...s.quests,
            active: s.quests.active.filter((q) => q.questId !== questId),
            failed: [...s.quests.failed, questId],
          },
        }));

        get().setStoryFlag(`quest_${questId}_failed`, true);
        get().addMessage(`Quest Failed: ${questDef.name}`);
      },

      getQuestStatus: (questId) => {
        const state = get();
        if (state.quests.completed.includes(questId)) return "completed";
        if (state.quests.failed.includes(questId)) return "failed";
        if (state.quests.active.find((q) => q.questId === questId)) return "active";
        return "not_started";
      },

      getQuestProgress: (questId) => {
        return get().quests.active.find((q) => q.questId === questId) ?? null;
      },

      hasActiveQuest: (questId) => {
        return get().quests.active.some((q) => q.questId === questId);
      },

      checkQuestRequirements: (questId) => {
        const questDef = getQuestById(questId);
        if (!questDef) return false;

        const state = get();

        // Check required flags
        if (questDef.requiredFlags) {
          for (const flag of questDef.requiredFlags) {
            if (!state.story.flags[flag]) return false;
          }
        }

        // Check required quests
        if (questDef.requiredQuests) {
          for (const reqQuestId of questDef.requiredQuests) {
            if (!state.quests.completed.includes(reqQuestId)) return false;
          }
        }

        // Check level (if party exists)
        if (questDef.requiredLevel && state.party.length > 0) {
          const partyLevel = Math.max(...state.party.map((c) => c.level));
          if (partyLevel < questDef.requiredLevel) return false;
        }

        return true;
      },

      onItemCollected: (itemId, quantity) => {
        const state = get();

        // Check all active quests for collect objectives matching this item
        for (const quest of state.quests.active) {
          const questDef = getQuestById(quest.questId);
          if (!questDef) continue;

          for (const objective of questDef.objectives) {
            if (objective.type === "collect" && objective.targetId === itemId) {
              const objProgress = quest.objectives.find((o) => o.objectiveId === objective.id);
              if (objProgress && !objProgress.isComplete) {
                const newProgress = (objProgress.currentProgress ?? 0) + quantity;
                get().updateQuestProgress(quest.questId, objective.id, newProgress);
              }
            }
          }
        }
      },

      // Messages
      addMessage: (message) =>
        set((state) => ({
          messageLog: [...state.messageLog.slice(-9), message],
        })),

      clearMessages: () => set({ messageLog: [] }),

      // Shop
      enterShop: (shopId) => {
        const shop = getShopById(shopId);
        if (!shop) return;

        set({
          phase: "shop",
          shop: {
            currentShop: shop,
            selectedCategory: "buy",
            selectedIndex: 0,
            quantity: 1,
          },
        });
      },

      exitShop: () => {
        set({
          phase: "exploring",
          shop: {
            currentShop: null,
            selectedCategory: "buy",
            selectedIndex: 0,
            quantity: 1,
          },
        });
      },

      setShopCategory: (category) =>
        set((state) => ({
          shop: { ...state.shop, selectedCategory: category, selectedIndex: 0, quantity: 1 },
        })),

      setShopSelectedIndex: (index) =>
        set((state) => ({
          shop: { ...state.shop, selectedIndex: index, quantity: 1 },
        })),

      setShopQuantity: (quantity) =>
        set((state) => ({
          shop: { ...state.shop, quantity: Math.max(1, quantity) },
        })),

      buyItem: (itemId, quantity) => {
        const state = get();
        const { shop, inventory } = state;

        if (!shop.currentShop) {
          return { success: false, message: "No shop open" };
        }

        const shopItem = shop.currentShop.inventory.find((i) => i.itemId === itemId);
        if (!shopItem) {
          return { success: false, message: "Item not available" };
        }

        // Check stock
        if (shopItem.stock !== undefined && shopItem.stock < quantity) {
          return { success: false, message: "Not enough in stock" };
        }

        const totalCost = shopItem.price * quantity * (shop.currentShop.buyMultiplier ?? 1);

        // Check gold
        if (inventory.gold < totalCost) {
          return { success: false, message: "Not enough gold" };
        }

        // Perform transaction
        const item = getItemById(itemId);
        if (!item) {
          return { success: false, message: "Item not found" };
        }

        // Update inventory - InventorySlot uses { item: Item, quantity: number }
        const existingSlot = inventory.items.find((slot) => slot.item.id === itemId);
        let newItems = [...inventory.items];

        if (existingSlot) {
          newItems = newItems.map((slot) =>
            slot.item.id === itemId
              ? { ...slot, quantity: slot.quantity + quantity }
              : slot
          );
        } else {
          newItems.push({ item, quantity });
        }

        // Update shop stock if limited
        let updatedShopInventory = shop.currentShop.inventory;
        if (shopItem.stock !== undefined) {
          updatedShopInventory = shop.currentShop.inventory.map((i) =>
            i.itemId === itemId
              ? { ...i, stock: (i.stock ?? 0) - quantity }
              : i
          );
        }

        set({
          inventory: {
            ...inventory,
            gold: inventory.gold - totalCost,
            items: newItems,
          },
          shop: {
            ...shop,
            currentShop: {
              ...shop.currentShop,
              inventory: updatedShopInventory,
            },
            quantity: 1,
          },
        });

        return { success: true, message: `Bought ${quantity}x ${item.name}` };
      },

      sellItem: (itemId, quantity) => {
        const state = get();
        const { shop, inventory } = state;

        if (!shop.currentShop) {
          return { success: false, message: "No shop open" };
        }

        // Find item in inventory - InventorySlot uses { item: Item, quantity: number }
        const inventorySlot = inventory.items.find((slot) => slot.item.id === itemId);
        if (!inventorySlot || inventorySlot.quantity < quantity) {
          return { success: false, message: "Not enough items to sell" };
        }

        const item = inventorySlot.item;

        // Can't sell key items
        if (item.type === "key") {
          return { success: false, message: "Cannot sell key items" };
        }

        const sellPrice = Math.floor(item.value * (shop.currentShop.sellMultiplier ?? 0.5) * quantity);

        // Update inventory
        let newItems = inventory.items
          .map((slot) =>
            slot.item.id === itemId
              ? { ...slot, quantity: slot.quantity - quantity }
              : slot
          )
          .filter((slot) => slot.quantity > 0);

        set({
          inventory: {
            ...inventory,
            gold: inventory.gold + sellPrice,
            items: newItems,
          },
          shop: {
            ...shop,
            quantity: 1,
          },
        });

        return { success: true, message: `Sold ${quantity}x ${item.name} for ${sellPrice}G` };
      },

      // Menu
      toggleMenu: () => set((state) => ({ showMenu: !state.showMenu })),
      openSaveScreen: () => set({ showSaveScreen: true }),
      closeSaveScreen: () => set({ showSaveScreen: false }),

      // Inn
      openInn: () => set({ showInn: true }),
      closeInn: () => set({ showInn: false }),
      restAtInn: (cost: number) =>
        set((state) => {
          // Deduct gold
          const newGold = Math.max(0, state.inventory.gold - cost);

          // Restore all party members to full HP and MP
          const restoredParty = state.party.map((member) => ({
            ...member,
            stats: {
              ...member.stats,
              hp: member.stats.maxHp,
              mp: member.stats.maxMp,
            },
          }));

          return {
            inventory: {
              ...state.inventory,
              gold: newGold,
            },
            party: restoredParty,
          };
        }),

      // Level-up and rewards
      clearLevelUps: () => set({ pendingLevelUps: [] }),
      clearBattleRewards: () => set({ pendingBattleRewards: null }),

      // Save/Load
      saveGame: (slot) => {
        const state = get();
        const saveData = {
          slot,
          timestamp: Date.now(),
          playTime: state.story.playtime,
          location: state.currentMap?.name ?? "Unknown",
          party: state.party,
          inventory: state.inventory,
          storyFlags: state.story.flags,
          currentChapter: state.story.currentChapter,
          currentMapId: state.currentMap?.id ?? "havenwood",
          playerPosition: state.playerPosition,
          // Quest state
          quests: state.quests,
          // Opened chests/collectibles (convert Set to Array for JSON)
          openedChests: Array.from(state.openedChests),
          // Visited maps (convert Set to Array for JSON)
          visitedMaps: Array.from(state.visitedMaps),
        };
        localStorage.setItem(`chimera-save-${slot}`, JSON.stringify(saveData));
      },

      loadGame: (slot) => {
        const saved = localStorage.getItem(`chimera-save-${slot}`);
        if (!saved) return false;

        try {
          const data = JSON.parse(saved);
          set({
            party: data.party,
            inventory: data.inventory,
            story: {
              flags: data.storyFlags,
              currentChapter: data.currentChapter ?? 1,
              playtime: data.playTime,
            },
            playerPosition: data.playerPosition,
            phase: "exploring",
            // Restore quest state (with fallback for old saves)
            quests: data.quests ?? {
              active: [],
              completed: [],
              failed: [],
            },
            // Restore opened chests (convert Array back to Set)
            openedChests: new Set(data.openedChests ?? []),
            // Restore visited maps (convert Array back to Set)
            visitedMaps: new Set(data.visitedMaps ?? []),
          });
          get().loadMap(data.currentMapId);
          return true;
        } catch {
          return false;
        }
      },

      newGame: () => {
        set({
          ...initialState,
          phase: "system_boot",
          party: [KAI],
          activePartyIds: [KAI.id],
          // Start position - center of havenwood village
          playerPosition: {
            x: 15,
            y: 12,
            mapId: "havenwood",
            facing: "down",
          },
        });
        get().loadMap("havenwood");
      },
    }),
    {
      name: "chimera-game-state",
      partialize: (state) => ({
        party: state.party,
        inventory: state.inventory,
        story: state.story,
        playerPosition: state.playerPosition,
      }),
      // Migrate old save data to include new lattice fields
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<GameState>;
        if (state.party) {
          state.party = state.party.map((c) => ({
            ...c,
            // Add default lattice fields if missing
            optimizationPoints: c.optimizationPoints ?? 2,
            totalOPEarned: c.totalOPEarned ?? 2,
            latticeProgress: c.latticeProgress ?? {
              unlockedNodes: [],
              mutations: [],
            },
            activePassives: c.activePassives ?? [],
            systemAwareness: c.systemAwareness ?? (c.isGlitched ? 10 : 0),
          }));
        }
        return state as GameState;
      },
      version: 1,
    },
  ),
);
