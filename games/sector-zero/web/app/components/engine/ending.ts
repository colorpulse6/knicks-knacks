import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./types";
import { getSprite, SPRITES } from "./sprites";

// ─── Ending Scene Panels ────────────────────────────────────────────

interface EndingPanel {
  startFrame: number;
  duration: number;
  spriteKey: string;
  text: string[];
  style: "narration" | "dialog" | "title";
  speaker?: string;
  speakerColor?: string;
}

const FADE_FRAMES = 45;

const ENDING_PANELS: EndingPanel[] = [
  // Scene 1 — The Hollow Mind Falls
  {
    startFrame: 0,
    duration: 360,
    spriteKey: "ENDING_1",
    text: [
      "The Hollow Mind shattered—not with a",
      "scream, but with a sigh. A thousand",
      "years of silence, finally broken.",
    ],
    style: "narration",
  },
  // Scene 2 — The Signal Revealed
  {
    startFrame: 400,
    duration: 420,
    spriteKey: "ENDING_2",
    text: [
      "They weren't invaders. They were",
      "the colonists of the Kepler Exodus,",
      "transformed by centuries in the void.",
      "",
      "The Signal was never a weapon.",
      "It was a cry for home.",
    ],
    style: "narration",
  },
  // Reyes dialog
  {
    startFrame: 860,
    duration: 300,
    spriteKey: "ENDING_2",
    text: [
      "We came as executioners...",
      "but we leave as family.",
    ],
    style: "dialog",
    speaker: "LT. REYES",
    speakerColor: "#ff8844",
  },
  // Scene 3 — Coming Home
  {
    startFrame: 1200,
    duration: 420,
    spriteKey: "ENDING_3",
    text: [
      "Voss lowered her hand from her",
      "cybernetic eye. For the first time",
      "since the mission began, the whisper",
      "of The Signal fell quiet.",
    ],
    style: "narration",
  },
  // Voss dialog
  {
    startFrame: 1660,
    duration: 300,
    spriteKey: "ENDING_3",
    text: [
      "They're at peace now.",
      "All of them.",
    ],
    style: "dialog",
    speaker: "CDR. VOSS",
    speakerColor: "#44ccff",
  },
  // Kael dialog
  {
    startFrame: 2000,
    duration: 300,
    spriteKey: "ENDING_3",
    text: [
      "The Vanguard's mission log has",
      "been overwritten. The truth is",
      "ours now. No more cover-ups.",
    ],
    style: "dialog",
    speaker: "DOC KAEL",
    speakerColor: "#44ff88",
  },
  // Scene 4 — Sector Zero at Peace
  {
    startFrame: 2340,
    duration: 480,
    spriteKey: "ENDING_4",
    text: [
      "Where The Hollow once consumed,",
      "light now bloomed — a nebula born",
      "from a thousand reunited souls.",
      "",
      "Sector Zero was no longer forbidden.",
      "It was a memorial.",
    ],
    style: "narration",
  },
  // Final title
  {
    startFrame: 2860,
    duration: 360,
    spriteKey: "ENDING_4",
    text: ["THE END"],
    style: "title",
  },
];

export const ENDING_TOTAL_FRAMES = 3340; // 3220 + 120 buffer for fade

// ─── Draw Ending ────────────────────────────────────────────────────

