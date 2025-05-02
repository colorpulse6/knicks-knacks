import React, { useEffect, useState } from "react";

interface RegexInputProps {
  value: string;
  onChange: (v: string) => void;
  onExplain: () => void;
  disabled?: boolean;
}

// Only match double backslashes before a regex-relevant character
const DOUBLE_BACKSLASH_REGEX = /\\\\[a-zA-Z0-9.*+?^${}()|[\]\\]/g;

const RegexInput: React.FC<RegexInputProps> = ({
  value,
  onChange,
  onExplain,
  disabled,
}) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setShowWarning(DOUBLE_BACKSLASH_REGEX.test(value));
  }, [value]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter regex pattern (e.g. ^[a-z]+$)"
        className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        disabled={disabled}
        spellCheck={false}
        autoFocus
        aria-label="Regex input"
      />
      {showWarning && (
        <div className="text-yellow-600 bg-yellow-100 border border-yellow-300 rounded px-2 py-1 text-xs mt-1">
          <b>Heads up:</b> It looks like your regex contains double backslashes
          (e.g., <code>\\w</code>, <code>\\.</code>, <code>\\d</code>, etc.).
          <br />
          For JavaScript regex, use a single backslash (e.g., <code>
            \w
          </code>, <code>\.</code>, <code>\d</code>).
          <br />
          <span className="font-mono">
            Tip: Try replacing double backslashes with a single backslash for
            regex tokens (e.g., <code>\\w</code> → <code>\w</code>,{" "}
            <code>\\.</code> → <code>\.</code>).
          </span>
        </div>
      )}
      <button
        onClick={onExplain}
        disabled={disabled || !value.trim()}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        Explain
      </button>
    </div>
  );
};

export default RegexInput;
