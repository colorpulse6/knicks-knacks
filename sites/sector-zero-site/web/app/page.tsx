import { getAllPosts } from "@/lib/posts";
import { GAME_MODES } from "@/data/modes";
import HudSection from "@/components/HudSection";
import ModeCard from "@/components/ModeCard";
import NewsItem from "@/components/NewsItem";
import CtaButton from "@/components/CtaButton";

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-gradient-to-b from-purple-accent/10 to-transparent">
        <p className="hud-label mb-4">
          UEC VANGUARD // MISSION BRIEFING
        </p>
        <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-[0.3em] text-cyan-accent mb-3">
          SECTOR ZERO
        </h1>
        <p className="font-mono text-sm text-text-muted mb-8 tracking-wider">
          8 Sectors. 6 Modes. One Hivemind.
        </p>
        <CtaButton
          href="https://colorpulse6.github.io/knicks-knacks/sector-zero/"
          external
        >
          PLAY NOW
        </CtaButton>
      </section>

      {/* Mode Cards */}
      <HudSection label="GAMEPLAY MODES">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
          {GAME_MODES.map((mode) => (
            <ModeCard key={mode.id} mode={mode} />
          ))}
        </div>
      </HudSection>

      {/* Latest Transmissions */}
      <HudSection label="LATEST TRANSMISSIONS" className="border-t border-border-hud">
        <div className="space-y-6 max-w-3xl mb-8">
          {recentPosts.map((post) => (
            <NewsItem key={post.slug} post={post} />
          ))}
        </div>
        <CtaButton href="/news">VIEW ALL UPDATES</CtaButton>
      </HudSection>
    </>
  );
}
