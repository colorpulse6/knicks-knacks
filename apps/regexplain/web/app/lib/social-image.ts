export const terminalPalette = Object.freeze({
  background: "#07090c",
  surface: "#0b0f14",
  border: "#26313d",
  primary: "#b8ff3d",
  secondary: "#5ee7f5",
  text: "#f3f7f9",
  muted: "#98a7b5",
} as const);

export const socialImage = Object.freeze({
  brand: "Regexplain",
  proposition: "Regex explainer & tester",
  examplePattern: "/^[a-z]+$/i",
  prompt: "$ explain",
  size: Object.freeze({ width: 1200, height: 630 }),
  contentType: "image/png",
  palette: terminalPalette,
} as const);
