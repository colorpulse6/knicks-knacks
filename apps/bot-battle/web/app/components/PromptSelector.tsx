import React from "react";

const PROMPT_TEMPLATES = [
  {
    label: "General QA",
    prompt: "What is the capital of France and why is it historically significant?",
  },
  {
    label: "Creative Writing",
    prompt: "Write a short story about a lost astronaut discovering an ancient civilization.",
  },
  {
    label: "Summarization",
    prompt: "Summarize the following article into three concise sentences: {user pastes article}",
  },
  {
    label: "Code Generation",
    prompt: "Generate a Python function that calculates Fibonacci numbers using memoization.",
  },
  {
    label: "Math Problem Solving",
    prompt: "Solve step-by-step: If x² + 2x - 3 = 0, find the values of x.",
  },
  {
    label: "Translation",
    prompt: "Translate the following English sentence into Spanish: 'Tomorrow will be sunny and warm.'",
  },
  {
    label: "Instruction Following",
    prompt: "List five effective strategies to improve remote team productivity.",
  },
];

type PromptSelectorProps = {
  value: string;
  onChange: (prompt: string) => void;
};

export function PromptSelector({ value, onChange }: PromptSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">Prompt Template</label>
      <select
        className="w-full border rounded px-3 py-2 bg-white dark:bg-neutral-dark"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Custom</option>
        {PROMPT_TEMPLATES.map(t => (
          <option key={t.label} value={t.prompt}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
