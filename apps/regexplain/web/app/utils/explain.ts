export type RegexSummaryInput = {
  pattern: string;
  flags: string;
};

export type RegexSummaryRequestErrorCode =
  | "invalid_json"
  | "invalid_pattern"
  | "invalid_flags"
  | "service_unavailable"
  | "upstream_timeout"
  | "upstream_error"
  | "invalid_upstream_response"
  | "invalid_response"
  | "request_failed";

const API_ERROR_CODES = new Set<RegexSummaryRequestErrorCode>([
  "invalid_json",
  "invalid_pattern",
  "invalid_flags",
  "service_unavailable",
  "upstream_timeout",
  "upstream_error",
  "invalid_upstream_response",
]);

const INVALID_RESPONSE_MESSAGE =
  "The explanation service returned an invalid response.";
const REQUEST_FAILED_MESSAGE =
  "Unable to explain this regex. Please try again.";

export class RegexSummaryRequestError extends Error {
  readonly code: RegexSummaryRequestErrorCode;
  readonly status?: number;

  constructor(
    code: RegexSummaryRequestErrorCode,
    message: string,
    status?: number,
  ) {
    super(message);
    this.name = "RegexSummaryRequestError";
    this.code = code;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new RegexSummaryRequestError(
      "invalid_response",
      INVALID_RESPONSE_MESSAGE,
      response.status,
    );
  }
}

function readApiError(
  payload: unknown,
): { code: RegexSummaryRequestErrorCode; message: string } | undefined {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return undefined;
  }

  const { code, message } = payload.error;
  if (
    typeof code !== "string" ||
    !API_ERROR_CODES.has(code as RegexSummaryRequestErrorCode) ||
    typeof message !== "string" ||
    message.trim().length === 0
  ) {
    return undefined;
  }

  return {
    code: code as RegexSummaryRequestErrorCode,
    message: message.trim(),
  };
}

export async function requestRegexSummary(
  input: RegexSummaryInput,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  let response: Response;
  try {
    response = await fetchImpl("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new RegexSummaryRequestError(
      "request_failed",
      REQUEST_FAILED_MESSAGE,
    );
  }

  const payload = await readJson(response);

  if (!response.ok) {
    const apiError = readApiError(payload);
    if (!apiError) {
      throw new RegexSummaryRequestError(
        "invalid_response",
        INVALID_RESPONSE_MESSAGE,
        response.status,
      );
    }

    throw new RegexSummaryRequestError(
      apiError.code,
      apiError.message,
      response.status,
    );
  }

  if (!isRecord(payload) || typeof payload.summary !== "string") {
    throw new RegexSummaryRequestError(
      "invalid_response",
      INVALID_RESPONSE_MESSAGE,
      response.status,
    );
  }

  const summary = payload.summary.trim();
  if (summary.length === 0) {
    throw new RegexSummaryRequestError(
      "invalid_response",
      INVALID_RESPONSE_MESSAGE,
      response.status,
    );
  }

  return summary;
}
