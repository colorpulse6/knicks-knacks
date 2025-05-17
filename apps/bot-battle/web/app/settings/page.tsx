"use client";

import React from "react";
import { ApiKeyInput } from "../components/ApiKeyInput";
import { useApiKeyStore } from "../utils/apiKeyStore";
import Link from "next/link";

export default function SettingsPage() {
  const clearAllApiKeys = useApiKeyStore((state) => state.clearAllApiKeys);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API Settings</h1>
        <Link
          href="/"
          className="px-4 py-2 rounded-md text-blue-600 border border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 transition"
        >
          Return to Bot Battle
        </Link>
      </div>

      <p className="mb-6 text-neutral-600 dark:text-neutral-400">
        Add your own API keys to use with Bot Battle. Your keys are stored only
        in your browser's memory for this session and are never saved to our
        servers or local storage.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <ApiKeyInput
          provider="openai"
          label="OpenAI"
          description="Used for GPT models. Get your API key from the OpenAI dashboard."
        />

        <ApiKeyInput
          provider="groq"
          label="Groq"
          description="Used for Llama and Mixtral models. Get your API key from the Groq console."
        />

        <ApiKeyInput
          provider="gemini"
          label="Google AI"
          description="Used for Gemini models. Get your API key from Google AI Studio."
        />

        <ApiKeyInput
          provider="openrouter"
          label="OpenRouter"
          description="Access to multiple models including Claude, DeepSeek, and others."
        />
      </div>

      <div className="mt-10 pb-10">
        <button
          onClick={() => {
            if (
              window.confirm("Are you sure you want to clear all API keys?")
            ) {
              clearAllApiKeys();
            }
          }}
          className="px-4 py-2 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition"
        >
          Clear All API Keys
        </button>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          This will remove all API keys from the current session.
        </p>
      </div>
    </div>
  );
}
