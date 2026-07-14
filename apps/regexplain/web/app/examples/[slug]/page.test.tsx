import { within } from "@testing-library/dom";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { examples, getExample } from "../../data/examples";
import { siteConfig } from "../../lib/site";
import ExamplePage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from "./page";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    const error = new Error("NEXT_HTTP_ERROR_FALLBACK;404");
    Object.assign(error, { digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
    throw error;
  }),
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

function resolveMetadataUrl(value: unknown) {
  expect(value).toBeTruthy();

  if (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof URL) &&
    "url" in value
  ) {
    value = value.url;
  }

  expect(typeof value === "string" || value instanceof URL).toBe(true);
  return new URL(String(value), siteConfig.url).toString();
}

async function renderExample(slug: string) {
  const element = await ExamplePage({ params: Promise.resolve({ slug }) });
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(element);
  return container;
}

describe("worked example route generation", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
  });

  it("pre-renders exactly the five checked-in example slugs", () => {
    const params = generateStaticParams();
    const approvedSlugs = examples.map(({ slug }) => slug);
    const generatedSlugs = params.map(({ slug }) => slug);

    expect(dynamicParams).toBe(false);
    expect(generatedSlugs).toEqual(approvedSlugs);
    expect(new Set(generatedSlugs).size).toBe(5);
  });

  it("generates unique, example-specific canonical and social metadata", async () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const example of examples) {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: example.slug }),
      });
      const title = String(metadata.title);
      const description = metadata.description;
      const openGraph = metadata.openGraph;
      const twitter = metadata.twitter;
      const canonical = metadata.alternates?.canonical;

      expect(title).toContain(example.name);
      expect(description).toBe(example.description);
      expect(resolveMetadataUrl(canonical)).toBe(
        `${siteConfig.url}/examples/${example.slug}`,
      );
      expect(openGraph).toMatchObject({
        type: "website",
        title,
        description: example.description,
        images: [
          expect.objectContaining({
            url: "/opengraph-image",
            width: 1200,
            height: 630,
          }),
        ],
      });
      expect(resolveMetadataUrl(openGraph?.url)).toBe(
        `${siteConfig.url}/examples/${example.slug}`,
      );
      expect(twitter).toMatchObject({
        card: "summary_large_image",
        title,
        description: example.description,
        images: ["/opengraph-image"],
      });

      titles.add(title);
      descriptions.add(description ?? "");
    }

    expect(titles.size).toBe(5);
    expect(descriptions.size).toBe(5);
  });

  it("renders the complete email example as a substantive article", async () => {
    const example = getExample("email-regex");
    expect(example).toBeDefined();

    const container = await renderExample("email-regex");
    const page = within(container);

    expect(page.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(page.getByRole("heading", { level: 1 })).toHaveTextContent(
      example!.name,
    );
    expect(container.querySelector("article")).not.toBeNull();
    expect(container.querySelector("code.example-pattern")).toHaveTextContent(
      example!.pattern,
    );
    expect(container.querySelector(".example-flavor")).toHaveTextContent(
      "JavaScript (ECMAScript)",
    );
    expect(container.querySelector(".example-flags")).toHaveTextContent(
      "Flags: none",
    );
    expect(container).toHaveTextContent(example!.description);
    expect(container).toHaveTextContent(example!.summary);

    const tokenRows = container.querySelectorAll(".example-token-list li");
    expect(tokenRows).toHaveLength(example!.tokens.length);
    example!.tokens.forEach((token, index) => {
      expect(tokenRows[index]).toHaveTextContent(token.part);
      expect(tokenRows[index]).toHaveTextContent(token.explanation);
    });

    const matches = container.querySelector(".example-matches");
    const nonMatches = container.querySelector(".example-non-matches");
    expect(matches).not.toBeNull();
    expect(nonMatches).not.toBeNull();
    example!.matches.slice(0, 2).forEach((value) => {
      expect(matches).toHaveTextContent(value);
    });
    example!.nonMatches.slice(0, 2).forEach((value) => {
      expect(nonMatches).toHaveTextContent(value);
    });

    expect(
      page.getByRole("heading", { name: "Common mistakes" }),
    ).toHaveTextContent("Common mistakes");
    expect(
      page.getByRole("heading", { name: "Limitations" }),
    ).toHaveTextContent("Limitations");
    example!.commonMistakes.forEach((mistake) => {
      expect(container).toHaveTextContent(mistake);
    });
    example!.limitations.forEach((limitation) => {
      expect(container).toHaveTextContent(limitation);
    });

    const relatedLinks = Array.from(
      container.querySelectorAll<HTMLAnchorElement>(
        '.example-related a[href^="/examples/"]',
      ),
    );
    expect(relatedLinks.map((link) => link.getAttribute("href"))).toEqual(
      example!.relatedSlugs.map((slug) => `/examples/${slug}`),
    );
    expect(relatedLinks.every((link) => link.tagName === "A")).toBe(true);
    expect(
      page.getByRole("link", { name: "Try This Pattern" }),
    ).toHaveAttribute("href", "/?example=email-regex#workbench");
  });

  it("renders every checked-in example from the shared source", async () => {
    for (const example of examples) {
      const container = await renderExample(example.slug);
      const page = within(container);

      expect(page.getByRole("heading", { level: 1 })).toHaveTextContent(
        example.name,
      );
      expect(container.querySelector("code.example-pattern")).toHaveTextContent(
        example.pattern,
      );
      expect(container.querySelectorAll(".example-token-list li")).toHaveLength(
        example.tokens.length,
      );
      expect(container.querySelector(".example-matches")).toHaveTextContent(
        example.matches[0],
      );
      expect(container.querySelector(".example-non-matches")).toHaveTextContent(
        example.nonMatches[0],
      );
      expect(
        page.getByRole("link", { name: "Try This Pattern" }),
      ).toHaveAttribute("href", `/?example=${example.slug}#workbench`);
    }
  });

  it("delegates unknown slugs to Next's not-found boundary", async () => {
    const error = await ExamplePage({
      params: Promise.resolve({ slug: "not-checked-in" }),
    }).catch((caught: unknown) => caught);

    expect(notFoundMock).toHaveBeenCalledOnce();
    expect(error).toMatchObject({
      message: "NEXT_HTTP_ERROR_FALLBACK;404",
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    });
  });

  it("does not fabricate structured data for example-page rich results", async () => {
    const container = await renderExample("email-regex");

    expect(
      container.querySelector('script[type="application/ld+json"]'),
    ).toBeNull();
  });
});
