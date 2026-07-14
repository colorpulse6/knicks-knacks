import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import RegexBreakdown from "./RegexBreakdown";

describe("RegexBreakdown", () => {
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
