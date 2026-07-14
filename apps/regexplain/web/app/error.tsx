"use client";

import React from "react";
import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="error-screen">
      <section className="error-terminal" aria-labelledby="error-title">
        <p className="section-kicker">SYSTEM / ERROR</p>
        <h1 id="error-title">Terminal interrupted</h1>
        <p>
          The current session could not finish. Retry the operation or return to
          a clean Regexplain session.
        </p>
        <div className="error-terminal__code" aria-hidden="true">
          process exited with a recoverable error
        </div>
        <div className="error-terminal__actions">
          <button
            onClick={reset}
            className="terminal-button terminal-button--primary"
          >
            Try again
          </button>
          <Link href="/" className="terminal-button terminal-button--secondary">
            Go back home
          </Link>
        </div>
      </section>
    </main>
  );
}
