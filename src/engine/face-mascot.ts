import type { FaceConfig } from "../creatures/face-types";
import { type Vec, clamp, lerp, normalize, sub, len } from "./vec";
import { Blink } from "./blink";
import { Mood, type Expression } from "./mood";
import type { Mascot, Size } from "./mascot";
import { ParticleSystem } from "./particles";
import { bodyMetrics } from "./frog-sprites";
import { drawFrog, type FrogView } from "./frog-render";

/**
 * Sprite-Based Kawaii Frog Loaf Mascot.
 *
 * Owns all mascot state and behavior (cursor tracking, mood, jump/entry/typing/
 * vibe animations, drag & drop) and advances it each frame in {@link update}.
 * Rendering lives in `frog-render.ts` (via the read-only {@link FrogView}),
 * the procedural eye in `frog-eye.ts`, and the art catalog in `frog-sprites.ts`.
 *
 * Features:
 * - Expression/mood system: neutral, happy, uwu, surprised, sleepy, tongue, kiss.
 * - Cursor-driven reactions (drag & drop -> surprised, gentle hover -> content,
 *   click -> playful) plus an idle drift into sleepy.
 * - Procedural eye that tracks the cursor, plus gentle idle breathing.
 */
export class FaceMascot implements Mascot, FrogView {
  private cursor: Vec;
  private present = false;
  center: Vec;
  private normPos: Vec;
  private screenSize: Size;
  private readonly blink = new Blink();
  private readonly mood = new Mood();
  look: Vec = { x: 0, y: 0 };
  private desired: Vec = { x: 0, y: 0 };
  time = 0;

  // Dragging state
  dragging = false;
  private dragMoved = false;
  private dragOffset: Vec = { x: 0, y: 0 };

  // Jump animation state
  jumpProgress = -1; // -1 = idle, 0..1 = jumping
  private readonly jumpDuration = 680; // ms
  jumpStart: Vec = { x: 0, y: 0 };
  jumpTarget: Vec = { x: 0, y: 0 };
  facing: 1 | -1 = 1; // 1 = right, -1 = left

  // Entrance jump animation state (hopping into viewport from outside on new tab)
  entryProgress = -1; // -1 = idle, 0..1 = entering
  private readonly entryDuration = 840; // ms
  entryStart: Vec = { x: 0, y: 0 };
  entryTarget: Vec = { x: 0, y: 0 };

  // Landing squash animation state (after drag drop)
  landProgress = -1; // -1 = idle, 0..1 = landing squash
  private readonly landDuration = 180; // ms

  // Vibe / Music listening state
  isVibing = false;
  vibeTime = 0;
  private musicParticleTimer = 0;
  readonly particles = new ParticleSystem();

  // Typing / Hacker laptop state
  isTyping = false;
  private typingTimeout = 0; // ms remaining before returning to loaf
  typingActiveTimer = 0; // ms active tapping window (flutters paws while > 0)
  typingSmashTimer = 0; // ms brief smash timer for Space/Enter (both paws)
  typingAnimClock = 0; // continuous time accumulator for smooth paw cadence
  private typingHandIndex = 0; // 0 = left paw, 1 = right paw
  private readonly typingDuration = 800; // ms

  constructor(
    public readonly config: FaceConfig,
    size: Size,
    normPos?: Vec,
  ) {
    this.screenSize = size;
    this.normPos = normPos ? { ...normPos } : { x: 0.5, y: 0.5 };
    const { bodyW, bodyH } = bodyMetrics(this.config.size);
    const padX = bodyW * 0.5 + 16;
    const padY = bodyH * 0.5 + 16;

    this.center = {
      x: clamp(this.normPos.x * size.w, padX, Math.max(padX, size.w - padX)),
      y: clamp(this.normPos.y * size.h, padY, Math.max(padY, size.h - padY)),
    };
    this.cursor = { ...this.center };

    this.playEntryAnimation();
  }

