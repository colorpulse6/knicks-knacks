"use client";

import React, { useState, useEffect } from "react";
import { useApiKeyStore } from "../providers/ApiKeyProvider";
import { getClientApiKeys, setClientApiKey } from "../utils/llm/api-keys";

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
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const setApiKey = useApiKeyStore((state) => state.setApiKey);
  const clearApiKey = useApiKeyStore((state) => state.clearApiKey);
  const apiKey = useApiKeyStore((state) => state.getApiKey(provider));

  // Check if persistence is enabled
  const isPersistenceEnabled =
    process.env.NEXT_PUBLIC_PERSIST_API_KEYS === "true";

  // Check if key is also set in the client utilities
  const [isKeyInClient, setIsKeyInClient] = useState(false);
  useEffect(() => {
    // Check if the key is actually set in the client utilities
    const clientKeys = getClientApiKeys();
    setIsKeyInClient(!!clientKeys[provider.toLowerCase()]);

    // If we have a key in the store but not in client, we should set it directly
    if (apiKey && !clientKeys[provider.toLowerCase()]) {
      console.log(
        `Key exists in store but not in client for ${provider}, directly setting`
      );
      setClientApiKey(provider, apiKey);
      // Check again after setting
      setTimeout(() => {
        const updatedKeys = getClientApiKeys();
        setIsKeyInClient(!!updatedKeys[provider.toLowerCase()]);
      }, 100);
    }
  }, [provider, apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const key = inputValue.trim();
      // Set directly in both store and client
      setApiKey(provider, key);
      setClientApiKey(provider, key);
      setInputValue(""); // Clear input field after saving
      setSaveStatus("Key saved successfully!");

      // Verify key was properly set in client
      setTimeout(() => {
        const clientKeys = getClientApiKeys();
        setIsKeyInClient(!!clientKeys[provider.toLowerCase()]);
        if (!clientKeys[provider.toLowerCase()]) {
          setSaveStatus(
            "Warning: Key may not be fully synchronized. Try refreshing."
          );
        }
      }, 300);

      setTimeout(() => setSaveStatus(null), 3000); // Clear message after 3 seconds
    }
  };

  if (apiKey) {
    return (
      <div className="p-4 border rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">{label} API Key</h3>
        <div className="flex items-center mb-2">
          <p
            className={`mr-2 ${isKeyInClient ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}
          >
            {isKeyInClient
              ? "✓ API Key set for this session"
              : "⚠️ Key set but not active in client - refresh may be needed"}
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
        <div className="flex gap-2">
          <button
            onClick={() => {
              clearApiKey(provider);
              setClientApiKey(provider, null);
              setSaveStatus("Key removed");
              setTimeout(() => {
                const clientKeys = getClientApiKeys();
                setIsKeyInClient(!!clientKeys[provider.toLowerCase()]);
              }, 100);
              setTimeout(() => setSaveStatus(null), 3000);
            }}
            className="px-4 py-2 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition"
          >
            Remove API Key
          </button>

          {!isKeyInClient && (
            <button
              onClick={() => {
                if (apiKey) {
                  setClientApiKey(provider, apiKey);
                  setSaveStatus("Attempted to resync key");
                  setTimeout(() => {
                    const clientKeys = getClientApiKeys();
                    setIsKeyInClient(!!clientKeys[provider.toLowerCase()]);
                  }, 100);
                }
              }}
              className="px-4 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Force Sync Key
            </button>
          )}
        </div>
        {saveStatus && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            {saveStatus}
          </p>
        )}
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
          className="px-4 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          Save Key for Session
        </button>
        {saveStatus && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            {saveStatus}
          </p>
        )}
      </form>
      <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
        <p>
          <strong>Important Security Notes:</strong>
        </p>
        {isPersistenceEnabled ? (
          <p>
            • Your API key is stored in your browser's localStorage and will
            persist between sessions until you clear it.
          </p>
        ) : (
          <p>
            • Your API key is stored in your browser's memory for this session
            only.
          </p>
        )}
        <p>
          {isPersistenceEnabled
            ? "• Clearing browser data will remove stored keys."
            : "• Closing this tab or refreshing the page will clear the key."}
        </p>
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
