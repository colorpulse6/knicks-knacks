"use client";

import React, { useState, useEffect } from "react";
import {
  LLM_REGISTRY,
  LLMProviderSpec,
  LLMModelSpec,
  isModelAvailable,
} from "../core/llm-registry";
import {
  ChevronDown,
  ChevronUp,
  Info,
  Briefcase,
  Zap,
  DollarSign,
  Lock,
  Gift,
} from "lucide-react"; // For icons
import { useApiKeyStore } from "../providers/ApiKeyProvider";

// Helper function to check if a provider has any free models
const providerHasFreeModels = (provider: LLMProviderSpec): boolean => {
  return provider.models.some(
    (model) =>
      model.costType === "appKeyPermissive" || model.costType === "free"
  );
};

export interface SelectedLLM {
  providerId: string;
  modelId: string;
  // Store displayName for easier access if needed, though we can look it up
  // displayName?: string;
}

interface ModelSelectorProps {
  selected: SelectedLLM[];
  onChange: (models: SelectedLLM[]) => void;
}

// Helper to format cost
const formatCost = (cost: LLMModelSpec["cost"]) => {
  if (!cost) return "N/A";
  let parts = [];
  if (cost.inputPerMillionTokens !== undefined) {
    parts.push(`In: $${cost.inputPerMillionTokens.toFixed(2)}/M`);
  }
  if (cost.outputPerMillionTokens !== undefined) {
    parts.push(`Out: $${cost.outputPerMillionTokens.toFixed(2)}/M`);
  }
  if (parts.length === 0 && cost.notes) {
    return cost.notes;
  }
  return parts.join(", ") + (cost.notes ? ` (${cost.notes})` : "");
};

// Component to explain model availability based on cost types
function ModelAvailabilityInfo() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="mt-2 mb-4">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="text-sm flex items-center text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Info size={16} className="mr-1.5" />
        {showInfo ? "Hide model availability info" : "About model availability"}
      </button>

      {showInfo && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-gray-700 dark:text-gray-300 text-sm">
          <p className="font-medium mb-2">Model Types:</p>
          <ul className="space-y-2 pl-1">
            <li className="flex items-start">
              <span className="text-green-600 dark:text-green-400 font-medium mr-1.5">
                •
              </span>
              <div>
                <span className="font-medium">Free Models:</span> No API key
                required
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 dark:text-green-400 font-medium mr-1.5">
                •
              </span>
              <div>
                <span className="font-medium">App Key Models:</span> Available
                using BotBattle&apos;s API key (no cost to you)
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 dark:text-yellow-400 font-medium mr-1.5">
                •
              </span>
              <div>
                <span className="font-medium">Optional Key Models:</span>{" "}
                Available with limited functionality without your API key
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 dark:text-red-400 font-medium mr-1.5">
                •
              </span>
              <div>
                <span className="font-medium">User Key Required:</span> Only
                available with your own API key from the provider
              </div>
            </li>
          </ul>
          <p className="mt-2 text-xs">
            <span className="font-medium">Note:</span> When you use your own API
            key, you may be charged by the provider based on their pricing.
          </p>
        </div>
      )}
    </div>
  );
}

