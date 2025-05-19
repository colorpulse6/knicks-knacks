"use client";

import React, { useEffect, useState } from "react";
import { ApiKeyInput } from "../components/ApiKeyInput";
import { useApiKeyStore } from "../providers/ApiKeyProvider";
import { getClientApiKeys } from "../utils/llm/api-keys";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const clearAllApiKeys = useApiKeyStore((state) => state.clearAllApiKeys);
  const apiKeys = useApiKeyStore((state) => state.apiKeys);

  // Check if persistence is enabled
  const isPersistenceEnabled =
    process.env.NEXT_PUBLIC_PERSIST_API_KEYS === "true";

  // For debug purposes - show the client API keys state
  const [clientKeysState, setClientKeysState] = useState<
    Record<string, boolean>
  >({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to refresh the API key state
  const refreshClientKeys = () => {
    setIsRefreshing(true);
    const updatedKeys = getClientApiKeys();
    setClientKeysState(updatedKeys);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    // Check client keys on mount and whenever apiKeys changes
    refreshClientKeys();

    // Set up an interval to keep checking the client keys
    const interval = setInterval(refreshClientKeys, 5000);

    return () => clearInterval(interval);
  }, [apiKeys]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API Settings</h1>
        <div className="flex gap-3">
          <button
            onClick={refreshClientKeys}
            className={`p-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${isRefreshing ? "animate-spin" : ""}`}
            title="Refresh API key state"
          >
            <RefreshCw size={18} />
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-md text-blue-600 border border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 transition"
          >
            Return to Bot Battle
          </Link>
        </div>
      </div>

      <p className="mb-6 text-neutral-600 dark:text-neutral-400">
        Add your own API keys to use with Bot Battle.
        {isPersistenceEnabled
          ? " Your keys are stored in your browser's localStorage and will persist between sessions until you clear them."
          : " Your keys are stored only in your browser's memory for this session and are never saved to our servers or local storage."}
      </p>

      {/* Debug information - can be removed in production */}
      <div className="p-3 mb-6 text-xs bg-gray-100 dark:bg-gray-800 rounded-md">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">API Key Status:</h4>
          <button
            onClick={refreshClientKeys}
            className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
          >
            <RefreshCw
              size={12}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {Object.entries(clientKeysState).map(([provider, isActive]) => (
            <div key={provider} className="flex items-center">
              <span className={isActive ? "text-green-600" : "text-gray-400"}>
                {isActive ? "✓" : "✗"}
              </span>
              <span className="ml-2 capitalize">{provider}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Major Providers</h2>
      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <ApiKeyInput
          provider="openai"
          label="OpenAI"
          description="Used for GPT-4o, GPT-4.1, and other OpenAI models. Get your API key from the OpenAI dashboard."
        />

        <ApiKeyInput
          provider="anthropic"
          label="Anthropic"
          description="Used for Claude 3.7, Claude 3.5, and other Claude models. Get your API key from the Anthropic console."
        />

        <ApiKeyInput
          provider="google"
          label="Google AI"
          description="Used for Gemini 2.5, Gemini 2.0, and other Gemini models. Get your API key from Google AI Studio."
        />

        <ApiKeyInput
          provider="mistral"
          label="Mistral AI"
          description="Used for Mistral Large, Medium, Small, and other Mistral models. Get your API key from the Mistral AI console."
        />
      </div>

      <h2 className="text-xl font-semibold mb-4">Additional Providers</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <ApiKeyInput
          provider="groq"
          label="Groq"
          description="Used for Llama and Mixtral models with high-performance inference. Get your API key from the Groq console."
        />

        <ApiKeyInput
          provider="cohere"
          label="Cohere"
          description="Used for Command R+ and Command R models. Get your API key from the Cohere dashboard."
        />

        <ApiKeyInput
          provider="ai21"
          label="AI21 Labs"
          description="Used for Jamba models with long context windows. Get your API key from the AI21 Studio."
        />

        <ApiKeyInput
          provider="openrouter"
          label="OpenRouter"
          description="Used to access a wide range of models through a unified API. Get your API key from OpenRouter."
        />

        <ApiKeyInput
          provider="meta"
          label="Meta AI"
          description="Used for premium Llama models including Llama 3 Opus and Llama 4 Opus. If you have a Meta API key, you can access these models through the Meta platform."
        />

        <ApiKeyInput
          provider="microsoft"
          label="Microsoft"
          description="Used for premium Phi-4 models with enhanced reasoning capabilities. Get your API key from the Microsoft Azure portal."
        />

        <ApiKeyInput
          provider="deepseek"
          label="DeepSeek AI"
          description="Used for premium DeepSeek models like DeepSeek Coder and DeepSeek V2. Get your API key from the DeepSeek platform."
        />

        <ApiKeyInput
          provider="qwen"
          label="Qwen"
          description="Used for premium Qwen models including Qwen3 235B and other Qwen models. Get your API key from the Alibaba Cloud DashScope console."
        />
      </div>

      <div className="mt-10 pb-10">
        <button
          onClick={() => {
            if (
              window.confirm("Are you sure you want to clear all API keys?")
            ) {
              clearAllApiKeys();
              // Force a refresh of the client keys state
              setTimeout(refreshClientKeys, 100);
            }
          }}
          className="px-4 py-2 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition"
        >
          Clear All API Keys
        </button>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          This will remove all API keys{" "}
          {isPersistenceEnabled
            ? "from localStorage and the current session"
            : "from the current session"}
          .
        </p>
      </div>
    </div>
  );
}
