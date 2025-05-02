import React, { useState, useMemo } from "react";
import { parse } from "regexp-tree";

interface RegexBreakdownProps {
  regex: string;
}

// Expanded mapping for common regex tokens
const REGEX_TOKENS: Record<string, string> = {
  "^": "Start of string",
  $: "End of string",
  ".": "Any character except newline",
  "[": "Start of character class",
  "]": "End of character class",
  "(": "Start of group",
  ")": "End of group",
  "(?:": "Non-capturing group",
  "?": "Zero or one (optional)",
  "+": "One or more",
  "*": "Zero or more",
  "|": "Alternation (or)",
  "\\d": "Digit (0-9)",
  "\\D": "Non-digit",
  "\\w": "Word character (alphanumeric or underscore)",
  "\\W": "Non-word character",
  "\\s": "Whitespace",
  "\\S": "Non-whitespace",
  "\\b": "Word boundary",
  "\\B": "Non-word boundary",
  "\\t": "Tab",
  "\\n": "Newline",
  "\\r": "Carriage return",
  "\\.": "Literal dot",
  "{": "Start of quantifier",
  "}": "End of quantifier",
  "-": "Range or literal hyphen",
  ",": "Quantifier separator",
  "/": "Regex delimiter (in some languages)",
  ":": "Colon",
  // Add more as needed
};

/**
 * Uses regexp-tree to parse the regex and walk the AST for a robust breakdown.
 * Falls back to a basic tokenizer if parsing fails.
 */
const astTokenize = (regex: string) => {
  try {
    const ast = parse(regex);
    const tokens: { raw: string; desc: string }[] = [];

    function walk(node: any) {
      if (!node) return;
      switch (node.type) {
        case "RegExp":
          walk(node.body);
          break;
        case "Alternative":
          node.expressions.forEach(walk);
          break;
        case "Disjunction":
          walk(node.left);
          tokens.push({ raw: "|", desc: REGEX_TOKENS["|"] });
          walk(node.right);
          break;
        case "Character":
          tokens.push({
            raw: node.raw,
            desc:
              REGEX_TOKENS[node.raw] ||
              (node.symbol ? `Literal: ${node.symbol}` : `Char: ${node.raw}`),
          });
          break;
        case "CharacterClass":
          tokens.push({ raw: node.raw, desc: "Character class" });
          node.expressions.forEach(walk);
          break;
        case "Group":
          tokens.push({
            raw: node.raw,
            desc:
              node.capturing === false
                ? REGEX_TOKENS["(?:"] || "Non-capturing group"
                : REGEX_TOKENS["("] || "Capturing group",
          });
          walk(node.expression);
          break;
        case "Quantifier":
          walk(node.expression);
          tokens.push({
            raw: node.raw,
            desc: `Quantifier: ${node.greedy ? "greedy" : "lazy"}`,
          });
          break;
        case "Assertion":
          tokens.push({ raw: node.raw, desc: node.kind || "Assertion" });
          break;
        case "Repetition":
          walk(node.expression);
          tokens.push({ raw: node.raw, desc: "Repetition" });
          break;
        default:
          if (node.raw) {
            tokens.push({ raw: node.raw, desc: node.type });
          }
      }
    }

    walk(ast);
    return tokens;
  } catch (e) {
    // fallback to old tokenizer if regexp-tree can't parse
    return tokenize(regex);
  }
};

/**
 * Legacy fallback tokenizer (see comment above for limitations)
 */
const tokenize = (regex: string) => {
  const tokens: { raw: string; desc: string }[] = [];
  for (let i = 0; i < regex.length; i++) {
    let char = regex[i];
    if (char === "(" && regex.slice(i, i + 3) === "(?:") {
      tokens.push({ raw: "(?:", desc: REGEX_TOKENS["(?:"] });
      i += 2;
      continue;
    }
    if (char === "\\" && i + 1 < regex.length) {
      const seq = regex.slice(i, i + 2);
      tokens.push({
        raw: seq,
        desc: REGEX_TOKENS[seq] || "Escaped char: " + seq,
      });
      i++;
    } else {
      tokens.push({
        raw: char,
        desc: REGEX_TOKENS[char] || "Literal: " + char,
      });
    }
  }
  return tokens;
};

const RegexBreakdown: React.FC<RegexBreakdownProps> = ({ regex }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const tokens = useMemo(() => {
    if (!regex) return [];
    try {
      setParseError(null); // Only clear error if successful
      return astTokenize(regex);
    } catch (e: any) {
      setParseError(e.message || "Invalid regex");
      return [];
    }
  }, [regex]);

  if (!regex) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded p-4 border border-gray-200 dark:border-gray-700 mt-2">
      <div className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Regex Breakdown:
      </div>
      {parseError && (
        <div className="text-red-600 bg-red-100 border border-red-300 rounded px-2 py-1 text-xs mb-2">
          <b>Invalid regex:</b> {parseError}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {tokens.map((t, idx) => (
          <span
            key={idx}
            className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-sm cursor-help relative"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => setHoveredIdx(idx)}
          >
            {t.raw}
            {hoveredIdx === idx && (
              <span className="absolute left-1/2 top-full z-10 mt-2 min-w-max -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg border border-gray-700 whitespace-pre-line">
                {t.desc}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RegexBreakdown;
