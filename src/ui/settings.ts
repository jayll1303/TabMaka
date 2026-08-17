import type { Settings } from "../storage";
import { saveSettings } from "../storage";
import { mascotList } from "../creatures/index";

export interface SettingsPanelHandlers {
  onChange: (settings: Settings) => void;
  onCreatureChange: (settings: Settings) => void;
}

/**
 * Minimal settings panel: mascot picker, clock toggle, 12/24h, creature name.
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

  const options = mascotList
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");

  panel.innerHTML = `
    ${
      mascotList.length > 1
        ? `<label class="row">
      <span>Companion</span>
      <select id="set-creature">${options}</select>
    </label>`
        : ""
    }
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

  const creatureInput = panel.querySelector<HTMLSelectElement>("#set-creature");
  const nameInput = panel.querySelector<HTMLInputElement>("#set-name")!;
  const clockInput = panel.querySelector<HTMLInputElement>("#set-clock")!;
  const h24Input = panel.querySelector<HTMLInputElement>("#set-24h")!;

  if (creatureInput) {
    creatureInput.value = settings.creatureId;
    creatureInput.addEventListener("change", () => void commitCreature());
  }
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

  async function commitCreature(): Promise<void> {
    if (!creatureInput) return;
    settings.creatureId = creatureInput.value;
    await saveSettings(settings);
    handlers.onCreatureChange(settings);
  }
  nameInput.addEventListener("input", () => void commit());
  clockInput.addEventListener("change", () => void commit());
  h24Input.addEventListener("change", () => void commit());

  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
  });

  root.append(toggle, panel);
}

