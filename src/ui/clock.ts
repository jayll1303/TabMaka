import type { Settings } from "../storage";
import { saveSettings } from "../storage";

let timer: number | undefined;

export function initClock(el: HTMLElement, settings: Settings): void {
  function render(): void {
    if (!settings.clock) {
      el.textContent = "";
      el.style.display = "none";
      return;
    }
    el.style.display = "";
    const now = new Date();
    el.textContent = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: settings.hour12,
    });
  }
  render();
  if (timer !== undefined) clearInterval(timer);
  timer = window.setInterval(render, 1000);
}

/**
 * Initialize 3-state clock toggle button in top-left corner.
 * Cycle: Off -> On (12h) -> On (24h) -> Off -> ...
 */
export function initClockToggle(
  root: HTMLElement,
  settings: Settings,
  onToggle: (s: Settings) => void,
): void {
  const btn = document.createElement("button");
  btn.className = "clock-toggle-btn";
  btn.type = "button";

  const clockSvg = `
    <svg class="clock-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9.5"/>
      <polyline points="12 7 12 12 15.5 13.5"/>
    </svg>
  `;

  function renderState(): void {
    btn.className = "clock-toggle-btn";
    if (!settings.clock) {
      btn.classList.add("mode-off");
      btn.setAttribute("title", "Đồng hồ: Đang tắt (Bấm để bật 12 Giờ)");
      btn.setAttribute("aria-label", "Bật đồng hồ");
    } else if (settings.hour12) {
      btn.classList.add("mode-12h");
      btn.setAttribute("title", "Đồng hồ: 12 Giờ (Bấm để chuyển sang 24 Giờ)");
      btn.setAttribute("aria-label", "Chuyển sang 24 Giờ");
    } else {
      btn.classList.add("mode-24h");
      btn.setAttribute("title", "Đồng hồ: 24 Giờ (Bấm để tắt đồng hồ)");
      btn.setAttribute("aria-label", "Tắt đồng hồ");
    }
    btn.innerHTML = clockSvg;
  }

  btn.addEventListener("click", async () => {
    if (!settings.clock) {
      // 1. Off -> On (12h)
      settings.clock = true;
      settings.hour12 = true;
    } else if (settings.hour12) {
      // 2. On (12h) -> On (24h)
      settings.clock = true;
      settings.hour12 = false;
    } else {
      // 3. On (24h) -> Off
      settings.clock = false;
    }
    renderState();
    await saveSettings(settings);
    onToggle(settings);
  });

  renderState();
  root.replaceChildren(btn);
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
