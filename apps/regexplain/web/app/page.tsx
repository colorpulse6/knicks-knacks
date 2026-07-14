import ExampleGrid from "./components/ExampleGrid";
import JsonLd from "./components/JsonLd";
import LearningSections from "./components/LearningSections";
import RegexWorkbench from "./components/RegexWorkbench";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import { homepageJsonLd } from "./lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={homepageJsonLd()} />
      <SiteHeader />
      <main className="site-main">
        <section className="hero" aria-labelledby="home-title">
          <div className="hero__intro">
            <p className="hero__eyebrow">REGEX TERMINAL / JS RUNTIME</p>
            <h1 id="home-title">Regexplain</h1>
            <p className="hero__lede">
              Decode, test, and understand JavaScript regular expressions
              without leaving the browser.
            </p>
            <div className="hero__facts" aria-label="Tool capabilities">
              <span>LOCAL SYNTAX MAP</span>
              <span>LIVE MATCH TESTER</span>
              <span>OPTIONAL AI SUMMARY</span>
            </div>
          </div>

          <div className="terminal-shell">
            <div className="terminal-shell__bar" aria-hidden="true">
              <div className="terminal-shell__lights">
                <span />
                <span />
                <span />
              </div>
              <span className="terminal-shell__path">~/regexplain/session</span>
              <span className="terminal-shell__mode">INTERACTIVE</span>
            </div>
            <div className="terminal-shell__body">
              <div className="terminal-shell__prompt" aria-hidden="true">
                <span className="terminal-shell__prompt-mark">$</span>
                <span>inspect --flavor=ecmascript</span>
                <span className="terminal-shell__cursor" />
              </div>
              <RegexWorkbench />
            </div>
          </div>
        </section>

        <LearningSections />
        <ExampleGrid />
      </main>
      <SiteFooter />
    </>
  );
}
