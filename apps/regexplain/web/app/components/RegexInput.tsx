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
    <form className="regex-form" onSubmit={onSubmit}>
      <div className="regex-form__fields">
        <label className="regex-field regex-field--pattern">
          <span className="regex-field__label">
            <span aria-hidden="true">01</span> Pattern
          </span>
          <input
            ref={patternInputRef}
            type="text"
            value={pattern}
            onChange={(event) => onPatternChange(event.target.value)}
            placeholder="^[a-z]+$"
            className="regex-field__input"
            spellCheck={false}
            autoFocus
          />
        </label>
        <label className="regex-field regex-field--flags">
          <span className="regex-field__label">
            <span aria-hidden="true">02</span> Flags
          </span>
          <input
            type="text"
            value={flags}
            onChange={(event) => onFlagsChange(event.target.value)}
            placeholder="gim"
            className="regex-field__input"
            spellCheck={false}
          />
        </label>
      </div>
      <p className="regex-form__hint">
        Enter the pattern without surrounding slash delimiters. Slashes typed in
        the pattern field remain literal content.
      </p>
      {showWarning && (
        <div className="terminal-notice terminal-notice--warning">
          <b>Heads up:</b> It looks like your regex contains double backslashes
          (e.g., <code>\\w</code>, <code>\\.</code>, <code>\\d</code>, etc.).
          <br />
          For JavaScript regex, use a single backslash (e.g., <code>
            \w
          </code>, <code>\.</code>, <code>\d</code>).
          <br />
          <span>
            Tip: Try replacing double backslashes with a single backslash for
            regex tokens (e.g., <code>\\w</code> → <code>\w</code>,{" "}
            <code>\\.</code> → <code>\.</code>).
          </span>
        </div>
      )}
      <button
        type="submit"
        disabled={disabled}
        className="terminal-button terminal-button--primary"
      >
        <span aria-hidden="true">RUN</span> Explain regex
      </button>
    </form>
  );
};

export default RegexInput;
