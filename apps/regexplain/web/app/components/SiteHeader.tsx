const navItems = [
  { href: "#examples", label: "Examples" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#support", label: "Support" },
] as const;

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="terminal-brand" aria-label="Regexplain terminal">
          <span className="terminal-brand__prompt" aria-hidden="true">
            &gt;_
          </span>
          <span>regexplain</span>
        </div>
        <div className="terminal-status" aria-label="JavaScript engine ready">
          <span className="terminal-status__light" aria-hidden="true" />
          ECMASCRIPT READY
        </div>
        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
