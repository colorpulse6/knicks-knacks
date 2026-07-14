import { Children, isValidElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "test-geist-sans" }),
  Geist_Mono: () => ({ variable: "test-geist-mono" }),
}));

import RootLayout, { viewport } from "./layout";

interface BodyProps {
  readonly children?: ReactNode;
  readonly className?: string;
}

function rootBody(children: ReactNode) {
  const layout = RootLayout({ children });
  const body = Children.only(layout.props.children);

  if (!isValidElement<BodyProps>(body) || body.type !== "body") {
    throw new Error("RootLayout must render one body element");
  }

  return body;
}

describe("RootLayout", () => {
  it("does not force a light foreground onto transition-state pages", () => {
    const body = rootBody(<main>Light page</main>);

    expect(body.props.className).not.toMatch(/\btext-(?:white|slate-100)\b/);
    expect(body.props.className).toContain("test-geist-sans");
    expect(body.props.className).toContain("test-geist-mono");
    expect(body.props.className).toContain("bg-[#07090c]");
    expect(body.props.className).toContain("antialiased");
  });

  it("lets native controls follow light and dark color preferences", () => {
    expect(viewport).toMatchObject({
      colorScheme: "light dark",
      themeColor: "#07090c",
    });
  });
});
