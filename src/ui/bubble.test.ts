import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  GREETINGS,
  TIPS,
  REACTIONS,
  pickMessage,
  positionBubble,
  initBubble,
} from "./bubble";
import type { Mascot } from "../engine/mascot";

// Emoji / unicode symbol regex detector
const EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}]/u;

class MockElement {
  style: Record<string, string> = {};
  className = "";
  textContent = "";
  innerHTML = "";
  attributes = new Map<string, string>();
  listeners = new Map<string, ((e: unknown) => void)[]>();

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

  removeEventListener(type: string, fn: (e: unknown) => void) {
    const list = this.listeners.get(type) ?? [];
    this.listeners.set(
      type,
      list.filter((f) => f !== fn),
    );
  }

  dispatchEvent(e: { type: string; stopPropagation?: () => void }) {
    const list = this.listeners.get(e.type) ?? [];
    list.forEach((fn) => fn(e));
  }

  getBoundingClientRect() {
    return {
      width: 140,
      height: 36,
      top: 0,
      left: 0,
      bottom: 36,
      right: 140,
      x: 0,
      y: 0,
      toJSON: () => {},
    };
  }
}

describe("Thought Bubble Content Constraints", () => {
  it("all greetings must be <= 4 words and contain no icons/emojis", () => {
    expect(GREETINGS.length).toBeGreaterThan(0);
    for (const phrase of GREETINGS) {
      const words = phrase.trim().split(/\s+/);
      expect(
        words.length,
        `Greeting "${phrase}" must have <= 4 words`,
      ).toBeLessThanOrEqual(4);
      expect(
        EMOJI_REGEX.test(phrase),
        `Greeting "${phrase}" must not contain emojis`,
      ).toBe(false);
    }
  });

  it("all tips must be <= 4 words and contain no icons/emojis", () => {
    expect(TIPS.length).toBeGreaterThan(0);
    for (const phrase of TIPS) {
      const words = phrase.trim().split(/\s+/);
      expect(
        words.length,
        `Tip "${phrase}" must have <= 4 words`,
      ).toBeLessThanOrEqual(4);
      expect(
        EMOJI_REGEX.test(phrase),
        `Tip "${phrase}" must not contain emojis`,
      ).toBe(false);
    }
  });

  it("all reactions must be <= 2 words and contain no icons/emojis", () => {
    expect(REACTIONS.length).toBeGreaterThan(0);
    for (const phrase of REACTIONS) {
      const words = phrase.trim().split(/\s+/);
      expect(words.length).toBeLessThanOrEqual(2);
      expect(EMOJI_REGEX.test(phrase)).toBe(false);
    }
  });
});

describe("Thought Bubble Message Selection", () => {
  it("selects greeting when randomVal < 0.8 and tip when >= 0.8", () => {
    const greeting = pickMessage(0.79);
    expect(GREETINGS).toContain(greeting as (typeof GREETINGS)[number]);

    const tip = pickMessage(0.8);
    expect(TIPS).toContain(tip as (typeof TIPS)[number]);
  });

  it("follows 80/20 distribution over statistical sampling", () => {
    let greetingCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      const msg = pickMessage();
      if ((GREETINGS as readonly string[]).includes(msg)) {
        greetingCount++;
      }
    }
    const ratio = greetingCount / trials;
    // Expected ~0.80, tolerance +/- 0.08
    expect(ratio).toBeGreaterThanOrEqual(0.72);
    expect(ratio).toBeLessThanOrEqual(0.88);
  });

  it("avoids immediately repeating last message when alternatives exist", () => {
    const last = GREETINGS[0];
    for (let i = 0; i < 20; i++) {
      const next = pickMessage(0.5, last);
      expect(next).not.toBe(last);
    }
  });
});

describe("Thought Bubble Positioning", () => {
  it("positions above anchor and clamps within viewport margins", () => {
    const el = new MockElement() as unknown as HTMLElement;
    const screenSize = { w: 1000, h: 800 };

    // 1. Normal center
    positionBubble(el, { x: 500, y: 400 }, screenSize);
    expect((el as unknown as MockElement).style.left).toBe("500px");
    expect((el as unknown as MockElement).style.top).toBe("352px"); // 400 - 36 - 12

    // 2. Near left edge -> clamped
    positionBubble(el, { x: 20, y: 400 }, screenSize);
    expect((el as unknown as MockElement).style.left).toBe("86px"); // halfW (70) + 16

    // 3. Near top edge -> clamped
    positionBubble(el, { x: 500, y: 30 }, screenSize);
    expect((el as unknown as MockElement).style.top).toBe("16px");
  });
});

