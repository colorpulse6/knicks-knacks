"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useGameStore } from "../../stores/gameStore";

export default function DialogueBox() {
  const { activeDialogue, advanceDialogue, endDialogue } = useGameStore();
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    if (!activeDialogue) {
      setDisplayedText("");
      setIsComplete(false);
      return;
    }

    const text = activeDialogue.text;
    let currentIndex = 0;
    setDisplayedText("");
    setIsComplete(false);
    setSelectedChoiceIndex(0); // Reset choice selection

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 30); // Speed of typewriter

    return () => clearInterval(interval);
  }, [activeDialogue]);

  const handleAdvance = useCallback(() => {
    if (!activeDialogue) return;

    if (!isComplete) {
      // Skip to full text
      setDisplayedText(activeDialogue.text);
      setIsComplete(true);
    } else if (activeDialogue.choices && activeDialogue.choices.length > 0) {
      // Has choices - select the highlighted choice
      const choice = activeDialogue.choices[selectedChoiceIndex];
      if (choice) {
        if (choice.effect) {
          choice.effect();
        }
        if (choice.nextNodeId) {
          advanceDialogue(choice.nextNodeId);
        } else {
          endDialogue();
        }
      }
    } else if (activeDialogue.next) {
      // Has next dialogue node - advance to it
      advanceDialogue(activeDialogue.next);
    } else {
      // Check for onComplete actions before ending dialogue
      if (activeDialogue.onComplete) {
        // Handle startBattle flag - trigger the pending encounter
        if (activeDialogue.onComplete.startBattle) {
          const state = useGameStore.getState();
          if (state.pendingEncounter && state.pendingEncounter.length > 0) {
            // Start the battle transition
            useGameStore.setState({ isTransitioning: true });
          }
        }

        // Handle setFlags
        if (activeDialogue.onComplete.setFlags) {
          const { setStoryFlag } = useGameStore.getState();
          for (const flag of activeDialogue.onComplete.setFlags) {
            setStoryFlag(flag, true);
          }
        }

        // Handle callback
        if (activeDialogue.onComplete.callback) {
          activeDialogue.onComplete.callback();
        }
      }

      // End dialogue
      endDialogue();
    }
  }, [isComplete, activeDialogue, advanceDialogue, endDialogue, selectedChoiceIndex]);

  // Keyboard support for advancing dialogue
  useEffect(() => {
    if (!activeDialogue) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent escape from closing dialogue during quest-critical moments
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Navigate choices with arrow keys
      if (isComplete && activeDialogue.choices && activeDialogue.choices.length > 0) {
        if (e.key === "ArrowUp" || e.key === "w") {
          e.preventDefault();
          setSelectedChoiceIndex((prev) =>
            prev > 0 ? prev - 1 : activeDialogue.choices!.length - 1
          );
          return;
        }
        if (e.key === "ArrowDown" || e.key === "s") {
          e.preventDefault();
          setSelectedChoiceIndex((prev) =>
            prev < activeDialogue.choices!.length - 1 ? prev + 1 : 0
          );
          return;
        }
      }

      // Advance dialogue with Enter or Space
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        handleAdvance();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [handleAdvance, isComplete, activeDialogue]);

  if (!activeDialogue) return null;

  return (
    <div
      className="dialogue-box z-30 pointer-events-auto cursor-pointer"
      onClick={handleAdvance}
    >
      {/* Speaker name */}
      {activeDialogue.speaker && (
        <div className={`absolute -top-3 bg-menu-bg px-3 py-1 rounded border border-menu-border ${activeDialogue.portrait ? "left-24" : "left-4"}`}>
          <span className="text-gold text-sm font-bold">
            {activeDialogue.speaker}
          </span>
        </div>
      )}

      {/* Portrait (if available) */}
      {activeDialogue.portrait && (
        <div className="absolute -top-20 -left-4 w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg border-2 border-gold/50 overflow-hidden shadow-lg">
          <Image
            src={`/portraits/${activeDialogue.portrait}.png`}
            alt={activeDialogue.speaker || "Character"}
            width={96}
            height={96}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image doesn't exist
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl bg-gray-800">💬</div>`;
            }}
          />
        </div>
      )}

      {/* Dialogue text */}
      <div className="dialogue-text mt-2 mb-4 min-h-[60px]">
        {displayedText}
        {!isComplete && (
          <span className="animate-pulse ml-1">▌</span>
        )}
      </div>

      {/* Choices (if available) */}
      {isComplete && activeDialogue.choices && activeDialogue.choices.length > 0 && (
        <div className="mt-4 space-y-2">
          {activeDialogue.choices.map((choice, index) => {
            const isSelected = index === selectedChoiceIndex;
            return (
            <button
              key={index}
              className={`block w-full text-left px-4 py-2 rounded transition-colors ${
                isSelected
                  ? "bg-menu-highlight text-white"
                  : "bg-menu-highlight/30 hover:bg-menu-highlight/50"
              }`}
              onMouseEnter={() => setSelectedChoiceIndex(index)}
              onClick={(e) => {
                e.stopPropagation();
                // Handle choice selection - run effect first
                if (choice.effect) {
                  choice.effect();
                }
                // Advance to next dialogue node or end
                if (choice.nextNodeId) {
                  advanceDialogue(choice.nextNodeId);
                } else {
                  endDialogue();
                }
              }}
            >
              <span className={`mr-2 ${isSelected ? "text-gold" : "text-gray-500"}`}>
                {isSelected ? "▶" : " "}
              </span>
              {choice.text}
            </button>
          );
          })}
        </div>
      )}

      {/* Continue indicator */}
      {isComplete && (!activeDialogue.choices || activeDialogue.choices.length === 0) && (
        <div className="absolute bottom-3 right-4 animate-bounce">
          <span className="text-gold text-lg">▼</span>
        </div>
      )}
    </div>
  );
}
