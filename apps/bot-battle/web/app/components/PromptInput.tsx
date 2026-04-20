"use client";

import React from "react";

type PromptInputProps = {
  value: string;
  onChange: (val: string) => void;
};

export function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div className="bg-paper border border-rule rounded-sm p-5 mb-6">
      <h2 className="font-serif text-base font-bold mb-3">Prompt</h2>
      <textarea
        className="w-full min-h-[80px] bg-paper-sunk border border-rule-soft rounded-sm p-3 text-ink font-serif text-[15px] leading-[1.55] resize-y focus:outline-none focus:border-rust"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your prompt or select a template above..."
      />
    </div>
  );
}
