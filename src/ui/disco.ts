import type { Settings } from "../storage";
import { saveSettings } from "../storage";

/**
 * Apply or remove the disco mode class on document.body.
 */
export function applyDiscoMode(active: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("disco-mode", active);
}

export interface DiscoController {
  updateVibeState: (isVibing: boolean) => void;
}

/**
 * Initialize Disco mode toggle button in top-right corner.
 * Only enabled when the mascot is currently in Vibe Mode (e.g. music playing in tabs).
 * Click: Toggle Disco Bar Light Mode on / off.
 */
export function initDiscoToggle(
  root: HTMLElement,
  settings: Settings,
  isVibing: () => boolean,
  onToggle: (s: Settings) => void,
): DiscoController {
  const btn = document.createElement("button");
  btn.className = "disco-toggle-btn";
  btn.type = "button";

  const getDiscoIcon = (isActive: boolean): string => {
    if (!isActive) {
      return `
        <svg class="disco-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <!-- Hanging string -->
          <line x1="12" y1="2" x2="12" y2="4" />
          <!-- Disco sphere outline -->
          <circle cx="12" cy="12" r="8" />
          <!-- Horizontal equator -->
          <line x1="4" y1="12" x2="20" y2="12" />
          <!-- Vertical curved grid lines -->
          <path d="M12 4a12 12 0 0 1 0 16" />
          <path d="M12 4a12 12 0 0 0 0 16" />
          <!-- Horizontal latitudinal curves -->
          <path d="M6.5 7.5a11 11 0 0 1 11 0" />
          <path d="M6.5 16.5a11 11 0 0 0 11 0" />
        </svg>
      `;
    }
    return `
      <svg class="disco-icon active" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <!-- Hanging string -->
        <line x1="12" y1="2" x2="12" y2="4" />
        <!-- Disco sphere -->
        <circle cx="12" cy="12" r="8" />
        <!-- Grid facets -->
        <line x1="4" y1="12" x2="20" y2="12" />
        <path d="M12 4a12 12 0 0 1 0 16" />
        <path d="M12 4a12 12 0 0 0 0 16" />
        <path d="M6.5 7.5a11 11 0 0 1 11 0" />
        <path d="M6.5 16.5a11 11 0 0 0 11 0" />
        <!-- Disco sparkles -->
        <polygon points="20,3 21,5 23,6 21,7 20,9 19,7 17,6 19,5" fill="currentColor" stroke="none" />
        <polygon points="3,18 3.8,19.5 5.5,20 3.8,20.5 3,22 2.2,20.5 0.5,20 2.2,19.5" fill="currentColor" stroke="none" />
      </svg>
    `;
  };

  function renderState(): void {
    const vibing = isVibing();
    const isActive = vibing && !!settings.disco;

    applyDiscoMode(isActive);

    if (!vibing) {
      root.style.display = "none";
      btn.className = "disco-toggle-btn mode-hidden";
      btn.style.display = "none";
      btn.setAttribute("aria-hidden", "true");
      btn.innerHTML = "";
      return;
    }

    root.style.display = "";
    btn.style.display = "";
    if (typeof btn.removeAttribute === "function") {
      btn.removeAttribute("aria-hidden");
      btn.removeAttribute("aria-disabled");
    }
    btn.className = `disco-toggle-btn ${isActive ? "active" : "mode-off"}`;

    if (isActive) {
      btn.setAttribute(
        "title",
        "Disco Mode: Đang bật (Xập xình đèn Bar • Click để tắt)",
      );
      btn.setAttribute("aria-label", "Tắt Disco Mode");
    } else {
      btn.setAttribute(
        "title",
        "Disco Mode: Đang tắt (Click để bật chế độ đèn Bar xập xình)",
      );
      btn.setAttribute("aria-label", "Bật Disco Mode");
    }
    btn.innerHTML = getDiscoIcon(isActive);
  }

  btn.addEventListener("click", () => {
    if (!isVibing()) return;
    settings.disco = !settings.disco;
    renderState();
    void saveSettings(settings);
    onToggle(settings);
  });

  renderState();
  root.replaceChildren(btn);

  return {
    updateVibeState: (_vibing: boolean) => {
      renderState();
    },
  };
}
