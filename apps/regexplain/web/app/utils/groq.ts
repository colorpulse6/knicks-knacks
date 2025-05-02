const MODEL = "llama3-70b-8192";

function looksLikeRegex(input: string): boolean {
  // Heuristic: contains at least one common regex special character
  // (not perfect, but good for basic user warning)
  return /[.*+?^${}()|[\]\\]/.test(input);
}

// Types for regex explanation results
export interface RegexExplanation {
  summary: string;
  breakdown: { part: string; explanation: string }[];
  error?: boolean;
  notRegex?: boolean;
  suggestion: string;
}

export async function explainRegexWithGroq({
  regex,
  apiKey,
}: {
  regex: string;
  apiKey: string;
}): Promise<RegexExplanation> {
  if (!looksLikeRegex(regex)) {
    // Instead of calling the API, return a consistent response
    return {
      summary: "This does not appear to be a regular expression.",
      breakdown: [],
      notRegex: true,
      suggestion: "",
    };
  }

  const prompt = `You are a regex expert. Given the following regular expression, return ONLY a JSON object with three fields:
- "summary" (a one-sentence summary of what the regex does, or why it's invalid),
- "breakdown" (an array of objects, each with "part" and "explanation" fields; if invalid, this should be an empty array),
- "suggestion" (a clear, actionable fix or advice for correcting the pattern if it's invalid; if valid, just return an empty string). Always include the suggestion field, even if the regex is valid.

DO NOT include any commentary, explanation, or extra text outside the JSON.
DO NOT wrap the JSON in code blocks or markdown.
If the input is not a valid regular expression, your JSON MUST include a helpful suggestion for fixing it, not just an empty string.

Example (valid regex):
{
  "summary": "This regex matches a 10-digit phone number.",
  "breakdown": [
    { "part": "^", "explanation": "Start of string" },
    { "part": "\\d{3}", "explanation": "Exactly 3 digits" }
  ],
  "suggestion": ""
}

Example (invalid regex):
{
  "summary": "This does not appear to be a regular expression.",
  "breakdown": [],
  "suggestion": "Move the hyphen to the end of your character class, e.g. [abc-] instead of [a-bc]."
}

Regex: ${regex}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a regex expert who explains patterns simply.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    let details = "";
    try {
      details = await res.text();
      console.error("[GROQ] Error details:", details);
    } catch {}
    throw new Error(
      "Failed to fetch explanation: " +
        res.status +
        " " +
        res.statusText +
        (details ? ": " + details : "")
    );
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  // LOG RAW AI RESPONSE FOR DEBUGGING
  console.log("[GROQ] Raw AI response:", content);

  // Try direct JSON parse first (most robust if AI follows instructions)
  try {
    return JSON.parse(content);
  } catch (e1) {
    // Fallback: extract first JSON object from the response
    let match = content && content.match(/\{[\s\S]*\}/);
    if (!match) {
      return {
        summary:
          "Sorry, there was a problem explaining this regex. Please try again.",
        breakdown: [],
        error: true,
        suggestion: "",
      };
    }
    let jsonString = match[0];
    // Only double-escape single backslashes not already escaped
    jsonString = jsonString.replace(/([^\\])\\([^\\])/g, "$1\\\\$2");
    try {
      return JSON.parse(jsonString);
    } catch (e2) {
      if (jsonString.includes("notRegex")) {
        return {
          summary: "This does not appear to be a regular expression.",
          breakdown: [],
          notRegex: true,
          suggestion: "",
        };
      }
      return {
        summary:
          "Sorry, there was a problem explaining this regex. Please try again.",
        breakdown: [],
        error: true,
        suggestion: "",
      };
    }
  }
}
