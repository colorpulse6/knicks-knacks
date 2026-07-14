import { GroqError, requestGroqSummary } from "@/app/lib/groq";
import {
  type RegexValidationErrorCode,
  validateRegexInput,
} from "@/app/lib/regex";

type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

const INVALID_FLAGS_MESSAGE =
  "Use unique JavaScript flags: d, g, i, m, s, u, v, y.";

function errorResponse(
  status: number,
  code: string,
  message: string,
): Response {
  return Response.json({ error: { code, message } } satisfies ApiError, {
    status,
  });
}

function hasRuntimeInvalidFlags(input: unknown): boolean {
  if (
    typeof input !== "object" ||
    input === null ||
    !("flags" in input) ||
    typeof input.flags !== "string"
  ) {
    return false;
  }

  try {
    new RegExp("", input.flags);
    return false;
  } catch {
    return true;
  }
}

function validationErrorResponse(
  code: RegexValidationErrorCode,
  input: unknown,
): Response {
  if (code === "PATTERN_TOO_LONG") {
    return errorResponse(
      400,
      "invalid_pattern",
      "Pattern must be 1,000 characters or fewer.",
    );
  }

  if (
    code === "INVALID_FLAGS_TYPE" ||
    code === "DUPLICATE_FLAG" ||
    code === "UNSUPPORTED_FLAG" ||
    (code === "INVALID_REGEX" && hasRuntimeInvalidFlags(input))
  ) {
    return errorResponse(400, "invalid_flags", INVALID_FLAGS_MESSAGE);
  }

  if (code === "INVALID_REGEX") {
    return errorResponse(
      400,
      "invalid_pattern",
      "Pattern and flags must form a valid JavaScript regular expression.",
    );
  }

  return errorResponse(
    400,
    "invalid_pattern",
    "Pattern must be a non-empty string.",
  );
}

export async function POST(request: Request): Promise<Response> {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return errorResponse(
      400,
      "invalid_json",
      "Request body must be valid JSON.",
    );
  }

  const validation = validateRegexInput(input);
  if (!validation.ok) {
    return validationErrorResponse(validation.error.code, input);
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse(
      503,
      "service_unavailable",
      "The explanation service is not configured.",
    );
  }

  const model = process.env.GROQ_MODEL?.trim() || undefined;

  try {
    const summary = await requestGroqSummary({
      ...validation.value,
      apiKey,
      model,
    });
    return Response.json({ summary });
  } catch (error) {
    if (error instanceof GroqError) {
      const status = error.code === "upstream_timeout" ? 504 : 502;
      return errorResponse(status, error.code, error.message);
    }

    return errorResponse(
      502,
      "upstream_error",
      "The explanation service is unavailable.",
    );
  }
}
