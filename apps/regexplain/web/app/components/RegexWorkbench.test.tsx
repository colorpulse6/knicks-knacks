import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getExample } from "../data/examples";
import RegexWorkbench from "./RegexWorkbench";

const originalLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, reject, resolve };
}

describe("RegexWorkbench", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    window.history.replaceState({}, "", originalLocation);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows separate labeled inputs and explains that slash characters stay literal", async () => {
    const user = userEvent.setup();
    render(<RegexWorkbench />);

    const patternInput = screen.getByRole("textbox", { name: "Pattern" });
    expect(patternInput).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Flags" })).toBeVisible();
    expect(
      screen.getByText(
        /enter the pattern without surrounding slash delimiters/i,
      ),
    ).toBeVisible();
    expect(
      screen.getByText(/slashes typed in the pattern field remain literal/i),
    ).toBeVisible();

    await user.type(patternInput, "/a/i");
    expect(patternInput).toHaveValue("/a/i");
  });

  it("loads the complete checked-in email example when selected", async () => {
    const user = userEvent.setup();
    const emailExample = getExample("email-regex");
    render(<RegexWorkbench />);

    await user.type(screen.getByRole("textbox", { name: "Flags" }), "i");
    await user.click(screen.getByRole("button", { name: emailExample?.name }));

    expect(screen.getByRole("textbox", { name: "Pattern" })).toHaveValue(
      emailExample?.pattern,
    );
    expect(screen.getByRole("textbox", { name: "Flags" })).toHaveValue(
      emailExample?.flags,
    );
  });

  it("loads a known example from only the example query key after mount", async () => {
    const hexExample = getExample("hex-color-regex");
    window.history.replaceState(
      {},
      "",
      "/?pattern=ignored&flags=g&example=hex-color-regex#workbench",
    );

    render(<RegexWorkbench />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "Pattern" })).toHaveValue(
        hexExample?.pattern,
      );
    });
    expect(screen.getByRole("textbox", { name: "Flags" })).toHaveValue(
      hexExample?.flags,
    );
  });

  it("ignores unknown examples and unrelated query keys", async () => {
    window.history.replaceState(
      {},
      "",
      "/?example=not-checked-in&pattern=should-not-load&flags=i#workbench",
    );

    render(<RegexWorkbench />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "Pattern" })).toHaveValue("");
    });
    expect(screen.getByRole("textbox", { name: "Flags" })).toHaveValue("");
  });

  it.each([
    ["empty", "", "", "Pattern must not be empty."],
    [
      "invalid",
      "[",
      "",
      "Pattern and flags do not form a valid JavaScript regular expression.",
    ],
  ])(
    "shows stable local validation for %s input without fetching",
    async (_case, pattern, flags, message) => {
      const user = userEvent.setup();
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);
      render(<RegexWorkbench />);

      if (pattern) {
        fireEvent.change(screen.getByRole("textbox", { name: "Pattern" }), {
          target: { value: pattern },
        });
      }
      if (flags) {
        await user.type(screen.getByRole("textbox", { name: "Flags" }), flags);
      }
      await user.click(screen.getByRole("button", { name: "Explain regex" }));

      expect(screen.getByRole("status")).toHaveTextContent(message);
      expect(screen.getByRole("textbox", { name: "Pattern" })).toHaveFocus();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("posts the exact pattern and flags and renders only the returned AI summary in its panel", async () => {
    const user = userEvent.setup();
    let resolveResponse: ((response: Response) => void) | undefined;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<RegexWorkbench />);

    await user.type(screen.getByRole("textbox", { name: "Pattern" }), "/a/i");
    await user.type(screen.getByRole("textbox", { name: "Flags" }), "g");
    await user.click(screen.getByRole("button", { name: "Explain regex" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Generating AI summary…",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pattern: "/a/i", flags: "g" }),
    });

    resolveResponse?.(
      jsonResponse({ summary: "Matches the literal characters /a/i." }),
    );

    const aiPanel = await screen.findByRole("region", { name: "AI summary" });
    expect(aiPanel).toHaveTextContent("Matches the literal characters /a/i.");
    expect(within(aiPanel).queryByRole("button")).not.toBeInTheDocument();
    expect(within(aiPanel).queryByRole("list")).not.toBeInTheDocument();
  });

  it("ignores a successful response after a different example is selected", async () => {
    const user = userEvent.setup();
    const request = deferred<Response>();
    const fetchMock = vi.fn(() => request.promise);
    const hexExample = getExample("hex-color-regex");
    vi.stubGlobal("fetch", fetchMock);
    render(<RegexWorkbench />);

    await user.type(screen.getByRole("textbox", { name: "Pattern" }), "a");
    await user.click(screen.getByRole("button", { name: "Explain regex" }));
    await user.click(screen.getByRole("button", { name: hexExample?.name }));

    request.resolve(jsonResponse({ summary: "Stale summary for a." }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Explain regex" }),
      ).toBeEnabled();
    });
    expect(screen.getByRole("textbox", { name: "Pattern" })).toHaveValue(
      hexExample?.pattern,
    );
    expect(screen.getByRole("textbox", { name: "Flags" })).toHaveValue(
      hexExample?.flags,
    );
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(
      screen.getByRole("region", { name: "AI summary" }),
    ).not.toHaveTextContent("Stale summary for a.");
  });

  it("keeps focus on an example control that invalidates a pending request", async () => {
    const user = userEvent.setup();
    const request = deferred<Response>();
    const hexExample = getExample("hex-color-regex");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => request.promise),
    );
    render(<RegexWorkbench />);

    await user.type(screen.getByRole("textbox", { name: "Pattern" }), "a");
    await user.click(screen.getByRole("button", { name: "Explain regex" }));
    const exampleButton = screen.getByRole("button", {
      name: hexExample?.name,
    });
    await user.click(exampleButton);

    expect(exampleButton).toHaveFocus();
  });

  it("does not steal tester focus when the current request fails", async () => {
    const user = userEvent.setup();
    const request = deferred<Response>();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => request.promise),
    );
    render(<RegexWorkbench />);

    await user.type(screen.getByRole("textbox", { name: "Pattern" }), "a");
    await user.click(screen.getByRole("button", { name: "Explain regex" }));
    const sampleInput = screen.getByRole("textbox", { name: "Sample string" });
    await user.type(sampleInput, "A a");
    expect(sampleInput).toHaveFocus();

    request.reject(new Error("offline"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to explain this regex. Please try again.",
    );
    expect(sampleInput).toHaveFocus();
  });

  it("keeps focus on the submit button when the current AI request fails", async () => {
    const user = userEvent.setup();
    const request = deferred<Response>();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => request.promise),
    );
    render(<RegexWorkbench />);

    const patternInput = screen.getByRole("textbox", { name: "Pattern" });
    const flagsInput = screen.getByRole("textbox", { name: "Flags" });
    const submitButton = screen.getByRole("button", { name: "Explain regex" });
    await user.type(patternInput, "a");
    await user.type(flagsInput, "i");
    await user.click(submitButton);
    expect(submitButton).toHaveFocus();

    request.resolve(
      jsonResponse(
        {
          error: {
            code: "upstream_timeout",
            message: "The explanation service timed out.",
          },
        },
        { status: 504 },
      ),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The explanation service timed out.",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "AI summary unavailable.",
    );
    expect(submitButton).toHaveFocus();
    expect(patternInput).toHaveValue("a");
    expect(flagsInput).toHaveValue("i");
  });

  it("ignores a failed response after the pattern is edited", async () => {
    const user = userEvent.setup();
    const request = deferred<Response>();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => request.promise),
    );
    render(<RegexWorkbench />);

    const patternInput = screen.getByRole("textbox", { name: "Pattern" });
    await user.type(patternInput, "a");
    await user.click(screen.getByRole("button", { name: "Explain regex" }));
    await user.type(patternInput, "b");

    request.reject(new Error("offline"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Explain regex" }),
      ).toBeEnabled();
    });
    expect(patternInput).toHaveValue("ab");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("does not submit twice while the current request is pending", async () => {
    const user = userEvent.setup();
    const request = deferred<Response>();
    const fetchMock = vi.fn(() => request.promise);
    vi.stubGlobal("fetch", fetchMock);
    render(<RegexWorkbench />);

    const patternInput = screen.getByRole("textbox", { name: "Pattern" });
    await user.type(patternInput, "a");
    await user.click(screen.getByRole("button", { name: "Explain regex" }));
    patternInput.focus();
    await user.keyboard("{Enter}");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retains local tools and editable input when the AI request fails", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: "upstream_error",
            message: "The explanation service is temporarily unavailable.",
          },
        },
        { status: 502 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<RegexWorkbench />);

    const patternInput = screen.getByRole("textbox", { name: "Pattern" });
    const flagsInput = screen.getByRole("textbox", { name: "Flags" });
    await user.type(patternInput, "a");
    await user.type(flagsInput, "i");
    await user.click(screen.getByRole("button", { name: "Explain regex" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The explanation service is temporarily unavailable.",
    );
    expect(patternInput).toHaveValue("a");
    expect(flagsInput).toHaveValue("i");
    expect(
      screen.getByRole("region", { name: "Local syntax map" }),
    ).toBeVisible();

    const sampleInput = screen.getByRole("textbox", { name: "Sample string" });
    await user.type(sampleInput, "A a");
    expect(screen.getAllByText(/A|a/, { selector: "mark" })).toHaveLength(2);
  });

  it("discloses that the pattern is sent to Groq", () => {
    render(<RegexWorkbench />);

    expect(screen.getByText(/your pattern is sent to groq/i)).toBeVisible();
  });
});
