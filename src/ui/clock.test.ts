import { describe, it, expect, beforeEach } from "vitest";
import { greetingFor, CLOCK_STYLES, initClock, initClockToggle } from "./clock";
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
    contains: (c: string) => this.className.split(" ").includes(c),
  };

  setAttribute(k: string, v: string) {
    this.attributes.set(k, v);
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

describe("greetingFor", () => {
  it("greets by time of day", () => {
    expect(greetingFor(new Date(2020, 0, 1, 2))).toBe("Still up?");
    expect(greetingFor(new Date(2020, 0, 1, 9))).toBe("Good morning");
    expect(greetingFor(new Date(2020, 0, 1, 14))).toBe("Good afternoon");
    expect(greetingFor(new Date(2020, 0, 1, 20))).toBe("Good evening");
  });
});

describe("CLOCK_STYLES presets", () => {
  it("defines all 4 presets", () => {
    expect(CLOCK_STYLES).toHaveLength(4);
    expect(CLOCK_STYLES.map((s) => s.id)).toEqual([
      "minimal",
      "pixel-box",
      "cozy-hand",
      "analog-round",
    ]);
  });
});

describe("initClock", () => {
  it("renders digital time with matching style class", () => {
    const el = new MockElement() as unknown as HTMLElement;
    initClock(el, { ...defaultSettings, clock: true, clockStyle: "pixel-box" });
    expect(el.className).toContain("style-pixel-box");
    expect(el.innerHTML).toContain("pixel-clock-inner");
  });

  it("renders analog SVG when style is analog-round", () => {
    const el = new MockElement() as unknown as HTMLElement;
    initClock(el, {
      ...defaultSettings,
      clock: true,
      clockStyle: "analog-round",
    });
    expect(el.className).toContain("style-analog-round");
    expect(el.innerHTML).toContain("analog-clock-face");
  });

  it("hides element when clock is false", () => {
    const el = new MockElement() as unknown as HTMLElement;
    initClock(el, { ...defaultSettings, clock: false });
    expect(el.style.display).toBe("none");
    expect(el.textContent).toBe("");
  });
});

describe("initClockToggle", () => {
  beforeEach(() => {
    (globalThis as unknown as { document: unknown }).document = {
      createElement: () => new MockElement(),
    };
  });

  it("cycles styles on click and turns off at the end", () => {
    const root = new MockElement() as unknown as HTMLElement;
    let currentSettings: Settings = {
      ...defaultSettings,
      clock: true,
      clockStyle: "minimal",
    };
    initClockToggle(root, currentSettings, (updated) => {
      currentSettings = { ...updated };
    });

    const btn = (root as unknown as MockElement).querySelector("button")!;
    expect(btn).not.toBeNull();

    // 1st click: minimal -> pixel-box
    btn.click();
    expect(currentSettings.clockStyle).toBe("pixel-box");
    expect(currentSettings.clock).toBe(true);

    // 2nd click: pixel-box -> cozy-hand
    btn.click();
    expect(currentSettings.clockStyle).toBe("cozy-hand");

    // 3rd click: cozy-hand -> analog-round
    btn.click();
    expect(currentSettings.clockStyle).toBe("analog-round");

    // 4th click: analog-round -> off
    btn.click();
    expect(currentSettings.clock).toBe(false);

    // 5th click: off -> on (minimal)
    btn.click();
    expect(currentSettings.clock).toBe(true);
    expect(currentSettings.clockStyle).toBe("minimal");
  });
});
