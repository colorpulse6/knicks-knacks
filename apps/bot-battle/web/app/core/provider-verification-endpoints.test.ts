import { describe, it, expect } from "vitest";
import { PROVIDER_VERIFICATION } from "./provider-verification-endpoints";

describe("PROVIDER_VERIFICATION", () => {
  const required = ["openai","anthropic","google","xai","deepseek","mistral","qwen"];
  it.each(required)("has a verification spec for %s", (id) => {
    expect(PROVIDER_VERIFICATION[id]).toBeDefined();
    expect(PROVIDER_VERIFICATION[id].url).toMatch(/^https:/);
  });
});
