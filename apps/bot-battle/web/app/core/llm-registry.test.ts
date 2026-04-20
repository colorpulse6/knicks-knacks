import { describe, it, expect } from "vitest";
import type { LLMModelSpec } from "./llm-registry";

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
