import type { Settings } from "../storage";
import { saveSettings } from "../storage";

export interface ThemePreset {
  id: string;
  name: string;
  color: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: "oat-cream", name: "Kem", color: "#FAF6EE" },
  { id: "matcha-mist", name: "Matcha", color: "#EAF0E6" },
  { id: "lavender-mist", name: "Lavender", color: "#EDE8F5" },
  { id: "dark-slate", name: "Đêm", color: "#0F1117" },
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
  let r = 0,
    g = 0,
    b = 0;
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

/**
 * Initialize ambient color palette dock at bottom of the screen.
 * Idle: low opacity; Hover: frosted glass dock with 1-click theme selection.
 */
export function initAmbientPalette(
  root: HTMLElement,
  settings: Settings,
  onColorChange: (s: Settings) => void,
): void {
  const container = document.createElement("div");
  container.className = "ambient-color-bar";
  container.setAttribute("role", "toolbar");
  container.setAttribute("aria-label", "Chọn màu nền");

  const swatchesHtml = THEME_PRESETS.map((p) => {
    const isSelected =
      (settings.bg || "").toLowerCase() === p.color.toLowerCase();
    return `
      <button
        type="button"
        class="color-swatch ${isSelected ? "active" : ""}"
        data-color="${p.color}"
        title="${p.name}"
        style="background-color: ${p.color};"
        aria-label="${p.name}"
      ></button>
    `;
  }).join("");

  const isCustom = !THEME_PRESETS.some(
    (p) => p.color.toLowerCase() === (settings.bg || "").toLowerCase(),
  );

  container.innerHTML = `
    ${swatchesHtml}
    <label class="color-swatch custom-picker ${isCustom ? "active" : ""}" title="Tùy chọn màu" aria-label="Tùy chọn màu" ${isCustom ? `style="background-color: ${settings.bg};"` : ""}>
      <input type="color" id="custom-bg-input" value="${settings.bg || "#FAF6EE"}" />
      <svg class="custom-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    </label>
  `;

  const swatchButtons = container.querySelectorAll<HTMLButtonElement>(
    ".color-swatch[data-color]",
  );
  const customLabel =
    container.querySelector<HTMLLabelElement>(".custom-picker")!;
  const customBgInput =
    container.querySelector<HTMLInputElement>("#custom-bg-input")!;

  function updateActiveSwatch(currentColor: string): void {
    let matchedPreset = false;
    swatchButtons.forEach((btn) => {
      const match =
        (btn.dataset.color || "").toLowerCase() === currentColor.toLowerCase();
      btn.classList.toggle("active", match);
      if (match) matchedPreset = true;
    });
    customLabel.classList.toggle("active", !matchedPreset);
    if (!matchedPreset) {
      customLabel.style.backgroundColor = currentColor;
    } else {
      customLabel.style.backgroundColor = "";
    }
    customBgInput.value = currentColor;
  }

  async function setBackground(color: string): Promise<void> {
    settings.bg = color;
    applyTheme(color);
    updateActiveSwatch(color);
    await saveSettings(settings);
    onColorChange(settings);
  }

  swatchButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      if (color) void setBackground(color);
    });
  });

  customBgInput.addEventListener("input", (e) => {
    const val = (e.target as HTMLInputElement).value;
    if (val) void setBackground(val);
  });

  root.replaceChildren(container);
}
