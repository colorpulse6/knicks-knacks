import React, { useEffect, useState, useCallback } from "react";
import { LLM_REGISTRY } from "../core/llm-registry";
import { estimateTokensForPrompt } from "../utils/tokenCounter";
import { SelectedLLM } from "./ModelSelector";
import { Info, RefreshCw } from "lucide-react";

interface CostEstimate {
  modelDisplayName: string;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
  free: boolean;
}

interface CostCalculatorProps {
  prompt: string;
  selectedModels: SelectedLLM[];
}

// Simple debounce function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Utility function to compute costs from token counts and models
function computeCosts(
  inputTokens: number,
  outputTokens: number,
  selectedModels: SelectedLLM[]
): CostEstimate[] {
  return selectedModels.map((model) => {
    const provider = LLM_REGISTRY.find((p) => p.id === model.providerId);
    const modelSpec = provider?.models.find((m) => m.id === model.modelId);

    if (!modelSpec || !modelSpec.cost) {
      return {
        modelDisplayName:
          modelSpec?.displayName || `${model.providerId}/${model.modelId}`,
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
        currency: "USD",
        free:
          modelSpec?.costType === "free" ||
          !modelSpec?.cost?.inputPerMillionTokens,
      };
    }

    // Calculate costs based on token estimates and model pricing
    const inputCost =
      ((modelSpec.cost.inputPerMillionTokens || 0) * inputTokens) / 1000000;

    const outputCost =
      ((modelSpec.cost.outputPerMillionTokens || 0) * outputTokens) / 1000000;

    return {
      modelDisplayName: modelSpec.displayName,
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      currency: modelSpec.cost.currency || "USD",
      free:
        modelSpec.costType === "free" || !modelSpec.cost.inputPerMillionTokens,
    };
  });
}

export function CostCalculator({
  prompt,
  selectedModels,
}: CostCalculatorProps) {
  const [costEstimates, setCostEstimates] = useState<CostEstimate[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [tokensInfo, setTokensInfo] = useState({
    inputTokens: 0,
    estimatedOutputTokens: 0,
    totalTokens: 0,
    explanation: "",
  });
  const [isAccurate, setIsAccurate] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Debounce prompt changes to avoid excessive recalculations
  const debouncedPrompt = useDebounce(prompt, 500);

  // Use Groq to get more accurate token estimates
  const recalculateWithGroq = async () => {
    if (!prompt || selectedModels.length === 0) return;

    setIsCalculating(true);
    setCalculationError(null);

    try {
      const response = await fetch("/api/tokens/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to estimate tokens");
      }

      const data = await response.json();

      // Update token counts
      setTokensInfo({
        inputTokens: data.inputTokens,
        estimatedOutputTokens: data.estimatedOutputTokens,
        totalTokens: data.totalTokens,
        explanation: data.explanation || "",
      });

      // Recalculate costs based on new token counts
      const estimates = computeCosts(
        data.inputTokens,
        data.estimatedOutputTokens,
        selectedModels
      );

      setCostEstimates(estimates);
      setTotalCost(estimates.reduce((sum, est) => sum + est.totalCost, 0));

      // Only mark as accurate if Groq was used (not the fallback)
      setIsAccurate(data.source === "groq");

      // Show a warning if we fell back to local estimation
      if (data.source === "local") {
        setCalculationError(
          data.explanation || "Using local estimation - Groq API unavailable"
        );
      }
    } catch (err: any) {
      console.error("Error estimating tokens with Groq:", err);

      // Extract the most relevant error message
      let errorMessage = err.message || "Failed to estimate tokens";

      // Handle specific error cases
      if (errorMessage.includes("API key")) {
        errorMessage =
          "Invalid Groq API key. Check your API key in .env.local file.";
      }

      setCalculationError(errorMessage);

      // We still want to show token estimates, so use local calculation
      const localEstimate = estimateTokensForPrompt(prompt);
      setTokensInfo({
        ...localEstimate,
        explanation: "Using local estimation due to API error",
      });

      // Calculate costs based on local estimates
      const estimates = computeCosts(
        localEstimate.inputTokens,
        localEstimate.estimatedOutputTokens,
        selectedModels
      );

      setCostEstimates(estimates);
      setTotalCost(estimates.reduce((sum, est) => sum + est.totalCost, 0));
    } finally {
      setIsCalculating(false);
    }
  };

  // Create memoized calculation function to avoid unnecessary recalculations
  const calculateCosts = useCallback(() => {
    if (!debouncedPrompt || selectedModels.length === 0) {
      setCostEstimates([]);
      setTotalCost(0);
      setTokensInfo({
        inputTokens: 0,
        estimatedOutputTokens: 0,
        totalTokens: 0,
        explanation: "",
      });
      setIsAccurate(false);
      return;
    }

    // Start with the simple estimation algorithm
    const tokenEstimate = estimateTokensForPrompt(debouncedPrompt);
    setTokensInfo({
      ...tokenEstimate,
      explanation: "",
    });
    setIsAccurate(false);

    // Calculate costs for each selected model
    const estimates = computeCosts(
      tokenEstimate.inputTokens,
      tokenEstimate.estimatedOutputTokens,
      selectedModels
    );

    setCostEstimates(estimates);
    setTotalCost(estimates.reduce((sum, est) => sum + est.totalCost, 0));
  }, [debouncedPrompt, selectedModels]);

  // Run the calculation effect when dependencies change
  useEffect(() => {
    calculateCosts();
  }, [calculateCosts]);

  if (selectedModels.length === 0) {
    return null;
  }

  const formatCost = (cost: number): string => {
    if (cost === 0) return "Free";
    if (cost < 0.01) return "< $0.01";
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div className="mb-6 border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium flex items-center">
          Cost Estimator
          <span
            className="ml-1 text-gray-500 dark:text-gray-400 inline-flex items-center"
            title="This is an estimate based on approximate token counts. Actual costs may vary."
          >
            <Info size={14} />
          </span>
          {isAccurate && (
            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
              (Groq-verified)
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={recalculateWithGroq}
            disabled={isCalculating || !prompt.trim()}
            className="text-xs px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-700 transition-colors"
            title="Use Groq to get a more accurate token count"
          >
            {isCalculating ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <RefreshCw size={12} />
                Recalculate
              </>
            )}
          </button>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-xs text-blue-600 dark:text-blue-400"
          >
            {isVisible ? "Hide Details" : "Show Details"}
          </button>
        </div>
      </div>

      {calculationError && (
        <div
          className={`text-xs mb-2 ${
            calculationError.includes("Using local estimation")
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {calculationError.includes("Using local estimation") ? "⚠️ " : "❌ "}
          {calculationError}
        </div>
      )}

      {isVisible && (
        <>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Estimated tokens: {tokensInfo.inputTokens} input + ~
            {tokensInfo.estimatedOutputTokens} output
            {tokensInfo.explanation && (
              <div className="mt-1 italic">{tokensInfo.explanation}</div>
            )}
          </div>

          <div className="space-y-2">
            {costEstimates.map((est, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {est.modelDisplayName}
                </span>
                <span
                  className={
                    est.free
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-700 dark:text-gray-300"
                  }
                >
                  {est.free ? "Free" : formatCost(est.totalCost)}
                </span>
              </div>
            ))}
          </div>

          {totalCost > 0 && (
            <div className="mt-3 pt-2 border-t flex justify-between text-sm font-medium">
              <span>Total estimated cost:</span>
              <span>{formatCost(totalCost)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
