// Quest System Types for Chimera RPG

export type QuestStatus = "not_started" | "active" | "completed" | "failed";

export type ObjectiveType =
  | "collect"   // Gather X items
  | "deliver"   // Bring item to NPC
  | "talk"      // Speak with NPC
  | "defeat"    // Kill X enemies
  | "explore";  // Visit location

export interface QuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  targetId?: string;        // Item ID, NPC ID, enemy type, location ID
  targetQuantity?: number;  // How many needed (default 1)
  currentProgress?: number; // Current count
  isComplete?: boolean;
  hidden?: boolean;         // Hidden until discovered
  optional?: boolean;       // Bonus objective
}

export interface QuestReward {
  gold?: number;
  experience?: number;
  items?: { itemId: string; quantity: number }[];
  shards?: string[];        // Shard IDs
  storyFlags?: string[];    // Flags to set on completion
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  giver: string;            // NPC ID who gives the quest
  category: "main" | "side" | "guild" | "personal";
  chapter?: number;         // Story chapter this belongs to

  // Prerequisites
  requiredFlags?: string[];
  requiredLevel?: number;
  requiredQuests?: string[];

  // Quest content
  objectives: QuestObjective[];
  rewards: QuestReward;

  // Lore (Chimera's medieval/sci-fi blend)
  medievalLore?: string;    // In-world explanation
  hiddenTruth?: string;     // Sci-fi reality (revealed later in story)
}

// Runtime progress tracking (for save/load)
export interface QuestProgress {
  questId: string;
  status: QuestStatus;
  objectives: {
    objectiveId: string;
    currentProgress: number;
    isComplete: boolean;
  }[];
  startedAt?: number;
  completedAt?: number;
}

// Quest state in game store
export interface QuestState {
  active: QuestProgress[];
  completed: string[];  // Quest IDs
  failed: string[];     // Quest IDs
}

// Helper to create initial quest progress
export function createQuestProgress(quest: Quest): QuestProgress {
  return {
    questId: quest.id,
    status: "active",
    objectives: quest.objectives.map((obj) => ({
      objectiveId: obj.id,
      currentProgress: 0,
      isComplete: false,
    })),
    startedAt: Date.now(),
  };
}

// Helper to check if all required objectives are complete
export function areRequiredObjectivesComplete(
  quest: Quest,
  progress: QuestProgress
): boolean {
  return quest.objectives
    .filter((obj) => !obj.optional)
    .every((obj) => {
      const objProgress = progress.objectives.find(
        (p) => p.objectiveId === obj.id
      );
      return objProgress?.isComplete ?? false;
    });
}
