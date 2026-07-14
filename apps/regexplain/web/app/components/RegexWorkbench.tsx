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
  const requestGenerationRef = React.useRef(0);

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
    requestGenerationRef.current += 1;
    setSummary(null);
    setError(null);
    setStatus("");
    setIsLoading(false);
  };

  const selectExample = (example: RegexExample) => {
    setPattern(example.pattern);
    setFlags(example.flags);
    resetRemoteState();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = validateRegexInput({ pattern, flags });
    if (!validation.ok) {
      resetRemoteState();
      setStatus(validation.error.message);
      patternInputRef.current?.focus();
      return;
    }

    const requestGeneration = requestGenerationRef.current + 1;
    requestGenerationRef.current = requestGeneration;
    const activeElementAtSubmission = document.activeElement;
    setIsLoading(true);
    setSummary(null);
    setError(null);
    setStatus("Generating AI summary…");

    try {
      const nextSummary = await requestRegexSummary(validation.value);
      if (requestGenerationRef.current !== requestGeneration) return;

      setSummary(nextSummary);
      setStatus("AI summary ready.");
    } catch (requestError) {
      if (requestGenerationRef.current !== requestGeneration) return;

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to explain this regex. Please try again.",
      );
      setStatus("AI summary unavailable.");
      if (document.activeElement === activeElementAtSubmission) {
        patternInputRef.current?.focus();
      }
    } finally {
      if (requestGenerationRef.current === requestGeneration) {
        setIsLoading(false);
      }
    }
  };

  return (
    <section id="workbench" aria-label="Regex workbench" className="workbench">
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
      <p className="workbench__privacy">
        <span aria-hidden="true">i</span>
        Local tools stay in this browser. Your pattern is sent to Groq only when
        you request an AI summary.
      </p>
      <div role="status" aria-live="polite" className="workbench__status">
        {status}
      </div>
      <ExplanationDisplay summary={summary} loading={isLoading} error={error} />
      <RegexBreakdown pattern={pattern} flags={flags} />
      <RegexTester pattern={pattern} flags={flags} />
    </section>
  );
}
