import type { Settings } from "../storage";
import { saveSettings } from "../storage";

export interface SettingsPanelHandlers {
  onChange: (settings: Settings) => void;
}

/**
 * Minimal settings panel: clock toggle, 12/24h, creature name.
 * Kept intentionally tiny to respect the single-purpose scope.
 */
export function initSettings(
  root: HTMLElement,
  settings: Settings,
  handlers: SettingsPanelHandlers,
): void {
  const toggle = document.createElement("button");
  toggle.className = "settings-toggle";
  toggle.setAttribute("aria-label", "Settings");
  toggle.textContent = "\u2699";

  const panel = document.createElement("div");
  panel.className = "settings-panel";
  panel.hidden = true;

  panel.innerHTML = `
    <label class="row">
      <span>Name</span>
      <input type="text" id="set-name" maxlength="24" placeholder="Name your companion" />
    </label>
    <label class="row">
      <span>Show clock</span>
      <input type="checkbox" id="set-clock" />
    </label>
    <label class="row">
      <span>24-hour time</span>
      <input type="checkbox" id="set-24h" />
    </label>
  `;

  const nameInput = panel.querySelector<HTMLInputElement>("#set-name")!;
  const clockInput = panel.querySelector<HTMLInputElement>("#set-clock")!;
  const h24Input = panel.querySelector<HTMLInputElement>("#set-24h")!;

  nameInput.value = settings.name;
  clockInput.checked = settings.clock;
  h24Input.checked = !settings.hour12;

  async function commit(): Promise<void> {
    settings.name = nameInput.value.trim();
    settings.clock = clockInput.checked;
    settings.hour12 = !h24Input.checked;
    await saveSettings(settings);
    handlers.onChange(settings);
  }

  nameInput.addEventListener("input", () => void commit());
  clockInput.addEventListener("change", () => void commit());
  h24Input.addEventListener("change", () => void commit());

  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
  });

  root.append(toggle, panel);
}
