import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import SettingsLayout, { metadata } from "./layout";

describe("settings layout", () => {
  it("owns route-specific metadata without social cards", () => {
    expect(metadata).toEqual({
      title: "API Key Settings",
      description:
        "Configure provider API keys used by BotBattle in this browser.",
      alternates: { canonical: "/settings" },
      robots: { index: false, follow: true },
    });
    expect(metadata).not.toHaveProperty("openGraph");
    expect(metadata).not.toHaveProperty("twitter");
  });

  it("passes settings content through", () => {
    render(
      SettingsLayout({
        children: createElement("p", null, "Settings content"),
      }),
    );

    expect(screen.getByText("Settings content")).toBeInTheDocument();
  });
});
