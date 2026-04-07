import HudSection from "@/components/HudSection";

const colonyFeatures = [
  {
    name: "Found Settlements",
    description: "Establish Outposts, grow them into Colonies, and fortify Strongholds on planet surfaces.",
  },
  {
    name: "Manage Resources",
    description: "Balance Food, Metal, Power, and Water to keep your colony alive and growing.",
  },
  {
    name: "Build & Expand",
    description: "16+ building types across Survival, Civilian, Military, and Advanced categories.",
  },
  {
    name: "Population & Happiness",
    description: "Colonists arrive, grow, and leave based on happiness. Keep them fed, safe, and housed.",
  },
  {
    name: "Defend Against Attacks",
    description: "Hollow raids and natural disasters threaten your colonies. Build defenses or lose everything.",
  },
  {
    name: "Earth Supply Lines",
    description: "Resupply shipments from Earth degrade the deeper you push into Sector Zero.",
  },
];

export default function ComingSoonPage() {
  return (
    <>
      <section className="text-center py-16 px-6 bg-gradient-to-b from-purple-accent/10 to-transparent">
        <p className="hud-label mb-4">
          CLASSIFIED // COLONY PROTOCOL
        </p>
        <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-[0.3em] text-cyan-accent mb-3">
          COLONY MANAGEMENT
        </h1>
        <p className="font-mono text-sm text-text-muted tracking-wider">
          Coming Soon to Sector Zero
        </p>
      </section>

      <HudSection label="COLONY FEATURES">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {colonyFeatures.map((feature) => (
            <div key={feature.name} className="border border-border-hud p-4">
              <h3 className="font-mono text-sm text-cyan-accent mb-2">
                {feature.name}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </HudSection>

      <HudSection label="INTEL PREVIEW" className="border-t border-border-hud">
        <div className="max-w-3xl">
          <div className="border border-cyan-accent/20 bg-cyan-accent/5 px-4 py-3">
            <p className="font-mono text-[0.65rem] tracking-wider text-cyan-accent/60 mb-2">
              // COMMANDER&apos;S NOTE
            </p>
            <p className="text-sm text-text-primary leading-relaxed">
              The Kepler colonists didn&apos;t just survive — they built. Ruins of
              their settlements dot every planet in Sector Zero. Now it&apos;s your
              turn. Found colonies, manage resources, and hold the line against
              the Hollow. But be warned: the further you push from Earth, the
              less help arrives.
            </p>
          </div>
        </div>
      </HudSection>
    </>
  );
}
