import type { Settings } from "../storage";

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
