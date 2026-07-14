import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SITE } from "../config/site";
import { SupportLink } from "./SupportLink";

describe("SupportLink", () => {
  it("opens the support page safely from an accessible control", () => {
    render(<SupportLink />);

    const link = screen.getByRole("link", {
      name: /support botbattle - buy me a coffee/i,
    });

    expect(link.getAttribute("href")).toBe(SITE.supportUrl);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.getAttribute("title")).toBe("Buy me a coffee");
    expect(link.classList.contains("min-h-10")).toBe(true);
    expect(link.classList.contains("min-w-10")).toBe(true);
    expect(link.className).toContain("focus-visible");
    expect(link.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});
