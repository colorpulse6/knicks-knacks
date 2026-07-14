import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SettingsPage from "./page";

vi.mock("../providers/ApiKeyProvider", () => {
  const state = { apiKeys: {}, clearAllApiKeys: vi.fn() };

  return {
    useApiKeyStore: (
      selector: (state: {
        apiKeys: Record<string, string>;
        clearAllApiKeys: () => void;
      }) => unknown,
    ) => selector(state),
  };
});

vi.mock("../utils/llm/api-keys", () => ({
  getClientApiKeys: () => ({}),
}));

vi.mock("../components/ApiKeyInput", () => ({
  ApiKeyInput: () => null,
}));

describe("settings page API-key disclosure", () => {
  it("distinguishes session storage from transmission through BotBattle", () => {
    render(<SettingsPage />);

    const disclosure = screen.getByText(/add your own API keys/i);
    expect(disclosure).toHaveTextContent(
      /kept in your browser's memory.*not stored between sessions/i,
    );
    expect(disclosure).toHaveTextContent(
      /test a key or run a benchmark.*through BotBattle's API to the provider/i,
    );
    expect(disclosure).not.toHaveTextContent(/never saved to our servers/i);
  });
});
