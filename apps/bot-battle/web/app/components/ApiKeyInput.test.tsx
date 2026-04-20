import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ApiKeyInput } from "./ApiKeyInput";

// Mock the ApiKeyProvider hook and utilities so we don't need a real store
vi.mock("../providers/ApiKeyProvider", () => ({
  useApiKeyStore: (selector: (s: any) => any) =>
    selector({
      setApiKey: vi.fn(),
      clearApiKey: vi.fn(),
      getApiKey: (_provider: string) => undefined,
    }),
}));

vi.mock("../utils/llm/api-keys", () => ({
  getClientApiKeys: () => ({}),
  setClientApiKey: vi.fn(),
}));

describe("ApiKeyInput — Test connection", () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("renders a Test button", () => {
    render(<ApiKeyInput provider="openai" label="OpenAI" />);
    expect(screen.getByRole("button", { name: /test/i })).toBeInTheDocument();
  });

  it("shows success after POSTing to /api/providers/test-key and receiving ok:true", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<ApiKeyInput provider="openai" label="OpenAI" />);

    // Type a key value so the button does something meaningful
    const input = screen.getByPlaceholderText(/enter your openai api key/i);
    fireEvent.change(input, { target: { value: "sk-test-key" } });

    fireEvent.click(screen.getByRole("button", { name: /test/i }));

    await waitFor(() =>
      expect(screen.getByText(/works/i)).toBeInTheDocument()
    );
  });

  it("shows error message on failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: false, error: "401: invalid" }),
    });

    render(<ApiKeyInput provider="openai" label="OpenAI" />);

    const input = screen.getByPlaceholderText(/enter your openai api key/i);
    fireEvent.change(input, { target: { value: "sk-bad-key" } });

    fireEvent.click(screen.getByRole("button", { name: /test/i }));

    await waitFor(() =>
      expect(screen.getByText(/401/)).toBeInTheDocument()
    );
  });
});
