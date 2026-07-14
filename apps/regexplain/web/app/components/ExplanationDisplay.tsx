import React from "react";

interface ExplanationDisplayProps {
  summary: string | null;
  loading: boolean;
  error: string | null;
}

const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({
  summary,
  loading,
  error,
}) => {
  return (
    <section
      aria-label="AI summary"
      className="result-panel result-panel--summary"
    >
      {loading ? (
        <span className="terminal-pulse">Generating AI summary…</span>
      ) : error ? (
        <div role="alert" className="terminal-notice terminal-notice--error">
          {error}
        </div>
      ) : summary ? (
        <p>{summary}</p>
      ) : (
        <span className="result-panel__empty">
          <span aria-hidden="true">//</span> AI summary will appear here.
        </span>
      )}
    </section>
  );
};

export default ExplanationDisplay;