describe("Thought Bubble Lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows when mascot finishes entry and auto-hides after 4s", () => {
    let entryCb: (() => void) | undefined;
    const mascot: Mascot = {
      setCursor: vi.fn(),
      setPointerPresent: vi.fn(),
      setEnv: vi.fn(),
      update: vi.fn(),
      draw: vi.fn(),
      isSettled: () => true,
      getBubbleAnchor: () => ({ x: 200, y: 300 }),
      onEntryComplete: (cb) => {
        entryCb = cb;
      },
    };

    const el = new MockElement() as unknown as HTMLElement;
    const controller = initBubble(el, mascot, () => ({ w: 800, h: 600 }));

    expect(controller.isVisible()).toBe(false);
    expect((el as unknown as MockElement).classList.contains("visible")).toBe(
      false,
    );

    // Mascot finishes entry leap
    if (entryCb) {
      (entryCb as () => void)();
    }

    expect(controller.isVisible()).toBe(true);
    expect((el as unknown as MockElement).classList.contains("visible")).toBe(
      true,
    );
    expect((el as unknown as MockElement).textContent).toBeTruthy();

    // Fast-forward 4s
    vi.advanceTimersByTime(4000);
    expect(controller.isVisible()).toBe(false);
    expect((el as unknown as MockElement).classList.contains("visible")).toBe(
      false,
    );

    controller.destroy();
  });

  it("triggers short reaction and hides quickly when clicked", () => {
    const mascot: Mascot = {
      setCursor: vi.fn(),
      setPointerPresent: vi.fn(),
      setEnv: vi.fn(),
      update: vi.fn(),
      draw: vi.fn(),
      isSettled: () => true,
      getBubbleAnchor: () => ({ x: 200, y: 300 }),
    };

    const el = new MockElement() as unknown as HTMLElement;
    const controller = initBubble(el, mascot, () => ({ w: 800, h: 600 }));

    controller.show("Hello friend!");
    expect((el as unknown as MockElement).textContent).toBe("Hello friend!");

    // User clicks bubble
    (el as unknown as MockElement).dispatchEvent({
      type: "click",
      stopPropagation: () => {},
    });

    expect((el as unknown as MockElement).classList.contains("reacting")).toBe(
      true,
    );
    expect(REACTIONS).toContain(
      (el as unknown as MockElement).textContent as (typeof REACTIONS)[number],
    );

    // Fast-forward 800ms
    vi.advanceTimersByTime(800);
    expect(controller.isVisible()).toBe(false);
    expect((el as unknown as MockElement).classList.contains("visible")).toBe(
      false,
    );

    controller.destroy();
  });

  it("shows thought bubble when mascot wakes up from sleep", () => {
    let wakeCb: (() => void) | undefined;
    const mascot: Mascot = {
      setCursor: vi.fn(),
      setPointerPresent: vi.fn(),
      setEnv: vi.fn(),
      update: vi.fn(),
      draw: vi.fn(),
      isSettled: () => true,
      getBubbleAnchor: () => ({ x: 200, y: 300 }),
      onWake: (cb) => {
        wakeCb = cb;
      },
    };

    const el = new MockElement() as unknown as HTMLElement;
    const controller = initBubble(el, mascot, () => ({ w: 800, h: 600 }));

    expect(controller.isVisible()).toBe(false);

    // Mascot wakes up
    if (wakeCb) {
      (wakeCb as () => void)();
    }

    expect(controller.isVisible()).toBe(true);
    expect((el as unknown as MockElement).classList.contains("visible")).toBe(
      true,
    );
    expect((el as unknown as MockElement).textContent).toBeTruthy();

    // Auto-hides after 4s
    vi.advanceTimersByTime(4000);
    expect(controller.isVisible()).toBe(false);
    expect((el as unknown as MockElement).classList.contains("visible")).toBe(
      false,
    );

    controller.destroy();
  });
});
