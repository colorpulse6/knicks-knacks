import React from "react";

import type { RegexExample } from "../data/examples";

export default function CommonPatterns({
  examples,
  onSelect,
}: {
  examples: readonly RegexExample[];
  onSelect: (example: RegexExample) => void;
}) {
  return (
    <div className="pattern-picker">
      <div className="pattern-picker__label">QUICK LOAD</div>
      <div className="pattern-picker__controls">
        {examples.map((example) => (
          <button
            key={example.slug}
            className="pattern-picker__button"
            title={example.description}
            onClick={() => onSelect(example)}
            type="button"
          >
            {example.name}
          </button>
        ))}
      </div>
    </div>
  );
}
