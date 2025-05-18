#!/usr/bin/env node

/**
 * This script checks and fixes API keys in the .env.local file.
 * It removes any quotes or extra spaces that might cause issues.
 *
 * Usage:
 * node scripts/check-api-keys.js
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ENV_FILE = path.join(process.cwd(), ".env.local");
const TEMPLATE_FILE = path.join(process.cwd(), ".env.template");

// Key names to check
const API_KEY_NAMES = [
  "GROQ_API_KEY",
  "NEXT_PUBLIC_GROQ_API_KEY",
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "OPENROUTER_API_KEY",
];

// Check if .env.local exists
if (!fs.existsSync(ENV_FILE)) {
  console.log(
    "\x1b[33m%s\x1b[0m",
    ".env.local file not found. Creating a template..."
  );

  // Create a template file
  const templateContent = `# BotBattle API Keys
# Replace these with your actual API keys

# Groq API key (used for token estimation and LLM judge)
GROQ_API_KEY=

# OpenAI API key
OPENAI_API_KEY=

# Gemini API key
GEMINI_API_KEY=

# OpenRouter API key (used for Claude and other models)
OPENROUTER_API_KEY=

# Note: Do not add quotes or extra spaces around your API keys
`;

  fs.writeFileSync(ENV_FILE, templateContent);
  console.log(
    "\x1b[32m%s\x1b[0m",
    `.env.local file created. Please add your API keys to ${ENV_FILE}`
  );
  process.exit(0);
}

// Read the .env.local file
const envContent = fs.readFileSync(ENV_FILE, "utf8");
const lines = envContent.split("\n");
let hasChanges = false;
const newLines = [];

// Process each line
lines.forEach((line) => {
  // Skip comments and empty lines
  if (line.trim() === "" || line.trim().startsWith("#")) {
    newLines.push(line);
    return;
  }

  // Check if line contains an API key
  const keyMatch = line.match(/^([A-Z_]+)=(.*)$/);
  if (keyMatch && API_KEY_NAMES.includes(keyMatch[1])) {
    const keyName = keyMatch[1];
    let keyValue = keyMatch[2];
    const originalValue = keyValue;

    // Remove quotes and trim whitespace
    keyValue = keyValue.trim();
    if (
      (keyValue.startsWith('"') && keyValue.endsWith('"')) ||
      (keyValue.startsWith("'") && keyValue.endsWith("'"))
    ) {
      keyValue = keyValue.substring(1, keyValue.length - 1);
    }
    keyValue = keyValue.trim();

    // If the value changed, mark that we have changes
    if (keyValue !== originalValue) {
      hasChanges = true;
      console.log(
        "\x1b[33m%s\x1b[0m",
        `Fixed ${keyName}: Removed quotes or extra spaces`
      );
    }

    newLines.push(`${keyName}=${keyValue}`);
  } else {
    newLines.push(line);
  }
});

// Write the changes back if needed
if (hasChanges) {
  fs.writeFileSync(ENV_FILE, newLines.join("\n"));
  console.log("\x1b[32m%s\x1b[0m", "API keys fixed successfully!");
} else {
  console.log("\x1b[32m%s\x1b[0m", "API keys look good! No changes needed.");
}

// Check if any API keys are present
let apiKeysPresent = false;
API_KEY_NAMES.forEach((keyName) => {
  const keyRegex = new RegExp(`^${keyName}=(.+)$`, "m");
  const keyMatch = envContent.match(keyRegex);
  if (keyMatch && keyMatch[1].trim() !== "") {
    apiKeysPresent = true;

    // For Groq API keys, validate format
    if (keyName === "GROQ_API_KEY") {
      const groqKey = keyMatch[1].trim();
      if (!isValidGroqApiKey(groqKey)) {
        console.log(
          "\x1b[33m%s\x1b[0m",
          `WARNING: ${keyName} doesn't appear to match the expected format (should start with 'gsk_'). Please verify your key.`
        );
      } else {
        console.log(
          "\x1b[32m%s\x1b[0m",
          `${keyName} is present and format looks valid.`
        );
      }
    } else {
      console.log("\x1b[32m%s\x1b[0m", `${keyName} is present.`);
    }
  } else {
    console.log("\x1b[33m%s\x1b[0m", `${keyName} is missing or empty.`);
  }
});

// Function to validate Groq API key format
function isValidGroqApiKey(key) {
  // Groq API keys typically start with 'gsk_'
  return key.startsWith("gsk_") && key.length > 20;
}

if (!apiKeysPresent) {
  console.log(
    "\x1b[33m%s\x1b[0m",
    "\nNo API keys found. Please add your API keys to .env.local"
  );
} else {
  console.log(
    "\x1b[32m%s\x1b[0m",
    "\nAPI keys found. You can now run the app with: yarn dev"
  );
}

// Instructions
console.log(
  "\x1b[36m%s\x1b[0m",
  "\nAfter adding or updating your API keys, restart the server for changes to take effect."
);
console.log(
  "\x1b[36m%s\x1b[0m",
  "For more info on how to get API keys, check the project README.md file.\n"
);
