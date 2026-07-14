import { afterEach, describe, expect, it, vi } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { ClientProviders } from "./ClientProviders";
import { useApiKeyStore } from "./ApiKeyProvider";
import { getClientApiKey } from "../utils/llm/api-keys";

function KeyProbe() {
  const apiKey = useApiKeyStore((state) => state.getApiKey("openai"));

  return (
    <span data-testid="key-probe">{apiKey ? "key-present" : "key-absent"}</span>
  );
}

describe("ClientProviders", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount());
    }

    container?.remove();
    root = undefined;
    container = undefined;
    localStorage.clear();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("server-renders its children instead of a loading shell", () => {
    const markup = renderToString(
      <ClientProviders>
        <span data-child-marker="true">child-marker</span>
      </ClientProviders>,
    );

    expect(markup).toContain("child-marker");
    expect(markup).not.toContain("Loading...");
  });

  it("keeps persisted API keys out of server markup", () => {
    vi.stubEnv("NEXT_PUBLIC_PERSIST_API_KEYS", "true");
    localStorage.setItem(
      "botbattle_apikeys",
      JSON.stringify({ openai: "sk-private" }),
    );

    const markup = renderToString(
      <ClientProviders>
        <KeyProbe />
      </ClientProviders>,
    );

    expect(markup).toContain("key-absent");
    expect(markup).not.toContain("sk-private");
  });

  it("hydrates matching empty state before restoring persisted keys without a request", async () => {
    vi.stubEnv("NEXT_PUBLIC_PERSIST_API_KEYS", "true");
    localStorage.setItem(
      "botbattle_apikeys",
      JSON.stringify({ openai: "sk-private" }),
    );

    const app = (
      <ClientProviders>
        <KeyProbe />
      </ClientProviders>
    );
    const serverMarkup = renderToString(app);

    container = document.createElement("div");
    container.innerHTML = serverMarkup;
    document.body.appendChild(container);

    expect(container.textContent).toContain("key-absent");
    expect(container.innerHTML).not.toContain("sk-private");

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await act(async () => {
      root = hydrateRoot(container!, app);
    });

    await waitFor(() => {
      expect(container?.textContent).toContain("key-present");
    });

    const hydrationErrors = consoleErrorSpy.mock.calls
      .flat()
      .map(String)
      .join("\n");
    expect(hydrationErrors).not.toMatch(/hydration|did not match|server html/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does not restore a stale key after its provider unmounts", async () => {
    vi.useFakeTimers();
    vi.stubEnv("NEXT_PUBLIC_PERSIST_API_KEYS", "true");
    localStorage.setItem(
      "botbattle_apikeys",
      JSON.stringify({ openai: "sk-stale" }),
    );

    container = document.createElement("div");
    document.body.appendChild(container);

    await act(async () => {
      root = createRoot(container!);
      root.render(
        <StrictMode>
          <ClientProviders>
            <KeyProbe />
          </ClientProviders>
        </StrictMode>,
      );
    });

    expect(getClientApiKey("openai")).toBe("sk-stale");

    await act(async () => root?.unmount());
    root = undefined;
    container.remove();
    container = undefined;
    localStorage.clear();

    expect(getClientApiKey("openai")).toBeNull();

    container = document.createElement("div");
    document.body.appendChild(container);

    await act(async () => {
      root = createRoot(container!);
      root.render(
        <StrictMode>
          <ClientProviders>
            <KeyProbe />
          </ClientProviders>
        </StrictMode>,
      );
    });

    expect(container.textContent).toContain("key-absent");

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(getClientApiKey("openai")).toBeNull();
  });
});
