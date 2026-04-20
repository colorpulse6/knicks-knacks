"use client";
import React from "react";
import { useStreamPreference } from "../utils/streamPreference";

export const StreamToggle: React.FC = () => {
  const [on, setOn] = useStreamPreference();
  return (
    <label className="flex items-center gap-2 text-xs text-ink-soft select-none cursor-pointer">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => setOn(e.target.checked)}
        className="accent-rust"
      />
      Stream when possible
    </label>
  );
};
