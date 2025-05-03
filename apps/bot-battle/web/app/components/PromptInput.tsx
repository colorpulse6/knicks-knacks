import React from "react";

type PromptInputProps = {
  value: string;
  onChange: (val: string) => void;
};

export function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">Prompt</label>
      <textarea
        className="w-full border rounded px-3 py-2 min-h-[80px] bg-white dark:bg-neutral-dark"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Enter your prompt or select a template above..."
      />
    </div>
  );
}
