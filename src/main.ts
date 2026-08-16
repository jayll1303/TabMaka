import "./styles/main.css";
import { creatures, defaultCreatureId } from "./creatures/index";
import type { CreatureConfig } from "./creatures/types";
import { createSpine, resolveSpine, type Spine } from "./engine/spine";
import { drawCreature, resizeCanvas } from "./engine/render";
import { stepToward } from "./engine/locomotion";
import { Blink } from "./engine/blink";
import { Behavior } from "./engine/behavior";
import { type Vec, dist } from "./engine/vec";
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
  let config: CreatureConfig =
    creatures[settings.creatureId] ?? creatures[defaultCreatureId];

  let size = resizeCanvas(canvas);
  const center: Vec = { x: size.w / 2, y: size.h / 2 };

  let spine: Spine = createSpine(config, center);
  let head: Vec = { ...center };
  const blink = new Blink();
  const behavior = new Behavior({ width: size.w, height: size.h }, center);

  let reduced = prefersReducedMotion();

  // Motion allowed: idly wander until the cursor appears.
  // Reduced motion: sit still until the cursor moves.
  behavior.state = reduced ? "RESTING" : "WANDERING";

  function drawFrame(dtScale: number): void {
    const { target, state } = behavior.update(head);
    const speed =
      state === "FOLLOWING" ? config.followSpeed : config.wanderSpeed;
    head = stepToward(head, target, speed, dtScale);
    resolveSpine(spine, head);
    const eyeOpen = reduced ? 1 : blink.update(dtScale);
    ctx!.clearRect(0, 0, size.w, size.h);
    drawCreature(ctx!, spine, config, target, eyeOpen);

    // Reduced motion: glide to the cursor, then stop (no perpetual animation).
    if (reduced && dist(head, target) < 0.5) {
      loop.stop();
    }
  }

  const loop = new Loop(drawFrame);

  function wake(): void {
    if (!loop.isRunning && !document.hidden) loop.start();
  }

  // Initial paint.
  resolveSpine(spine, head);
  ctx.clearRect(0, 0, size.w, size.h);
  drawCreature(ctx, spine, config, head, 1);
  if (!reduced) loop.start();

  window.addEventListener("mousemove", (e) => {
    behavior.setPointerPresent(true);
    behavior.notifyMouse({ x: e.clientX, y: e.clientY });
    wake();
  });

  // When the cursor leaves the page, allow the creature to wander again.
  document.addEventListener("mouseleave", () => {
    behavior.setPointerPresent(false);
  });
  document.addEventListener("mouseenter", () => {
    behavior.setPointerPresent(true);
    wake();
  });

  window.addEventListener("resize", () => {
    size = resizeCanvas(canvas);
    behavior.setEnv({ width: size.w, height: size.h });
    if (reduced) drawFrame(1);
  });

  onVisibilityChange(
    () => loop.stop(),
    () => wake(),
  );

  onReducedMotionChange((r) => {
    reduced = r;
    if (!reduced) behavior.state = "WANDERING";
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
        config = creatures[s.creatureId] ?? creatures[defaultCreatureId];
        spine = createSpine(config, head);
        wake();
        if (reduced) drawFrame(1);
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




