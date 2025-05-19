import { NextRequest, NextResponse } from "next/server";
import { estimateTokensForPrompt } from "../../../utils/tokenCounter";
import {
  parseGroqError,
  getFriendlyErrorMessage,
  APIError,
} from "../../../utils/apiErrors";

// Function to estimate tokens using Groq's API
async function estimateTokensWithGroq(prompt: string) {
  try {
    // Use environment variable directly like in the comparative route
    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY");
    }

    console.log("Using Groq API for token estimation");

    const analyzePrompt = `
You are a tokenization expert. Please analyze this prompt and estimate how many tokens it will use as input and how many tokens might be in a typical response.

You MUST respond with ONLY a JSON object in this exact format, with NO additional text before or after:
{
  "inputTokens": number,
  "estimatedOutputTokens": number,
  "explanation": "brief explanation of factors affecting the count"
}

IMPORTANT: Both "inputTokens" and "estimatedOutputTokens" MUST be single integer values, not ranges. If you think the output could be a range, use the average value instead.

For example:
{ 
  "inputTokens": 42, 
  "estimatedOutputTokens": 375, 
  "explanation": "Brief explanation here..." 
}

Prompt to analyze:
"""
${prompt}
"""
`;

    // Modified to match the comparative route format exactly
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: analyzePrompt }],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw parseGroqError(errorData);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Invalid response format from Groq");
    }

    // Parse the extracted JSON
    try {
      // First, try to parse directly
      let jsonContent = match[0];

      // Log the extracted JSON for debugging
      console.log("Extracted JSON content:", jsonContent);

      // Before parsing, check and fix range values in the JSON
      // First, check for range pattern in estimatedOutputTokens
      const rangePattern = /"estimatedOutputTokens"\s*:\s*(\d+)-(\d+)/;
      const rangeMatch = jsonContent.match(rangePattern);

      if (rangeMatch) {
        // Extract min and max values and calculate average
        const min = parseInt(rangeMatch[1]);
        const max = parseInt(rangeMatch[2]);
        const average = Math.round((min + max) / 2);

        // Replace the range with the average value
        jsonContent = jsonContent.replace(
          rangePattern,
          `"estimatedOutputTokens": ${average}`
        );
        console.log("Fixed range in JSON:", jsonContent);
      }

      // Fix any string values that should be numbers
      jsonContent = jsonContent.replace(
        /"inputTokens"\s*:\s*"(\d+)"/g,
        '"inputTokens": $1'
      );
      jsonContent = jsonContent.replace(
        /"estimatedOutputTokens"\s*:\s*"(\d+)"/g,
        '"estimatedOutputTokens": $1'
      );

      // Now try to parse the fixed JSON
      let result;
      try {
        result = JSON.parse(jsonContent);
      } catch (parsingError) {
        console.error("JSON parsing error after fixes:", parsingError);
        // Last resort: try manual extraction of values
        const inputMatch = jsonContent.match(/"inputTokens"\s*:\s*(\d+)/);
        const outputMatch = jsonContent.match(
          /"estimatedOutputTokens"\s*:\s*(\d+)/
        );
        const explanationMatch = jsonContent.match(
          /"explanation"\s*:\s*"([^"]*)"/
        );

        if (inputMatch && outputMatch) {
          result = {
            inputTokens: parseInt(inputMatch[1]),
            estimatedOutputTokens: parseInt(outputMatch[1]),
            explanation: explanationMatch
              ? explanationMatch[1]
              : "Extracted from malformed JSON",
          };
        } else {
          throw new Error("Could not extract values from malformed JSON");
        }
      }

      // Ensure values are proper numbers
      return {
        inputTokens:
          typeof result.inputTokens === "number"
            ? result.inputTokens
            : parseInt(String(result.inputTokens)) || 0,
        estimatedOutputTokens:
          typeof result.estimatedOutputTokens === "number"
            ? result.estimatedOutputTokens
            : parseInt(String(result.estimatedOutputTokens)) || 300,
        explanation: result.explanation || "No explanation provided",
        source: "groq",
      };
    } catch (jsonError) {
      console.error("Failed to parse Groq response:", content);
      throw new Error("Invalid JSON in Groq response");
    }
  } catch (err) {
    console.error("Error estimating tokens with Groq:", err);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    try {
      // Try to use Groq for token estimation
      const tokenEstimate = await estimateTokensWithGroq(prompt);

      return NextResponse.json({
        ...tokenEstimate,
        totalTokens:
          tokenEstimate.inputTokens + tokenEstimate.estimatedOutputTokens,
      });
    } catch (groqError) {
      console.warn(
        "Failed to use Groq for token estimation, falling back to local calculation"
      );

      // Create an APIError from the caught error or use a default
      const apiError =
        groqError instanceof APIError
          ? groqError
          : new APIError(
              typeof groqError === "object" &&
              groqError !== null &&
              "message" in groqError
                ? String(groqError.message)
                : "Unknown error with Groq API",
              "api_error"
            );

      // Use the friendly error message utility
      const friendlyError = getFriendlyErrorMessage(apiError);

      // Fallback to local estimation
      const localEstimate = estimateTokensForPrompt(prompt);

      return NextResponse.json({
        ...localEstimate,
        explanation: `Using local estimation (${friendlyError})`,
        source: "local",
      });
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
