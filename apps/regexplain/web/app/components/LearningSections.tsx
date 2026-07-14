const steps = [
  {
    number: "01",
    title: "Enter the source",
    copy: "Paste the pattern without surrounding slash delimiters, then add flags in their own field.",
  },
  {
    number: "02",
    title: "Inspect it locally",
    copy: "Read the syntax map, select individual tokens, and test sample text directly in your browser.",
  },
  {
    number: "03",
    title: "Ask for context",
    copy: "Request an optional plain-language AI summary when the deterministic tools are not enough.",
  },
] as const;

const faqs = [
  {
    question: "What regex flavor does Regexplain use?",
    answer:
      "Regexplain uses the JavaScript / ECMAScript RegExp flavor. Syntax support follows the browser runtime that opens the page, so newer features depend on that browser.",
  },
  {
    question: "Should I include slash delimiters?",
    answer:
      "No. Enter the pattern without surrounding slash delimiters. Put flags such as g, i, m, s, u, v, or y in the separate flags field; any slash typed in the pattern remains literal content.",
  },
  {
    question: "Is my regex processed privately?",
    answer:
      "The syntax map and sample testing run locally in your browser. If you request an AI summary, Regexplain sends your pattern and flags to its server and then to Groq for that response.",
  },
  {
    question: "What can regex validation tell me?",
    answer:
      "It can tell you whether the pattern and flags form valid JavaScript syntax and whether sample text matches. Regex validates format, not meaning or strength, so it cannot prove that an email exists, a password is strong, or a URL is safe.",
  },
] as const;

export default function LearningSections() {
  return (
    <>
      <section
        id="how-it-works"
        className="document-section document-section--steps"
        aria-labelledby="how-it-works-title"
      >
        <div className="section-heading">
          <p className="section-kicker">PROCESS / 03 STEPS</p>
          <h2 id="how-it-works-title">How It Works</h2>
          <p>
            Start with deterministic browser tools. Add an AI explanation only
            when you want another layer of context.
          </p>
        </div>
        <ol className="process-grid">
          {steps.map((step) => (
            <li key={step.number} className="process-card">
              <span className="process-card__number" aria-hidden="true">
                {step.number}
              </span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="document-section flavor-section"
        aria-labelledby="flavor-title"
      >
        <div>
          <p className="section-kicker">RUNTIME / JAVASCRIPT</p>
          <h2 id="flavor-title">JavaScript regex, clearly scoped.</h2>
        </div>
        <div className="flavor-section__copy">
          <p>
            Regexplain targets the JavaScript / ECMAScript regular-expression
            flavor and compiles patterns with the browser runtime. That makes
            the local tester useful for the environment where your front-end
            code will actually run.
          </p>
          <p>
            A successful match is evidence about text shape, not truth. Regex
            validates format, not meaning or strength; business rules,
            deliverability, security, and real-world existence need separate
            checks.
          </p>
        </div>
      </section>

      <section
        id="faq"
        className="document-section faq-section"
        aria-labelledby="faq-title"
      >
        <div className="section-heading">
          <p className="section-kicker">MANUAL / FAQ</p>
          <h2 id="faq-title">Before you run the pattern</h2>
        </div>
        <dl className="faq-list">
          {faqs.map((faq) => (
            <div key={faq.question} className="faq-item">
              <dt>{faq.question}</dt>
              <dd>{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
