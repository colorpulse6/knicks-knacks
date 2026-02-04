"use client";

import type { ATBState } from "../../types/battle";

interface ATBGaugeProps {
  atb: ATBState;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export default function ATBGauge({
  atb,
  size = "medium",
  showLabel = false,
}: ATBGaugeProps) {
  const percent = (atb.gauge / atb.maxGauge) * 100;
  const isReady = atb.isReady;

  const sizeClasses = {
    small: "h-1 w-16",
    medium: "h-2 w-24",
    large: "h-3 w-32",
  };

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-xs text-gray-400 w-8">ATB</span>
      )}
      <div className={`${sizeClasses[size]} bg-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`h-full transition-all duration-75 ${
            isReady
              ? "bg-yellow-400 animate-pulse"
              : "bg-cyan-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {isReady && (
        <span className="text-xs text-yellow-400 font-bold">!</span>
      )}
    </div>
  );
}
