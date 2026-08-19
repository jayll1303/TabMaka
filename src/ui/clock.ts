import type { Settings, ClockStyle } from "../storage";
import { saveSettings } from "../storage";

let timer: number | undefined;

export const CLOCK_STYLES: { id: ClockStyle; name: string; desc: string }[] = [
  { id: "minimal", name: "Minimal Digital", desc: "Chữ số hiện đại tối giản" },
  {
    id: "pixel-box",
    name: "Pixel Arcade",
    desc: "Font pixel 8-bit khung retro",
  },
  {
    id: "cozy-hand",
    name: "Cozy Handwritten",
    desc: "Font nét viết tay ấm áp",
  },
  { id: "analog-round", name: "Analog Dial", desc: "Đồng hồ kim tròn cổ điển" },
];

function formatDigitalTime(
  now: Date,
  settings: Settings,
  showSeconds = false,
): string {
  if (showSeconds) {
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: settings.hour12,
    });
  }
  return now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: settings.hour12,
  });
}

function renderAnalogSvg(now: Date): string {
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ms = now.getMilliseconds();

  const secDeg = ((s + ms / 1000) / 60) * 360;
  const minDeg = ((m + s / 60) / 60) * 360;
  const hourDeg = (((h % 12) + m / 60) / 12) * 360;

  return `
    <svg class="analog-clock-face" viewBox="0 0 100 100" width="120" height="120" aria-label="Analog clock">
      <circle cx="50" cy="50" r="46" class="analog-dial-bg" />
      <circle cx="50" cy="8" r="2.2" class="analog-tick-main" />
      <circle cx="71" cy="13.6" r="1.3" class="analog-tick-sub" />
      <circle cx="86.4" cy="29" r="1.3" class="analog-tick-sub" />
      <circle cx="92" cy="50" r="2.2" class="analog-tick-main" />
      <circle cx="86.4" cy="71" r="1.3" class="analog-tick-sub" />
      <circle cx="71" cy="86.4" r="1.3" class="analog-tick-sub" />
      <circle cx="50" cy="92" r="2.2" class="analog-tick-main" />
      <circle cx="29" cy="86.4" r="1.3" class="analog-tick-sub" />
      <circle cx="13.6" cy="71" r="1.3" class="analog-tick-sub" />
      <circle cx="8" cy="50" r="2.2" class="analog-tick-main" />
      <circle cx="13.6" cy="29" r="1.3" class="analog-tick-sub" />
      <circle cx="29" cy="13.6" r="1.3" class="analog-tick-sub" />

      <line x1="50" y1="50" x2="50" y2="25" class="analog-hand analog-hour" style="transform: rotate(${hourDeg}deg);" />
      <line x1="50" y1="50" x2="50" y2="15" class="analog-hand analog-minute" style="transform: rotate(${minDeg}deg);" />
      <line x1="50" y1="50" x2="50" y2="11" class="analog-hand analog-second" style="transform: rotate(${secDeg}deg);" />
      <circle cx="50" cy="50" r="3.2" class="analog-center-dot" />
    </svg>
  `;
}

export function initClock(el: HTMLElement, settings: Settings): void {
  function render(): void {
    if (!settings.clock) {
      el.textContent = "";
      el.style.display = "none";
      el.className = "";
      return;
    }
    el.style.display = "";
    const style = settings.clockStyle || "minimal";
    el.className = `clock-root style-${style}`;

    const now = new Date();

    switch (style) {
      case "analog-round":
        el.innerHTML = renderAnalogSvg(now);
        break;
      case "pixel-box":
        el.innerHTML = `<span class="pixel-clock-inner">${formatDigitalTime(now, settings)}</span>`;
        break;
      case "cozy-hand":
      case "minimal":
      default:
        el.textContent = formatDigitalTime(now, settings);
        break;
    }
  }

  render();
  if (timer !== undefined) clearInterval(timer);
  timer = setInterval(render, 1000) as unknown as number;
}

/**
 * Initialize multi-style clock toggle button in top-left corner.
 * Cycle: Minimal -> Pixel Box -> Cozy Hand -> Analog Round -> Off -> Minimal
 * Right-click / contextmenu: Toggle 12h / 24h format.
 */
