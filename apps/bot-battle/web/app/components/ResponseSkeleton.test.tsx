import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResponseSkeleton } from "./ResponseSkeleton";

describe("ResponseSkeleton", () => {
  it("renders 3 shimmer bars", () => {
    const { container } = render(<ResponseSkeleton />);
    expect(container.querySelectorAll("[data-skeleton-bar]")).toHaveLength(3);
  });

  it("is accessible as a loading status", () => {
    render(<ResponseSkeleton />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
