const MODEL = "llama3-70b-8192";

function looksLikeRegex(input: string): boolean {
  // Heuristic: contains at least one common regex special character
  // (not perfect, but good for basic user warning)
  return /[.*+?^${}()|[\]\\]/.test(input);
}

export async function explainRegexWithGroq({
  regex,
  apiKey,
}: {
  regex: string;
  apiKey: string;
}): Promise<any> {
  if (!looksLikeRegex(regex)) {
    // Instead of calling the API, return a consistent response
    return {
      summary: "This does not appear to be a regular expression.",
      breakdown: [],
      notRegex: true,
    };
  }
  const prompt = `You are a regex expert. Given the following regular expression, return ONLY a JSON object with three fields: 
- "summary" (a one-sentence summary),
- "breakdown" (an array of objects, each with "part" and "explanation" fields),
- and, if the regex is invalid, a "suggestion" field with a helpful fix or advice for correcting the pattern.

DO NOT include any commentary, explanation, or extra text outside the JSON.
DO NOT wrap the JSON in code blocks or markdown.
If the input is not a valid regular expression, reply with this exact JSON: {"summary":"This does not appear to be a regular expression.","breakdown":[],"notRegex":true, "suggestion":""}

Example:
{
  "summary": "This regex matches a 10-digit phone number.",
  "breakdown": [
    { "part": "^", "explanation": "Start of string" },
    { "part": "\\d{3}", "explanation": "Exactly 3 digits" }
  ]
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
      stream: false, // Disable streaming for JSON output
      max_tokens: 512,
      temperature: 0.3,
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
  // Extract the first JSON object from the response
  const match = content && content.match(/\{[\s\S]*\}/);
  if (!match) {
    // Instead of throwing, return a user-friendly fallback
    return {
      summary: "Sorry, there was a problem explaining this regex. Please try again.",
      breakdown: [],
      error: true,
    };
  }
  try {
    return JSON.parse(match[0]);
  } catch (e) {
    // Try to recover: if model output contains the fallback JSON, extract it
    if (match[0].includes("notRegex")) {
      return {
        summary: "This does not appear to be a regular expression.",
        breakdown: [],
        notRegex: true,
      };
    }
    // Instead of throwing, return a user-friendly fallback
    return {
      summary: "Sorry, there was a problem explaining this regex. Please try again.",
      breakdown: [],
      error: true,
    };
  }
}
