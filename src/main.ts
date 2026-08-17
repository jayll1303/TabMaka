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
import { initClock, initGreeting } from "./ui/clock";
import { initSettings } from "./ui/settings";
import { applyTheme, DEFAULT_BG } from "./ui/theme";

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
  applyTheme(settings.bg || DEFAULT_BG);
  let size = resizeCanvas(canvas);
  let reduced = prefersReducedMotion();

  let mascot: Mascot = createMascot(
    settings.creatureId ?? defaultMascotId,
    size,
    reduced,
    { x: settings.posX ?? 0.5, y: settings.posY ?? 0.5 },
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

  window.addEventListener("pointermove", (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    mascot.setCursor(pos);

    if (mascot.isDragging?.()) {
      mascot.dragTo?.(pos);
      document.body.style.cursor = "grabbing";
    } else {
      const isOver = mascot.hitTest?.(pos) ?? false;
      document.body.style.cursor = isOver ? "grab" : "";
    }
    wake();
  });

  window.addEventListener("pointerdown", (e) => {
    // Only primary mouse button (left-click)
    if (e.button !== 0) return;
    const pos = { x: e.clientX, y: e.clientY };
    if (mascot.hitTest?.(pos)) {
      mascot.startDrag?.(pos);
      document.body.style.cursor = "grabbing";
      wake();
    }
  });

  window.addEventListener("pointerup", (e) => {
    if (mascot.isDragging?.()) {
      const newPos = mascot.endDrag?.();
      if (newPos) {
        settings.posX = newPos.x;
        settings.posY = newPos.y;
        void saveSettings(settings);
      }
      const isOver = mascot.hitTest?.({ x: e.clientX, y: e.clientY }) ?? false;
      document.body.style.cursor = isOver ? "grab" : "";
      wake();
    }
  });

  window.addEventListener("pointercancel", () => {
    if (mascot.isDragging?.()) {
      mascot.endDrag?.();
      document.body.style.cursor = "";
      wake();
    }
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
  if (greetingEl) initGreeting(greetingEl, settings);
  if (settingsRoot) {
    initSettings(settingsRoot, settings, {
      onChange: (s: Settings) => {
        if (clockEl) initClock(clockEl, s);
      },
      onCreatureChange: (s: Settings) => {
        mascot = createMascot(s.creatureId, size, reduced, {
          x: s.posX ?? 0.5,
          y: s.posY ?? 0.5,
        });
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
