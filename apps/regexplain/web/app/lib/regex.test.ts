import { describe, expect, it } from "vitest";

import { compileGlobalRegex, validateRegexInput } from "./regex";

describe("validateRegexInput", () => {
  it("accepts a valid JavaScript pattern and flags", () => {
    expect(validateRegexInput({ pattern: "^[a-z]+$", flags: "i" })).toEqual({
      ok: true,
      value: { pattern: "^[a-z]+$", flags: "i" },
    });
  });

  it.each([null, undefined, "pattern", 42, [], /pattern/])(
    "rejects non-object input: %s",
    (input) => {
      expect(validateRegexInput(input)).toEqual({
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: "Input must be an object with pattern and flags fields.",
        },
      });
    },
  );

  it("rejects a non-string pattern", () => {
    expect(validateRegexInput({ pattern: 42, flags: "" })).toEqual({
      ok: false,
      error: {
        code: "INVALID_PATTERN_TYPE",
        message: "Pattern must be a string.",
      },
    });
  });

  it("rejects a non-string flags value", () => {
    expect(validateRegexInput({ pattern: "a", flags: null })).toEqual({
      ok: false,
      error: {
        code: "INVALID_FLAGS_TYPE",
        message: "Flags must be a string.",
      },
    });
  });

  it.each(["", "   ", "\n\t"])("rejects an empty pattern: %j", (pattern) => {
    expect(validateRegexInput({ pattern, flags: "" })).toEqual({
      ok: false,
      error: {
        code: "EMPTY_PATTERN",
        message: "Pattern must not be empty.",
      },
    });
  });

  it("rejects patterns longer than 1,000 characters", () => {
    expect(
      validateRegexInput({ pattern: "a".repeat(1001), flags: "" }),
    ).toEqual({
      ok: false,
      error: {
        code: "PATTERN_TOO_LONG",
        message: "Pattern must be 1,000 characters or fewer.",
      },
    });
  });

  it("rejects duplicate flags", () => {
    expect(validateRegexInput({ pattern: "a", flags: "ii" })).toEqual({
      ok: false,
      error: {
        code: "DUPLICATE_FLAG",
        message: 'Flag "i" must not be repeated.',
      },
    });
  });

  it("rejects unsupported flags", () => {
    expect(validateRegexInput({ pattern: "a", flags: "x" })).toEqual({
      ok: false,
      error: {
        code: "UNSUPPORTED_FLAG",
        message: 'Flag "x" is not supported.',
      },
    });
  });

  it("rejects runtime-incompatible flags", () => {
    const result = validateRegexInput({ pattern: "a", flags: "uv" });

    expect(result).toMatchObject({
      ok: false,
      error: { code: "INVALID_REGEX" },
    });
    if (!result.ok) {
      expect(result.error.message).toBe(
        "Pattern and flags do not form a valid JavaScript regular expression.",
      );
    }
  });

  it("rejects invalid pattern syntax", () => {
    expect(validateRegexInput({ pattern: "[", flags: "" })).toEqual({
      ok: false,
      error: {
        code: "INVALID_REGEX",
        message:
          "Pattern and flags do not form a valid JavaScript regular expression.",
      },
    });
  });

  it("preserves meaningful pattern whitespace", () => {
    expect(validateRegexInput({ pattern: " a ", flags: "" })).toEqual({
      ok: true,
      value: { pattern: " a ", flags: "" },
    });
  });

  it("treats slash-delimited notation as literal pattern content", () => {
    expect(validateRegexInput({ pattern: "/a/i", flags: "" })).toEqual({
      ok: true,
      value: { pattern: "/a/i", flags: "" },
    });
  });
});

describe("compileGlobalRegex", () => {
  it("preserves supplied flags and adds global matching", () => {
    const regex = compileGlobalRegex("a", "i");

    expect(regex.flags).toContain("i");
    expect(regex.flags).toContain("g");
  });

  it("does not duplicate an existing global flag", () => {
    const regex = compileGlobalRegex("a", "gi");

    expect(regex.flags).toBe("gi");
    expect([...regex.flags].filter((flag) => flag === "g")).toHaveLength(1);
  });
});
