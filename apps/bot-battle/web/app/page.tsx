"use client";
import React, { useState, useTransition, useEffect } from "react";
import { PromptSelector } from "./components/PromptSelector";
import { PromptInput } from "./components/PromptInput";
import { ModelSelector, SelectedLLM } from "./components/ModelSelector";
import { LLMResponsePanel } from "./components/LLMResponsePanel";
import { LLMComparativeAnalysis } from "./components/LLMComparativeAnalysis";
import { ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useApiKeyStore } from "./providers/ApiKeyProvider";
import { LLM_REGISTRY, getModelSpec } from "./core/llm-registry";
import { CostCalculator } from "./components/CostCalculator";

// Create a unique ID for each selected model to use as map keys
const getModelKey = (model: SelectedLLM): string => {
  return `${model.providerId}:${model.modelId}`;
};

// Get the display name for a model
const getModelDisplayName = (model: SelectedLLM): string => {
  const provider = LLM_REGISTRY.find((p) => p.id === model.providerId);
  const modelSpec = provider?.models.find((m) => m.id === model.modelId);
  return modelSpec?.displayName || `${model.providerId} - ${model.modelId}`;
};

// Update the ResponseData interface
interface ResponseData {
  loading: boolean;
  response: string | React.ReactElement;
  displayName: string;
  metrics?: Record<string, string | number | undefined>;
}

// Add this type guard function at the top of the file
function isString(value: any): value is string {
  return typeof value === "string";
}

async function fetchLLMResponse(
  selectedModel: SelectedLLM,
  prompt: string,
  signal?: AbortSignal
) {
  const res = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      providerId: selectedModel.providerId,
      modelId: selectedModel.modelId,
      prompt,
    }),
    signal,
  });

  const data = await res.json();

  if (!res.ok) {
    // Extract specific error messages
    if (data.errorType === "model_unavailable") {
      throw new Error(
        `Model unavailable: ${data.error}. Please check API Settings.`
      );
    }
    if (
      data.errorType === "api_key_missing" ||
      data.errorType === "api_key_invalid"
    ) {
      throw new Error(
        `API key error: ${data.error}. Go to Settings to add your key.`
      );
    }
    throw new Error(data.error || "Unknown error");
  }

  return data;
}

