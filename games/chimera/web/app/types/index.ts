// Re-export all types for easy importing

export * from "./character";
export * from "./battle";
export * from "./map";
export * from "./item";
export * from "./animation";
export * from "./quest";
export * from "./shop";

// Game state types
export type GamePhase =
  | "title"
  | "system_boot"
  | "loading"
  | "exploring"
  | "combat"
  | "dialogue"
  | "menu"
  | "cutscene"
  | "shop"
  | "game_over"
  | "victory";

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  portrait?: string;
  choices?: DialogueChoice[];
  next?: string;
  onComplete?: () => void;
}

export interface DialogueChoice {
  text: string;
  nextNodeId: string;
  condition?: () => boolean;
  effect?: () => void;
}

export interface SaveData {
  slot: number;
  timestamp: number;
  playTime: number; // In seconds
  location: string;
  party: import("./character").Character[];
  inventory: import("./item").Inventory;
  storyFlags: Record<string, boolean>;
  currentMapId: string;
  playerPosition: import("./map").PlayerPosition;
}

// Story flags for tracking progress
export interface StoryState {
  flags: Record<string, boolean>;
  currentChapter: number;
  playtime: number;
}

// Input state for the game
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  confirm: boolean; // Enter/Space/Z
  cancel: boolean; // Escape/X
  menu: boolean; // M/Escape
  pause: boolean; // P
}
