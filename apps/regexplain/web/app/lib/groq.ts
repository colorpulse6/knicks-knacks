const GROQ_CHAT_COMPLETIONS_ENDPOINT =
  "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";
const UPSTREAM_TIMEOUT_MS = 15_000;

export type GroqErrorCode =
  | "upstream_timeout"
  | "upstream_error"
  | "invalid_upstream_response";

const ERROR_MESSAGES: Record<GroqErrorCode, string> = {
  upstream_timeout: "The explanation service timed out.",
  upstream_error: "The explanation service is unavailable.",
  invalid_upstream_response:
    "The explanation service returned an invalid response.",
};

export class GroqError extends Error {
  readonly code: GroqErrorCode;

  constructor(code: GroqErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.name = "GroqError";
    this.code = code;
  }
}

export type GroqSummaryInput = {
  pattern: string;
  flags: string;
  apiKey: string;
  model?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAbortError(error: unknown): boolean {
  return (
    isRecord(error) &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  );
}

function readCompletionContent(payload: unknown): unknown {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) {
    return undefined;
  }

  const firstChoice = payload.choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    return undefined;
  }

  return firstChoice.message.content;
}

function parseSummary(payload: unknown): string {
  const content = readCompletionContent(payload);
  if (typeof content !== "string") {
    throw new GroqError("invalid_upstream_response");
  }

  let structuredContent: unknown;
  try {
    structuredContent = JSON.parse(content);
  } catch {
    throw new GroqError("invalid_upstream_response");
  }

  if (
    !isRecord(structuredContent) ||
    typeof structuredContent.summary !== "string"
  ) {
    throw new GroqError("invalid_upstream_response");
  }

  const summary = structuredContent.summary.trim();
  if (summary.length === 0) {
    throw new GroqError("invalid_upstream_response");
  }

  return summary;
}

export async function requestGroqSummary(
  { pattern, flags, apiKey, model = DEFAULT_GROQ_MODEL }: GroqSummaryInput,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const signal = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetchImpl(GROQ_CHAT_COMPLETIONS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "Explain the intent of a JavaScript regular expression in one concise sentence.",
          },
          {
            role: "user",
            content: `Explain this regular expression: /${pattern}/${flags}`,
          },
        ],
        reasoning_effort: "low",
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "regex_explanation",
            strict: true,
            schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
              },
              required: ["summary"],
              additionalProperties: false,
            },
          },
        },
      }),
      signal,
    });
  } catch (error) {
    if (signal.aborted || isAbortError(error)) {
      throw new GroqError("upstream_timeout");
    }
    throw new GroqError("upstream_error");
  }

  if (!response.ok) {
    throw new GroqError("upstream_error");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new GroqError("invalid_upstream_response");
  }

  return parseSummary(payload);
}
