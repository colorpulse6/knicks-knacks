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

function expectSourceFallbackNotice(): void {
  expect(
    screen.getByText(
      /valid in javascript.*detailed local semantics are unavailable.*source-preserving/i,
    ),
  ).toBeVisible();
}

describe("RegexBreakdown", () => {
  it("discloses when a valid pattern is shown in source-fallback mode", () => {
    const pattern = "[a&&b]";
    expect(() => new RegExp(pattern, "v")).not.toThrow();

    render(<RegexBreakdown pattern={pattern} flags="v" />);

    expectSourceFallbackNotice();
    expect(renderedTokenSource()).toBe(pattern);
  });

  it("labels v-mode intersection as source-preserving instead of literal ampersands", async () => {
    const user = userEvent.setup();
    const pattern = "[a&&b]";
    expect(() => new RegExp(pattern, "v")).not.toThrow();

    render(<RegexBreakdown pattern={pattern} flags="v" />);

    expect(renderedTokenSource()).toBe(pattern);
    const ampersand = screen.getAllByRole("button", {
      name: /token \d+: &$/i,
    })[0];
    await user.click(ampersand);
    const description = screen.getByRole("region", {
      name: "Selected token description",
    });
    expect(description).not.toHaveTextContent("Literal: &");
    expect(description).toHaveTextContent(
      /source fragment: &.*detailed local semantics are unavailable/i,
    );
    expectSourceFallbackNotice();
  });

  it("does not describe v-mode set subtraction as a generic hyphen range", async () => {
    const user = userEvent.setup();
    const pattern = "[\\p{ASCII}--\\p{Letter}]";
    expect(() => new RegExp(pattern, "v")).not.toThrow();

    render(<RegexBreakdown pattern={pattern} flags="v" />);

    expect(renderedTokenSource()).toBe(pattern);
    const hyphen = screen.getAllByRole("button", {
      name: /token \d+: -$/i,
    })[0];
    await user.click(hyphen);
    const description = screen.getByRole("region", {
      name: "Selected token description",
    });
    expect(description).not.toHaveTextContent("Range or literal hyphen");
    expect(description).toHaveTextContent(
      /source fragment: -.*detailed local semantics are unavailable/i,
    );
    expectSourceFallbackNotice();
  });

  it("does not guess escape semantics for a v-mode string-set member", async () => {
    const user = userEvent.setup();
    const pattern = "[\\q{ab|cd}]";
    expect(() => new RegExp(pattern, "v")).not.toThrow();

    render(<RegexBreakdown pattern={pattern} flags="v" />);

    expect(renderedTokenSource()).toBe(pattern);
    const stringSetEscape = screen.getByRole("button", {
      name: /token \d+: \\q$/i,
    });
    await user.click(stringSetEscape);
    const description = screen.getByRole("region", {
      name: "Selected token description",
    });
    expect(description).not.toHaveTextContent("Escaped character");
    expect(description).toHaveTextContent(
      /source fragment: \\q.*detailed local semantics are unavailable/i,
    );
    expectSourceFallbackNotice();
  });

  it("keeps semantic descriptions for patterns supported by the AST parser", async () => {
    const user = userEvent.setup();
    render(<RegexBreakdown pattern="^a+$" flags="i" />);

    expect(
      screen.queryByText(/detailed local semantics are unavailable/i),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Token 1: ^" }));
    expect(
      screen.getByRole("region", { name: "Selected token description" }),
    ).toHaveTextContent("^: Start of string");
  });

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
