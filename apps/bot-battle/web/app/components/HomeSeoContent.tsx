import Link from "next/link";

export function HomeIntro() {
  return (
    <section
      aria-labelledby="botbattle-heading"
      className="mb-6 border-b border-rule pb-5"
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-rust">
        LLM comparison workbench
      </p>
      <h1
        id="botbattle-heading"
        className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl"
      >
        Compare AI models side by side
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-soft sm:text-base">
        Run one prompt across selected AI models, compare their responses, and
        inspect latency, token usage, and throughput in a single benchmark.
      </p>
    </section>
  );
}

export function HomeExplainer() {
  return (
    <section
      aria-labelledby="how-botbattle-works"
      className="mt-10 border-t border-rule pt-6"
    >
      <h2
        id="how-botbattle-works"
        className="font-serif text-2xl font-bold tracking-tight text-ink"
      >
        How BotBattle works
      </h2>
      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        <li className="rounded-sm border border-rule bg-paper p-4">
          <h3 className="font-medium text-ink">1. Select and run</h3>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Select AI models and run the same prompt across each one.
          </p>
        </li>
        <li className="rounded-sm border border-rule bg-paper p-4">
          <h3 className="font-medium text-ink">2. Inspect the results</h3>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Inspect side-by-side responses with latency, token usage, and
            throughput measurements.
          </p>
        </li>
        <li className="rounded-sm border border-rule bg-paper p-4">
          <h3 className="font-medium text-ink">3. Analyze the comparison</h3>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            With two or more results, run comparative analysis across the
            responses.
          </p>
        </li>
      </ol>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-soft">
        Some models use shared free-tier access; others require your own
        provider keys. Keys stay browser-side according to your{" "}
        <Link href="/settings" className="font-medium text-rust underline">
          settings mode
        </Link>
        .
      </p>
    </section>
  );
}
