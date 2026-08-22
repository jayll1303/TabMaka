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
import { loadSettings, saveSettings } from "./storage";
import { initClock, initGreeting, initClockToggle } from "./ui/clock";
import { applyTheme, DEFAULT_BG, initAmbientPalette } from "./ui/theme";
import { initDiscoToggle } from "./ui/disco";
import { initBubble, type BubbleController } from "./ui/bubble";
import { AudioDetector } from "./engine/audio-detector";
import { isEditableTarget } from "./ui/editable";

const canvas = document.getElementById("scene") as HTMLCanvasElement | null;
const clockEl = document.getElementById("clock");
const greetingEl = document.getElementById("greeting");
const clockControlEl = document.getElementById("clock-control");
const discoControlEl = document.getElementById("disco-control");
const ambientPaletteEl = document.getElementById("ambient-palette");
const bubbleEl = document.getElementById("mascot-bubble");
const onboardingEl = document.getElementById("onboarding");

async function main(): Promise<void> {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const settings = await loadSettings();
  applyTheme(settings.bg || DEFAULT_BG);
  let size = resizeCanvas(canvas);
  let reduced = prefersReducedMotion();

  const mascot: Mascot = createMascot(
    settings.creatureId ?? defaultMascotId,
    size,
    reduced,
    { x: settings.posX ?? 0.5, y: settings.posY ?? 0.5 },
  );
  mascot.setDiscoActive?.(!!settings.disco);

  let bubbleController: BubbleController | null = null;
  if (bubbleEl) {
    bubbleController = initBubble(bubbleEl, mascot, () => size);
  }

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
  loop.start();

  let pointerDownPos: { x: number; y: number } | null = null;
  let hasDragged = false;

  window.addEventListener("pointermove", (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    mascot.setCursor(pos);

    if (mascot.isDragging?.()) {
      if (pointerDownPos && !hasDragged) {
        const d = Math.hypot(
          pos.x - pointerDownPos.x,
          pos.y - pointerDownPos.y,
        );
        if (d > 8) hasDragged = true;
      }
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
      e.preventDefault();
      pointerDownPos = pos;
      hasDragged = false;
      mascot.startDrag?.(pos);
      bubbleController?.hide();
      document.body.style.cursor = "grabbing";
      wake();
    } else {
      // Clicked on empty canvas or stage: spawn a fly snack for Maka!
      const target = e.target as HTMLElement | null;
      if (
        !isEditableTarget(target, document.activeElement) &&
        !target?.closest("#clock-control") &&
        !target?.closest("#disco-control") &&
        !target?.closest("#ambient-palette") &&
        !target?.closest("#mascot-bubble") &&
        !target?.closest("#onboarding")
      ) {
        mascot.spawnFly?.(pos);
        if (bubbleController?.isVisible()) {
          bubbleController.react("Yay!");
        }
        wake();
      }
    }
  });

  window.addEventListener("pointerup", (e) => {
    if (mascot.isDragging?.()) {
      const newPos = mascot.endDrag?.();
      if (!hasDragged) {
        mascot.poke?.();
      }
      if (newPos) {
        settings.posX = newPos.x;
        settings.posY = newPos.y;
        void saveSettings(settings);
      }
      const isOver = mascot.hitTest?.({ x: e.clientX, y: e.clientY }) ?? false;
      document.body.style.cursor = isOver ? "grab" : "";
      pointerDownPos = null;
      hasDragged = false;
      bubbleController?.updatePosition();
      wake();
    }
  });

  window.addEventListener("dblclick", (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    if (mascot.hitTest?.(pos)) {
      mascot.jump?.();
      if (bubbleController?.isVisible()) {
        bubbleController.react("Wheee!");
      }
      wake();
    }
  });

  let discoController: ReturnType<typeof initDiscoToggle> | null = null;

  const audioDetector = new AudioDetector((isAudible) => {
    mascot.setVibing?.(isAudible);
    mascot.setDiscoActive?.(isAudible && !!settings.disco);
    discoController?.updateVibeState(isAudible);
    wake();
  });

  // Expose to window for dev convenience
  if (typeof window !== "undefined") {
    (
      window as unknown as { audioDetector?: AudioDetector; mascot?: Mascot }
    ).audioDetector = audioDetector;
    (
      window as unknown as { audioDetector?: AudioDetector; mascot?: Mascot }
    ).mascot = mascot;
  }

  window.addEventListener("keydown", (e) => {
    // Ignore pure modifier keys alone (Shift, Ctrl, Alt, Meta) so paws only tap on real keys
    if (
      e.key === "Shift" ||
      e.key === "Control" ||
      e.key === "Alt" ||
      e.key === "Meta"
    ) {
      return;
    }

    // Trigger bongo typing animation on keystroke!
    mascot.triggerTyping?.(e.key);
    if (bubbleController?.isVisible()) {
      bubbleController.react("Yay!");
    }
    wake();
  });

  window.addEventListener("pointercancel", () => {
    if (mascot.isDragging?.()) {
      mascot.endDrag?.();
      document.body.style.cursor = "";
      pointerDownPos = null;
      hasDragged = false;
      bubbleController?.updatePosition();
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
    bubbleController?.updatePosition();
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

  // Shell: clock, greeting, clock control, disco control, ambient palette.
  if (clockEl) initClock(clockEl, settings);
  if (greetingEl) initGreeting(greetingEl, settings);
  if (clockControlEl && clockEl) {
    initClockToggle(clockControlEl, settings, (s) => {
      initClock(clockEl, s);
    });
  }
  if (discoControlEl) {
    discoController = initDiscoToggle(
      discoControlEl,
      settings,
      () => audioDetector.getStatus(),
      (s) => {
        mascot.setDiscoActive?.(audioDetector.getStatus() && !!s.disco);
        wake();
      },
    );
  }
  if (ambientPaletteEl) {
    initAmbientPalette(ambientPaletteEl, settings, () => {});
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
