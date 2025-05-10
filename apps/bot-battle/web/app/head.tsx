import React from "react";

// This file customizes the <head> for your Next.js app directory
export default function Head() {
  return (
    <>
      <title>BotBattle – LLM Benchmarking</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="BotBattle: Benchmark and compare LLMs with advanced metrics and side-by-side evaluation." />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" type="image/png" href="/botbattle-icon.png" />
      {/* Add more icons for PWA/Apple/Android support if needed */}
    </>
  );
}
