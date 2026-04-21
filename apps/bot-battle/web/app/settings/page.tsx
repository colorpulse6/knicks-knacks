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
        <h1 className="font-serif text-2xl font-bold mb-6 text-ink">API Settings</h1>
        <div className="flex gap-3">
          <button
            onClick={refreshClientKeys}
            className={`p-2 rounded-sm border border-rule hover:bg-paper-sunk transition-all ${isRefreshing ? "animate-spin" : ""}`}
            title="Refresh API key state"
          >
            <RefreshCw size={18} />
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-sm text-rust border border-rule hover:bg-paper-sunk transition"
          >
            Return to Bot Battle
          </Link>
        </div>
      </div>

      <p className="mb-6 text-ink-soft">
        Add your own API keys to use with Bot Battle.
        {isPersistenceEnabled
          ? " Your keys are stored in your browser's localStorage and will persist between sessions until you clear them."
          : " Your keys are stored only in your browser's memory for this session and are never saved to our servers or local storage."}
      </p>

      {/* Debug information - can be removed in production */}
      <div className="p-3 mb-6 text-xs bg-paper-sunk rounded-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">API Key Status:</h4>
          <button
            onClick={refreshClientKeys}
            className="text-rust hover:underline flex items-center gap-1 text-xs"
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
              <span className={isActive ? "text-green-600" : "text-ink-soft"}>
                {isActive ? "✓" : "✗"}
              </span>
              <span className="ml-2 capitalize">{provider}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Major Providers</h2>
      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <section className="bg-paper border border-rule rounded-sm p-5 mb-4">
          <h3 className="font-serif text-base font-bold mb-3">OpenAI</h3>
          <ApiKeyInput
            provider="openai"
            label="OpenAI"
            description="Used for GPT-4o, GPT-4.1, and other OpenAI models. Get your API key from the OpenAI dashboard."
          />
        </section>

        <section className="bg-paper border border-rule rounded-sm p-5 mb-4">
          <h3 className="font-serif text-base font-bold mb-3">Anthropic</h3>
          <ApiKeyInput
            provider="anthropic"
            label="Anthropic"
            description="Used for Claude 3.7, Claude 3.5, and other Claude models. Get your API key from the Anthropic console."
          />
        </section>

        <section className="bg-paper border border-rule rounded-sm p-5 mb-4">
          <h3 className="font-serif text-base font-bold mb-3">Google AI</h3>
          <ApiKeyInput
            provider="google"
            label="Google AI"
            description="Used for Gemini 2.5, Gemini 2.0, and other Gemini models. Get your API key from Google AI Studio."
          />
        </section>

        <section className="bg-paper border border-rule rounded-sm p-5 mb-4">
          <h3 className="font-serif text-base font-bold mb-3">Mistral AI</h3>
          <ApiKeyInput
            provider="mistral"
            label="Mistral AI"
            description="Used for Mistral Large, Medium, Small, and other Mistral models. Get your API key from the Mistral AI console."
          />
        </section>
      </div>

      <h2 className="text-xl font-semibold mb-4">Additional Providers</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-paper border border-rule rounded-sm p-5 mb-4">
          <h3 className="font-serif text-base font-bold mb-3">Groq</h3>
          <ApiKeyInput
            provider="groq"
            label="Groq"
            description="Used for Llama and Mixtral models with high-performance inference. Get your API key from the Groq console."
          />
        </section>

        <section className="bg-paper border border-rule rounded-sm p-5 mb-4">
          <h3 className="font-serif text-base font-bold mb-3">xAI (Grok)</h3>
          <ApiKeyInput
            provider="xai"
            label="xAI (Grok)"
            description="Used for Grok models from xAI. Get your API key from the xAI console."
          />
        </section>

        <section className="bg-paper border border-rule rounded-sm p-5 mb-4">
          <h3 className="font-serif text-base font-bold mb-3">DeepSeek AI</h3>
          <ApiKeyInput
            provider="deepseek"
            label="DeepSeek AI"
            description="Used for premium DeepSeek models like DeepSeek Coder and DeepSeek V2. Get your API key from the DeepSeek platform."
          />
        </section>

        <section className="bg-paper border border-rule rounded-sm p-5 mb-4">
          <h3 className="font-serif text-base font-bold mb-3">Qwen</h3>
          <ApiKeyInput
            provider="qwen"
            label="Qwen"
            description="Used for premium Qwen models including Qwen3 235B and other Qwen models. Get your API key from the Alibaba Cloud DashScope console."
          />
        </section>

        <section className="bg-paper border border-rule rounded-sm p-5 mb-4">
          <h3 className="font-serif text-base font-bold mb-3">Cerebras</h3>
          <ApiKeyInput
            provider="cerebras"
            label="Cerebras"
            description="Used for Llama 3.3 70B and Llama 3.1 8B served on Cerebras' fast inference hardware (~1,000 tok/sec). Free tier available — no credit card required. Get your API key from cloud.cerebras.ai."
          />
        </section>

        <section className="bg-paper border border-rule rounded-sm p-5 mb-4">
          <h3 className="font-serif text-base font-bold mb-3">Cloudflare Workers AI</h3>
          <ApiKeyInput
            provider="cloudflare"
            label="Cloudflare (API Token)"
            description="Used for Llama 3.3 70B, Qwen 2.5 Coder, and Kimi K2.5 on Cloudflare's global network. Note: this provider also requires CLOUDFLARE_ACCOUNT_ID set server-side — entering a token here alone is not sufficient for personal deployments."
          />
        </section>
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
          className="px-4 py-2 rounded-sm font-medium text-paper bg-red-600 hover:bg-red-700 transition"
        >
          Clear All API Keys
        </button>
        <p className="mt-2 text-sm text-ink-soft">
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
