import { examples } from "../data/examples";

export default function ExampleGrid() {
  return (
    <section
      id="examples"
      className="document-section example-section"
      aria-labelledby="examples-title"
    >
      <div className="section-heading section-heading--split">
        <div>
          <p className="section-kicker">LIBRARY / 05 PATTERNS</p>
          <h2 id="examples-title">Start with a checked-in example</h2>
        </div>
        <p>
          Practical patterns with explicit tradeoffs, test strings, and common
          mistakes.
        </p>
      </div>
      <div className="example-grid">
        {examples.map((example, index) => (
          <article key={example.slug} className="example-card">
            <a href={`/examples/${example.slug}`}>
              <span className="example-card__index" aria-hidden="true">
                EX_{String(index + 1).padStart(2, "0")}
              </span>
              <h3>{example.name}</h3>
              <p>{example.description}</p>
              <code>
                {example.pattern}
                {example.flags ? `  [flags: ${example.flags}]` : ""}
              </code>
              <span className="example-card__action">Open breakdown →</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
