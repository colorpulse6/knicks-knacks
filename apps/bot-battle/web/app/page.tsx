"use client";

import React, { useRef, useState } from "react";
import { PromptSelector } from "./components/PromptSelector";
import { PromptInput } from "./components/PromptInput";
import { ModelSelector, SelectedLLM } from "./components/ModelSelector";
import { LLMResponsePanel } from "./components/LLMResponsePanel";
import dynamic from "next/dynamic";

// Dynamically import LLMComparativeAnalysis to prevent SSR issues with ReactMarkdown
const LLMComparativeAnalysis = dynamic(
  () =>
    import("./components/LLMComparativeAnalysis").then((mod) => ({
      default: mod.LLMComparativeAnalysis,
    })),
  {
    ssr: false,
    loading: () => <div>Loading analysis...</div>,
  }
);
import { ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useApiKeyStore } from "./providers/ApiKeyProvider";
import { LLM_REGISTRY } from "./core/llm-registry";
import { CostCalculator } from "./components/CostCalculator";
import { streamLLMResponse } from "./utils/llm/streamClient";
import { getClientApiKey } from "./utils/llm/api-keys";
import { getStreamPreference } from "./utils/streamPreference";
import { StreamToggle } from "./components/StreamToggle";

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
  isStreaming?: boolean;
  thinking?: string;
}

// Add this type guard function at the top of the file
function isString(value: any): value is string {
  return typeof value === "string";
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
  const [effortPerModel, setEffortPerModel] = useState<
    Record<string, "low" | "medium" | "high">
  >({});

  // Check if the user has any API keys set
  const apiKeys = useApiKeyStore((state) => state.apiKeys);
  const hasApiKeys = Object.keys(apiKeys).length > 0;

  const resultsRef = useRef<HTMLDivElement>(null);

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

    // Scroll to results so user sees loading cards populate
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const useStream = getStreamPreference();

    // Process each model individually instead of waiting for all to complete
    models.forEach((model) => {
      const modelKey = getModelKey(model);
      const provider = LLM_REGISTRY.find((p) => p.id === model.providerId);
      const spec = provider?.models.find((m) => m.id === model.modelId);
      const isReasoning = spec?.modelType === "reasoning";

      // Mark cell as streaming-in-progress so UI can render caret later
      setResponses((prev) => ({
        ...prev,
        [modelKey]: { ...prev[modelKey], isStreaming: useStream },
      }));

      const clientKey = getClientApiKey(model.providerId);

      streamLLMResponse(
        {
          providerId: model.providerId,
          modelId: model.modelId,
          prompt: usedPrompt,
          stream: useStream,
          ...(isReasoning && effortPerModel[modelKey] ? { effort: effortPerModel[modelKey] } : {}),
          ...(clientKey ? { apiKey: clientKey } : {}),
        },
        {
          onChunk: (delta) =>
            setResponses((prev) => {
              const cur = prev[modelKey];
              const prior = typeof cur?.response === "string" ? cur.response : "";
              return {
                ...prev,
                [modelKey]: {
                  ...cur,
                  loading: false,
                  response: prior + delta,
                  isStreaming: useStream,
                },
              };
            }),
          onDone: (metrics, thinking) =>
            setResponses((prev) => ({
              ...prev,
              [modelKey]: {
                ...prev[modelKey],
                loading: false,
                isStreaming: false,
                metrics,
                thinking,
              },
            })),
          onError: (err) =>
            setResponses((prev) => {
              const cur = prev[modelKey];
              const priorResponse = typeof cur?.response === "string" ? cur.response : "";
              return {
                ...prev,
                [modelKey]: {
                  ...cur,
                  loading: false,
                  isStreaming: false,
                  response: priorResponse + (priorResponse ? "\n\n" : "") + `⚠️ ${err}`,
                },
              };
            }),
        }
      );
    });
  };

  async function runComparativeAnalysis() {
    if (!Object.keys(responses).length) return;

    setIsComparativeLoading(true);
    setComparativeAnalysis(null);

    try {
      // Extract model responses for analysis
      const modelResponses = Object.entries(responses).map(
        ([_, responseData]) => ({
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
            className="text-rust hover:underline"
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
        <div className="mb-6 p-4 border-l-4 border-rule bg-paper-sunk rounded-md">
          <div className="flex items-start">
            <div className="flex-grow">
              <h3 className="text-sm font-medium text-ink">
                Using fallback API keys
              </h3>
              <p className="text-sm text-ink-soft mt-1">
                You&apos;re currently using shared API keys with rate limits.
                For better performance, you can
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
        results={Object.entries(responses).map(([_, data]) => ({
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

        <div className="flex items-center gap-4 mt-4">
          <button
            type="submit"
            className="bg-ink hover:bg-ink-soft text-paper font-medium px-6 py-3 rounded-md shadow-md flex items-center justify-center gap-2 w-full sm:w-auto mb-8 disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-700 transition-colors"
            disabled={!prompt.trim() || models.length === 0}
          >
            <PlayCircle size={20} />
            Run Benchmark
          </button>
          <StreamToggle />
        </div>

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
                className="px-3 py-1 text-sm bg-rust-tint rounded"
              >
                Show Comprehensive Analysis
              </button>
            </div>

            <div className="mb-6 border rounded-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowMetricsComparison(!showMetricsComparison)}
                className="w-full flex items-center justify-between p-3 bg-paper-sunk"
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
                  <table className="min-w-full divide-y divide-rule">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-ink-soft">
                          Metric
                        </th>
                        {Object.keys(responses).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-2 text-left text-xs font-medium text-ink-soft"
                          >
                            {responses[key].displayName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rule">
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
                              <td className="px-4 py-2 text-sm text-ink-soft">
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
        <div
          ref={resultsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 scroll-mt-6"
        >
          {Object.keys(responses).map((modelKey) => {
            const { loading, response, metrics, displayName } =
              responses[modelKey];
            // Check if response is a string and if it starts with the warning symbol
            const isTokenError =
              isString(response) && response.startsWith("⚠️");
            // Look up the model spec for this key
            const [mkProviderId, mkModelId] = modelKey.split(":");
            const mkProvider = LLM_REGISTRY.find(
              (p) => p.id === mkProviderId
            );
            const mkSpec = mkProvider?.models.find(
              (m) => m.id === mkModelId
            );
            return (
              <div
                key={modelKey}
                className={`p-4 border border-rule rounded-sm shadow-md bg-paper ${
                  isTokenError ? "bg-red-50 dark:bg-red-900/20" : ""
                }`}
              >
                <LLMResponsePanel
                  model={displayName}
                  modelType={mkSpec?.modelType}
                  status={mkSpec?.status}
                  supportsReasoningEffort={mkSpec?.supportsReasoningEffort}
                  effort={effortPerModel[modelKey] ?? "medium"}
                  onEffortChange={(e) =>
                    setEffortPerModel((prev) => ({ ...prev, [modelKey]: e }))
                  }
                  isLoading={loading}
                  isStreaming={responses[modelKey]?.isStreaming}
                  response={renderResponseContent(response)}
                  thinking={
                    typeof metrics?.thinking === "string"
                      ? metrics.thinking
                      : undefined
                  }
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
