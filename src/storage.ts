export interface Settings {
  creatureId: string;
  name: string;
  clock: boolean;
  hour12: boolean;
  seenOnboarding: boolean;
}

export const defaultSettings: Settings = {
  creatureId: "frog",
  name: "",
  clock: true,
  hour12: false,
  seenOnboarding: false,
};

const KEY = "tabmaka.settings";

interface ChromeLike {
  storage?: {
    local?: {
      get(keys: string | string[]): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
    };
  };
}

function chromeLocal() {
  const c = (globalThis as unknown as { chrome?: ChromeLike }).chrome;
  return c?.storage?.local;
}

/** Load settings from chrome.storage.local, falling back to localStorage. */
export async function loadSettings(): Promise<Settings> {
  const local = chromeLocal();
  try {
    if (local) {
      const got = await local.get(KEY);
      const raw = got[KEY];
      if (raw && typeof raw === "object") {
        return { ...defaultSettings, ...(raw as Partial<Settings>) };
      }
      return { ...defaultSettings };
    }
  } catch {
    // fall through to localStorage
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    // ignore
  }
  return { ...defaultSettings };
}

/** Persist settings to chrome.storage.local, falling back to localStorage. */
export async function saveSettings(settings: Settings): Promise<void> {
  const local = chromeLocal();
  try {
    if (local) {
      await local.set({ [KEY]: settings });
      return;
    }
  } catch {
    // fall through
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
