import { describe, expect, it, vi } from "vitest";

import { RegexSummaryRequestError, requestRegexSummary } from "./explain";

async function captureError(action: () => Promise<unknown>) {
  try {
    await action();
  } catch (error) {
    return error;
  }

  throw new Error("Expected action to reject");
}

describe("requestRegexSummary", () => {
  it("posts exactly the pattern and flags to the local route", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('{"summary":"Matches digits."}', {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await requestRegexSummary({ pattern: "^\\d+$", flags: "gi" }, fetchMock);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pattern: "^\\d+$", flags: "gi" }),
    });
  });

  it("returns the summary from a complete successful response", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('{"summary":"Matches digits."}', {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      requestRegexSummary({ pattern: "^\\d+$", flags: "" }, fetchMock),
    ).resolves.toBe("Matches digits.");
  });

  it("converts the stable API error shape into a typed safe client error", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "invalid_flags",
            message: "Use unique JavaScript flags: d, g, i, m, s, u, v, y.",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const error = await captureError(() =>
      requestRegexSummary({ pattern: "a", flags: "ii" }, fetchMock),
    );

    expect(error).toBeInstanceOf(RegexSummaryRequestError);
    expect(error).toMatchObject({
      code: "invalid_flags",
      status: 400,
      message: "Use unique JavaScript flags: d, g, i, m, s, u, v, y.",
    });
  });

  it.each([
    ["invalid JSON", "not-json"],
    ["missing summary", "{}"],
    ["non-string summary", '{"summary":42}'],
    ["empty summary", '{"summary":"   "}'],
  ])(
    "rejects a malformed successful response with %s",
    async (_label, body) => {
      const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
        new Response(body, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const error = await captureError(() =>
        requestRegexSummary({ pattern: "a", flags: "" }, fetchMock),
      );

      expect(error).toBeInstanceOf(RegexSummaryRequestError);
      expect(error).toMatchObject({
        code: "invalid_response",
        message: "The explanation service returned an invalid response.",
      });
    },
  );
});