export function ModelSelector({ selected, onChange }: ModelSelectorProps) {
  const [expandedProviders, setExpandedProviders] = useState<
    Record<string, boolean>
  >({});

  // Get API keys from store
  const apiKeys = useApiKeyStore((state) => state.apiKeys);

  // Convert apiKeys object to a record of provider -> boolean (has key)
  const availableApiKeys: Record<string, boolean> = Object.keys(apiKeys).reduce(
    (acc, provider) => {
      acc[provider.toLowerCase()] = true;
      return acc;
    },
    {} as Record<string, boolean>
  );

  useEffect(() => {
    // console.log("Selected models in selector:", selected);
  }, [selected]);

  function toggleModel(
    providerId: string,
    modelId: string,
    isAvailable: boolean
  ) {
    // Prevent selecting unavailable models
    if (!isAvailable) return;

    const isCurrentlySelected = selected.some(
      (s) => s.providerId === providerId && s.modelId === modelId
    );

    if (isCurrentlySelected) {
      onChange(
        selected.filter(
          (s) => !(s.providerId === providerId && s.modelId === modelId)
        )
      );
    } else {
      onChange([...selected, { providerId, modelId }]);
    }
  }

  function toggleProviderExpansion(providerId: string) {
    setExpandedProviders((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  }

  return (
    <div className="mb-6">
      <label className="block text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        Select LLM Models
      </label>

      <ModelAvailabilityInfo />

      <div className="space-y-3">
        {LLM_REGISTRY.map((provider) => (
          <div
            key={provider.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between p-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
              onClick={() => toggleProviderExpansion(provider.id)}
            >
              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {provider.displayName}
                </span>
                {providerHasFreeModels(provider) && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    <Gift size={12} className="mr-1" />
                  </span>
                )}
              </div>
              {expandedProviders[provider.id] ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {expandedProviders[provider.id] && (
              <div className="p-4 bg-white dark:bg-gray-800/50 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {provider.models.map((model) => {
                    const isSelected = selected.some(
                      (s) =>
                        s.providerId === provider.id && s.modelId === model.id
                    );

                    // Check if this model is available based on API keys
                    const availability = isModelAvailable(
                      provider.id,
                      model.id,
                      availableApiKeys
                    );
                    const isAvailable = availability.available;

                    return (
                      <button
                        type="button"
                        key={model.id}
                        onClick={() =>
                          toggleModel(provider.id, model.id, isAvailable)
                        }
                        disabled={!isAvailable}
                        className={`
                          p-3 rounded-md text-left transition-all duration-150 border 
                          ${
                            isSelected
                              ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 shadow-md ring-2 ring-blue-500 dark:ring-blue-400"
                              : isAvailable
                                ? "bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                : "bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-70"
                          }
                        `}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm">
                            {model.displayName}
                          </span>
                          {!isAvailable && (
                            <Lock
                              size={16}
                              className="text-gray-400 dark:text-gray-500"
                            />
                          )}
                          {(model.costType === "appKeyPermissive" ||
                            model.costType === "free") &&
                            isAvailable && (
                              <Gift
                                size={14}
                                className="text-green-600 dark:text-green-400"
                              />
                            )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                          <div className="flex items-center">
                            <Briefcase
                              size={12}
                              className="mr-1.5 opacity-70"
                            />{" "}
                            Context: {model.contextWindow.toLocaleString()}{" "}
                            tokens
                          </div>
                          <div className="flex items-center">
                            <DollarSign
                              size={12}
                              className="mr-1.5 opacity-70"
                            />{" "}
                            Cost: {formatCost(model.cost)}
                          </div>
                          {model.capabilities &&
                            model.capabilities.length > 0 && (
                              <div className="flex items-center pt-0.5">
                                <Zap
                                  size={12}
                                  className="mr-1.5 opacity-70 flex-shrink-0"
                                />
                                Capabilities: {model.capabilities.join(", ")}
                              </div>
                            )}
                          {model.costType === "appKeyPermissive" && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <Gift size={12} className="mr-1.5 opacity-70" />{" "}
                              Free with app&apos;s key
                            </div>
                          )}
                          {model.costType === "free" && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <Gift size={12} className="mr-1.5 opacity-70" />{" "}
                              Free to use
                            </div>
                          )}
                          {!isAvailable && availability.reason && (
                            <div className="flex items-center text-red-500 dark:text-red-400 mt-1.5">
                              <Lock size={12} className="mr-1.5 opacity-70" />{" "}
                              {availability.reason}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Selected: {selected.length} model{selected.length !== 1 ? "s" : ""}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selected.map((s) => {
              const provider = LLM_REGISTRY.find((p) => p.id === s.providerId);
              const model = provider?.models.find((m) => m.id === s.modelId);
              const displayName = model?.displayName || s.modelId;

              return (
                <div
                  key={`${s.providerId}-${s.modelId}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                >
                  {displayName}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleModel(s.providerId, s.modelId, true);
                    }}
                    className="ml-1.5 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {Object.keys(availableApiKeys).length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md text-yellow-800 dark:text-yellow-200 text-sm">
          <p className="font-medium mb-1">No API keys available</p>
          <p>
            Models requiring an API key are disabled. You can{" "}
            <a
              href="/settings"
              className="underline hover:text-yellow-600 dark:hover:text-yellow-100"
            >
              add your API keys in Settings
            </a>{" "}
            to enable more models.
          </p>
        </div>
      )}
    </div>
  );
}
