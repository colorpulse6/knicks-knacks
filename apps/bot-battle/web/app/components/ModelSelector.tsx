import React from "react";
import { LLMModel } from "../utils/llm";

const MODELS: { label: string; value: LLMModel }[] = [
  { label: "Anthropic Claude (Haiku/Sonnet)", value: "claude" },
  { label: "Google Gemini (1.5 Pro)", value: "gemini" },
  { label: "Groq (LLaMA, Mixtral)", value: "groq" },
  { label: "DeepSeek", value: "deepseek" },
  { label: "Mistral AI (7B, Mixtral)", value: "mistral" },
  { label: "Perplexity AI (Sonar)", value: "perplexity" },
  { label: "Cohere (Command R)", value: "cohere" },
  { label: "OpenRouter", value: "openrouter" },
  { label: "OpenAI GPT (3.5/4)", value: "openai" },
];

type ModelSelectorProps = {
  selected: LLMModel[];
  onChange: (models: LLMModel[]) => void;
};

export function ModelSelector({ selected, onChange }: ModelSelectorProps) {
  function toggleModel(model: LLMModel) {
    if (selected.includes(model)) {
      onChange(selected.filter((m) => m !== model));
    } else {
      onChange([...selected, model]);
    }
  }

  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">Select LLM Models</label>
      <div className="flex flex-wrap gap-2">
        {MODELS.map((m) => (
          <button
            type="button"
            key={m.value}
            className={`px-3 py-1 rounded border transition-colors ${
              selected.includes(m.value)
                ? "bg-primary text-white border-primary"
                : "bg-white dark:bg-neutral-dark border-gray-300"
            }`}
            onClick={() => toggleModel(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
