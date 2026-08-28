import { describe, it, expect, beforeEach } from "vitest";
import { initDiscoToggle, applyDiscoMode } from "./disco";
import type { Settings } from "../storage";
import { defaultSettings } from "../storage";

class MockElement {
  style: Record<string, string> = {};
  className = "";
  textContent = "";
  innerHTML = "";
  type = "";
  attributes = new Map<string, string>();
  listeners = new Map<string, ((e: unknown) => void)[]>();
  children: MockElement[] = [];

  classList = {
    add: (...classes: string[]) => {
      const set = new Set(this.className.split(" ").filter(Boolean));
      classes.forEach((c) => set.add(c));
      this.className = Array.from(set).join(" ");
    },
    remove: (...classes: string[]) => {
      const set = new Set(this.className.split(" ").filter(Boolean));
      classes.forEach((c) => set.delete(c));
      this.className = Array.from(set).join(" ");
    },
    toggle: (c: string, force?: boolean) => {
      const set = new Set(this.className.split(" ").filter(Boolean));
      const shouldHave = force !== undefined ? force : !set.has(c);
      if (shouldHave) set.add(c);
      else set.delete(c);
      this.className = Array.from(set).join(" ");
    },
    contains: (c: string) => this.className.split(" ").includes(c),
  };

  setAttribute(k: string, v: string) {
    this.attributes.set(k, v);
  }

  removeAttribute(k: string) {
    this.attributes.delete(k);
  }

  getAttribute(k: string) {
    return this.attributes.get(k) ?? null;
  }

  addEventListener(type: string, fn: (e: unknown) => void) {
    const list = this.listeners.get(type) ?? [];
    list.push(fn);
    this.listeners.set(type, list);
  }

  replaceChildren(...children: MockElement[]) {
    this.children = [...children];
  }

  querySelector(selector: string): MockElement | null {
    if (selector === "button") {
      return (
        this.children.find(
          (c) => c.type === "button" || c.className.includes("btn"),
        ) ??
        this.children[0] ??
        null
      );
    }
    return null;
  }

  click() {
    const fns = this.listeners.get("click") ?? [];
    fns.forEach((fn) => fn({ type: "click", preventDefault: () => {} }));
  }
}

describe("applyDiscoMode", () => {
  it("toggles disco-mode class on body", () => {
    const mockBody = new MockElement();
    (globalThis as unknown as { document: unknown }).document = {
      body: mockBody,
    };

    applyDiscoMode(true);
    expect(mockBody.classList.contains("disco-mode")).toBe(true);

    applyDiscoMode(false);
    expect(mockBody.classList.contains("disco-mode")).toBe(false);
  });
});

describe("initDiscoToggle", () => {
  let mockBody: MockElement;

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
    mockBody = new MockElement();
    (globalThis as unknown as { document: unknown }).document = {
      createElement: () => new MockElement(),
      body: mockBody,
    };
  });

  it("renders hidden state when not in vibe mode and prevents click", () => {
    const root = new MockElement() as unknown as HTMLElement;
    let currentSettings: Settings = { ...defaultSettings, disco: false };
    let callbackCalled = false;

    initDiscoToggle(
      root,
      currentSettings,
      () => false, // not vibing
      (updated) => {
        currentSettings = { ...updated };
        callbackCalled = true;
      },
    );

    const btn = (root as unknown as MockElement).querySelector("button")!;
    expect(btn).not.toBeNull();
    expect(btn.className).toContain("mode-hidden");
    expect(btn.style.display).toBe("none");
    expect((root as unknown as MockElement).style.display).toBe("none");
    expect(mockBody.classList.contains("disco-mode")).toBe(false);

    // Clicking when not vibing does nothing
    btn.click();
    expect(currentSettings.disco).toBe(false);
    expect(callbackCalled).toBe(false);
    expect(btn.className).toContain("mode-hidden");
    expect(mockBody.classList.contains("disco-mode")).toBe(false);
  });

  it("renders enabled off state initially when vibing and disco is false", () => {
    const root = new MockElement() as unknown as HTMLElement;
    const settings: Settings = { ...defaultSettings, disco: false };
    initDiscoToggle(
      root,
      settings,
      () => true,
      () => {},
    );

    const btn = (root as unknown as MockElement).querySelector("button")!;
    expect(btn).not.toBeNull();
    expect((root as unknown as MockElement).style.display).toBe("");
    expect(btn.style.display).toBe("");
    expect(btn.className).toContain("mode-off");
    expect(btn.getAttribute("aria-label")).toBe("Bật Disco Mode");
    expect(mockBody.classList.contains("disco-mode")).toBe(false);
  });

  it("renders active state when vibing and disco is true", () => {
    const root = new MockElement() as unknown as HTMLElement;
    const settings: Settings = { ...defaultSettings, disco: true };
    initDiscoToggle(
      root,
      settings,
      () => true,
      () => {},
    );

    const btn = (root as unknown as MockElement).querySelector("button")!;
    expect(btn).not.toBeNull();
    expect((root as unknown as MockElement).style.display).toBe("");
    expect(btn.className).toContain("active");
    expect(btn.getAttribute("aria-label")).toBe("Tắt Disco Mode");
    expect(mockBody.classList.contains("disco-mode")).toBe(true);
  });

  it("toggles disco mode state on click when in vibe mode", () => {
    const root = new MockElement() as unknown as HTMLElement;
    let currentSettings: Settings = { ...defaultSettings, disco: false };
    let callbackCalled = false;

    initDiscoToggle(
      root,
      currentSettings,
      () => true, // vibing
      (updated) => {
        currentSettings = { ...updated };
        callbackCalled = true;
      },
    );

    const btn = (root as unknown as MockElement).querySelector("button")!;

    // 1st click: off -> on
    btn.click();
    expect(currentSettings.disco).toBe(true);
    expect(callbackCalled).toBe(true);
    expect(btn.className).toContain("active");
    expect(mockBody.classList.contains("disco-mode")).toBe(true);

    // 2nd click: on -> off
    callbackCalled = false;
    btn.click();
    expect(currentSettings.disco).toBe(false);
    expect(callbackCalled).toBe(true);
    expect(btn.className).toContain("mode-off");
    expect(mockBody.classList.contains("disco-mode")).toBe(false);
  });

  it("dynamically reacts to vibe state changes via updateVibeState", () => {
    const root = new MockElement() as unknown as HTMLElement;
    let isVibing = false;
    const settings: Settings = { ...defaultSettings, disco: true };

    const controller = initDiscoToggle(
      root,
      settings,
      () => isVibing,
      () => {},
    );

    const btn = (root as unknown as MockElement).querySelector("button")!;
    // Initially not vibing: hidden, no disco mode even though settings.disco is true
    expect(btn.className).toContain("mode-hidden");
    expect(btn.style.display).toBe("none");
    expect((root as unknown as MockElement).style.display).toBe("none");
    expect(mockBody.classList.contains("disco-mode")).toBe(false);

    // Music starts -> vibing becomes true
    isVibing = true;
    controller.updateVibeState(true);
    expect(btn.className).toContain("active");
    expect(btn.style.display).toBe("");
    expect((root as unknown as MockElement).style.display).toBe("");
    expect(mockBody.classList.contains("disco-mode")).toBe(true);

    // Music stops -> vibing becomes false
    isVibing = false;
    controller.updateVibeState(false);
    expect(btn.className).toContain("mode-hidden");
    expect(btn.style.display).toBe("none");
    expect((root as unknown as MockElement).style.display).toBe("none");
    expect(mockBody.classList.contains("disco-mode")).toBe(false);
  });
});
