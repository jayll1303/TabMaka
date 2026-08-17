import type { Settings } from "../storage";
import { saveSettings } from "../storage";
import { mascotList } from "../creatures/index";
import { THEME_PRESETS, applyTheme } from "./theme";

export interface SettingsPanelHandlers {
  onChange: (settings: Settings) => void;
  onCreatureChange: (settings: Settings) => void;
}

/**
 * Settings panel:
 * - Positioned at bottom-left corner
 * - Background color picker: 3 creamy/soothing presets + dark mode + custom color picker
 * - Companion name input
 * - Clock toggle & 12/24h format
 */
export function initSettings(
  root: HTMLElement,
  settings: Settings,
  handlers: SettingsPanelHandlers,
): void {
  const toggle = document.createElement("button");
  toggle.className = "settings-toggle";
  toggle.setAttribute("aria-label", "Settings");
  toggle.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  `;

  const panel = document.createElement("div");
  panel.className = "settings-panel";
  panel.hidden = true;

  const options = mascotList
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");

  const swatchesHtml = THEME_PRESETS.map((p) => {
    const isSelected = (settings.bg || "").toLowerCase() === p.color.toLowerCase();
    return `
      <button
        type="button"
        class="color-swatch ${isSelected ? "active" : ""}"
        data-color="${p.color}"
        title="${p.name}"
        style="background-color: ${p.color};"
        aria-label="${p.name}"
      ></button>
    `;
  }).join("");

  const isCustom = !THEME_PRESETS.some(
    (p) => p.color.toLowerCase() === (settings.bg || "").toLowerCase(),
  );

  panel.innerHTML = `
    <div class="settings-header">Settings</div>
    <div class="row column">
      <span class="row-label">Background</span>
      <div class="color-palette-group">
        ${swatchesHtml}
        <label class="color-swatch custom-picker ${isCustom ? "active" : ""}" title="Custom color" aria-label="Custom color">
          <input type="color" id="set-custom-bg" value="${settings.bg || "#FAF6EE"}" />
          <span class="custom-icon">🎨</span>
        </label>
      </div>
    </div>
    ${
      mascotList.length > 1
        ? `<label class="row">
      <span class="row-label">Companion</span>
      <select id="set-creature">${options}</select>
    </label>`
        : ""
    }
    <label class="row">
      <span class="row-label">Name</span>
      <input type="text" id="set-name" maxlength="24" placeholder="Name your companion" />
    </label>
    <label class="row">
      <span class="row-label">Show clock</span>
      <input type="checkbox" id="set-clock" />
    </label>
    <label class="row">
      <span class="row-label">24-hour time</span>
      <input type="checkbox" id="set-24h" />
    </label>
  `;

  const creatureInput = panel.querySelector<HTMLSelectElement>("#set-creature");
  const nameInput = panel.querySelector<HTMLInputElement>("#set-name")!;
  const clockInput = panel.querySelector<HTMLInputElement>("#set-clock")!;
  const h24Input = panel.querySelector<HTMLInputElement>("#set-24h")!;
  const customBgInput = panel.querySelector<HTMLInputElement>("#set-custom-bg")!;
  const swatchButtons = panel.querySelectorAll<HTMLButtonElement>(".color-swatch[data-color]");
  const customLabel = panel.querySelector<HTMLLabelElement>(".custom-picker")!;

  if (creatureInput) {
    creatureInput.value = settings.creatureId;
    creatureInput.addEventListener("change", () => void commitCreature());
  }
  nameInput.value = settings.name;
  clockInput.checked = settings.clock;
  h24Input.checked = !settings.hour12;

  function updateActiveSwatch(currentColor: string): void {
    let matchedPreset = false;
    swatchButtons.forEach((btn) => {
      const match = (btn.dataset.color || "").toLowerCase() === currentColor.toLowerCase();
      btn.classList.toggle("active", match);
      if (match) matchedPreset = true;
    });
    customLabel.classList.toggle("active", !matchedPreset);
    customBgInput.value = currentColor;
  }

  async function commit(): Promise<void> {
    settings.name = nameInput.value.trim();
    settings.clock = clockInput.checked;
    settings.hour12 = !h24Input.checked;
    await saveSettings(settings);
    handlers.onChange(settings);
  }

  async function setBackground(color: string): Promise<void> {
    settings.bg = color;
    applyTheme(color);
    updateActiveSwatch(color);
    await saveSettings(settings);
    handlers.onChange(settings);
  }

  async function commitCreature(): Promise<void> {
    if (!creatureInput) return;
    settings.creatureId = creatureInput.value;
    await saveSettings(settings);
    handlers.onCreatureChange(settings);
  }

  swatchButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      if (color) void setBackground(color);
    });
  });

  customBgInput.addEventListener("input", (e) => {
    const val = (e.target as HTMLInputElement).value;
    if (val) void setBackground(val);
  });

  nameInput.addEventListener("input", () => void commit());
  clockInput.addEventListener("change", () => void commit());
  h24Input.addEventListener("change", () => void commit());

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.hidden = !panel.hidden;
  });

  // Close panel on outside click
  document.addEventListener("click", (e) => {
    if (!panel.hidden && !panel.contains(e.target as Node) && !toggle.contains(e.target as Node)) {
      panel.hidden = true;
    }
  });

  root.append(toggle, panel);
}
