import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModelBadge } from "./ModelBadge";

describe("ModelBadge", () => {
  it("renders REASONING for reasoning modelType", () => {
    render(<ModelBadge modelType="reasoning" status="current" />);
    expect(screen.getByText("REASONING")).toBeInTheDocument();
  });

  it("renders LEGACY for legacy status", () => {
    render(<ModelBadge modelType="standard" status="legacy" />);
    expect(screen.getByText("LEGACY")).toBeInTheDocument();
  });

  it("renders PREVIEW for preview status", () => {
    render(<ModelBadge modelType="standard" status="preview" />);
    expect(screen.getByText("PREVIEW")).toBeInTheDocument();
  });

  it("renders REASONING first when both reasoning and legacy", () => {
    const { container } = render(<ModelBadge modelType="reasoning" status="legacy" />);
    const badges = container.querySelectorAll("[data-badge]");
    expect(badges[0]).toHaveAttribute("data-badge", "reasoning");
    expect(badges[1]).toHaveAttribute("data-badge", "legacy");
  });

  it("renders nothing for current + standard", () => {
    const { container } = render(<ModelBadge modelType="standard" status="current" />);
    expect(container.firstChild).toBeNull();
  });
});
