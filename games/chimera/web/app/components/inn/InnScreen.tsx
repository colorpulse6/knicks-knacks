"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useGameStore } from "../../stores/gameStore";

const INN_COST = 50;

type InnState = "greeting" | "resting" | "restored" | "insufficient_funds";

export default function InnScreen() {
  const { party, inventory, closeInn, restAtInn } = useGameStore();
  const [innState, setInnState] = useState<InnState>("greeting");
  const [selectedOption, setSelectedOption] = useState(0);

  const canAfford = inventory.gold >= INN_COST;

  // Check if party needs healing
  const partyNeedsRest = party.some(
    (member) =>
      member.stats.hp < member.stats.maxHp || member.stats.mp < member.stats.maxMp
  );

  const handleRest = useCallback(() => {
    if (!canAfford) {
      setInnState("insufficient_funds");
      return;
    }

    setInnState("resting");

    // Show resting animation, then restore
    setTimeout(() => {
      restAtInn(INN_COST);
      setInnState("restored");
    }, 1500);
  }, [canAfford, restAtInn]);

  const handleConfirm = useCallback(() => {
    if (innState === "greeting") {
      if (selectedOption === 0) {
        handleRest();
      } else {
        closeInn();
      }
    } else if (innState === "restored" || innState === "insufficient_funds") {
      closeInn();
    }
  }, [innState, selectedOption, handleRest, closeInn]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();

      if (innState === "resting") return; // No input during rest animation

      switch (e.key) {
        case "ArrowUp":
        case "w":
          e.preventDefault();
          if (innState === "greeting") {
            setSelectedOption((prev) => (prev > 0 ? prev - 1 : 1));
          }
          break;
        case "ArrowDown":
        case "s":
          e.preventDefault();
          if (innState === "greeting") {
            setSelectedOption((prev) => (prev < 1 ? prev + 1 : 0));
          }
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handleConfirm();
          break;
        case "Escape":
          e.preventDefault();
          closeInn();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [innState, handleConfirm, closeInn]);

  const renderContent = () => {
    switch (innState) {
      case "greeting":
        return (
          <>
            {/* Innkeeper dialogue */}
            <div className="bg-black/60 rounded-lg p-6 mb-6 border border-gray-700">
              <p className="text-gray-200 mb-2">
                &quot;Welcome, weary traveler! A warm bed and a good night&apos;s rest
                will restore your strength.&quot;
              </p>
              <p className="text-gray-400 text-sm">
                Rest for <span className="text-yellow-400">{INN_COST} gold</span>?
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedOption(0);
                  handleRest();
                }}
                className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                  selectedOption === 0
                    ? "bg-amber-700/50 border-2 border-amber-500"
                    : "bg-gray-800/50 border-2 border-gray-600 hover:border-gray-500"
                } ${!canAfford ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src="/sprites/ui/bed_icon.png"
                    alt=""
                    width={24}
                    height={24}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="text-white">Rest ({INN_COST}g)</span>
                </div>
                {selectedOption === 0 && <span className="text-amber-400">▸</span>}
              </button>

              <button
                onClick={() => {
                  setSelectedOption(1);
                  closeInn();
                }}
                className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                  selectedOption === 1
                    ? "bg-gray-700/50 border-2 border-gray-500"
                    : "bg-gray-800/50 border-2 border-gray-600 hover:border-gray-500"
                }`}
              >
                <span className="text-gray-300">No thanks</span>
                {selectedOption === 1 && <span className="text-gray-400">▸</span>}
              </button>
            </div>

            {/* Affordability warning */}
            {!canAfford && (
              <p className="mt-4 text-center text-red-400 text-sm">
                Not enough gold!
              </p>
            )}
          </>
        );

      case "resting":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
              {/* Heal particles */}
              <Image
                src="/sprites/effects/heal_particles.png"
                alt=""
                width={128}
                height={128}
                className="absolute inset-0 animate-pulse opacity-80"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              {/* Pulsing overlay fallback */}
              <div className="absolute inset-0 bg-blue-500/20 animate-pulse rounded-full" />
              <span className="text-4xl">💤</span>
            </div>
            <p className="text-xl text-blue-300 animate-pulse">Resting...</p>
          </div>
        );

      case "restored":
        return (
          <div className="flex flex-col items-center justify-center py-8">
            {/* Restored banner */}
            <div className="mb-6">
              <Image
                src="/sprites/ui/fully_rested_banner.png"
                alt="Fully Rested"
                width={200}
                height={50}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".fallback-text");
                  if (fallback) (fallback as HTMLElement).style.display = "block";
                }}
              />
              <h2 className="fallback-text text-2xl font-bold text-green-400 text-center hidden">
                ✨ Fully Rested! ✨
              </h2>
            </div>

            {/* Party status */}
            <div className="bg-black/60 rounded-lg p-4 w-full mb-6 border border-gray-700">
              <p className="text-center text-gray-400 mb-3">Party Restored</p>
              <div className="space-y-2">
                {party.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-white">{member.name}</span>
                    <div className="flex gap-4">
                      <span className="text-green-400">
                        HP {member.stats.hp}/{member.stats.maxHp}
                      </span>
                      <span className="text-blue-400">
                        MP {member.stats.mp}/{member.stats.maxMp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={closeInn}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded text-white font-bold transition-colors"
            >
              Continue
            </button>
          </div>
        );

      case "insufficient_funds":
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-black/60 rounded-lg p-6 mb-6 border border-red-700/50">
              <p className="text-gray-200 text-center">
                &quot;I&apos;m sorry, but you don&apos;t have enough gold. Come back when
                you have {INN_COST} gold.&quot;
              </p>
            </div>

            <button
              onClick={closeInn}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold transition-colors"
            >
              Leave
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-screen bg-black">
      {/* Background - styled like ShopScreen */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage: "url(/assets/inn/inn_interior_bg.png)",
          backgroundColor: "#2a1f1a",
        }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content container */}
      <div className="relative z-10 flex flex-col h-full p-8">
        {/* Inn header */}
        <div className="flex items-center gap-6 mb-6">
          {/* Innkeeper Portrait */}
          <div
            className="w-24 h-24 rounded-lg border-2 border-amber-600 bg-gray-800"
            style={{
              backgroundImage: "url(/portraits/innkeeper.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Inn Name */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-amber-400">The Weary Wanderer Inn</h1>
            <p className="text-gray-400 text-sm">Havenwood Village</p>
          </div>

          {/* Player Gold */}
          <div className="bg-black/60 px-6 py-3 rounded-lg border border-amber-600">
            <span className="text-yellow-400 font-bold text-xl">{inventory.gold} G</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg">
            {renderContent()}
          </div>
        </div>

        {/* Footer controls */}
        {innState === "greeting" && (
          <div className="mt-6 flex justify-center gap-8 text-sm text-gray-500">
            <span>[↑/↓] Select</span>
            <span>[Enter] Confirm</span>
            <span>[Esc] Leave</span>
          </div>
        )}

        {/* Exit Button */}
        <button
          onClick={closeInn}
          className="absolute bottom-4 right-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 transition-colors"
        >
          Leave Inn
        </button>
      </div>
    </div>
  );
}
