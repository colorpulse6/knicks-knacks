// Simple token counting utilities for cost estimation

/**
 * Estimates the number of tokens in a text string.
 * This is a rough approximation based on typical token-to-character ratios.
 * Different models tokenize differently, but this gives a reasonable estimate.
 *
 * For English text, ~4 characters per token is a common approximation.
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;

  // Count words (approximation: most common words are 1 token)
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Count non-alphanumeric characters (many special chars are their own token)
  const specialChars = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;

  // Count numbers (digits often tokenize differently)
  const digitGroups = (text.match(/\d+/g) || []).length;

  // Estimate based on character count as a fallback
  const characterCount = text.length;
  const charBasedEstimate = Math.ceil(characterCount / 4);

  // Weighted combination
  const combinedEstimate = Math.max(
    wordCount + Math.ceil(specialChars * 0.5) + digitGroups,
    Math.ceil(charBasedEstimate * 0.8) // Fallback with 20% reduction
  );

  return combinedEstimate;
}

/**
 * Estimates the token count for a prompt with compensation for special tokens
 * and message formatting that most chat models add.
 */
export function estimatePromptTokens(prompt: string): number {
  if (!prompt) return 0;

  const estimatedTokens = estimateTokenCount(prompt);

  // Check for code blocks which tend to tokenize differently
  const codeBlocks = prompt.match(/```[\s\S]*?```/g) || [];
  let codeBlocksTokens = 0;

  for (const block of codeBlocks) {
    // Code blocks often tokenize at around ~3 chars per token (more efficient)
    codeBlocksTokens += Math.ceil(block.length / 3);
  }

  // Add a small overhead for message formatting (varies by model)
  // Most models add 3-4 tokens for message formatting
  const messageOverhead = 4;

  // If the prompt contains code blocks, adjust the estimate
  if (codeBlocks.length > 0) {
    // Remove normal text tokens for the code blocks and add the specialized code block tokens
    const nonCodeText = prompt.replace(/```[\s\S]*?```/g, "");
    const nonCodeTokens = estimateTokenCount(nonCodeText);
    return nonCodeTokens + codeBlocksTokens + messageOverhead;
  }

  return estimatedTokens + messageOverhead;
}

/**
 * Estimates the response tokens based on prompt length and typical response ratios.
 * This is very approximate and will vary widely based on the specific prompt and task.
 */
export function estimateResponseTokens(prompt: string): number {
  if (!prompt) return 0;

  const promptTokens = estimatePromptTokens(prompt);

  // Check if the prompt appears to be a specific type of task
  const isQuestion =
    /\?\s*$/.test(prompt) ||
    /^(what|how|why|when|where|who|can|could|would|will|is|are|explain|tell)/i.test(
      prompt
    );

  const isSummarization = /summarize|summary|tldr|brief/i.test(prompt);
  const isGeneration = /generate|create|write|draft|compose/i.test(prompt);
  const isListRequest = /list|bullet points|steps|enumerate/i.test(prompt);

  // Different ratio based on prompt type and length
  if (isQuestion && promptTokens < 60) {
    // Questions often get more detailed responses
    return Math.min(promptTokens * 4, 500);
  } else if (isSummarization) {
    // Summarization tasks typically produce shorter outputs
    return Math.min(promptTokens * 0.7, 300);
  } else if (isGeneration) {
    // Creative generation tasks can produce longer outputs
    return Math.min(promptTokens * 5, 800);
  } else if (isListRequest) {
    // List requests often get medium-length, structured responses
    return Math.min(promptTokens * 3, 500);
  } else if (promptTokens < 50) {
    // Short prompts often get longer responses
    return promptTokens * 3.5;
  } else if (promptTokens < 200) {
    // Medium prompts get proportional responses
    return promptTokens * 2;
  } else if (promptTokens < 500) {
    // Longer prompts get relatively shorter responses
    return promptTokens;
  } else {
    // Very long prompts often get condensed responses
    return promptTokens * 0.7;
  }
}

/**
 * The most complete estimation, providing both input and output token estimates.
 */
export function estimateTokensForPrompt(prompt: string): {
  inputTokens: number;
  estimatedOutputTokens: number;
  totalTokens: number;
} {
  const inputTokens = estimatePromptTokens(prompt);
  const estimatedOutputTokens = estimateResponseTokens(prompt);

  return {
    inputTokens,
    estimatedOutputTokens,
    totalTokens: inputTokens + estimatedOutputTokens,
  };
}
