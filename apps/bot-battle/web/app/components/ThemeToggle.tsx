"use client";
import React from "react";

const STORAGE_KEY = "botbattle.theme";

export const ThemeToggle: React.FC = () => {
  function toggle() {
    const root = document.documentElement;
    const isDark = root.classList.toggle("dark");
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className="text-xs uppercase tracking-widest border border-rule text-ink-soft px-2.5 py-1 rounded-sm hover:text-ink hover:border-ink-soft"
      aria-label="Toggle theme"
    >
      Toggle theme
    </button>
  );
};
