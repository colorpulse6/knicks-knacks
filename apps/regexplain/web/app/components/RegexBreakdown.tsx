import React, { useState } from "react";

interface RegexBreakdownProps {
  regex: string;
}

// Expanded mapping for common regex tokens
const REGEX_TOKENS: Record<string, string> = {
  "^": "Start of string",
  $: "End of string",
  ".": "Any character except newline",
  "[": "Start of character class",
  "]": "End of character class",
  "(": "Start of group",
  ")": "End of group",
  "(?:": "Non-capturing group",
  "?": "Zero or one (optional)",
  "+": "One or more",
  "*": "Zero or more",
  "|": "Alternation (or)",
  "\\d": "Digit (0-9)",
  "\\D": "Non-digit",
  "\\w": "Word character (alphanumeric or underscore)",
  "\\W": "Non-word character",
  "\\s": "Whitespace",
  "\\S": "Non-whitespace",
  "\\b": "Word boundary",
  "\\B": "Non-word boundary",
  "\\t": "Tab",
  "\\n": "Newline",
  "\\r": "Carriage return",
  "\\.": "Literal dot",
  "{": "Start of quantifier",
  "}": "End of quantifier",
  "-": "Range or literal hyphen",
  ",": "Quantifier separator",
  "/": "Regex delimiter (in some languages)",
  ":": "Colon",
  // Add more as needed
};

const tokenize = (regex: string) => {
  // Very basic tokenizer: splits on individual chars, handles \ escapes and (?:
  const tokens: { raw: string; desc: string }[] = [];
  for (let i = 0; i < regex.length; i++) {
    let char = regex[i];
    // Handle non-capturing group (?:
    if (char === "(" && regex.slice(i, i + 3) === "(?:") {
      tokens.push({ raw: "(?:", desc: REGEX_TOKENS["(?:"] });
      i += 2;
      continue;
    }
    if (char === "\\" && i + 1 < regex.length) {
      const seq = regex.slice(i, i + 2);
      tokens.push({
        raw: seq,
        desc: REGEX_TOKENS[seq] || "Escaped char: " + seq,
      });
      i++;
    } else {
      tokens.push({
        raw: char,
        desc: REGEX_TOKENS[char] || "Literal: " + char,
      });
    }
  }
  return tokens;
};

const RegexBreakdown: React.FC<RegexBreakdownProps> = ({ regex }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  if (!regex) return null;
  const tokens = tokenize(regex);
  return (
    <div className="bg-white dark:bg-gray-900 rounded p-4 border border-gray-200 dark:border-gray-700 mt-2">
      <div className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Regex Breakdown:
      </div>
      <div className="flex flex-wrap gap-2">
        {tokens.map((t, idx) => (
          <span
            key={idx}
            className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-sm cursor-help relative"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => setHoveredIdx(idx)}
          >
            {t.raw}
            {hoveredIdx === idx && (
              <span className="absolute left-1/2 top-full z-10 mt-2 min-w-max -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg border border-gray-700 whitespace-pre-line">
                {t.desc}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RegexBreakdown;
