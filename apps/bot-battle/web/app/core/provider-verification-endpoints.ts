export interface ProviderVerificationSpec {
  url: string;
  method: "GET" | "POST";
  authHeader: (key: string) => Record<string, string>;
  body?: unknown;
}

export const PROVIDER_VERIFICATION: Record<string, ProviderVerificationSpec> = {
  openai: {
    url: "https://api.openai.com/v1/models",
    method: "GET",
    authHeader: (k) => ({ Authorization: `Bearer ${k}` }),
  },
  anthropic: {
    url: "https://api.anthropic.com/v1/models",
    method: "GET",
    authHeader: (k) => ({ "x-api-key": k, "anthropic-version": "2023-06-01" }),
  },
  google: {
    url: "https://generativelanguage.googleapis.com/v1beta/models",
    method: "GET",
    // Google uses ?key=... query param; url built with key appended in handler
    authHeader: () => ({}),
  },
  xai: {
    url: "https://api.x.ai/v1/models",
    method: "GET",
    authHeader: (k) => ({ Authorization: `Bearer ${k}` }),
  },
  deepseek: {
    url: "https://api.deepseek.com/v1/models",
    method: "GET",
    authHeader: (k) => ({ Authorization: `Bearer ${k}` }),
  },
  mistral: {
    url: "https://api.mistral.ai/v1/models",
    method: "GET",
    authHeader: (k) => ({ Authorization: `Bearer ${k}` }),
  },
  qwen: {
    url: "https://dashscope.aliyuncs.com/compatible-mode/v1/models",
    method: "GET",
    authHeader: (k) => ({ Authorization: `Bearer ${k}` }),
  },
};