export function initClockToggle(
  root: HTMLElement,
  settings: Settings,
  onToggle: (s: Settings) => void,
): void {
  const btn = document.createElement("button");
  btn.className = "clock-toggle-btn";
  btn.type = "button";

  const getStyleIcon = (style: ClockStyle, isOff: boolean): string => {
    if (isOff) {
      return `
        <svg class="clock-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9.5" opacity="0.35"/>
          <line x1="4" y1="4" x2="20" y2="20"/>
        </svg>
      `;
    }
    switch (style) {
      case "pixel-box":
        return `
          <svg class="clock-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2"/>
            <circle cx="8" cy="10" r="1" fill="currentColor"/>
            <circle cx="8" cy="14" r="1" fill="currentColor"/>
            <line x1="12" y1="12" x2="16" y2="12"/>
          </svg>
        `;
      case "cozy-hand":
        return `
          <svg class="clock-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/>
            <path d="M12 7v5l3.5 2"/>
            <path d="M17.5 4.5l2 2"/>
          </svg>
        `;
      case "analog-round":
        return `
          <svg class="clock-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9.5"/>
            <line x1="12" y1="12" x2="12" y2="6"/>
            <line x1="12" y1="12" x2="16" y2="14"/>
          </svg>
        `;
      case "minimal":
      default:
        return `
          <svg class="clock-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9.5"/>
            <polyline points="12 7 12 12 15.5 13.5"/>
          </svg>
        `;
    }
  };

  function renderState(): void {
    btn.className = "clock-toggle-btn";
    if (!settings.clock) {
      btn.classList.add("mode-off");
      btn.setAttribute(
        "title",
        `Đồng hồ: Đang tắt (Click để bật ${CLOCK_STYLES[0].name} • Chuột phải đổi 12/24h)`,
      );
      btn.setAttribute("aria-label", "Bật đồng hồ");
      btn.innerHTML = getStyleIcon("minimal", true);
      return;
    }

    const currentStyle = settings.clockStyle || "minimal";
    btn.classList.add(`mode-${currentStyle}`);

    const currentIndex = CLOCK_STYLES.findIndex((s) => s.id === currentStyle);
    const currentName = CLOCK_STYLES[currentIndex >= 0 ? currentIndex : 0].name;
    const nextItem =
      currentIndex >= 0 && currentIndex < CLOCK_STYLES.length - 1
        ? CLOCK_STYLES[currentIndex + 1].name
        : "Tắt đồng hồ";

    const formatStr = settings.hour12 ? "12h" : "24h";
    btn.setAttribute(
      "title",
      `Đồng hồ: ${currentName} (${formatStr})\nClick: Chuyển sang ${nextItem}\nChuột phải: Đổi 12h/24h`,
    );
    btn.setAttribute("aria-label", `Chuyển style đồng hồ từ ${currentName}`);
    btn.innerHTML = getStyleIcon(currentStyle, false);
  }

  // Left click: Cycle styles -> Off -> First style
  btn.addEventListener("click", async () => {
    if (!settings.clock) {
      settings.clock = true;
      settings.clockStyle = CLOCK_STYLES[0].id;
    } else {
      const currentIndex = CLOCK_STYLES.findIndex(
        (s) => s.id === (settings.clockStyle || "minimal"),
      );
      if (currentIndex >= 0 && currentIndex < CLOCK_STYLES.length - 1) {
        settings.clockStyle = CLOCK_STYLES[currentIndex + 1].id;
      } else {
        settings.clock = false;
      }
    }
    renderState();
    await saveSettings(settings);
    onToggle(settings);
  });

  // Right click: Quick toggle 12h / 24h format
  btn.addEventListener("contextmenu", async (e) => {
    e.preventDefault();
    settings.hour12 = !settings.hour12;
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
    if (raw === "" || raw === greetingFor()) {
      settings.customGreeting = "";
    } else {
      settings.customGreeting = raw;
    }
    void saveSettings(settings);
    render();
  });
}
