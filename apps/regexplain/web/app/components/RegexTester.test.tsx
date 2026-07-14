import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import RegexTester from "./RegexTester";

describe("RegexTester", () => {
  it("preserves case-insensitive flags while finding every match globally", async () => {
    const user = userEvent.setup();
    render(<RegexTester pattern="a" flags="i" />);

    await user.type(screen.getByRole("textbox", { name: "Sample string" }), "A a B");

    expect(screen.getAllByText(/A|a/, { selector: "mark" })).toHaveLength(2);
    expect(screen.getByText("2 matches found.")).toBeVisible();
  });

  it("does not duplicate a supplied global flag", async () => {
    const user = userEvent.setup();
    render(<RegexTester pattern="a" flags="g" />);

    await user.type(screen.getByRole("textbox", { name: "Sample string" }), "a a");

    expect(screen.getAllByText("a", { selector: "mark" })).toHaveLength(2);
    expect(screen.queryByText(/Invalid regex/)).not.toBeInTheDocument();
  });
});
