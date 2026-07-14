export type RegexInput = {
  pattern: string;
  flags: string;
};

export type RegexValidationErrorCode =
  | "INVALID_INPUT"
  | "INVALID_PATTERN_TYPE"
  | "INVALID_FLAGS_TYPE"
  | "EMPTY_PATTERN"
  | "PATTERN_TOO_LONG"
  | "DUPLICATE_FLAG"
  | "UNSUPPORTED_FLAG"
  | "INVALID_REGEX";

export type RegexValidationResult =
  | { ok: true; value: RegexInput }
  | {
      ok: false;
      error: { code: RegexValidationErrorCode; message: string };
    };

const SUPPORTED_FLAGS = new Set(["d", "g", "i", "m", "s", "u", "v", "y"]);

function isInputObject(input: unknown): input is Record<string, unknown> {
  return (
    typeof input === "object" &&
    input !== null &&
    !Array.isArray(input) &&
    Object.prototype.toString.call(input) === "[object Object]"
  );
}

export function validateRegexInput(input: unknown): RegexValidationResult {
  if (!isInputObject(input)) {
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: "Input must be an object with pattern and flags fields.",
      },
    };
  }

  if (typeof input.pattern !== "string") {
    return {
      ok: false,
      error: {
        code: "INVALID_PATTERN_TYPE",
        message: "Pattern must be a string.",
      },
    };
  }

  if (typeof input.flags !== "string") {
    return {
      ok: false,
      error: {
        code: "INVALID_FLAGS_TYPE",
        message: "Flags must be a string.",
      },
    };
  }

  if (input.pattern.trim().length === 0) {
    return {
      ok: false,
      error: {
        code: "EMPTY_PATTERN",
        message: "Pattern must not be empty.",
      },
    };
  }

  if (input.pattern.length > 1000) {
    return {
      ok: false,
      error: {
        code: "PATTERN_TOO_LONG",
        message: "Pattern must be 1,000 characters or fewer.",
      },
    };
  }

  const seenFlags = new Set<string>();
  for (const flag of input.flags) {
    if (!SUPPORTED_FLAGS.has(flag)) {
      return {
        ok: false,
        error: {
          code: "UNSUPPORTED_FLAG",
          message: `Flag "${flag}" is not supported.`,
        },
      };
    }

    if (seenFlags.has(flag)) {
      return {
        ok: false,
        error: {
          code: "DUPLICATE_FLAG",
          message: `Flag "${flag}" must not be repeated.`,
        },
      };
    }

    seenFlags.add(flag);
  }

  try {
    new RegExp(input.pattern, input.flags);
  } catch {
    return {
      ok: false,
      error: {
        code: "INVALID_REGEX",
        message:
          "Pattern and flags do not form a valid JavaScript regular expression.",
      },
    };
  }

  return {
    ok: true,
    value: { pattern: input.pattern, flags: input.flags },
  };
}

export function compileGlobalRegex(pattern: string, flags: string): RegExp {
  const globalFlags = flags.includes("g") ? flags : `${flags}g`;
  return new RegExp(pattern, globalFlags);
}
