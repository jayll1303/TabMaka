import { describe, it, expect, beforeEach } from "vitest";
import { loadSettings, saveSettings, defaultSettings } from "./storage";

describe("storage (localStorage fallback)", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    } as Storage;
    (globalThis as unknown as { chrome?: unknown }).chrome = undefined;
  });

  it("returns defaults when nothing stored", async () => {
    const s = await loadSettings();
    expect(s).toEqual(defaultSettings);
  });

  it("round-trips saved settings", async () => {
    await saveSettings({ ...defaultSettings, name: "Wiggles", hour12: true });
    const s = await loadSettings();
    expect(s.name).toBe("Wiggles");
    expect(s.hour12).toBe(true);
  });

  it("merges partial stored data over defaults", async () => {
    localStorage.setItem("companion.settings", JSON.stringify({ name: "Solo" }));
    const s = await loadSettings();
    expect(s.name).toBe("Solo");
    expect(s.clock).toBe(defaultSettings.clock);
  });
});
