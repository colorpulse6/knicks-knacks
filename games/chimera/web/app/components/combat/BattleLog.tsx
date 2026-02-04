"use client";

import { useEffect, useRef } from "react";
import type { BattleLogEntry } from "../../types/battle";

interface BattleLogProps {
  entries: BattleLogEntry[];
  maxEntries?: number;
}

export default function BattleLog({ entries, maxEntries = 5 }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const recentEntries = entries.slice(-maxEntries);

  return (
    <div
      ref={scrollRef}
      className="bg-gray-900/80 border border-gray-700 rounded-lg p-3 h-32 overflow-y-auto"
    >
      {recentEntries.map((entry, index) => (
        <div
          key={`${entry.timestamp}_${index}`}
          className={`text-sm mb-1 last:mb-0 ${getEntryColor(entry.type)}`}
        >
          {entry.message}
        </div>
      ))}
    </div>
  );
}

function getEntryColor(type: BattleLogEntry["type"]): string {
  switch (type) {
    case "action":
      return "text-white";
    case "damage":
      return "text-red-400";
    case "heal":
      return "text-green-400";
    case "status":
      return "text-yellow-400";
    case "system":
      return "text-cyan-400";
    default:
      return "text-gray-400";
  }
}
