import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SiteFooter from "../../components/SiteFooter";
import { examples, getExample } from "../../data/examples";
import { createPageMetadata } from "../../lib/seo";

interface ExamplePageProps {
  readonly params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return examples.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ExamplePageProps): Promise<Metadata> {
  const { slug } = await params;
  const example = getExample(slug);

  if (!example) {
    notFound();
  }

  return createPageMetadata({
    title: `${example.name} explained | Regexplain`,
    description: example.description,
    path: `/examples/${example.slug}`,
  });
}

export default async function ExamplePage({ params }: ExamplePageProps) {
  const { slug } = await params;
  const example = getExample(slug);

  if (!example) {
    notFound();
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <a className="terminal-brand" href="/" aria-label="Regexplain home">
            <span className="terminal-brand__prompt" aria-hidden="true">
              &gt;_
            </span>
            <span>regexplain</span>
          </a>
          <div className="terminal-status" aria-label="JavaScript engine ready">
            <span className="terminal-status__light" aria-hidden="true" />
            ECMASCRIPT READY
          </div>
          <nav className="site-nav" aria-label="Example navigation">
            <a href="/#examples">All examples</a>
            <a href="/#workbench">Workbench</a>
          </nav>
        </div>
      </header>

      <main className="site-main">
        <article className="example-page document-section">
          <nav className="example-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Regexplain</a>
            <span aria-hidden="true">/</span>
            <a href="/#examples">Examples</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{example.name}</span>
          </nav>

          <header className="example-page__header">
            <p className="section-kicker">WORKED EXAMPLE / ECMASCRIPT</p>
            <h1>{example.name}</h1>
            <p className="example-page__description">{example.description}</p>
          </header>

          <section
            className="example-pattern-panel"
            aria-labelledby="pattern-title"
          >
            <h2 id="pattern-title">Pattern</h2>
            <code className="example-pattern">{example.pattern}</code>
            <dl className="example-runtime">
              <div>
                <dt>Flavor</dt>
                <dd className="example-flavor">JavaScript (ECMAScript)</dd>
              </div>
              <div>
                <dt>Flags</dt>
                <dd className="example-flags">
                  Flags: {example.flags || "none"}
                </dd>
              </div>
            </dl>
          </section>

          <section
            className="example-page__section"
            aria-labelledby="summary-title"
          >
            <h2 id="summary-title">What it does</h2>
            <p>{example.summary}</p>
          </section>

          <section
            className="example-page__section"
            aria-labelledby="tokens-title"
          >
            <h2 id="tokens-title">Token-by-token explanation</h2>
            <ol className="example-token-list">
              {example.tokens.map((token, index) => (
                <li key={`${token.part}-${index}`}>
                  <code>{token.part}</code>
                  <p>{token.explanation}</p>
                </li>
              ))}
            </ol>
          </section>

          <section
            className="example-page__section"
            aria-labelledby="tests-title"
          >
            <h2 id="tests-title">Test strings</h2>
            <div className="example-test-grid">
              <div className="example-matches">
                <h3>Matches</h3>
                <ul>
                  {example.matches.map((value) => (
                    <li key={value}>
                      <code>{value}</code>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="example-non-matches">
                <h3>Does not match</h3>
                <ul>
                  {example.nonMatches.map((value) => (
                    <li key={value}>
                      <code>{value}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <div className="example-guidance-grid">
            <section
              className="example-page__section"
              aria-labelledby="mistakes-title"
            >
              <h2 id="mistakes-title">Common mistakes</h2>
              <ul>
                {example.commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </section>

            <section
              className="example-page__section"
              aria-labelledby="limits-title"
            >
              <h2 id="limits-title">Limitations</h2>
              <ul>
                {example.limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </section>
          </div>

          <section
            className="example-related example-page__section"
            aria-labelledby="related-title"
          >
            <h2 id="related-title">Related examples</h2>
            <ul>
              {example.relatedSlugs.map((relatedSlug) => {
                const related = getExample(relatedSlug);

                return related ? (
                  <li key={related.slug}>
                    <a href={`/examples/${related.slug}`}>{related.name}</a>
                  </li>
                ) : null;
              })}
            </ul>
          </section>

          <div className="example-page__actions">
            <a
              className="terminal-button terminal-button--primary"
              href={`/?example=${example.slug}#workbench`}
            >
              <span aria-hidden="true">$</span>
              Try This Pattern
            </a>
            <a
              className="terminal-button terminal-button--secondary"
              href="/#examples"
            >
              Back to all examples
            </a>
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
