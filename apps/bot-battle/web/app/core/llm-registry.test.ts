import { describe, it, expect } from "vitest";
import type { LLMModelSpec } from "./llm-registry";
import { LLM_REGISTRY } from "./llm-registry";

describe("LLMModelSpec schema", () => {
  it("accepts new lifecycle fields", () => {
    const model: LLMModelSpec = {
      id: "test-model",
      displayName: "Test",
      contextWindow: 1000,
      costType: "userKeyRequired",
      status: "current",
      modelType: "reasoning",
      supportsReasoningEffort: true,
      lastVerified: "2026-04-19",
    };
    expect(model.status).toBe("current");
    expect(model.modelType).toBe("reasoning");
    expect(model.supportsReasoningEffort).toBe(true);
    expect(model.lastVerified).toBe("2026-04-19");
  });

  it("treats new fields as optional", () => {
    const model: LLMModelSpec = {
      id: "test",
      displayName: "Test",
      contextWindow: 1000,
      costType: "userKeyRequired",
    };
    expect(model.status).toBeUndefined();
  });
});

describe("LLM_REGISTRY curation invariants", () => {
  const ALLOWED_PROVIDER_IDS = [
    "openai", "anthropic", "google", "xai",
    "deepseek", "mistral", "qwen", "groq",
    "cerebras", "cloudflare",
  ];

  it("only includes allowed providers", () => {
    const ids = LLM_REGISTRY.map(p => p.id);
    for (const id of ids) {
      expect(ALLOWED_PROVIDER_IDS).toContain(id);
    }
  });

  it("every model has lastVerified set", () => {
    for (const provider of LLM_REGISTRY) {
      for (const m of provider.models) {
        expect(m.lastVerified, `${provider.id}/${m.id} missing lastVerified`)
          .toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("every model has a status", () => {
    for (const provider of LLM_REGISTRY) {
      for (const m of provider.models) {
        expect(m.status, `${provider.id}/${m.id} missing status`).toBeDefined();
      }
    }
  });

  it("reasoning models have modelType set", () => {
    const reasoningIds = [
      "openai:o3",
      "openai:o4-mini",
      "openai:gpt-5.4",
      "anthropic:claude-sonnet-4-6",
    ];
    for (const compositeId of reasoningIds) {
      const [providerId, modelId] = compositeId.split(":");
      const provider = LLM_REGISTRY.find(p => p.id === providerId);
      const model = provider?.models.find(m => m.id === modelId);
      expect(model, `${compositeId} missing from registry`).toBeDefined();
      expect(model?.modelType).toBe("reasoning");
    }
  });

  it("registry size is in curated range", () => {
    const count = LLM_REGISTRY.reduce((sum, p) => sum + p.models.length, 0);
    expect(count).toBeGreaterThanOrEqual(12);
    expect(count).toBeLessThanOrEqual(30);
  });
});
