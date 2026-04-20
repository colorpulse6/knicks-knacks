import { describe, it, expect } from "vitest";
import { redactSecrets, validateKeyFormat } from "./sanitize";

describe("redactSecrets", () => {
  it("redacts Bearer tokens", () => {
    expect(redactSecrets("Authorization: Bearer sk-abc123def")).toBe(
      "Authorization: Bearer ***"
    );
  });

  it("redacts sk-ant- prefixed keys", () => {
    expect(redactSecrets("key: sk-ant-api03-abc123xyz")).toBe("key: sk-ant-***");
  });

  it("redacts sk- prefixed keys (openai/deepseek)", () => {
    expect(redactSecrets("key: sk-proj-abc123def456")).toBe("key: sk-***");
  });

  it("redacts gsk_ prefixed keys (groq)", () => {
    expect(redactSecrets("error with gsk_abc123def456 token")).toBe(
      "error with gsk_*** token"
    );
  });

  it("redacts xai- prefixed keys", () => {
    expect(redactSecrets("failed: xai-mykey12345")).toBe("failed: xai-***");
  });

  it("redacts AIza prefixed keys (google)", () => {
    expect(redactSecrets("key=AIzaSyAbc123Def456")).toBe("key=AIza***");
  });

  it("leaves non-secret strings untouched", () => {
    const safe = "Error: model not found for provider groq";
    expect(redactSecrets(safe)).toBe(safe);
  });
});

describe("validateKeyFormat", () => {
  it("accepts valid openai key", () => {
    expect(validateKeyFormat("openai", "sk-proj-abc123")).toEqual({ ok: true });
  });

  it("rejects malformed openai key", () => {
    const result = validateKeyFormat("openai", "pk-abc123");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("sk-...");
  });

  it("accepts valid anthropic key", () => {
    expect(validateKeyFormat("anthropic", "sk-ant-api03-xyz")).toEqual({
      ok: true,
    });
  });

  it("rejects malformed anthropic key (plain sk- prefix)", () => {
    const result = validateKeyFormat("anthropic", "sk-wrongformat");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("sk-ant-...");
  });

  it("accepts valid groq key", () => {
    expect(validateKeyFormat("groq", "gsk_abc123")).toEqual({ ok: true });
  });

  it("rejects malformed groq key", () => {
    const result = validateKeyFormat("groq", "sk-abc123");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("gsk_...");
  });

  it("accepts valid google key", () => {
    expect(validateKeyFormat("google", "AIzaSyAbcDef123")).toEqual({ ok: true });
  });

  it("rejects malformed google key", () => {
    const result = validateKeyFormat("google", "BIzaSyAbcDef123");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("AIza...");
  });

  it("accepts valid xai key", () => {
    expect(validateKeyFormat("xai", "xai-abc123xyz")).toEqual({ ok: true });
  });

  it("rejects malformed xai key", () => {
    const result = validateKeyFormat("xai", "api-abc123xyz");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("xai-...");
  });

  it("accepts valid deepseek key", () => {
    expect(validateKeyFormat("deepseek", "sk-abc123def")).toEqual({ ok: true });
  });

  it("accepts any non-empty mistral key (no known prefix)", () => {
    expect(validateKeyFormat("mistral", "anyRandomKey123")).toEqual({
      ok: true,
    });
  });

  it("accepts any non-empty qwen key (no known prefix)", () => {
    expect(validateKeyFormat("qwen", "anyRandomKey123")).toEqual({ ok: true });
  });

  it("returns ok:false for empty key", () => {
    const result = validateKeyFormat("openai", "");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("Key is empty");
  });

  it("returns ok:true for unknown provider with non-empty key", () => {
    expect(validateKeyFormat("someNewProvider", "anykey123")).toEqual({
      ok: true,
    });
  });
});
