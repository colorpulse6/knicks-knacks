import RegexWorkbench from "./components/RegexWorkbench";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900 transition-colors">
      <h1 className="text-4xl font-bold mb-2 text-center">Regexplain</h1>
      <p className="text-lg text-gray-500 mb-8 text-center max-w-xl">
        Enter a regex pattern to get an explanation and a character-by-character
        breakdown.
      </p>
      <div className="w-full max-w-xl flex flex-col gap-6">
        <RegexWorkbench />
      </div>
    </main>
  );
}