export function drawEnding(
  ctx: CanvasRenderingContext2D,
  frame: number
): void {
  ctx.save();

  // Black background
  ctx.fillStyle = "#000005";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Ambient stars
  for (let i = 0; i < 80; i++) {
    const seed = i * 7919;
    const sx = ((seed * 13) % CANVAS_WIDTH);
    const sy = ((seed * 17) % CANVAS_HEIGHT);
    const alpha = 0.15 + 0.35 * Math.abs(Math.sin(frame * 0.01 + i * 0.5));
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.4 + (i % 3) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw active panels
  for (const panel of ENDING_PANELS) {
    const elapsed = frame - panel.startFrame;
    if (elapsed < 0 || elapsed > panel.duration) continue;

    // Fade in / out
    const fadeIn = Math.min(1, elapsed / FADE_FRAMES);
    const fadeOut = Math.min(1, (panel.duration - elapsed) / FADE_FRAMES);
    const alpha = Math.min(fadeIn, fadeOut);
    if (alpha <= 0) continue;

    ctx.globalAlpha = alpha;

    // Draw illustration (if sprite loaded)
    const spritePath = (SPRITES as Record<string, string>)[panel.spriteKey];
    const sprite = spritePath ? getSprite(spritePath) : null;
    if (sprite) {
      // Scale to fill width, maintain aspect, center vertically in top portion
      const scale = CANVAS_WIDTH / sprite.width;
      const drawH = sprite.height * scale;
      const drawY = Math.max(0, (CANVAS_HEIGHT * 0.45 - drawH) / 2);
      ctx.drawImage(sprite, 0, drawY, CANVAS_WIDTH, drawH);

      // Gradient overlay at bottom of image for text readability
      const gradY = drawY + drawH - 200;
      const grad = ctx.createLinearGradient(0, gradY, 0, drawY + drawH);
      grad.addColorStop(0, "rgba(0, 0, 5, 0)");
      grad.addColorStop(1, "rgba(0, 0, 5, 1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, gradY, CANVAS_WIDTH, 200);
    }

    // Text rendering
    const textY = CANVAS_HEIGHT * 0.62;

    switch (panel.style) {
      case "title":
        ctx.fillStyle = "#44ccff";
        ctx.font = "bold 36px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#44ccff";
        ctx.fillText(panel.text[0], CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.shadowBlur = 0;
        break;

      case "dialog":
        // Speaker name
        if (panel.speaker) {
          ctx.fillStyle = panel.speakerColor ?? "#44ccff";
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(panel.speaker, CANVAS_WIDTH / 2, textY - 20);
        }
        // Dialog text
        ctx.fillStyle = "#ffffff";
        ctx.font = "italic 15px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        for (let i = 0; i < panel.text.length; i++) {
          ctx.fillText(panel.text[i], CANVAS_WIDTH / 2, textY + 6 + i * 24);
        }
        break;

      case "narration":
        ctx.fillStyle = "#bbbbbb";
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        for (let i = 0; i < panel.text.length; i++) {
          ctx.fillText(panel.text[i], CANVAS_WIDTH / 2, textY + i * 22);
        }
        break;
    }
  }

  // Skip hint
  const hintAlpha = Math.min(0.4, Math.max(0, (frame - 180) / 60));
  ctx.globalAlpha = hintAlpha;
  ctx.fillStyle = "#444444";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("PRESS ENTER OR TAP TO SKIP", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 16);

  ctx.restore();
}

// ─── Credits ────────────────────────────────────────────────────────

interface CreditEntry {
  style: "title" | "heading" | "name" | "spacer" | "small";
  text: string;
  color?: string;
}

const CREDITS: CreditEntry[] = [
  { style: "title", text: "SECTOR ZERO", color: "#44ccff" },
  { style: "small", text: "THE LAST PILOT OF SECTOR ZERO" },
  { style: "spacer", text: "" },
  { style: "spacer", text: "" },
  { style: "heading", text: "CREATED BY" },
  { style: "name", text: "NICHALAS BARNES" },
  { style: "spacer", text: "" },
  { style: "heading", text: "GAME DESIGN" },
  { style: "name", text: "NICHALAS BARNES" },
  { style: "spacer", text: "" },
  { style: "heading", text: "PROGRAMMING" },
  { style: "name", text: "NICHALAS BARNES" },
  { style: "spacer", text: "" },
  { style: "heading", text: "ART & SPRITES" },
  { style: "name", text: "NICHALAS BARNES" },
  { style: "spacer", text: "" },
  { style: "heading", text: "STORY & WRITING" },
  { style: "name", text: "NICHALAS BARNES" },
  { style: "spacer", text: "" },
  { style: "heading", text: "SOUND DESIGN" },
  { style: "name", text: "NICHALAS BARNES" },
  { style: "spacer", text: "" },
  { style: "spacer", text: "" },
  { style: "heading", text: "CREW ROSTER" },
  { style: "spacer", text: "" },
  { style: "name", text: "CDR. VOSS", color: "#44ccff" },
  { style: "small", text: "Commanding Officer" },
  { style: "spacer", text: "" },
  { style: "name", text: "LT. REYES", color: "#ff8844" },
  { style: "small", text: "Pilot & Weapons Officer" },
  { style: "spacer", text: "" },
  { style: "name", text: "DOC KAEL", color: "#44ff88" },
  { style: "small", text: "Science Officer" },
  { style: "spacer", text: "" },
  { style: "spacer", text: "" },
  { style: "heading", text: "WORLDS" },
  { style: "spacer", text: "" },
  { style: "small", text: "I  \u2022  Aurelia Belt" },
  { style: "small", text: "II  \u2022  Cryon Nebula" },
  { style: "small", text: "III  \u2022  Ignis Rift" },
  { style: "small", text: "IV  \u2022  The Graveyard" },
  { style: "small", text: "V  \u2022  Void Abyss" },
  { style: "small", text: "VI  \u2022  The Scar" },
  { style: "small", text: "VII  \u2022  The Fold" },
  { style: "small", text: "VIII  \u2022  The Hollow Core" },
  { style: "spacer", text: "" },
  { style: "spacer", text: "" },
  { style: "heading", text: "SPECIAL THANKS" },
  { style: "name", text: "YOU" },
  { style: "small", text: "For playing" },
  { style: "spacer", text: "" },
  { style: "spacer", text: "" },
  { style: "spacer", text: "" },
  { style: "small", text: "A KNICKS-KNACKS PRODUCTION", color: "#888888" },
  { style: "spacer", text: "" },
  { style: "small", text: "\u00A9 2025 NICHALAS BARNES", color: "#555555" },
  { style: "spacer", text: "" },
  { style: "spacer", text: "" },
  { style: "spacer", text: "" },
];

// Calculate total scroll height
const LINE_HEIGHTS: Record<CreditEntry["style"], number> = {
  title: 50,
  heading: 36,
  name: 30,
  small: 22,
  spacer: 20,
};

const CREDITS_TOTAL_HEIGHT = CREDITS.reduce(
  (sum, entry) => sum + LINE_HEIGHTS[entry.style],
  0
);

// Scroll speed: pixels per frame
const SCROLL_SPEED = 0.8;

// Total frames = time for all credits to scroll from bottom to off top
export const CREDITS_TOTAL_FRAMES = Math.ceil(
  (CANVAS_HEIGHT + CREDITS_TOTAL_HEIGHT + 200) / SCROLL_SPEED
);

export function drawCredits(
  ctx: CanvasRenderingContext2D,
  frame: number
): void {
  ctx.save();

  // Black background
  ctx.fillStyle = "#000005";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Stars
  for (let i = 0; i < 80; i++) {
    const seed = i * 7919;
    const sx = ((seed * 13) % CANVAS_WIDTH);
    const sy = ((seed * 17) % CANVAS_HEIGHT);
    const alpha = 0.15 + 0.35 * Math.abs(Math.sin(frame * 0.008 + i * 0.5));
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.4 + (i % 3) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Scrolling credits
  const scrollOffset = CANVAS_HEIGHT - frame * SCROLL_SPEED;
  let y = scrollOffset;

  for (const entry of CREDITS) {
    const lineH = LINE_HEIGHTS[entry.style];
    const drawY = y + lineH / 2;

    // Only draw if in view
    if (drawY > -40 && drawY < CANVAS_HEIGHT + 40) {
      // Fade edges
      const edgeFade =
        drawY < 60
          ? Math.max(0, drawY / 60)
          : drawY > CANVAS_HEIGHT - 60
            ? Math.max(0, (CANVAS_HEIGHT - drawY) / 60)
            : 1;
      ctx.globalAlpha = edgeFade;

      switch (entry.style) {
        case "title":
          ctx.fillStyle = entry.color ?? "#44ccff";
          ctx.font = "bold 32px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowBlur = 15;
          ctx.shadowColor = entry.color ?? "#44ccff";
          ctx.fillText(entry.text, CANVAS_WIDTH / 2, drawY);
          ctx.shadowBlur = 0;
          break;

        case "heading":
          ctx.fillStyle = "#667788";
          ctx.font = "bold 11px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(entry.text, CANVAS_WIDTH / 2, drawY);
          break;

        case "name":
          ctx.fillStyle = entry.color ?? "#ffffff";
          ctx.font = "bold 18px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(entry.text, CANVAS_WIDTH / 2, drawY);
          break;

        case "small":
          ctx.fillStyle = entry.color ?? "#999999";
          ctx.font = "12px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(entry.text, CANVAS_WIDTH / 2, drawY);
          break;

        case "spacer":
          break;
      }
    }

    y += lineH;
  }

  // Skip hint
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#444444";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("PRESS ENTER OR TAP TO SKIP", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 16);

  ctx.restore();
}
