import React from "react";

interface ExplanationDisplayProps {
  explanation: {
    summary: string;
    breakdown: { part: string; explanation: string }[];
    error: boolean;
    suggestion?: string;
    notRegex?: boolean;
  } | null;
  loading: boolean;
}

// Mapping of regex symbols/tokens to plain-English explanations
const REGEX_TOKENS: Record<string, string> = {
  "^": "Start of string",
  $: "End of string",
  ".": "Any character",
  "[": "Start of character class",
  "]": "End of character class",
  "(": "Start of group",
  ")": "End of group",
  "(?:": "Non-capturing group",
  "?": "Zero or one (optional)",
  "+": "One or more",
  "*": "Zero or more",
  "\\d": "Digit",
  "\\w": "Word character",
  "\\s": "Whitespace",
  "\\.": "Literal dot",
  "|": "Alternation (or)",
  "{": "Start of quantifier",
  "}": "End of quantifier",
  "-": "Range or literal hyphen",
  ",": "Quantifier separator",
  // Add more as needed
};

const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({
  explanation,
  loading,
}) => {
  return (
    <div className="min-h-[64px] bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700 text-base text-gray-900 dark:text-gray-100 shadow-sm transition-colors">
      {loading ? (
        <span className="animate-pulse text-blue-500">
          Generating explanation…
        </span>
      ) : explanation ? (
        explanation.error ? (
          <div className="text-red-600 bg-red-100 border border-red-300 rounded px-2 py-1 text-sm mb-2">
            <b>Sorry, there was a problem explaining this regex.</b> Please try
            again or check your pattern.
          </div>
        ) : (
          <div>
            {explanation.summary && (
              <h3 className="font-semibold text-lg mb-3">
                {explanation.summary}
              </h3>
            )}
            {explanation.suggestion && explanation.suggestion.trim() !== "" && (
              <div className="mb-3 text-blue-900 bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm flex items-start gap-2">
                <span className="text-xl">💡</span>
                <span>
                  <b>Suggestion:</b> {explanation.suggestion}
                </span>
              </div>
            )}
            {explanation.breakdown && explanation.breakdown.length > 0 && (
              <ul className="space-y-3">
                {explanation.breakdown.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="font-mono font-bold bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-1 rounded mr-2">
                      {item.part}
                    </span>
                    <span className="flex-1">{item.explanation}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      ) : (
        <span className="text-gray-400">AI explanation will appear here.</span>
      )}
    </div>
  );
};

export default ExplanationDisplay;
