"use client";

import { useState, useEffect } from "react";

export interface DamageNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  type: "damage" | "heal" | "critical" | "miss";
}

interface DamageNumbersProps {
  numbers: DamageNumber[];
  onRemove: (id: string) => void;
}

export default function DamageNumbers({ numbers, onRemove }: DamageNumbersProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {numbers.map((num) => (
        <FloatingNumber key={num.id} number={num} onComplete={() => onRemove(num.id)} />
      ))}
    </div>
  );
}

interface FloatingNumberProps {
  number: DamageNumber;
  onComplete: () => void;
}

function FloatingNumber({ number, onComplete }: FloatingNumberProps) {
  const [offset, setOffset] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Float upward with easing
      setOffset(progress * 60);

      // Fade out in the last 30%
      if (progress > 0.7) {
        setOpacity(1 - (progress - 0.7) / 0.3);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  const colorClass = {
    damage: "text-white",
    heal: "text-green-400",
    critical: "text-red-500",
    miss: "text-gray-400",
  }[number.type];

  const sizeClass = number.type === "critical" ? "text-4xl font-black" : "text-2xl";

  return (
    <div
      className={`absolute font-bold ${colorClass} ${sizeClass} drop-shadow-lg`}
      style={{
        left: number.x,
        top: number.y - offset,
        opacity,
        transform: "translate(-50%, -50%)",
        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
      }}
    >
      {number.type === "miss" ? "MISS" : number.type === "critical" ? `${number.value}!` : number.value}
    </div>
  );
}

/**
 * Hook for managing damage numbers
 */
export function useDamageNumbers() {
  const [numbers, setNumbers] = useState<DamageNumber[]>([]);

  const addNumber = (
    value: number,
    x: number,
    y: number,
    type: DamageNumber["type"] = "damage"
  ) => {
    const id = `${Date.now()}_${Math.random()}`;
    setNumbers((prev) => [...prev, { id, value, x, y, type }]);
  };

  const removeNumber = (id: string) => {
    setNumbers((prev) => prev.filter((n) => n.id !== id));
  };

  return { numbers, addNumber, removeNumber };
}