  /** Current mood expression (satisfies FrogView). */
  currentExpression(): Expression {
    return this.mood.current();
  }

  /** Current blink open amount [0,1] (satisfies FrogView). */
  blinkOpen(): number {
    return this.blink.currentOpen();
  }

  /** Trigger bongo typing animation on keystroke. */
  triggerTyping(key?: string): void {
    if (this.dragging || this.entryProgress >= 0 || this.jumpProgress >= 0)
      return;
    this.isTyping = true;
    this.typingTimeout = this.typingDuration;
    this.typingActiveTimer = 220; // Active paw tapping window

    if (key === " " || key === "Enter") {
      this.typingSmashTimer = 110; // Brief 110ms double-paw smash on Space/Enter
    } else {
      // Toggle hand on each keypress and advance clock for immediate visual snap
      this.typingHandIndex = 1 - this.typingHandIndex;
      this.typingAnimClock = this.typingHandIndex;
    }

    this.mood.notifyActivity();
  }

  /** Check if mascot is currently in typing mode. */
  isTypingActive(): boolean {
    return this.isTyping;
  }

  /** Trigger a dramatic, joyful entrance leap from outside the screen! */
  playEntryAnimation(): void {
    if (this.dragging) return;

    const { bodyW, bodyH } = bodyMetrics(this.config.size);
    const padX = bodyW * 0.5 + 24;
    const padY = bodyH * 0.5 + 24;

    const targetX = clamp(
      this.normPos.x * this.screenSize.w,
      padX,
      Math.max(padX, this.screenSize.w - padX),
    );
    const targetY = clamp(
      this.normPos.y * this.screenSize.h,
      padY,
      Math.max(padY, this.screenSize.h - padY),
    );

    this.entryTarget = { x: targetX, y: targetY };

    // Launch from offscreen bottom corner directed toward target perch
    if (targetX < this.screenSize.w * 0.5) {
      // Enter from bottom-left
      this.entryStart = {
        x: Math.max(-bodyW * 0.8, targetX - 240),
        y: this.screenSize.h + bodyH * 0.75,
      };
      this.facing = 1; // Face right toward landing spot
    } else {
      // Enter from bottom-right
      this.entryStart = {
        x: Math.min(this.screenSize.w + bodyW * 0.8, targetX + 240),
        y: this.screenSize.h + bodyH * 0.75,
      };
      this.facing = -1; // Face left toward landing spot
    }

    this.entryProgress = 0;
    this.jumpProgress = -1;
    this.landProgress = -1;
    this.center = { ...this.entryStart };
  }

  setCursor(pos: Vec): void {
    this.present = true;
    this.cursor = pos;
    this.mood.notifyActivity();

    // Gentle hover near the frog triggers content reactions (happy / uwu).
    const near = len(sub(pos, this.center)) < this.config.size * 1.6;
    if (near && !this.dragging) {
      this.mood.pet();
    }
  }

  /** Trigger a joyful hop to a random nearby position! */
  jump(): void {
    if (this.jumpProgress < 0 && this.entryProgress < 0 && !this.dragging) {
      this.jumpProgress = 0;
      this.landProgress = -1;
      this.mood.poke();

      this.jumpStart = { ...this.center };

      // Safe screen boundaries with padding
      const { bodyW, bodyH } = bodyMetrics(this.config.size);
      const padX = bodyW * 0.5 + 24;
      const padY = bodyH * 0.5 + 24;
      const minX = padX;
      const maxX = Math.max(padX, this.screenSize.w - padX);
      const minY = padY;
      const maxY = Math.max(padY, this.screenSize.h - padY);

      // Random hop distance (100px - 220px)
      const dist = 100 + Math.random() * 120;
      let angle = Math.random() * Math.PI * 2;

      // Turn inward if near screen edges
      if (this.center.x > maxX - 80) {
        angle = Math.PI * 0.65 + Math.random() * Math.PI * 0.7;
      } else if (this.center.x < minX + 80) {
        angle = -Math.PI * 0.35 + Math.random() * Math.PI * 0.7;
      }

      const tx = clamp(this.jumpStart.x + Math.cos(angle) * dist, minX, maxX);
      const ty = clamp(
        this.jumpStart.y + Math.sin(angle) * (dist * 0.6),
        minY,
        maxY,
      );

      this.jumpTarget = { x: tx, y: ty };

      // Face the direction of the hop
      if (tx < this.jumpStart.x - 8) {
        this.facing = -1; // Face left
      } else if (tx > this.jumpStart.x + 8) {
        this.facing = 1; // Face right
      }
    }
  }

