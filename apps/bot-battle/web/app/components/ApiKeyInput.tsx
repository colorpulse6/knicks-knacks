"use client";

import React, { useState } from "react";
import { useApiKeyStore } from "../utils/apiKeyStore";

interface ApiKeyInputProps {
  provider: string;
  label: string;
  description?: string;
}

export function ApiKeyInput({
  provider,
  label,
  description,
}: ApiKeyInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const setApiKey = useApiKeyStore((state) => state.setApiKey);
  const clearApiKey = useApiKeyStore((state) => state.clearApiKey);
  const apiKey = useApiKeyStore((state) => state.getApiKey(provider));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setApiKey(provider, inputValue.trim());
      setInputValue(""); // Clear input field after saving
    }
  };

  if (apiKey) {
    return (
      <div className="p-4 border rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">{label} API Key</h3>
        <div className="flex items-center mb-2">
          <p className="text-green-600 dark:text-green-400 mr-2">
            ✓ API Key set for this session
          </p>
          <button
            onClick={() => setShowKey(!showKey)}
            className="text-sm px-2 py-1 rounded-md font-medium text-white bg-neutral-600 hover:bg-neutral-700 transition"
          >
            {showKey ? "Hide Key" : "Show Key"}
          </button>
        </div>
        {showKey && (
          <div className="mb-4 p-2 bg-neutral-100 dark:bg-neutral-800 rounded">
            <code className="break-all text-sm">{apiKey}</code>
          </div>
        )}
        <button
          onClick={() => clearApiKey(provider)}
          className="px-4 py-2 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition"
        >
          Remove API Key
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">{label} API Key</h3>
      {description && (
        <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Enter your ${label} API key`}
          className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md font-medium text-white bg-primary hover:bg-primary-dark transition"
        >
          Save Key for Session
        </button>
      </form>
      <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
        <p>
          <strong>Important Security Notes:</strong>
        </p>
        <p>
          • Your API key is stored in your browser's memory for this session
          only.
        </p>
        <p>• Closing this tab or refreshing the page will clear the key.</p>
        <p>
          • Your key is sent directly from your browser to the LLM provider.
        </p>
        <p>
          • For enhanced security, consider using keys with limited permissions.
        </p>
      </div>
    </div>
  );
}
