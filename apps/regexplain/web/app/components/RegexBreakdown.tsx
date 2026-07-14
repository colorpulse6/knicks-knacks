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

type AnalysisMode = "semantic" | "sourceFallback";

interface RegexAnalysis {
  tokens: RegexToken[];
  error: string | null;
  mode: AnalysisMode;
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

function sourceTokenize(pattern: string): RegexToken[] {
  const tokens: RegexToken[] = [];

  const pushSourceFragment = (raw: string) => {
    tokens.push({
      raw,
      description: `Source fragment: ${raw}. Detailed local semantics are unavailable.`,
    });
  };

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === "(" && pattern.slice(index, index + 3) === "(?:") {
      pushSourceFragment("(?:");
      index += 2;
      continue;
    }

    if (character === "\\" && index + 1 < pattern.length) {
      const propertyPrefix = pattern.slice(index, index + 3);
      if (propertyPrefix === "\\p{" || propertyPrefix === "\\P{") {
        const propertyEnd = pattern.indexOf("}", index + 3);
        if (propertyEnd !== -1) {
          const property = pattern.slice(index, propertyEnd + 1);
          pushSourceFragment(property);
          index = propertyEnd;
          continue;
        }
      }

      const sequence = pattern.slice(index, index + 2);
      pushSourceFragment(sequence);
      index += 1;
      continue;
    }

    pushSourceFragment(character);
  }

  return tokens;
}

function astTokenize(regex: RegExp): RegexToken[] {
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
  return tokens;
}

function analyzePattern(pattern: string, flags: string): RegexAnalysis {
  if (!pattern) {
    return { tokens: [], error: null, mode: "semantic" };
  }

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (error) {
    return {
      tokens: sourceTokenize(pattern),
      error: error instanceof Error ? error.message : "Invalid regex",
      mode: "sourceFallback",
    };
  }

  try {
    const astTokens = astTokenize(regex);
    const astSource = astTokens.map((token) => token.raw).join("");
    if (astSource === pattern) {
      return { tokens: astTokens, error: null, mode: "semantic" };
    }
  } catch {
    // A runtime-valid pattern can exceed regexp-tree's syntax support.
  }

  return {
    tokens: sourceTokenize(pattern),
    error: null,
    mode: "sourceFallback",
  };
}

export default function RegexBreakdown({
  pattern,
  flags,
}: RegexBreakdownProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const result = React.useMemo(
    () => analyzePattern(pattern, flags),
    [flags, pattern],
  );

  React.useEffect(() => {
    setActiveIndex(null);
  }, [flags, pattern]);

  const selectedToken =
    activeIndex === null ? undefined : result.tokens[activeIndex];
  const descriptionId = "selected-token-description";

  return (
    <section aria-label="Local syntax map" className="result-panel syntax-map">
      <div className="result-panel__heading">
        <span>Local syntax map</span>
        <span className="result-panel__badge">DETERMINISTIC</span>
      </div>
      {result.error && (
        <div className="terminal-notice terminal-notice--error">
          <b>Invalid regex:</b> {result.error}
        </div>
      )}
      {result.mode === "sourceFallback" && !result.error && (
        <div className="terminal-notice" role="note">
          This pattern is valid in JavaScript, but detailed local semantics are
          unavailable. Showing a source-preserving token view.
        </div>
      )}
      <div className="syntax-map__tokens">
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
                className="syntax-token"
                onClick={() => setActiveIndex(index)}
              >
                {token.raw}
              </button>
            );
          })
        ) : (
          <span className="result-panel__empty">
            Enter a pattern to inspect its syntax locally.
          </span>
        )}
      </div>
      <div
        id={descriptionId}
        role="region"
        aria-label="Selected token description"
        className="syntax-map__description"
      >
        {selectedToken
          ? `${selectedToken.raw}: ${selectedToken.description}`
          : "Select a token to read its description."}
      </div>
    </section>
  );
}
