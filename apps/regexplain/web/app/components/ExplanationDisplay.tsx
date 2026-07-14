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
      className="min-h-[64px] bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700 text-base text-gray-900 dark:text-gray-100 shadow-sm transition-colors"
    >
      {loading ? (
        <span className="animate-pulse text-blue-500">
          Generating AI summary…
        </span>
      ) : error ? (
        <div
          role="alert"
          className="text-red-600 bg-red-100 border border-red-300 rounded px-2 py-1 text-sm"
        >
          {error}
        </div>
      ) : summary ? (
        <p>{summary}</p>
      ) : (
        <span className="text-gray-400">AI summary will appear here.</span>
      )}
    </section>
  );
};

export default ExplanationDisplay;
