import type { Settings } from "../storage";
import { saveSettings } from "../storage";

let timer: number | undefined;

export function initClock(el: HTMLElement, settings: Settings): void {
  function render(): void {
    if (!settings.clock) {
      el.textContent = "";
      return;
    }
    const now = new Date();
    el.textContent = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: settings.hour12,
    });
  }
  render();
  if (timer !== undefined) clearInterval(timer);
  timer = window.setInterval(render, 15_000);
}

export function greetingFor(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return "Still up?";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Initialize Momentum-style inline editable greeting.
 * Allows users to edit the entire greeting line seamlessly.
 */
export function initGreeting(el: HTMLElement, settings: Settings): void {
  function render(): void {
    if (settings.customGreeting && settings.customGreeting.trim().length > 0) {
      el.textContent = settings.customGreeting.trim();
    } else {
      el.textContent = greetingFor();
    }
  }

  render();
  el.contentEditable = "true";
  el.spellcheck = false;
  el.setAttribute("title", "Click to edit greeting");

  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      el.blur();
    }
    if (e.key === "Escape") {
      render();
      el.blur();
    }
  });

  el.addEventListener("blur", () => {
    const raw = el.textContent?.trim() || "";
    // If the user entered the default time-based greeting or blank, save as blank to remain dynamic
    if (raw === "" || raw === greetingFor()) {
      settings.customGreeting = "";
    } else {
      settings.customGreeting = raw;
    }
    void saveSettings(settings);
    render();
  });
}
