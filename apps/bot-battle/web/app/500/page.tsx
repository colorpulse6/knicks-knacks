import Link from "next/link";

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-6xl font-bold mb-4">500</h1>
      <h2 className="text-4xl font-bold mb-4">Server Error</h2>
      <p className="text-xl mb-8">
        Something went wrong on our end. Please try again later.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