// Entry page for BotBattle Web (Next.js app directory convention)
export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [models, setModels] = useState<SelectedLLM[]>([]);
  const [responses, setResponses] = useState<
    Record<
      string, // Now using providerId:modelId as the key
      ResponseData
    >
  >({});
  const [comparativeAnalysis, setComparativeAnalysis] = useState<string | null>(
    null
  );
  const [isComparativeLoading, setIsComparativeLoading] = useState(false);
  const [openComparativeAnalysis, setOpenComparativeAnalysis] = useState(false);
  const [showMetricsComparison, setShowMetricsComparison] = useState(false);

  // Check if the user has any API keys set
  const apiKeys = useApiKeyStore((state) => state.apiKeys);
  const hasApiKeys = Object.keys(apiKeys).length > 0;

  // Handler for model selection changes
  const handleModelChange = (newModels: SelectedLLM[]) => {
    console.log("Models changed to:", newModels);
    setModels([...newModels]); // Create a new array to ensure state update
  };

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

    // Set loading state - now using getModelKey to create unique keys
    setResponses(
      Object.fromEntries(
        models.map((model) => [
          getModelKey(model),
          {
            loading: true,
            response: "",
            displayName: getModelDisplayName(model),
          },
        ])
      )
    );

    // Process each model individually instead of waiting for all to complete
    models.forEach(async (model) => {
      try {
        const res = await fetchLLMResponse(model, usedPrompt);

        // Update just this model's result, preserving other models' states
        setResponses((prevResponses) => ({
          ...prevResponses,
          [getModelKey(model)]: {
            loading: false,
            response: res.response,
            metrics: res.metrics,
            displayName: getModelDisplayName(model),
          },
        }));
      } catch (err: any) {
        // Create a user-friendly error message based on error type
        let errorMessage: string | React.ReactElement = `Error: ${err.message}`;

        // Handle API key errors with a settings link
        if (
          err.message.includes("API key") ||
          err.message.includes("Model unavailable")
        ) {
          // Use string for type checking but render React node in UI
          const errorText = `⚠️ ${err.message}`;
          errorMessage = (
            <div>
              <p className="text-red-500 mb-2">{errorText}</p>
              <a
                href="/settings"
                className="text-blue-500 hover:underline text-sm"
              >
                Go to API Settings →
              </a>
            </div>
          );
        }
        // Handle token limit errors
        else if (
          err.message.includes("Token limit exceeded") ||
          err.message.includes("API quota exceeded") ||
          err.message.includes("RESOURCE_EXHAUSTED")
        ) {
          errorMessage = `⚠️ ${err.message}`;
        }

        // Update just this model's error state
        setResponses((prevResponses) => ({
          ...prevResponses,
          [getModelKey(model)]: {
            loading: false,
            response: errorMessage,
            displayName: getModelDisplayName(model),
          },
        }));
      }
    });
  };

  async function runComparativeAnalysis() {
    if (!Object.keys(responses).length) return;

    setIsComparativeLoading(true);
    setComparativeAnalysis(null);

    try {
      // Extract model responses for analysis
      const modelResponses = Object.entries(responses).map(
        ([key, responseData]) => ({
          model: responseData.displayName,
          // Convert ReactNode responses to strings for API calls
          response:
            typeof responseData.response === "string"
              ? responseData.response
              : "Error: Unable to analyze non-text response",
        })
      );

      const res = await fetch("/api/llm/comparative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          results: modelResponses,
        }),
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

  function renderResponseContent(content: string | React.ReactNode) {
    // Just return React elements directly
    if (React.isValidElement(content)) {
      return content;
    }

    // Handle string responses
    if (typeof content === "string") {
      // Convert URLs to clickable links
      if (content.startsWith("http")) {
        return (
          <a
            href={content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {content}
          </a>
        );
      }

      // Return normal string response
      return content;
    }

    // Fallback for other types
    return String(content);
  }

  return (
    <>
      {!hasApiKeys && (
        <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400 rounded-md">
          <div className="flex items-start">
            <div className="flex-grow">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Using fallback API keys
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                You're currently using shared API keys with rate limits. For
                better performance, you can
                <Link
                  href={{ pathname: "/settings" }}
                  className="ml-1 underline font-medium"
                >
                  add your own API keys
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      )}
      <LLMComparativeAnalysis
        results={Object.entries(responses).map(([key, data]) => ({
          model: data.displayName,
          response: data.response,
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
        <ModelSelector selected={models} onChange={handleModelChange} />

        {/* Show calculator if models are selected, even before prompt is entered */}
        {models.length > 0 && (
          <CostCalculator prompt={prompt} selectedModels={models} />
        )}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md shadow-md flex items-center justify-center gap-2 w-full sm:w-auto mb-8 disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-700 transition-colors"
          disabled={!prompt.trim() || models.length === 0}
        >
          <PlayCircle size={20} />
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
                        {Object.keys(responses).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                          >
                            {responses[key].displayName}
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
                              {Object.keys(responses).map((key) => {
                                const metricValue =
                                  responses[key]?.metrics?.[metric];
                                return (
                                  <td
                                    key={`${key}-${metric}`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {Object.keys(responses).map((modelKey) => {
            const { loading, response, metrics, displayName } =
              responses[modelKey];
            // Check if response is a string and if it starts with the warning symbol
            const isTokenError =
              isString(response) && response.startsWith("⚠️");
            return (
              <div
                key={modelKey}
                className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800 ${
                  isTokenError ? "bg-red-50 dark:bg-red-900/20" : ""
                }`}
              >
                <LLMResponsePanel
                  model={displayName}
                  isLoading={loading}
                  response={renderResponseContent(response)}
                  metrics={metrics}
                />
              </div>
            );
          })}
        </div>
      </form>
    </>
  );
}
