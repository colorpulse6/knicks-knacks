import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BenchmarkClient from "./BenchmarkClient";

vi.mock("./providers/ApiKeyProvider", () => ({
  useApiKeyStore: (
    selector: (state: { apiKeys: Record<string, string> }) => unknown,
  ) => selector({ apiKeys: {} }),
}));

describe("BenchmarkClient", () => {
  it("uses a level-two heading for the fallback API-key notice", () => {
    render(<BenchmarkClient />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Using fallback API keys",
      }),
    ).toBeInTheDocument();
  });
});
