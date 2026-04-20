import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EffortSelector, effortToBudgetTokens } from "./EffortSelector";

describe("EffortSelector", () => {
  it("renders low/medium/high options", () => {
    render(<EffortSelector value="medium" onChange={() => {}} />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("medium");
    expect(select.querySelectorAll("option").length).toBe(3);
  });

  it("fires onChange with new value", () => {
    const onChange = vi.fn();
    render(<EffortSelector value="medium" onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "high" } });
    expect(onChange).toHaveBeenCalledWith("high");
  });
});

describe("effortToBudgetTokens", () => {
  it("maps low/medium/high to 1024/4096/16384", () => {
    expect(effortToBudgetTokens("low")).toBe(1024);
    expect(effortToBudgetTokens("medium")).toBe(4096);
    expect(effortToBudgetTokens("high")).toBe(16384);
  });
});
