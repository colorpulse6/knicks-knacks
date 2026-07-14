"use client";

import React from "react";

import { examples, getExample, type RegexExample } from "../data/examples";
import { validateRegexInput } from "../lib/regex";
import { requestRegexSummary } from "../utils/explain";
import CommonPatterns from "./CommonPatterns";
import ExplanationDisplay from "./ExplanationDisplay";
import RegexBreakdown from "./RegexBreakdown";
import RegexInput from "./RegexInput";
import RegexTester from "./RegexTester";

export default function RegexWorkbench() {
  const [pattern, setPattern] = React.useState("");
  const [flags, setFlags] = React.useState("");
  const [summary, setSummary] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const patternInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const exampleSlug = new URLSearchParams(window.location.search).get(
      "example",
    );
    if (!exampleSlug) return;

    const example = getExample(exampleSlug);
    if (!example) return;

    setPattern(example.pattern);
    setFlags(example.flags);
  }, []);

  const resetRemoteState = () => {
    setSummary(null);
    setError(null);
    setStatus("");
  };

  const selectExample = (example: RegexExample) => {
    setPattern(example.pattern);
    setFlags(example.flags);
    resetRemoteState();
    patternInputRef.current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = validateRegexInput({ pattern, flags });
    if (!validation.ok) {
      setSummary(null);
      setError(null);
      setStatus(validation.error.message);
      patternInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setSummary(null);
    setError(null);
    setStatus("Generating AI summary…");

    try {
      const nextSummary = await requestRegexSummary(validation.value);
      setSummary(nextSummary);
      setStatus("AI summary ready.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to explain this regex. Please try again.",
      );
      setStatus("AI summary unavailable.");
      patternInputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="workbench" aria-label="Regex workbench" className="space-y-6">
      <CommonPatterns examples={examples} onSelect={selectExample} />
      <RegexInput
        pattern={pattern}
        flags={flags}
        onPatternChange={(value) => {
          setPattern(value);
          resetRemoteState();
        }}
        onFlagsChange={(value) => {
          setFlags(value);
          resetRemoteState();
        }}
        onSubmit={handleSubmit}
        patternInputRef={patternInputRef}
        disabled={isLoading}
      />
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Privacy: your pattern is sent to Groq when you request an AI summary.
      </p>
      <div role="status" aria-live="polite" className="min-h-5 text-sm">
        {status}
      </div>
      <ExplanationDisplay
        summary={summary}
        loading={isLoading}
        error={error}
      />
      <RegexBreakdown pattern={pattern} flags={flags} />
      <RegexTester pattern={pattern} flags={flags} />
    </section>
  );
}
