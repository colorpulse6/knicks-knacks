import React from "react";

const EXAMPLES = [
  {
    name: "Email Address",
    pattern: "^[\\w-.]+@[\\w-.]+\\.\\w{2,}$",
    description: "Basic email validation",
  },
  {
    name: "Secure Password",
    pattern:
      "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+={}\\[\\]:;\"'<>,.?/\\-]).{8,}$",
    description: "At least 8 chars, upper, lower, digit, special",
  },
  {
    name: "US Phone Number",
    pattern: "^\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$",
    description: "Matches (123) 456-7890, 123-456-7890, etc.",
  },
  {
    name: "Hex Color",
    pattern: "^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$",
    description: "Matches #fff, #123abc, etc.",
  },
  {
    name: "URL",
    pattern: "^https?://[\\w.-]+(?:\\.[\\w\\.-]+)+[/#?]?.*$",
    description: "Basic http(s) URL",
  },
];

export default function CommonPatterns({
  onSelect,
}: {
  onSelect: (pattern: string) => void;
}) {
  return (
    <div className="mb-4">
      <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">
        Common Patterns:
      </div>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.name}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs hover:bg-blue-200 dark:hover:bg-blue-900 transition"
            title={ex.description}
            onClick={() => onSelect(ex.pattern)}
            type="button"
          >
            {ex.name}
          </button>
        ))}
      </div>
    </div>
  );
}
