"use client";
import React, { useState, useEffect } from "react";
import { PromptSelector } from "./components/PromptSelector";
import { PromptInput } from "./components/PromptInput";
import { ModelSelector } from "./components/ModelSelector";
import { LLMResponsePanel } from "./components/LLMResponsePanel";
import { LLMComparativeAnalysis } from "./components/LLMComparativeAnalysis";
import { LLMModel } from "./utils/llm";

async function fetchLLMResponse(
  model: LLMModel,
  prompt: string,
  signal?: AbortSignal
) {
  const res = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt }),
    signal,
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Unknown error");
  }
  return res.json();
}

// Entry page for BotBattle Web (Next.js app directory convention)
export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [models, setModels] = useState<LLMModel[]>([]);
  const [responses, setResponses] = useState<
    Record<
      string,
      {
        loading: boolean;
        response: string;
        metrics?: Record<string, string | number>;
      }
    >
  >({});
  const [comparativeAnalysis, setComparativeAnalysis] = useState<string | null>(
    null
  );
  const [isComparativeLoading, setIsComparativeLoading] = useState(false);
  const [openComparativeAnalysis, setOpenComparativeAnalysis] = useState(false);

  const handlePromptTemplateChange = (val: string) => {
    setSelectedPrompt(val);
    setPrompt(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpenComparativeAnalysis(false);
    setComparativeAnalysis(null);
    const usedPrompt = prompt.trim();
    if (!usedPrompt || models.length === 0) return;
    // Set loading state
    setResponses(
      Object.fromEntries(
        models.map((m) => [m, { loading: true, response: "" }])
      )
    );
    const results = await Promise.all(
      models.map(async (model) => {
        try {
          const res = await fetchLLMResponse(model, usedPrompt);
          return [
            model,
            { loading: false, response: res.response, metrics: res.metrics },
          ];
        } catch (err: any) {
          return [model, { loading: false, response: `Error: ${err.message}` }];
        }
      })
    );
    setResponses(Object.fromEntries(results));
  };

  async function runComparativeAnalysis() {
    setIsComparativeLoading(true);
    setComparativeAnalysis(null);
    try {
      const results = Object.keys(responses).map((model) => ({
        model,
        response: responses[model].response,
      }));
      const res = await fetch("/api/llm/comparative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), results }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("Comparative analysis error:", errText);
        throw new Error(errText);
      }
      const data = await res.json();
      setComparativeAnalysis(data.analysis);
    } catch (err: any) {
      setComparativeAnalysis(`Error: ${err.message}`);
      console.error("Comparative analysis exception:", err);
    } finally {
      setIsComparativeLoading(false);
    }
  }

  useEffect(() => {
    const allDone =
      models.length > 0 &&
      models.every(
        (model) => responses[model]?.response && !responses[model]?.loading
      );

    if (allDone && !openComparativeAnalysis) {
      console.log("All models completed - opening analysis");
      setOpenComparativeAnalysis(true);
      if (!comparativeAnalysis) {
        runComparativeAnalysis();
      }
    }
  }, [responses, models]);

  return (
    <>
      <LLMComparativeAnalysis
        prompt={prompt.trim()}
        results={Object.keys(responses).map((model) => ({
          model,
          response: responses[model].response,
        }))}
        analysis={comparativeAnalysis}
        isLoading={isComparativeLoading}
        onRunAnalysis={runComparativeAnalysis}
        open={openComparativeAnalysis}
        onClose={() => setOpenComparativeAnalysis(false)}
      />
      <form onSubmit={handleSubmit}>
        <PromptSelector
          value={selectedPrompt}
          onChange={handlePromptTemplateChange}
        />
        <PromptInput value={prompt} onChange={setPrompt} />
        <ModelSelector selected={models} onChange={setModels} />
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              console.log("Current analysis state:", {
                openComparativeAnalysis,
                comparativeAnalysis,
              });
              setOpenComparativeAnalysis(true);
            }}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 rounded"
          >
            Debug: Show Analysis
          </button>
          <button
            type="button"
            onClick={() => setOpenComparativeAnalysis(false)}
            className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 rounded"
          >
            Debug: Hide Analysis
          </button>
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded mb-6 disabled:opacity-50"
          disabled={!prompt.trim() || models.length === 0}
        >
          Run Benchmark
        </button>
        <div className="grid md:grid-cols-2 gap-4">
          {models.map((m) => (
            <LLMResponsePanel
              key={m}
              model={m}
              isLoading={responses[m]?.loading}
              response={responses[m]?.response}
              metrics={responses[m]?.metrics}
            />
          ))}
        </div>
      </form>
    </>
  );
}
