"use client";

import type { BattleCharacter } from "../../types/battle";
import ATBGauge from "./ATBGauge";
import { StatusEffectBar } from "./StatusEffectIcons";

interface PartyStatusProps {
  party: BattleCharacter[];
  activeActorId: string | null;
  onSelectMember?: (memberId: string) => void;
}

export default function PartyStatus({
  party,
  activeActorId,
  onSelectMember,
}: PartyStatusProps) {
  return (
    <div className="bg-gray-900/90 border border-gray-700 rounded-lg p-3 w-72">
      {party.map((member) => {
        const { character, atb } = member;
        const isDead = character.stats.hp <= 0;
        const isActive = character.id === activeActorId;
        const hpPercent = (character.stats.hp / character.stats.maxHp) * 100;
        const mpPercent = (character.stats.mp / character.stats.maxMp) * 100;

        return (
          <div
            key={character.id}
            onClick={() => onSelectMember?.(character.id)}
            className={`
              p-2 rounded mb-2 last:mb-0 transition-colors cursor-pointer
              ${isDead ? "opacity-50" : ""}
              ${isActive ? "bg-cyan-900/50 border border-cyan-500" : "bg-gray-800/50 hover:bg-gray-700/50"}
            `}
          >
            {/* Name and Level */}
            <div className="flex justify-between items-center mb-1">
              <span className={`font-bold ${isDead ? "text-gray-500" : "text-white"}`}>
                {character.name}
              </span>
              <span className="text-xs text-gray-400">
                Lv.{character.level}
              </span>
            </div>

            {/* HP Bar */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-green-400 w-6">HP</span>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    hpPercent <= 25
                      ? "bg-red-500"
                      : hpPercent <= 50
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-300 w-16 text-right">
                {character.stats.hp}/{character.stats.maxHp}
              </span>
            </div>

            {/* MP Bar */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-blue-400 w-6">MP</span>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${mpPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-300 w-16 text-right">
                {character.stats.mp}/{character.stats.maxMp}
              </span>
            </div>

            {/* ATB Gauge */}
            {!isDead && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-400 w-6">ATB</span>
                <ATBGauge atb={atb} size="small" />
              </div>
            )}

            {/* Status Effects */}
            {member.statusEffects.length > 0 && (
              <StatusEffectBar effects={member.statusEffects} />
            )}
          </div>
        );
      })}
    </div>
  );
}
