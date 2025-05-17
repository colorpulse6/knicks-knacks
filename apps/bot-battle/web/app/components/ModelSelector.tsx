import React, { useEffect } from "react";
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
  // For debugging - log the selected models whenever they change
  useEffect(() => {
    console.log("Selected models:", selected);
  }, [selected]);

  function toggleModel(model: LLMModel) {
    if (selected.includes(model)) {
      // If already selected, remove it from the array
      const newModels = selected.filter((m) => m !== model);
      onChange(newModels);
    } else {
      // If not selected, add it to the array
      const newModels = [...selected, model];
      onChange(newModels);
    }
  }

  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">Select LLM Models</label>
      <div className="flex flex-wrap gap-2">
        {MODELS.map((m) => {
          const isSelected = selected.includes(m.value);
          return (
            <button
              type="button"
              key={m.value}
              className={`
                px-4 py-2 rounded-md font-medium transition-all duration-200
                ${
                  isSelected
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shadow-sm"
                    : "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                }
              `}
              onClick={() => toggleModel(m.value)}
            >
              {isSelected ? (
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 inline-block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {m.label}
                </span>
              ) : (
                m.label
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        {selected.length === 0
          ? "Select at least one model to run a benchmark"
          : `Selected: ${selected.length} model${selected.length > 1 ? "s" : ""}`}
      </div>
    </div>
  );
}
