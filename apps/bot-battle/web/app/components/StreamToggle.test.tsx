import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StreamToggle } from "./StreamToggle";
import { getStreamPreference } from "../utils/streamPreference";

describe("StreamToggle", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("renders an unchecked checkbox labeled 'Stream when possible' by default", () => {
    render(<StreamToggle />);
    const cb = screen.getByRole("checkbox", { name: /stream when possible/i }) as HTMLInputElement;
    expect(cb).toBeInTheDocument();
    expect(cb.checked).toBe(false);
  });

  it("reflects existing localStorage preference on mount", () => {
    localStorage.setItem("botbattle.stream", "on");
    render(<StreamToggle />);
    const cb = screen.getByRole("checkbox", { name: /stream when possible/i }) as HTMLInputElement;
    expect(cb.checked).toBe(true);
  });

  it("persists to localStorage on toggle", () => {
    render(<StreamToggle />);
    const cb = screen.getByRole("checkbox", { name: /stream when possible/i });
    fireEvent.click(cb);
    expect(localStorage.getItem("botbattle.stream")).toBe("on");
    fireEvent.click(cb);
    expect(localStorage.getItem("botbattle.stream")).toBe("off");
  });
});

describe("getStreamPreference", () => {
  beforeEach(() => localStorage.clear());
  it("returns false when unset", () => {
    expect(getStreamPreference()).toBe(false);
  });
  it("returns true when set to 'on'", () => {
    localStorage.setItem("botbattle.stream", "on");
    expect(getStreamPreference()).toBe(true);
  });
});
