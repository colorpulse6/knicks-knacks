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
    <div className="mb-4">
      <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">
        Common Patterns:
      </div>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.slug}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs hover:bg-blue-200 dark:hover:bg-blue-900 transition"
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
