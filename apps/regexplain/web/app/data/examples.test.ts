import { describe, expect, it } from "vitest";

import { examples, getExample } from "./examples";

const APPROVED_SLUGS = [
  "email-regex",
  "password-regex",
  "phone-number-regex",
  "url-regex",
  "hex-color-regex",
] as const;

const EXPECTED_TOKEN_PARTS = {
  "email-regex": ["^", "[^\\s@]+", "@", "[^\\s@]+", "\\.", "[^\\s@]+", "$"],
  "password-regex": [
    "^",
    "(?=.*[a-z])",
    "(?=.*[A-Z])",
    "(?=.*\\d)",
    "[A-Za-z\\d@$!%*?&]",
    "{12,64}",
    "$",
  ],
  "phone-number-regex": [
    "^",
    "(?:\\+1[ .-]?)?",
    "(?:\\(([2-9]\\d{2})\\)|([2-9]\\d{2}))",
    "[ .-]?",
    "([2-9]\\d{2})",
    "[ .-]?",
    "(\\d{4})",
    "$",
  ],
  "url-regex": [
    "^",
    "https?",
    ":\\/\\/",
    "(?:www\\.)?",
    "[a-z0-9]",
    "(?:[a-z0-9-]*[a-z0-9])?",
    "(?:\\.[a-z]{2,})+",
    "(?:[/?#][^\\s]*)?",
    "$",
  ],
  "hex-color-regex": [
    "^",
    "#?",
    "(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})",
    "$",
  ],
} as const;

describe("examples", () => {
  it("contains exactly the five approved, unique slugs", () => {
    const slugs = examples.map((example) => example.slug);

    expect(slugs).toEqual(APPROVED_SLUGS);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only references examples that exist", () => {
    const slugs = new Set(examples.map((example) => example.slug));

    for (const example of examples) {
      for (const relatedSlug of example.relatedSlugs) {
        expect(
          slugs.has(relatedSlug),
          `${example.slug} -> ${relatedSlug}`,
        ).toBe(true);
      }
    }
  });

  it("provides substantive, nonempty content for every example", () => {
    for (const example of examples) {
      expect(example.name.trim(), `${example.slug} name`).not.toBe("");
      expect(example.pattern.trim(), `${example.slug} pattern`).not.toBe("");
      expect(
        example.description.trim(),
        `${example.slug} description`,
      ).not.toBe("");
      expect(example.summary.trim(), `${example.slug} summary`).not.toBe("");
      expect(
        example.matches.length,
        `${example.slug} matches`,
      ).toBeGreaterThanOrEqual(2);
      expect(
        example.nonMatches.length,
        `${example.slug} nonMatches`,
      ).toBeGreaterThanOrEqual(2);
      expect(
        example.limitations.length,
        `${example.slug} limitations`,
      ).toBeGreaterThanOrEqual(1);
      expect(
        example.commonMistakes.length,
        `${example.slug} commonMistakes`,
      ).toBeGreaterThanOrEqual(1);

      for (const token of example.tokens) {
        expect(token.part.trim(), `${example.slug} token part`).not.toBe("");
        expect(
          token.explanation.trim(),
          `${example.slug} token explanation for ${token.part}`,
        ).not.toBe("");
      }

      for (const text of [
        ...example.matches,
        ...example.nonMatches,
        ...example.limitations,
        ...example.commonMistakes,
      ]) {
        expect(text.trim(), `${example.slug} content`).not.toBe("");
      }
    }
  });

  it("explains every checked-in meaningful token group", () => {
    for (const example of examples) {
      expect(example.tokens.map((token) => token.part)).toEqual(
        EXPECTED_TOKEN_PARTS[example.slug],
      );
    }
  });

  it("keeps the checked-in match examples truthful", () => {
    for (const example of examples) {
      const regex = new RegExp(example.pattern, example.flags);

      for (const value of example.matches) {
        expect(regex.test(value), `${example.slug} should match ${value}`).toBe(
          true,
        );
      }

      for (const value of example.nonMatches) {
        expect(
          regex.test(value),
          `${example.slug} should reject ${value}`,
        ).toBe(false);
      }
    }
  });

  it("states the boundary of password regex validation", () => {
    const password = getExample("password-regex");

    expect(password?.limitations.join(" ").toLowerCase()).toContain(
      "format, not actual strength or breach history",
    );
  });

  it("looks up known slugs and returns undefined for unknown slugs", () => {
    expect(getExample("email-regex")).toBe(examples[0]);
    expect(getExample("not-an-example")).toBeUndefined();
  });

  it("exports an immutable collection", () => {
    expect(Object.isFrozen(examples)).toBe(true);
    expect(examples.every((example) => Object.isFrozen(example))).toBe(true);
  });
});
