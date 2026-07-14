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
      <mark key={i} className="match-highlight">
        {input.slice(start, end)}
      </mark>,
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
    <div className="result-panel regex-tester">
      <label className="result-panel__heading">
        <span>Test your regex</span>
        <span className="result-panel__badge">LOCAL</span>
      </label>
      <input
        type="text"
        value={sample}
        onChange={(e) => setSample(e.target.value)}
        placeholder="Enter a sample string"
        className="regex-field__input"
        aria-label="Sample string"
      />
      <div className="regex-tester__output">
        {sample && pattern ? (
          result.error ? (
            <span className="terminal-error-text">
              Invalid regex: {result.error}
            </span>
          ) : (
            <span>{highlightMatches(sample, result.matches ?? [])}</span>
          )
        ) : (
          <span className="result-panel__empty">
            Matches will be highlighted here.
          </span>
        )}
      </div>
      {result.matches && (
        <div className="regex-tester__count">
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
