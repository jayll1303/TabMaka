import { describe, it, expect } from "vitest";
import { isDarkColor, THEME_PRESETS, DEFAULT_BG } from "./theme";

describe("theme", () => {
  it("correctly classifies dark and light colors", () => {
    expect(isDarkColor("#000000")).toBe(true);
    expect(isDarkColor("#0F1117")).toBe(true);
    expect(isDarkColor("#FFFFFF")).toBe(false);
    expect(isDarkColor("#FAF6EE")).toBe(false);
    expect(isDarkColor("#EAF0E6")).toBe(false);
    expect(isDarkColor("#FBF0EB")).toBe(false);
  });

  it("provides valid presets", () => {
    expect(THEME_PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const p of THEME_PRESETS) {
      expect(p.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("has default background", () => {
    expect(DEFAULT_BG).toBe("#FAF6EE");
  });
});
