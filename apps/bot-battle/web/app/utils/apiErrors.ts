export class APIError extends Error {
  constructor(
    message: string,
    public type: string,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function parseGroqError(error: any): APIError {
  try {
    // Handle rate limit errors
    if (
      error?.error?.type === "tokens" &&
      error.error.code === "rate_limit_exceeded"
    ) {
      const message = `Rate limit exceeded. Please try again later or upgrade your plan.`;
      return new APIError(message, "rate_limit", error.error.code);
    }

    // Handle other Groq API errors
    if (error?.error?.message) {
      return new APIError(error.error.message, "api_error", error.error.code);
    }

    // Handle raw string errors
    if (typeof error === "string") {
      try {
        const parsed = JSON.parse(error);
        return parseGroqError(parsed);
      } catch {
        return new APIError(error, "unknown");
      }
    }

    // Fallback for unexpected errors
    return new APIError(
      "An unexpected error occurred with the API request",
      "unexpected_error"
    );
  } catch (e) {
    return new APIError("Failed to parse error response", "parse_error");
  }
}

export function parseOpenAIError(error: any): APIError {
  try {
    // Handle token/context limit errors
    if (error?.error?.code === "context_length_exceeded") {
      return new APIError(
        "Token limit exceeded for this model. Please try a shorter prompt.",
        "rate_limit",
        error.error.code
      );
    }

    // Handle quota errors
    if (error?.error?.code === "insufficient_quota") {
      return new APIError(
        "API quota exceeded. Please check your token balance.",
        "rate_limit",
        error.error.code
      );
    }

    // Handle other OpenAI API errors
    if (error?.error?.message) {
      return new APIError(error.error.message, "api_error", error.error.code);
    }

    // Fallback for unexpected errors
    return new APIError(
      "An unexpected error occurred with the OpenAI API",
      "unexpected_error"
    );
  } catch (e) {
    return new APIError("Failed to parse OpenAI error response", "parse_error");
  }
}

export function parseGeminiError(error: any): APIError {
  try {
    // Handle resource exhaustion errors
    if (error?.error?.status === "RESOURCE_EXHAUSTED") {
      return new APIError(
        "Token limit or quota exceeded for Gemini. Please try again later.",
        "rate_limit",
        error.error.status
      );
    }

    // Handle other Gemini API errors
    if (error?.error?.message) {
      return new APIError(error.error.message, "api_error", error.error.status);
    }

    // Fallback for unexpected errors
    return new APIError(
      "An unexpected error occurred with the Gemini API",
      "unexpected_error"
    );
  } catch (e) {
    return new APIError("Failed to parse Gemini error response", "parse_error");
  }
}

export const getFriendlyErrorMessage = (error: APIError): string => {
  switch (error.type) {
    case "rate_limit":
      return `⚠️ ${error.message}`;
    case "api_error":
      return `API Error: ${error.message}`;
    case "context_length_exceeded":
      return `⚠️ Token limit reached: ${error.message}`;
    case "insufficient_quota":
      return `⚠️ Quota exceeded: ${error.message}`;
    case "parse_error":
      return "Failed to understand the error response";
    default:
      return error.message || "An unexpected error occurred";
  }
};
