import React, { useEffect, useState } from "react";

interface RegexInputProps {
  pattern: string;
  flags: string;
  onPatternChange: (value: string) => void;
  onFlagsChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  patternInputRef?: React.Ref<HTMLInputElement>;
  disabled?: boolean;
}

// Only match double backslashes before a regex-relevant character
const DOUBLE_BACKSLASH_REGEX = /\\\\[a-zA-Z0-9.*+?^${}()|[\]\\]/;

const RegexInput: React.FC<RegexInputProps> = ({
  pattern,
  flags,
  onPatternChange,
  onFlagsChange,
  onSubmit,
  patternInputRef,
  disabled,
}) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setShowWarning(DOUBLE_BACKSLASH_REGEX.test(pattern));
  }, [pattern]);

  return (
    <form className="flex w-full flex-col gap-2" onSubmit={onSubmit}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Pattern
          </span>
          <input
            ref={patternInputRef}
            type="text"
            value={pattern}
            onChange={(event) => onPatternChange(event.target.value)}
            placeholder="^[a-z]+$"
            className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
            spellCheck={false}
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1 sm:w-24">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Flags
          </span>
          <input
            type="text"
            value={flags}
            onChange={(event) => onFlagsChange(event.target.value)}
            placeholder="gim"
            className="rounded border border-gray-300 bg-white px-4 py-2 text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
            spellCheck={false}
          />
        </label>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Enter the pattern without surrounding slash delimiters. Slashes typed
        in the pattern field remain literal content.
      </p>
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
        type="submit"
        disabled={disabled}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        Explain regex
      </button>
    </form>
  );
};

export default RegexInput;
