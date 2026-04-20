// Secret sanitization and key validation utilities

export function redactSecrets(s: string): string {
  return s
    .replace(/Bearer\s+[\w-]+/gi, "Bearer ***")
    .replace(/\bgsk_[\w-]+/g, "gsk_***")
    .replace(/\bxai-[\w-]+/g, "xai-***")
    .replace(/\bAIza[\w-]+/g, "AIza***")
    // Use a single regex for sk- prefixed keys so sk-ant- is handled atomically.
    // Matches sk-ant-... and sk-... and redacts each to the appropriate prefix.
    .replace(/\bsk-(ant-[\w-]+|[\w-]+)/g, (_, rest) =>
      rest.startsWith("ant-") ? "sk-ant-***" : "sk-***"
    );
}

export function validateKeyFormat(
  provider: string,
  key: string
): { ok: boolean; reason?: string } {
  if (!key) return { ok: false, reason: "Key is empty" };
  const p = provider.toLowerCase();
  const expectations: Record<
    string,
    { prefix: string; label: string } | null
  > = {
    openai: { prefix: "sk-", label: "sk-..." },
    anthropic: { prefix: "sk-ant-", label: "sk-ant-..." },
    groq: { prefix: "gsk_", label: "gsk_..." },
    google: { prefix: "AIza", label: "AIza..." },
    xai: { prefix: "xai-", label: "xai-..." },
    deepseek: { prefix: "sk-", label: "sk-..." },
    mistral: null,
    qwen: null,
  };
  const exp = expectations[p];
  if (exp === undefined) return { ok: true }; // unknown provider — allow any non-empty
  if (exp === null) return { ok: true }; // mistral/qwen — no known prefix
  if (!key.startsWith(exp.prefix)) {
    return { ok: false, reason: `Expected key to start with "${exp.label}"` };
  }
  return { ok: true };
}
