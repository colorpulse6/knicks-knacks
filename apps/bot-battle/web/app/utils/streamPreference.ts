"use client";
import { useEffect, useState } from "react";

const KEY = "botbattle.stream";

export function getStreamPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

export function setStreamPreference(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
}

export function useStreamPreference(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState<boolean>(false);
  useEffect(() => setOn(getStreamPreference()), []);
  return [
    on,
    (next) => {
      setOn(next);
      setStreamPreference(next);
    },
  ];
}
