import "./styles/main.css";
import { creatures, defaultCreatureId } from "./creatures/eel";
import type { CreatureConfig } from "./creatures/types";
import { createSpine, resolveSpine, type Spine } from "./engine/spine";
import { drawCreature, resizeCanvas } from "./engine/render";
import { stepToward } from "./engine/locomotion";
import { Blink } from "./engine/blink";
import { Behavior } from "./engine/behavior";
import { type Vec } from "./engine/vec";
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
  const config: CreatureConfig = creatures[settings.creatureId] ?? creatures[defaultCreatureId];

  let size = resizeCanvas(canvas);
  const center: Vec = { x: size.w / 2, y: size.h / 2 };

  const spine: Spine = createSpine(config, center);
  let head: Vec = { ...center };
  const blink = new Blink();
  const behavior = new Behavior({ width: size.w, height: size.h }, center);

  // Wandering starts if the user never moves the mouse.
  behavior.state = "WANDERING";

  let reduced = prefersReducedMotion();

  function drawFrame(dtScale: number): void {
    const { target, state } = behavior.update(head);
    const speed = state === "FOLLOWING" ? config.followSpeed : config.wanderSpeed;
    head = stepToward(head, target, speed, dtScale);
    resolveSpine(spine, head);
    const eyeOpen = reduced ? 1 : blink.update(dtScale);
    ctx!.clearRect(0, 0, size.w, size.h);
    drawCreature(ctx!, spine, config, target, eyeOpen);
  }

  const loop = new Loop(drawFrame);

  function wake(): void {
    if (reduced) {
      drawFrame(1);
      return;
    }
    if (!loop.isRunning && !document.hidden) loop.start();
  }

  // Initial paint + run.
  if (reduced) {
    resolveSpine(spine, head);
    ctx.clearRect(0, 0, size.w, size.h);
    drawCreature(ctx, spine, config, center, 1);
  } else {
    loop.start();
  }

  window.addEventListener("mousemove", (e) => {
    behavior.notifyMouse({ x: e.clientX, y: e.clientY });
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
    if (reduced) {
      loop.stop();
      drawFrame(1);
    } else {
      wake();
    }
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


