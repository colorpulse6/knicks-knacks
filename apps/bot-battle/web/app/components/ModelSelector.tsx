"use client";

import React, { useState } from "react";
import {
  LLM_REGISTRY,
  LLMProviderSpec,
  isModelAvailable,
} from "../core/llm-registry";
import { Info, Gift, Lock } from "lucide-react";
import { useApiKeyStore } from "../providers/ApiKeyProvider";
import { ModelBadge } from "./ModelBadge";

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
}

interface ModelSelectorProps {
  selected: SelectedLLM[];
  onChange: (models: SelectedLLM[]) => void;
}

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

  function toggleModel(providerId: string, modelId: string) {
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

  // Flatten all models from the registry with their provider id attached
  const allModels = LLM_REGISTRY.flatMap((p) =>
    p.models.map((m) => ({ ...m, providerId: p.id, providerName: p.displayName, hasFreeModels: providerHasFreeModels(p) }))
  );

  return (
    <div className="mb-6">
      <label className="block text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        Select LLM Models
      </label>

      <ModelAvailabilityInfo />

      {/* Chip row */}
      <div className="flex flex-wrap gap-1.5">
        {allModels.map((m) => {
          const isSelected = selected.some(
            (s) => s.providerId === m.providerId && s.modelId === m.id
          );
          const availability = isModelAvailable(
            m.providerId,
            m.id,
            availableApiKeys
          );
          const isAvailable = availability.available;
          const isFree =
            m.costType === "appKeyPermissive" || m.costType === "free";

          return (
            <button
              key={`${m.providerId}:${m.id}`}
              type="button"
              onClick={() => isAvailable && toggleModel(m.providerId, m.id)}
              disabled={!isAvailable}
              title={
                !isAvailable && availability.reason
                  ? availability.reason
                  : `${m.providerName} — ${m.displayName}`
              }
              className={[
                "text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-0.5 transition-colors",
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                  : isAvailable
                  ? "bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-400"
                  : "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700 opacity-50 cursor-not-allowed",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {m.displayName}
              {isFree && isAvailable && (
                <Gift
                  size={10}
                  className={
                    isSelected
                      ? "text-white"
                      : "text-green-600 dark:text-green-400"
                  }
                />
              )}
              {!isAvailable && <Lock size={10} className="text-gray-400 dark:text-gray-600" />}
              <ModelBadge status={m.status} modelType={m.modelType} />
            </button>
          );
        })}
      </div>

      {/* Selected model count + removable summary pills */}
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
                      toggleModel(s.providerId, s.modelId);
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

      {/* No API keys warning */}
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
