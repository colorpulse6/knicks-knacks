"use client";

import { useState, useCallback, useEffect } from "react";
import { useGameStore } from "../../stores/gameStore";
import { QUESTS, getQuestById } from "../../data/quests";
import type { Quest, QuestProgress } from "../../types/quest";

type QuestFilter = "active" | "all" | "completed";

interface QuestListItem {
  quest: Quest;
  progress: QuestProgress | null;
  status: "not_started" | "active" | "completed" | "failed";
}

export default function QuestScreen() {
  const { quests, getQuestStatus, getQuestProgress } = useGameStore();
  const [filter, setFilter] = useState<QuestFilter>("active");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Build the filtered quest list
  const getQuestList = (): QuestListItem[] => {
    const allQuests = Object.values(QUESTS);

    return allQuests
      .map((quest) => ({
        quest,
        progress: getQuestProgress(quest.id),
        status: getQuestStatus(quest.id),
      }))
      .filter((item) => {
        switch (filter) {
          case "active":
            return item.status === "active";
          case "completed":
            return item.status === "completed";
          case "all":
            return item.status !== "not_started"; // Show only started quests
          default:
            return true;
        }
      });
  };

  const questList = getQuestList();

  // Keep selected index in bounds
  useEffect(() => {
    if (selectedIndex >= questList.length) {
      setSelectedIndex(Math.max(0, questList.length - 1));
    }
  }, [questList.length, selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Filter navigation with left/right arrows
      if (e.key === "ArrowLeft" || e.key === "a") {
        e.preventDefault();
        e.stopPropagation();
        const filters: QuestFilter[] = ["active", "all", "completed"];
        const currentIdx = filters.indexOf(filter);
        const newIdx = currentIdx > 0 ? currentIdx - 1 : filters.length - 1;
        setFilter(filters[newIdx]);
        setSelectedIndex(0);
      }

      if (e.key === "ArrowRight" || e.key === "d") {
        e.preventDefault();
        e.stopPropagation();
        const filters: QuestFilter[] = ["active", "all", "completed"];
        const currentIdx = filters.indexOf(filter);
        const newIdx = currentIdx < filters.length - 1 ? currentIdx + 1 : 0;
        setFilter(filters[newIdx]);
        setSelectedIndex(0);
      }

      // Quest list navigation with up/down arrows
      if (e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : Math.max(0, questList.length - 1)
        );
      }

      if (e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) =>
          prev < questList.length - 1 ? prev + 1 : 0
        );
      }
    },
    [filter, questList.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "main":
        return "text-amber-400";
      case "side":
        return "text-blue-400";
      case "guild":
        return "text-purple-400";
      case "personal":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  // Get status indicator
  const getStatusIndicator = (
    status: "not_started" | "active" | "completed" | "failed"
  ): { icon: string; color: string } => {
    switch (status) {
      case "active":
        return { icon: "◆", color: "text-amber-400" };
      case "completed":
        return { icon: "✓", color: "text-green-400" };
      case "failed":
        return { icon: "✗", color: "text-red-400" };
      default:
        return { icon: "○", color: "text-gray-500" };
    }
  };

  // Render empty state
  if (questList.length === 0) {
    const emptyMessage =
      filter === "active"
        ? "No active quests. Talk to villagers to find work."
        : filter === "completed"
        ? "No completed quests yet."
        : "No quests discovered yet.";

    return (
      <div className="flex flex-col h-full">
        {/* Filter tabs */}
        <div className="flex gap-4 mb-4 pb-2 border-b border-gray-700/50">
          {(["active", "all", "completed"] as QuestFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setSelectedIndex(0);
              }}
              className={`
                px-3 py-1 text-sm font-medium rounded transition-colors
                ${
                  filter === f
                    ? "bg-amber-700/30 text-amber-300"
                    : "text-gray-400 hover:text-gray-200"
                }
              `}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center flex-1">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>

        {/* Navigation hint */}
        <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-500">
          [←/→] Filter • [↑/↓] Select • [Esc] Back
        </div>
      </div>
    );
  }

  const selectedQuest = questList[selectedIndex];

  return (
    <div className="flex flex-col h-full">
      {/* Filter tabs */}
      <div className="flex gap-4 mb-4 pb-2 border-b border-gray-700/50">
        {(["active", "all", "completed"] as QuestFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setSelectedIndex(0);
            }}
            className={`
              px-3 py-1 text-sm font-medium rounded transition-colors
              ${
                filter === f
                  ? "bg-amber-700/30 text-amber-300"
                  : "text-gray-400 hover:text-gray-200"
              }
            `}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Quest list */}
        <div className="w-48 overflow-auto">
          <div className="space-y-1">
            {questList.map((item, index) => {
              const isSelected = index === selectedIndex;
              const status = getStatusIndicator(item.status);

              return (
                <button
                  key={item.quest.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`
                    w-full px-3 py-2 text-left rounded transition-colors
                    ${
                      isSelected
                        ? "bg-amber-700/30 border border-amber-500/50"
                        : "hover:bg-gray-700/30 border border-transparent"
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    <span className={`${status.color} mt-0.5`}>
                      {status.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-200 truncate">
                        {item.quest.name}
                      </div>
                      <div
                        className={`text-xs ${getCategoryColor(
                          item.quest.category
                        )} uppercase`}
                      >
                        {item.quest.category}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quest details */}
        <div className="flex-1 bg-gray-800/30 rounded p-4 overflow-auto">
          {selectedQuest && (
            <>
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-amber-400">
                  {selectedQuest.quest.name}
                </h3>
                <p
                  className={`text-xs ${getCategoryColor(
                    selectedQuest.quest.category
                  )} uppercase tracking-wide`}
                >
                  {selectedQuest.quest.category} Quest
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4">
                {selectedQuest.quest.description}
              </p>

              {/* Long description (if available) */}
              {selectedQuest.quest.longDescription && (
                <div className="mb-4 text-gray-400 text-xs italic border-l-2 border-gray-600 pl-3">
                  {selectedQuest.quest.longDescription}
                </div>
              )}

              {/* Objectives */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Objectives
                </h4>
                <div className="space-y-2">
                  {selectedQuest.quest.objectives.map((objective) => {
                    // Get progress for this objective
                    const objProgress = selectedQuest.progress?.objectives.find(
                      (o) => o.objectiveId === objective.id
                    );
                    // If quest is completed, all objectives should show as complete
                    const isComplete = selectedQuest.status === "completed"
                      ? true
                      : (objProgress?.isComplete ?? false);
                    const currentProgress = objProgress?.currentProgress ?? 0;
                    const targetProgress = objective.targetQuantity ?? 1;

                    // Skip hidden objectives unless they're complete
                    if (objective.hidden && !isComplete) {
                      return (
                        <div
                          key={objective.id}
                          className="flex items-center gap-2 text-sm text-gray-500"
                        >
                          <span>?</span>
                          <span className="italic">???</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={objective.id}
                        className={`flex items-center gap-2 text-sm ${
                          isComplete ? "text-green-400" : "text-gray-300"
                        }`}
                      >
                        <span>{isComplete ? "✓" : "○"}</span>
                        <span
                          className={isComplete ? "line-through" : ""}
                        >
                          {objective.description}
                          {objective.targetQuantity && objective.targetQuantity > 1 && (
                            <span className="text-gray-500 ml-1">
                              ({currentProgress}/{targetProgress})
                            </span>
                          )}
                        </span>
                        {objective.optional && (
                          <span className="text-xs text-gray-500">
                            (Optional)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rewards (only show for completed quests or active quests) */}
              {(selectedQuest.status === "completed" ||
                selectedQuest.status === "active") && (
                <div>
                  <h4 className="text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                    Rewards
                  </h4>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {selectedQuest.quest.rewards.gold && (
                      <div className="flex items-center gap-1 text-amber-400">
                        <span className="text-xs">●</span>
                        {selectedQuest.quest.rewards.gold} Gold
                      </div>
                    )}
                    {selectedQuest.quest.rewards.experience && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <span className="text-xs">●</span>
                        {selectedQuest.quest.rewards.experience} XP
                      </div>
                    )}
                    {selectedQuest.quest.rewards.items?.map((item) => (
                      <div
                        key={item.itemId}
                        className="flex items-center gap-1 text-gray-300"
                      >
                        <span className="text-xs">●</span>
                        {item.quantity}x {formatItemName(item.itemId)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status banner for completed/failed quests */}
              {selectedQuest.status === "completed" && (
                <div className="mt-4 p-2 bg-green-900/20 border border-green-500/30 rounded text-green-400 text-sm text-center">
                  Quest Completed
                </div>
              )}
              {selectedQuest.status === "failed" && (
                <div className="mt-4 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm text-center">
                  Quest Failed
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation hint */}
      <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-500">
        [←/→] Filter • [↑/↓] Select • [Esc] Back
      </div>
    </div>
  );
}

// Helper to format item IDs to display names
function formatItemName(itemId: string): string {
  return itemId
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
