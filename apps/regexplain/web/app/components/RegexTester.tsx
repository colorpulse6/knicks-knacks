import React from "react";

interface RegexTesterProps {
  regex: string;
}

const highlightMatches = (input: string, regex: RegExp) => {
  if (!input) return input;
  const matches = [...input.matchAll(regex)];
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

const RegexTester: React.FC<RegexTesterProps> = ({ regex }) => {
  const [sample, setSample] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [matches, setMatches] = React.useState<RegExpMatchArray[] | null>(null);

  React.useEffect(() => {
    setError(null);
    setMatches(null);
    if (!regex || !sample) return;
    try {
      const re = new RegExp(regex, "g");
      const found = [...sample.matchAll(re)];
      setMatches(found);
    } catch (e: any) {
      setError(e.message);
    }
  }, [regex, sample]);

  let highlighted: React.ReactNode = sample;
  try {
    if (regex && sample) {
      highlighted = highlightMatches(sample, new RegExp(regex, "g"));
    }
  } catch {}

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
        {sample && regex ? (
          error ? (
            <span className="text-red-500">Invalid regex: {error}</span>
          ) : (
            <span>{highlighted}</span>
          )
        ) : (
          <span className="text-gray-400">
            Matches will be highlighted here.
          </span>
        )}
      </div>
      {matches && matches.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          {matches.length} match{matches.length > 1 ? "es" : ""} found.
          {matches[0].length > 1 && <> (Groups: {matches[0].length - 1})</>}
        </div>
      )}
    </div>
  );
};

export default RegexTester;
