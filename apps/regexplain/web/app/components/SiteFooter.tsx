import { siteConfig } from "../lib/site";

function CoffeeCup() {
  return (
    <svg
      aria-hidden="true"
      className="support-link__icon"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M5 5.75h11v7.5A4.75 4.75 0 0 1 11.25 18h-1.5A4.75 4.75 0 0 1 5 13.25v-7.5Z" />
      <path d="M16 8h1.5a2.5 2.5 0 0 1 0 5H16M4 20h14" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer id="support" className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__method">
          <p className="section-kicker">METHOD / PRIVACY</p>
          <p>
            The syntax map and match testing are local and deterministic. An AI
            request sends your pattern and flags to Groq to generate the
            optional summary.
          </p>
        </div>
        <div className="site-footer__links">
          <a href={siteConfig.sourceUrl}>View source</a>
          <a
            className="support-link"
            href={siteConfig.supportUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CoffeeCup />
            <span>Support Regexplain</span>
          </a>
        </div>
      </div>
      <div className="site-footer__signal" aria-hidden="true">
        <span>REGEXPLAIN.CC</span>
        <span>LOCAL-FIRST REGEX TOOLING</span>
        <span>END OF LINE_</span>
      </div>
    </footer>
  );
}