  /** Click / tap on the frog. */
  poke(): void {
    this.mood.poke();
    this.jump();
  }

  /** Set listening to music / chill vibe state. */
  setVibing(vibing: boolean): void {
    this.isVibing = vibing;
    if (vibing) {
      this.mood.pet();
    }
  }

  /** Check if mascot is currently in vibe mode. */
  isVibeActive(): boolean {
    return this.isVibing;
  }

  setPointerPresent(present: boolean): void {
    this.present = present;
  }

  setEnv(size: Size): void {
    this.screenSize = size;
    const { bodyW, bodyH } = bodyMetrics(this.config.size);
    const padX = bodyW * 0.5 + 16;
    const padY = bodyH * 0.5 + 16;

    const targetX = clamp(
      this.normPos.x * size.w,
      padX,
      Math.max(padX, size.w - padX),
    );
    const targetY = clamp(
      this.normPos.y * size.h,
      padY,
      Math.max(padY, size.h - padY),
    );

    if (this.entryProgress < 0) {
      this.center = { x: targetX, y: targetY };
    } else {
      this.entryTarget = { x: targetX, y: targetY };
    }
  }

  hitTest(pos: Vec): boolean {
    const { bodyW, bodyH } = bodyMetrics(this.config.size);
    const dx = (pos.x - this.center.x) / (bodyW * 0.52);
    const dy = (pos.y - this.center.y) / (bodyH * 0.52);
    return dx * dx + dy * dy <= 1.0;
  }

  startDrag(pos: Vec): void {
    this.dragging = true;
    this.dragMoved = false;
    this.entryProgress = -1;
    this.jumpProgress = -1;
    this.landProgress = -1;
    this.dragOffset = {
      x: pos.x - this.center.x,
      y: pos.y - this.center.y,
    };
  }

  dragTo(pos: Vec): void {
    if (!this.dragging) return;
    this.dragMoved = true;
    const { bodyW, bodyH } = bodyMetrics(this.config.size);
    const padX = bodyW * 0.5 + 16;
    const padY = bodyH * 0.5 + 16;

    const newX = clamp(
      pos.x - this.dragOffset.x,
      padX,
      Math.max(padX, this.screenSize.w - padX),
    );
    const newY = clamp(
      pos.y - this.dragOffset.y,
      padY,
      Math.max(padY, this.screenSize.h - padY),
    );

    if (newX < this.center.x - 3) this.facing = -1;
    else if (newX > this.center.x + 3) this.facing = 1;

    this.center.x = newX;
    this.center.y = newY;

    this.normPos = {
      x: this.center.x / Math.max(1, this.screenSize.w),
      y: this.center.y / Math.max(1, this.screenSize.h),
    };
    this.mood.startle();
  }

  endDrag(): Vec {
    this.dragging = false;
    if (this.dragMoved) {
      // Trigger landing impact squash on release
      this.landProgress = 0;
    }
    return { ...this.normPos };
  }

  isDragging(): boolean {
    return this.dragging;
  }

  setNormalizedPos(pos: Vec): void {
    this.normPos = { ...pos };
    this.setEnv(this.screenSize);
  }

