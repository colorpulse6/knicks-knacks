export type RegexExampleSlug =
  | "email-regex"
  | "password-regex"
  | "phone-number-regex"
  | "url-regex"
  | "hex-color-regex";

export interface RegexToken {
  readonly part: string;
  readonly explanation: string;
}

export interface RegexExample {
  readonly slug: RegexExampleSlug;
  readonly name: string;
  readonly pattern: string;
  readonly flags: string;
  readonly description: string;
  readonly summary: string;
  readonly tokens: readonly RegexToken[];
  readonly matches: readonly string[];
  readonly nonMatches: readonly string[];
  readonly limitations: readonly string[];
  readonly commonMistakes: readonly string[];
  readonly relatedSlugs: readonly RegexExampleSlug[];
}

const exampleDefinitions = [
  {
    slug: "email-regex",
    name: "Practical email address regex",
    pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    flags: "",
    description:
      "A deliberately practical email check for forms that require one @ sign, a dotted domain, and no whitespace.",
    summary:
      "This pattern catches common typing mistakes without pretending to implement the full email-address specification. It is a useful first-pass format check before confirmation email or server-side validation.",
    tokens: [
      {
        part: "^",
        explanation: "Starts matching at the beginning of the input.",
      },
      {
        part: "[^\\s@]+",
        explanation:
          "Consumes one or more local-part characters that are neither whitespace nor @.",
      },
      { part: "@", explanation: "Requires the address separator." },
      {
        part: "[^\\s@]+",
        explanation:
          "Consumes one or more domain characters before the final dot, excluding whitespace and @.",
      },
      { part: "\\.", explanation: "Requires a literal dot in the domain." },
      {
        part: "[^\\s@]+",
        explanation:
          "Consumes the final domain segment, such as com or museum, without whitespace or @.",
      },
      { part: "$", explanation: "Stops matching at the end of the input." },
    ],
    matches: ["reader@example.com", "first.last+notes@sub.domain.co"],
    nonMatches: ["reader@@example.com", "reader@example"],
    limitations: [
      "It does not implement every quoted local part, domain literal, or other edge case allowed by the email RFCs, and it cannot prove that a mailbox exists.",
    ],
    commonMistakes: [
      "Using an enormous RFC-style regex as the only validation step instead of sending a confirmation email.",
      "Forgetting to anchor the pattern, which can accept an email-looking substring inside invalid text.",
    ],
    relatedSlugs: ["url-regex", "password-regex"],
  },
  {
    slug: "password-regex",
    name: "Password format regex",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{12,64}$",
    flags: "",
    description:
      "A password format check requiring lowercase, uppercase, and a digit across 12 to 64 allowed characters.",
    summary:
      "The lookaheads enforce three character categories while the final character class controls the accepted alphabet and total length. Treat it as an input-policy example, not a security score.",
    tokens: [
      {
        part: "^",
        explanation: "Starts the check at the beginning of the password.",
      },
      {
        part: "(?=.*[a-z])",
        explanation:
          "Looks ahead from the start and requires at least one lowercase ASCII letter.",
      },
      {
        part: "(?=.*[A-Z])",
        explanation:
          "Looks ahead from the start and requires at least one uppercase ASCII letter.",
      },
      {
        part: "(?=.*\\d)",
        explanation:
          "Looks ahead from the start and requires at least one digit.",
      },
      {
        part: "[A-Za-z\\d@$!%*?&]",
        explanation:
          "Allows ASCII letters, digits, and the listed policy-approved symbols only.",
      },
      {
        part: "{12,64}",
        explanation: "Requires between 12 and 64 allowed characters in total.",
      },
      { part: "$", explanation: "Ends the check at the end of the password." },
    ],
    matches: ["CorrectHorse9", "Str0ng!Passw0rd"],
    nonMatches: ["shortA1!", "correcthorsebattery9"],
    limitations: [
      "This regex checks format, not actual strength or breach history; use length-friendly policy, breached-password screening, rate limiting, and secure hashing as separate controls.",
      "Its explicit ASCII character class rejects spaces, accented letters, emoji, and unlisted symbols even when a product might reasonably allow them.",
    ],
    commonMistakes: [
      "Calling a composition-rule match a strong password instead of measuring resistance to guessing and known-password reuse.",
      "Silently truncating passwords at the maximum length rather than rejecting or documenting the limit.",
    ],
    relatedSlugs: ["email-regex"],
  },
  {
    slug: "phone-number-regex",
    name: "US phone number regex",
    pattern:
      "^(?:\\+1[ .-]?)?(?:\\(([2-9]\\d{2})\\)|([2-9]\\d{2}))[ .-]?([2-9]\\d{2})[ .-]?(\\d{4})$",
    flags: "",
    description:
      "A North American-style phone check with an optional +1 country code, paired area-code parentheses, and common separators.",
    summary:
      "This pattern recognizes ten-digit US-style numbers while requiring area and exchange codes to begin with 2–9. Parentheses are accepted only as a balanced pair around the area code.",
    tokens: [
      {
        part: "^",
        explanation: "Starts matching at the beginning of the input.",
      },
      {
        part: "(?:\\+1[ .-]?)?",
        explanation:
          "Optionally accepts the literal +1 country code followed by one optional space, dot, or hyphen.",
      },
      {
        part: "(?:\\(([2-9]\\d{2})\\)|([2-9]\\d{2}))",
        explanation:
          "Accepts a three-digit area code either inside balanced parentheses or without parentheses; its first digit must be 2–9.",
      },
      {
        part: "[ .-]?",
        explanation: "Allows one optional separator after the area code.",
      },
      {
        part: "([2-9]\\d{2})",
        explanation:
          "Captures the three-digit exchange code and prevents it from beginning with 0 or 1.",
      },
      {
        part: "[ .-]?",
        explanation:
          "Allows one optional separator before the subscriber number.",
      },
      {
        part: "(\\d{4})",
        explanation: "Captures the final four-digit subscriber number.",
      },
      { part: "$", explanation: "Stops matching at the end of the input." },
    ],
    matches: ["+1 (212) 555-0198", "415.867.5309"],
    nonMatches: ["+44 20 7946 0958", "(112) 555-0198"],
    limitations: [
      "It models a US/NANP-style shape only; it does not support international numbering plans, extensions, short codes, or prove that an assigned number is reachable.",
    ],
    commonMistakes: [
      "Making opening and closing parentheses independently optional, which accepts unbalanced phone numbers.",
      "Stripping a leading country code without first knowing which numbering plan the user selected.",
    ],
    relatedSlugs: ["email-regex", "url-regex"],
  },
  {
    slug: "url-regex",
    name: "HTTP and HTTPS URL regex",
    pattern:
      "^https?:\\/\\/(?:www\\.)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.[a-z]{2,})+(?:[/?#][^\\s]*)?$",
    flags: "i",
    description:
      "A conservative web URL check for HTTP(S), dotted hostnames, and an optional path, query, or fragment.",
    summary:
      "This pattern is useful when a product deliberately accepts only ordinary public-looking HTTP and HTTPS URLs. It keeps the scheme explicit and prevents hostname labels from starting or ending with a hyphen.",
    tokens: [
      {
        part: "^",
        explanation: "Starts matching at the beginning of the URL.",
      },
      {
        part: "https?",
        explanation: "Requires http and permits one optional s for HTTPS.",
      },
      {
        part: ":\\/\\/",
        explanation: "Requires the literal :// scheme separator.",
      },
      {
        part: "(?:www\\.)?",
        explanation: "Optionally accepts a leading www. hostname label.",
      },
      {
        part: "[a-z0-9]",
        explanation: "Starts the first hostname label with a letter or digit.",
      },
      {
        part: "(?:[a-z0-9-]*[a-z0-9])?",
        explanation:
          "Completes the first hostname label while ensuring a hyphen is not its final character.",
      },
      {
        part: "(?:\\.[a-z]{2,})+",
        explanation:
          "Requires one or more dotted alphabetic domain segments of at least two characters.",
      },
      {
        part: "(?:[/?#][^\\s]*)?",
        explanation:
          "Optionally accepts a path, query, or fragment beginning with /, ?, or # and containing no whitespace.",
      },
      { part: "$", explanation: "Stops matching at the end of the URL." },
    ],
    matches: [
      "https://example.com",
      "http://www.docs.example.co.uk/path?q=regex#tokens",
    ],
    nonMatches: ["ftp://example.com", "https://-example.com"],
    limitations: [
      "It intentionally excludes valid URLs such as localhost, IP-address hosts, ports, Unicode domains, and many percent-encoded or uncommon hostname forms; URL parsing and allow-listing are safer for security decisions.",
    ],
    commonMistakes: [
      "Using a URL regex to prevent server-side request forgery instead of resolving and enforcing an explicit network allow-list.",
      "Making the scheme optional when the application requires an absolute navigable URL.",
    ],
    relatedSlugs: ["email-regex", "phone-number-regex"],
  },
  {
    slug: "hex-color-regex",
    name: "CSS hex color regex",
    pattern: "^#?(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$",
    flags: "i",
    description:
      "A CSS-oriented hex color check accepting 3-, 6-, or 8-digit notation with an optional leading #.",
    summary:
      "The alternatives cover shorthand RGB, full RGB, and full RGBA values. Case-insensitive matching permits the A–F digits in either case while anchors reject extra text.",
    tokens: [
      {
        part: "^",
        explanation: "Starts matching at the beginning of the color value.",
      },
      {
        part: "#?",
        explanation: "Allows one optional leading hash character.",
      },
      {
        part: "(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})",
        explanation:
          "Requires exactly 3 RGB shorthand digits, 6 full RGB digits, or 8 full RGBA digits.",
      },
      {
        part: "$",
        explanation: "Stops matching at the end of the color value.",
      },
    ],
    matches: ["#0f8", "336699", "#112233cc"],
    nonMatches: ["#12", "#xyz"],
    limitations: [
      "This covers selected hexadecimal CSS forms only; it does not accept 4-digit #RGBA shorthand or other valid CSS color syntaxes such as rgb(), hsl(), named colors, or color().",
    ],
    commonMistakes: [
      "Allowing any three, six, or eight characters instead of limiting each digit to 0–9 and A–F.",
      "Assuming an eight-digit hex color uses ARGB order when CSS defines it as RRGGBBAA.",
    ],
    relatedSlugs: ["url-regex"],
  },
] satisfies readonly RegexExample[];

function freezeExample(example: RegexExample): RegexExample {
  return Object.freeze({
    ...example,
    tokens: Object.freeze(
      example.tokens.map((token) => Object.freeze({ ...token })),
    ),
    matches: Object.freeze([...example.matches]),
    nonMatches: Object.freeze([...example.nonMatches]),
    limitations: Object.freeze([...example.limitations]),
    commonMistakes: Object.freeze([...example.commonMistakes]),
    relatedSlugs: Object.freeze([...example.relatedSlugs]),
  });
}

export const examples: readonly RegexExample[] = Object.freeze(
  exampleDefinitions.map(freezeExample),
);

const examplesBySlug = new Map(
  examples.map((example) => [example.slug, example] as const),
);

export function getExample(slug: string): RegexExample | undefined {
  return examplesBySlug.get(slug as RegexExampleSlug);
}
