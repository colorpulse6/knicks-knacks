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
  const prompt = `You are a regex expert. Given the following regular expression, return a JSON object with two fields: "summary" (a one-sentence summary), and "breakdown" (an array of objects, each with "part" and "explanation" fields).\n\nIf the input is not a valid regular expression, reply with this exact JSON: {"summary":"This does not appear to be a regular expression.","breakdown":[],"notRegex":true}\n\nExample:\n{\n  "summary": "This regex matches a 10-digit phone number.",\n  "breakdown": [\n    { "part": "^", "explanation": "Start of string" },\n    { "part": "\\d{3}", "explanation": "Exactly 3 digits" }\n  ]\n}\nRegex: ${regex}`;

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
    throw new Error("No JSON object found in model response: " + content);
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
    throw new Error("Failed to parse JSON from model: " + content);
  }
}