  update(dtScale: number, reduced: boolean): void {
    let desired: Vec = { x: 0, y: 0 };
    if (this.present) {
      const to = sub(this.cursor, this.center);
      const d = len(to);
      if (d > 1) {
        const dir = normalize(to);
        // Smooth cursor tracking across entire viewport
        const reach = clamp(d / (this.config.size * 3.2), 0, 1);
        desired = { x: dir.x * reach, y: dir.y * reach };
      }
    }
    this.desired = desired;
    const t = reduced ? 1 : clamp(0.22 * dtScale, 0, 1);
    this.look = {
      x: lerp(this.look.x, desired.x, t),
      y: lerp(this.look.y, desired.y, t),
    };

    if (!reduced) {
      this.blink.update(dtScale);
      this.time += dtScale * 0.035;
    }

    // Advance entrance leap animation
    if (this.entryProgress >= 0) {
      const dtMs = dtScale * (1000 / 60);
      this.entryProgress += dtMs / this.entryDuration;
      if (this.entryProgress >= 1) {
        this.entryProgress = -1;
        this.center = { ...this.entryTarget };
        this.normPos = {
          x: this.center.x / Math.max(1, this.screenSize.w),
          y: this.center.y / Math.max(1, this.screenSize.h),
        };
        this.mood.pet(); // Trigger cute happy/uwu face on successful landing!
      }
    }

    // Advance typing animation timeout and active cadence clock
    if (this.isTyping) {
      const dtMs = dtScale * (1000 / 60);
      this.typingTimeout -= dtMs;
      if (this.typingActiveTimer > 0) {
        this.typingActiveTimer -= dtMs;
      }
      if (this.typingSmashTimer > 0) {
        this.typingSmashTimer -= dtMs;
      }
      if (!reduced) {
        this.typingAnimClock += dtScale * 0.28;
      }
      if (this.typingTimeout <= 0) {
        this.isTyping = false;
        this.typingTimeout = 0;
        this.typingActiveTimer = 0;
        this.typingSmashTimer = 0;
      }
    }

    // Advance the jump regardless of reduced motion; a triggered hop must
    // always finish (otherwise it freezes mid-air and blocks isSettled()).
    if (this.jumpProgress >= 0) {
      const dtMs = dtScale * (1000 / 60);
      this.jumpProgress += dtMs / this.jumpDuration;
      if (this.jumpProgress >= 1) {
        this.jumpProgress = -1;
        this.center = { ...this.jumpTarget };
        this.normPos = {
          x: this.center.x / Math.max(1, this.screenSize.w),
          y: this.center.y / Math.max(1, this.screenSize.h),
        };
      }
    }

    if (this.landProgress >= 0) {
      const dtMs = dtScale * (1000 / 60);
      this.landProgress += dtMs / this.landDuration;
      if (this.landProgress >= 1) {
        this.landProgress = -1;
      }
    }

    if (
      this.isVibing &&
      !this.dragging &&
      this.jumpProgress < 0 &&
      this.entryProgress < 0
    ) {
      const dtMs = dtScale * (1000 / 60);
      this.vibeTime += dtMs;
      this.musicParticleTimer += dtMs;
      if (this.musicParticleTimer >= 600) {
        this.musicParticleTimer = 0;
        const { bodyW, bodyH } = bodyMetrics(this.config.size);
        const spawnX = this.center.x + (Math.random() - 0.5) * bodyW * 0.55;
        const spawnY = this.center.y - bodyH * 0.42;
        this.particles.emitMusicNote({ x: spawnX, y: spawnY });
      }
    }
    this.particles.update(dtScale);
  }

  draw(ctx: CanvasRenderingContext2D, _size: Size): void {
    void _size;
    drawFrog(ctx, this);
  }

  isSettled(): boolean {
    return (
      !this.dragging &&
      !this.isTyping &&
      this.entryProgress < 0 &&
      this.jumpProgress < 0 &&
      this.landProgress < 0 &&
      !this.isVibing &&
      !this.mood.isBusy() &&
      this.mood.current() === "sleepy" &&
      Math.abs(this.look.x - this.desired.x) < 0.01 &&
      Math.abs(this.look.y - this.desired.y) < 0.01
    );
  }
}
