export interface ThemePreset {
  id: string;
  name: string;
  color: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: "oat-cream", name: "Oat Cream", color: "#FAF6EE" },
  { id: "matcha-mist", name: "Matcha Mist", color: "#EAF0E6" },
  { id: "blossom-peach", name: "Blossom Peach", color: "#FBF0EB" },
  { id: "dark-slate", name: "Dark Slate", color: "#0F1117" },
];

export const DEFAULT_BG = "#FAF6EE";

/**
 * Calculates relative luminance and applies adaptive CSS variables for light/dark surfaces.
 */
export function applyTheme(colorHex: string): void {
  const root = document.documentElement;
  const isDark = isDarkColor(colorHex);

  root.style.setProperty("--bg", colorHex);

  if (isDark) {
    root.style.setProperty("--fg", "#e7e9ee");
    root.style.setProperty("--muted", "rgba(231, 233, 238, 0.6)");
    root.style.setProperty("--panel-bg", "rgba(20, 24, 33, 0.92)");
    root.style.setProperty("--panel-border", "rgba(255, 255, 255, 0.1)");
    root.style.setProperty("--panel-input-bg", "rgba(255, 255, 255, 0.08)");
    root.style.setProperty("--panel-input-border", "rgba(255, 255, 255, 0.15)");
    root.style.setProperty("--toggle-bg", "rgba(255, 255, 255, 0.08)");
    root.style.setProperty("--toggle-hover-bg", "rgba(255, 255, 255, 0.15)");
    root.style.setProperty("--swatch-border", "rgba(255, 255, 255, 0.2)");
    root.style.colorScheme = "dark";
  } else {
    root.style.setProperty("--fg", "#1f2421");
    root.style.setProperty("--muted", "rgba(31, 36, 33, 0.62)");
    root.style.setProperty("--panel-bg", "rgba(255, 255, 255, 0.94)");
    root.style.setProperty("--panel-border", "rgba(0, 0, 0, 0.08)");
    root.style.setProperty("--panel-input-bg", "rgba(0, 0, 0, 0.04)");
    root.style.setProperty("--panel-input-border", "rgba(0, 0, 0, 0.12)");
    root.style.setProperty("--toggle-bg", "rgba(0, 0, 0, 0.06)");
    root.style.setProperty("--toggle-hover-bg", "rgba(0, 0, 0, 0.12)");
    root.style.setProperty("--swatch-border", "rgba(0, 0, 0, 0.15)");
    root.style.colorScheme = "light";
  }
}

/** Check if hex color is perceptually dark */
export function isDarkColor(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length !== 6 && clean.length !== 3) return true;
  let r = 0, g = 0, b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return true;
  // Standard luminance formula
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum < 0.48;
}
