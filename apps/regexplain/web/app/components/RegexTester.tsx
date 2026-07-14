import React from "react";

import { compileGlobalRegex } from "../lib/regex";

interface RegexTesterProps {
  pattern: string;
  flags: string;
}

const highlightMatches = (input: string, matches: RegExpMatchArray[]) => {
  if (matches.length === 0) return input;
  let lastIndex = 0;
  const parts: React.ReactNode[] = [];
  matches.forEach((match, i) => {
    const [matched] = match;
    const start = match.index ?? 0;
    const end = start + matched.length;
    if (lastIndex < start) {
      parts.push(input.slice(lastIndex, start));
    }
    parts.push(
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 rounded px-1">
        {input.slice(start, end)}
      </mark>
    );
    lastIndex = end;
  });
  if (lastIndex < input.length) {
    parts.push(input.slice(lastIndex));
  }
  return parts;
};

const RegexTester: React.FC<RegexTesterProps> = ({ pattern, flags }) => {
  const [sample, setSample] = React.useState("");
  const result = React.useMemo<{
    matches: RegExpMatchArray[] | null;
    error: string | null;
  }>(() => {
    if (!pattern || !sample) {
      return { matches: null, error: null };
    }

    try {
      return {
        matches: [...sample.matchAll(compileGlobalRegex(pattern, flags))],
        error: null,
      };
    } catch (error) {
      return {
        matches: null,
        error: error instanceof Error ? error.message : "Invalid regex",
      };
    }
  }, [flags, pattern, sample]);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
      <label className="font-medium text-gray-700 dark:text-gray-300 mb-1">
        Test your regex:
      </label>
      <input
        type="text"
        value={sample}
        onChange={(e) => setSample(e.target.value)}
        placeholder="Enter a sample string"
        className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Sample string"
      />
      <div className="mt-2 min-h-[2em] text-base text-gray-900 dark:text-gray-100">
        {sample && pattern ? (
          result.error ? (
            <span className="text-red-500">
              Invalid regex: {result.error}
            </span>
          ) : (
            <span>{highlightMatches(sample, result.matches ?? [])}</span>
          )
        ) : (
          <span className="text-gray-400">
            Matches will be highlighted here.
          </span>
        )}
      </div>
      {result.matches && (
        <div className="text-xs text-gray-500 mt-2">
          {result.matches.length} match
          {result.matches.length === 1 ? "" : "es"} found.
          {result.matches[0] && result.matches[0].length > 1 && (
            <> (Groups: {result.matches[0].length - 1})</>
          )}
        </div>
      )}
    </div>
  );
};

export default RegexTester;
