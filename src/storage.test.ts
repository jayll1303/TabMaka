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

  it("round-trips saved settings including clockStyle", async () => {
    await saveSettings({
      ...defaultSettings,
      customGreeting: "Good morning Nam",
      hour12: true,
      clockStyle: "pixel-box",
    });
    const s = await loadSettings();
    expect(s.customGreeting).toBe("Good morning Nam");
    expect(s.hour12).toBe(true);
    expect(s.clockStyle).toBe("pixel-box");
  });

  it("merges partial stored data over defaults", async () => {
    localStorage.setItem(
      "tabmaka.settings",
      JSON.stringify({ customGreeting: "Hello world" }),
    );
    const s = await loadSettings();
    expect(s.customGreeting).toBe("Hello world");
    expect(s.clock).toBe(defaultSettings.clock);
    expect(s.clockStyle).toBe("minimal");
  });
});
