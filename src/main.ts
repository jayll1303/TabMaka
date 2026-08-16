import "./styles/main.css";
import { defaultMascotId } from "./creatures/index";
import { createMascot } from "./engine/mascot-factory";
import type { Mascot } from "./engine/mascot";
import { resizeCanvas } from "./engine/render";
import { Loop } from "./perf/loop";
import { onVisibilityChange } from "./perf/visibility";
import {
  prefersReducedMotion,
  onReducedMotionChange,
} from "./perf/reduced-motion";
import { loadSettings, saveSettings, type Settings } from "./storage";
import { initClock, greetingFor } from "./ui/clock";
import { initSettings } from "./ui/settings";

const canvas = document.getElementById("scene") as HTMLCanvasElement | null;
const clockEl = document.getElementById("clock");
const greetingEl = document.getElementById("greeting");
const settingsRoot = document.getElementById("settings-root");
const onboardingEl = document.getElementById("onboarding");

async function main(): Promise<void> {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const settings = await loadSettings();
  let size = resizeCanvas(canvas);
  let reduced = prefersReducedMotion();

  let mascot: Mascot = createMascot(
    settings.creatureId ?? defaultMascotId,
    size,
    reduced,
  );

  function drawFrame(dtScale: number): void {
    mascot.update(dtScale, reduced);
    ctx!.clearRect(0, 0, size.w, size.h);
    mascot.draw(ctx!, size);

    // Reduced motion: once settled, stop the loop (no perpetual animation).
    if (reduced && mascot.isSettled()) {
      loop.stop();
    }
  }

  const loop = new Loop(drawFrame);

  function wake(): void {
    if (!loop.isRunning && !document.hidden) loop.start();
  }

  // Initial paint + run.
  drawFrame(1);
  if (!reduced) loop.start();

  window.addEventListener("mousemove", (e) => {
    mascot.setCursor({ x: e.clientX, y: e.clientY });
    wake();
  });

  document.addEventListener("mouseleave", () => {
    mascot.setPointerPresent(false);
  });
  document.addEventListener("mouseenter", () => {
    mascot.setPointerPresent(true);
    wake();
  });

  window.addEventListener("resize", () => {
    size = resizeCanvas(canvas);
    mascot.setEnv(size);
    if (reduced) drawFrame(1);
  });

  onVisibilityChange(
    () => loop.stop(),
    () => wake(),
  );

  onReducedMotionChange((r) => {
    reduced = r;
    wake();
  });

  // Shell: clock, greeting, settings.
  if (clockEl) initClock(clockEl, settings);
  if (greetingEl) {
    greetingEl.textContent = settings.name
      ? `${greetingFor()}, ${settings.name}`
      : greetingFor();
  }
  if (settingsRoot) {
    initSettings(settingsRoot, settings, {
      onChange: (s: Settings) => {
        if (clockEl) initClock(clockEl, s);
        if (greetingEl) {
          greetingEl.textContent = s.name
            ? `${greetingFor()}, ${s.name}`
            : greetingFor();
        }
      },
      onCreatureChange: (s: Settings) => {
        mascot = createMascot(s.creatureId, size, reduced);
        drawFrame(1);
        wake();
      },
    });
  }

  // First-run onboarding.
  if (onboardingEl && !settings.seenOnboarding) {
    onboardingEl.hidden = false;
    onboardingEl.addEventListener(
      "click",
      () => {
        onboardingEl.hidden = true;
        settings.seenOnboarding = true;
        void saveSettings(settings);
      },
      { once: true },
    );
  }
}

void main();

