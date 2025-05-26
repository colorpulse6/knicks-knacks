import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 - Page Not Found | BotBattle</title>
        <meta name="description" content="Page not found" />
        <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f9fafb;
            min-height: 100vh;
          }
          .header {
            width: 100%;
            padding: 1.5rem 0;
            background-color: #111827;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }
          .content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            text-align: center;
          }
          .title {
            font-size: 6rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 1rem;
          }
          .subtitle {
            font-size: 2rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 1rem;
          }
          .description {
            font-size: 1.125rem;
            color: #6b7280;
            margin-bottom: 2rem;
            max-width: 28rem;
          }
          .button {
            padding: 0.75rem 1.5rem;
            background-color: #2563eb;
            color: white;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
        `}</style>
      </head>
      <body>
        <header className="header">
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              letterSpacing: "-0.025em",
            }}
          >
            BotBattle – LLM Benchmarking
          </h1>
        </header>
        <main className="container">
          <div className="content">
            <h2 className="title">404</h2>
            <h3 className="subtitle">Page Not Found</h3>
            <p className="description">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link href="/" className="button">
              Go Back Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
