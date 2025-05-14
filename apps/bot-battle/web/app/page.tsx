"use client";
import React, { useState } from "react";
import { PromptSelector } from "./components/PromptSelector";
import { PromptInput } from "./components/PromptInput";
import { ModelSelector } from "./components/ModelSelector";
import { LLMResponsePanel } from "./components/LLMResponsePanel";
import { LLMComparativeAnalysis } from "./components/LLMComparativeAnalysis";
import { LLMModel } from "./utils/llm";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [showMetricsComparison, setShowMetricsComparison] = useState(false);

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
          // Handle token-related errors specifically
          const errorMessage =
            err.message.includes("Token limit exceeded") ||
              err.message.includes("API quota exceeded") ||
              err.message.includes("RESOURCE_EXHAUSTED")
              ? `⚠️ ${err.message}`
              : `Error: ${err.message}`;
          return [model, { loading: false, response: errorMessage }];
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

  function formatNumber(num: number | undefined): string {
    if (num === undefined) return "";
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  return (
    <>
      <LLMComparativeAnalysis
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
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded mb-6 disabled:opacity-50"
          disabled={!prompt.trim() || models.length === 0}
        >
          Run Benchmark
        </button>

        {Object.keys(responses).length > 0 && (
          <>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setOpenComparativeAnalysis(true);
                  if (!comparativeAnalysis) {
                    runComparativeAnalysis();
                  }
                }}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 rounded"
              >
                Show Comprehensive Analysis
              </button>
            </div>

            <div className="mb-6 border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowMetricsComparison(!showMetricsComparison)}
                className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800"
              >
                <span className="font-medium">Side by side comparison</span>
                {showMetricsComparison ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>

              {showMetricsComparison && (
                <div className="overflow-x-auto p-3">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                          Metric
                        </th>
                        {Object.keys(responses).map((model) => (
                          <th
                            key={model}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                          >
                            {model}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[
                        "latencyMs",
                        "inputTokens",
                        "outputTokens",
                        "totalTokens",
                        "tokensPerSecond",
                        "wordCount",
                        "charCount",
                        "outputTokensPerSecond",
                        "inputTokensPerSecond",
                        "totalTokensPerSecond",
                      ].map(
                        (metric) =>
                          responses[Object.keys(responses)[0]]?.metrics?.[
                          metric
                          ] !== undefined && (
                            <tr key={metric}>
                              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                {metric === "latencyMs"
                                  ? "Latency (ms)"
                                  : metric === "tokensPerSecond"
                                    ? "Tokens/sec"
                                    : metric
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) =>
                                        str.toUpperCase()
                                      )}
                              </td>
                              {Object.keys(responses).map((model) => {
                                const metricValue =
                                  responses[model]?.metrics?.[metric];
                                return (
                                  <td
                                    key={`${model}-${metric}`}
                                    className="px-4 py-2 text-sm"
                                  >
                                    {metric === "tokensPerSecond"
                                      ? formatNumber(metricValue as number)
                                      : metricValue}
                                    {metric === "latencyMs" && " ms"}
                                  </td>
                                );
                              })}
                            </tr>
                          )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => {
            const response = responses[model];
            const isTokenError = response?.response?.startsWith("⚠️");
            return (
              <div
                key={model}
                className={`border rounded-lg p-4 ${isTokenError
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : ""
                  }`}
              >
                <LLMResponsePanel
                  model={model}
                  isLoading={response?.loading}
                  response={response?.response}
                  metrics={response?.metrics}
                />
              </div>
            );
          })}
        </div>
      </form>
    </>
  );
}
