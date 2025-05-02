"use client";
import React from "react";
import RegexTester from "./components/RegexTester";
import { explainRegexWithGroq } from "./utils/groq";
import RegexBreakdown from "./components/RegexBreakdown";
import RegexInput from "./components/RegexInput";
import ExplanationDisplay from "./components/ExplanationDisplay";
import CommonPatterns from "./components/CommonPatterns";

export default function Home() {
  const [regex, setRegex] = React.useState("");
  const [explanation, setExplanation] = React.useState<{
    summary: string;
    breakdown: { part: string; explanation: string }[];
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Handler for submitting regex
  const handleExplain = async () => {
    setIsLoading(true);
    setExplanation(null);
    setError(null);
    try {
      const apiKey =
        process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
      if (!apiKey) {
        setError("Missing Groq API key. Please set it in your .env file.");
        setIsLoading(false);
        return;
      }
      const result = await explainRegexWithGroq({ regex, apiKey });
      setExplanation(result);
    } catch (err: any) {
      setError(err.message || "Failed to fetch explanation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900 transition-colors">
      <h1 className="text-4xl font-bold mb-2 text-center">Regexplain</h1>
      <p className="text-lg text-gray-500 mb-8 text-center max-w-xl">
        Enter a regex pattern to get an explanation and a character-by-character
        breakdown.
      </p>
      <div className="w-full max-w-xl flex flex-col gap-6">
        <CommonPatterns onSelect={setRegex} />
        <RegexInput
          value={regex}
          onChange={setRegex}
          onExplain={handleExplain}
          disabled={isLoading}
        />
        <ExplanationDisplay
          explanation={
            explanation
              ? { ...explanation, error: (explanation as any).error ?? false }
              : null
          }
          loading={isLoading}
        />
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {/* Show a warning if explanation indicates not a regex */}
        {explanation && (explanation as any).notRegex && !isLoading && (
          <div className="text-yellow-700 bg-yellow-50 border border-yellow-300 rounded px-3 py-2 text-sm mt-2">
            <b>Notice:</b> The input does not appear to be a regular expression.
            <br />
            Please enter a valid regex pattern (e.g., <code>^\d+$</code> for
            numbers, <code>^[a-z]+$</code> for lowercase letters).
          </div>
        )}
        <RegexBreakdown regex={regex} />
        <RegexTester regex={regex} />
      </div>
    </main>
  );
}
