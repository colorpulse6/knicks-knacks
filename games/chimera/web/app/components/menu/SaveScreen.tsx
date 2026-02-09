"use client";

import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "../../stores/gameStore";
import Image from "next/image";

/**
 * Simple icon component for confirm/delete actions
 */
function SaveIcon({ type, size = 20 }: { type: "confirm" | "delete"; size?: number }) {
  // Use simple text icons for reliability
  return (
    <span
      style={{
        fontSize: size,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
      }}
    >
      {type === "confirm" ? "✓" : "✕"}
    </span>
  );
}

interface SaveSlotData {
  slot: number;
  timestamp: number;
  playTime: number;
  location: string;
  party: { name: string; level: number }[];
  isEmpty: boolean;
}

interface SaveScreenProps {
  mode: "save" | "load";
  onClose: () => void;
  onComplete?: () => void;
}

const SLOT_COUNT = 4;

/**
 * Get metadata for a save slot without loading the full save
 */
function getSaveSlotData(slot: number): SaveSlotData {
  const saved = localStorage.getItem(`chimera-save-${slot}`);
  if (!saved) {
    return {
      slot,
      timestamp: 0,
      playTime: 0,
      location: "",
      party: [],
      isEmpty: true,
    };
  }

  try {
    const data = JSON.parse(saved);
    return {
      slot,
      timestamp: data.timestamp ?? 0,
      playTime: data.playTime ?? 0,
      location: data.location ?? "Unknown",
      party: data.party ?? [],
      isEmpty: false,
    };
  } catch {
    return {
      slot,
      timestamp: 0,
      playTime: 0,
      location: "",
      party: [],
      isEmpty: true,
    };
  }
}

/**
 * Format playtime from milliseconds to HH:MM:SS
 */
function formatPlayTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format timestamp to readable date
 */
function formatTimestamp(ts: number): string {
  if (!ts) return "";
  const date = new Date(ts);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SaveScreen({ mode, onClose, onComplete }: SaveScreenProps) {
  const { saveGame, loadGame } = useGameStore();
  const [slots, setSlots] = useState<SaveSlotData[]>([]);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Load slot data on mount
  useEffect(() => {
    const slotData = Array.from({ length: SLOT_COUNT }, (_, i) => getSaveSlotData(i + 1));
    setSlots(slotData);
  }, []);

  // Action handlers (defined before keyboard effect)
  const performSave = useCallback((slotNum: number) => {
    saveGame(slotNum);
    setMessage("Game saved!");
    // Refresh slot data
    const slotData = Array.from({ length: SLOT_COUNT }, (_, i) => getSaveSlotData(i + 1));
    setSlots(slotData);
    setTimeout(() => {
      setMessage(null);
      onComplete?.();
    }, 1500);
  }, [saveGame, onComplete]);

  const performLoad = useCallback((slotNum: number) => {
    const success = loadGame(slotNum);
    if (success) {
      setMessage("Game loaded!");
      setTimeout(() => {
        setMessage(null);
        onComplete?.();
        onClose();
      }, 1000);
    } else {
      setMessage("Failed to load save data");
      setTimeout(() => setMessage(null), 2000);
    }
  }, [loadGame, onComplete, onClose]);

  const handleSlotAction = useCallback(() => {
    const slot = slots[selectedSlot];
    if (!slot) return;

    if (mode === "save") {
      if (!slot.isEmpty) {
        // Confirm overwrite
        setConfirmOverwrite(true);
      } else {
        // Save to empty slot
        performSave(slot.slot);
      }
    } else {
      // Load mode
      if (slot.isEmpty) {
        setMessage("No save data in this slot");
        setTimeout(() => setMessage(null), 2000);
      } else {
        performLoad(slot.slot);
      }
    }
  }, [mode, selectedSlot, slots, performSave, performLoad]);

  const handleConfirmSave = useCallback(() => {
    const slot = slots[selectedSlot];
    if (slot) {
      performSave(slot.slot);
    }
    setConfirmOverwrite(false);
  }, [slots, selectedSlot, performSave]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Stop propagation to prevent Game.tsx from handling these keys
      e.stopPropagation();

      if (confirmOverwrite) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleConfirmSave();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setConfirmOverwrite(false);
        }
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
          e.preventDefault();
          setSelectedSlot((prev) => (prev > 0 ? prev - 1 : SLOT_COUNT - 1));
          break;
        case "ArrowDown":
        case "s":
          e.preventDefault();
          setSelectedSlot((prev) => (prev < SLOT_COUNT - 1 ? prev + 1 : 0));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handleSlotAction();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [confirmOverwrite, onClose, handleSlotAction, handleConfirmSave]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative bg-gray-900 border-2 border-cyan-500 rounded-lg p-6 w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Image
              src={mode === "save" ? "/sprites/ui/save_icon.png" : "/sprites/ui/load_icon.png"}
              alt=""
              width={24}
              height={24}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <h2 className="text-xl font-bold text-cyan-400">
              {mode === "save" ? "Save Game" : "Load Game"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Message overlay */}
        {message && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-lg z-20">
            <span className="text-2xl text-cyan-400 font-bold drop-shadow-lg">{message}</span>
          </div>
        )}

        {/* Confirm overwrite dialog */}
        {confirmOverwrite && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center rounded-lg p-4 z-10">
            <span className="text-lg text-yellow-400 mb-4">
              Overwrite existing save?
            </span>
            <div className="flex gap-4">
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded flex items-center gap-2"
              >
                <SaveIcon type="confirm" size={24} />
                <span>Yes</span>
              </button>
              <button
                onClick={() => setConfirmOverwrite(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded flex items-center gap-2"
              >
                <SaveIcon type="delete" size={24} />
                <span>No</span>
              </button>
            </div>
          </div>
        )}

        {/* Save slots */}
        <div className="space-y-2">
          {slots.map((slot, index) => (
            <div
              key={slot.slot}
              onClick={() => setSelectedSlot(index)}
              onDoubleClick={handleSlotAction}
              className={`
                relative p-3 rounded border-2 cursor-pointer transition-all
                ${selectedSlot === index
                  ? "border-cyan-400 bg-cyan-900/30"
                  : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                }
              `}
              style={{ minHeight: "80px" }}
            >
              {/* Slot number */}
              <div className="absolute top-2 left-3 text-xs text-gray-500">
                Slot {slot.slot}
              </div>

              {slot.isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Image
                    src="/sprites/ui/save_slot_empty.png"
                    alt="Empty slot"
                    width={32}
                    height={32}
                    className="opacity-50"
                    onError={(e) => {
                      // Hide image on error, show text fallback
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="text-gray-500 italic text-sm">Empty Slot</span>
                </div>
              ) : (
                <div className="mt-3">
                  {/* Location and timestamp */}
                  <div className="flex justify-between items-start">
                    <span className="text-white font-medium">{slot.location}</span>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(slot.timestamp)}
                    </span>
                  </div>

                  {/* Party info and playtime */}
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex gap-2">
                      {slot.party.slice(0, 4).map((member, i) => (
                        <span key={i} className="text-xs text-cyan-300">
                          {member.name} Lv.{member.level ?? 1}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatPlayTime(slot.playTime)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer controls */}
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <span>[↑/↓] Select</span>
          <span>[Enter] {mode === "save" ? "Save" : "Load"}</span>
          <span>[Esc] Back</span>
        </div>
      </div>
    </div>
  );
}
