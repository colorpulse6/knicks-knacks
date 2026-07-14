import { Coffee } from "lucide-react";
import { SITE } from "../config/site";

export function SupportLink() {
  return (
    <a
      href={SITE.supportUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Support BotBattle - buy me a coffee"
      title="Buy me a coffee"
      className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-sm border border-rule bg-[#ffdd00] text-[#2b241c] transition-colors hover:bg-[#f5d400] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper-sunk"
    >
      <Coffee aria-hidden="true" size={18} strokeWidth={1.8} />
    </a>
  );
}
