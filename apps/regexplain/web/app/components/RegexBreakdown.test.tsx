import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import RegexBreakdown from "./RegexBreakdown";

function renderedTokenSource(): string {
  return screen
    .getAllByRole("button", { name: /token/i })
    .map((button) => button.textContent ?? "")
    .join("");
}

describe("RegexBreakdown", () => {
  it.each([
    ["indices flag", "a", "d"],
    ["Unicode sets flag", "[a&&b]", "v"],
  ])(
    "keeps a complete map for a runtime-valid pattern using the %s",
    (_case, pattern, flags) => {
      expect(() => new RegExp(pattern, flags)).not.toThrow();

      render(<RegexBreakdown pattern={pattern} flags={flags} />);

      expect(screen.queryByText("Invalid regex:")).not.toBeInTheDocument();
      expect(renderedTokenSource()).toBe(pattern);
    },
  );

  it("preserves a Unicode property escape as one meaningful token", () => {
    const pattern = "\\p{Letter}+";
    expect(() => new RegExp(pattern, "u")).not.toThrow();

    render(<RegexBreakdown pattern={pattern} flags="u" />);

    expect(screen.queryByText("Invalid regex:")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Token 1: \\p{Letter}" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Token 2: +" })).toBeVisible();
    expect(renderedTokenSource()).toBe(pattern);
  });

  it("preserves literal slashes exactly as entered", () => {
    const pattern = "/a/i";
    expect(() => new RegExp(pattern)).not.toThrow();

    render(<RegexBreakdown pattern={pattern} flags="" />);

    expect(renderedTokenSource()).toBe(pattern);
    expect(
      screen.getAllByRole("button", { name: /token \d+: \/$/i }),
    ).toHaveLength(2);
  });

  it("still reports patterns rejected by the JavaScript runtime", () => {
    expect(() => new RegExp("[")).toThrow();

    render(<RegexBreakdown pattern="[" flags="" />);

    expect(screen.getByText("Invalid regex:")).toBeVisible();
    expect(renderedTokenSource()).toBe("[");
  });

  it("keeps literal and quantifier details in the local syntax map", () => {
    render(<RegexBreakdown pattern="^a+$" flags="i" />);

    expect(
      screen.getByRole("button", { name: /token \d+: a$/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /token \d+: \+$/i }),
    ).toBeVisible();
  });

  it("exposes local token details through focusable native buttons", async () => {
    const user = userEvent.setup();
    render(<RegexBreakdown pattern="^a+$" flags="i" />);

    const tokenButtons = screen.getAllByRole("button", { name: /token/i });
    expect(tokenButtons.length).toBeGreaterThan(0);
    expect(tokenButtons[0].tagName).toBe("BUTTON");
    expect(tokenButtons[0]).toHaveAttribute("type", "button");

    await user.tab();
    expect(tokenButtons[0]).toHaveFocus();
  });

  it("associates the active token with one stable visible description region", async () => {
    const user = userEvent.setup();
    render(<RegexBreakdown pattern="^a+$" flags="i" />);

    const tokenButtons = screen.getAllByRole("button", { name: /token/i });
    const activeButton = tokenButtons[0];
    await user.click(activeButton);

    const description = screen.getByRole("region", {
      name: "Selected token description",
    });
    expect(description).toBeVisible();
    expect(description).not.toBeEmptyDOMElement();
    expect(activeButton).toHaveAttribute("aria-describedby", description.id);
    expect(activeButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("region", { name: "Local syntax map" }),
    ).toHaveAccessibleName("Local syntax map");
  });
});
