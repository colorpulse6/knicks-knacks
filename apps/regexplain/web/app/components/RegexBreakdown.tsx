import React from "react";
import { generate, parse } from "regexp-tree";
import type { AstNode } from "regexp-tree/ast";

interface RegexBreakdownProps {
  pattern: string;
  flags: string;
}

interface RegexToken {
  raw: string;
  description: string;
}

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
  "/": "Literal slash",
  ":": "Colon",
};

function tokenize(pattern: string): RegexToken[] {
  const tokens: RegexToken[] = [];

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === "(" && pattern.slice(index, index + 3) === "(?:") {
      tokens.push({
        raw: "(?:",
        description: REGEX_TOKENS["(?:"],
      });
      index += 2;
      continue;
    }

    if (character === "\\" && index + 1 < pattern.length) {
      const sequence = pattern.slice(index, index + 2);
      tokens.push({
        raw: sequence,
        description: REGEX_TOKENS[sequence] ?? `Escaped character: ${sequence}`,
      });
      index += 1;
      continue;
    }

    tokens.push({
      raw: character,
      description: REGEX_TOKENS[character] ?? `Literal: ${character}`,
    });
  }

  return tokens;
}

function astTokenize(pattern: string, flags: string): RegexToken[] {
  const regex = new RegExp(pattern, flags);
  const ast = parse(regex);
  const tokens: RegexToken[] = [];

  function walk(node: AstNode | null): void {
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
        tokens.push({ raw: "|", description: REGEX_TOKENS["|"] });
        walk(node.right);
        break;
      case "Char": {
        const raw = generate(node);
        tokens.push({
          raw,
          description:
            REGEX_TOKENS[raw] ??
            (node.kind === "simple"
              ? `Literal: ${node.value}`
              : `Character escape: ${raw}`),
        });
        break;
      }
      case "CharacterClass":
        tokens.push({
          raw: generate(node),
          description: node.negative
            ? "Negated character class"
            : "Character class",
        });
        break;
      case "ClassRange":
        tokens.push({
          raw: generate(node),
          description: "Character range",
        });
        break;
      case "Group": {
        const opening = node.capturing
          ? node.name
            ? `(?<${node.name}>`
            : "("
          : "(?:";
        tokens.push({
          raw: opening,
          description: node.capturing
            ? "Start of capturing group"
            : REGEX_TOKENS["(?:"],
        });
        walk(node.expression);
        tokens.push({ raw: ")", description: "End of group" });
        break;
      }
      case "Repetition":
        walk(node.expression);
        tokens.push({
          raw: generate(node.quantifier),
          description: `Quantifier: ${node.quantifier.greedy ? "greedy" : "lazy"}`,
        });
        break;
      case "Quantifier":
        tokens.push({ raw: generate(node), description: "Quantifier" });
        break;
      case "Assertion":
        if (node.kind === "Lookahead" || node.kind === "Lookbehind") {
          const opening =
            node.kind === "Lookbehind"
              ? node.negative
                ? "(?<!"
                : "(?<="
              : node.negative
                ? "(?!"
                : "(?=";
          tokens.push({ raw: opening, description: node.kind });
          walk(node.assertion);
          tokens.push({ raw: ")", description: `End of ${node.kind}` });
        } else {
          tokens.push({
            raw: node.kind,
            description: REGEX_TOKENS[node.kind] ?? "Assertion",
          });
        }
        break;
      case "Backreference":
        tokens.push({
          raw: generate(node),
          description: "Backreference",
        });
        break;
    }
  }

  walk(ast);
  return tokens.length > 0 ? tokens : tokenize(pattern);
}

export default function RegexBreakdown({
  pattern,
  flags,
}: RegexBreakdownProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const result = React.useMemo<{
    tokens: RegexToken[];
    error: string | null;
  }>(() => {
    if (!pattern) return { tokens: [], error: null };

    try {
      return { tokens: astTokenize(pattern, flags), error: null };
    } catch (error) {
      return {
        tokens: tokenize(pattern),
        error: error instanceof Error ? error.message : "Invalid regex",
      };
    }
  }, [flags, pattern]);

  React.useEffect(() => {
    setActiveIndex(null);
  }, [flags, pattern]);

  const selectedToken =
    activeIndex === null ? undefined : result.tokens[activeIndex];
  const descriptionId = "selected-token-description";

  return (
    <section
      aria-label="Local syntax map"
      className="mt-2 rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
        Local syntax map
      </div>
      {result.error && (
        <div className="mb-2 rounded border border-red-300 bg-red-100 px-2 py-1 text-xs text-red-600">
          <b>Invalid regex:</b> {result.error}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {result.tokens.length > 0 ? (
          result.tokens.map((token, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={`${index}-${token.raw}`}
                type="button"
                aria-label={`Token ${index + 1}: ${token.raw}`}
                aria-pressed={isActive}
                aria-describedby={isActive ? descriptionId : undefined}
                className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                onClick={() => setActiveIndex(index)}
              >
                {token.raw}
              </button>
            );
          })
        ) : (
          <span className="text-sm text-gray-400">
            Enter a pattern to inspect its syntax locally.
          </span>
        )}
      </div>
      <div
        id={descriptionId}
        role="region"
        aria-label="Selected token description"
        className="mt-3 min-h-6 text-sm text-gray-700 dark:text-gray-300"
      >
        {selectedToken
          ? `${selectedToken.raw}: ${selectedToken.description}`
          : "Select a token to read its description."}
      </div>
    </section>
  );
}
