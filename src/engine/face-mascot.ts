import type { FaceConfig } from "../creatures/face-types";
import { type Vec, clamp, lerp, normalize, sub, len } from "./vec";
import { Blink } from "./blink";
import { Mood, type Expression } from "./mood";
import type { Mascot, Size } from "./mascot";
import { ParticleSystem } from "./particles";
import { Fly } from "./fly";
import { DiscoStage } from "./disco-stage";

function createImage(src: string): HTMLImageElement {
  if (typeof Image !== "undefined") {
    const img = new Image();
    img.src = src;
    return img;
  }
  return {
    src,
    complete: false,
    naturalWidth: 0,
    naturalHeight: 0,
  } as HTMLImageElement;
}

// Load body sprite. The baked-in black eye bead has been removed from the
// source PNG (see scripts/clean-frog-eye.mjs); the eye is drawn entirely in
// code so the mood system has full control (blink, wide, sleepy, closed, ...).
const bodyImg = createImage("./sprites/frog/frog_body.png");

// Natural eye geometry on the 566x450 body sprite.
const EYE_NAT = { x: 313.3, y: 85.8, r: 38.8 };

// Natural mouth anchor on the 566x450 body sprite (idle + tongue origin).
const MOUTH_NAT = { x: 405, y: 100 };

// Body geometry: rendered width is size * scale, height keeps sprite aspect.
const BODY_WIDTH_SCALE = 2.2;
const BODY_ASPECT = 450 / 566;

// Milliseconds per frame at the reference 60fps cadence.
const MS_PER_FRAME = 1000 / 60;

/** Jump animation keyframe specification. */
interface JumpFrame {
  img: HTMLImageElement;
  natW: number;
  natH: number;
  eyeAnchor: { x: number; y: number; r: number };
  mouthAnchor: { x: number; y: number };
}

function loadJumpFrame(
  file: string,
  natW: number,
  natH: number,
  eyeAnchor: { x: number; y: number; r: number },
  mouthAnchor: { x: number; y: number },
): JumpFrame {
  const img = createImage(`./sprites/frog/jump/${file}`);
  return { img, natW, natH, eyeAnchor, mouthAnchor };
}

const jumpFrames: JumpFrame[] = [
  // 0: Crouch / Anticipation (637x329)
  loadJumpFrame(
    "jump_1_crouch.png",
    637,
    329,
    { x: 370, y: 110, r: 36 },
    { x: 440, y: 155 },
  ),
  // 1: Launch / Takeoff (571x511)
  loadJumpFrame(
    "jump_2_launch.png",
    571,
    511,
    { x: 465, y: 125, r: 34 },
    { x: 475, y: 190 },
  ),
  // 2: Apex Peak Flight (473x397)
  loadJumpFrame(
    "jump_3_apex.png",
    473,
    397,
    { x: 305, y: 85, r: 32 },
    { x: 340, y: 140 },
  ),
  // 3: Land Impact / Squash (647x304)
  loadJumpFrame(
    "jump_4_land.png",
    647,
    304,
    { x: 410, y: 105, r: 35 },
    { x: 475, y: 150 },
  ),
];

/** Vibe / Music chill headphone animation keyframe specification. */
interface VibeFrame {
  img: HTMLImageElement;
  natW: number;
  natH: number;
  eyeAnchor: { x: number; y: number; r: number };
  mouthAnchor: { x: number; y: number };
}

function loadVibeFrame(
  file: string,
  natW: number,
  natH: number,
  eyeAnchor: { x: number; y: number; r: number },
  mouthAnchor: { x: number; y: number },
): VibeFrame {
  const img = createImage(`./sprites/frog/vibe/${file}`);
  return { img, natW, natH, eyeAnchor, mouthAnchor };
}

const vibeFrames: VibeFrame[] = [
  // 0: Sway / relaxed groove with headphones (529x521)
  loadVibeFrame(
    "vibe_1_sway.png",
    529,
    521,
    { x: 315, y: 140, r: 34 },
    { x: 370, y: 230 },
  ),
  // 1: Up / bouncy stretch groove with headphones (501x487)
  loadVibeFrame(
    "vibe_2_up.png",
    501,
    487,
    { x: 280, y: 130, r: 32 },
    { x: 325, y: 205 },
  ),
];

/** Typing / Hacker laptop animation keyframe specification. */
interface TypingFrame {
  img: HTMLImageElement;
  natW: number;
  natH: number;
  mouthAnchor: { x: number; y: number };
  frogCenterX: number;
  frogBottomY: number;
  frogHeight: number;
}

function loadTypingFrame(
  file: string,
  natW: number,
  natH: number,
  mouthAnchor: { x: number; y: number },
  frogCenterX: number,
  frogBottomY: number,
  frogHeight: number,
): TypingFrame {
  const img = createImage(`./sprites/frog/typing/${file}`);
  return {
    img,
    natW,
    natH,
    mouthAnchor,
    frogCenterX,
    frogBottomY,
    frogHeight,
  };
}

const typingFrames: TypingFrame[] = [
  // 0: Idle at laptop (1298x921)
  loadTypingFrame(
    "type_0_idle.png",
    1298,
    921,
    { x: 620, y: 420 },
    550.0,
    790.0,
    738,
  ),
  // 1: Left paw down, right paw up (1295x933)
  loadTypingFrame(
    "type_1_left.png",
    1295,
    933,
    { x: 620, y: 420 },
    572.5,
    798.0,
    745,
  ),
  // 2: Right paw down, left paw up (1300x930)
  loadTypingFrame(
    "type_2_right.png",
    1300,
    930,
    { x: 620, y: 420 },
    551.0,
    800.0,
    750,
  ),
  // 3: Both paws up frenzy (1297x951)
  loadTypingFrame(
    "type_3_both.png",
    1297,
    951,
    { x: 620, y: 420 },
    550.5,
    815.0,
    768,
  ),
];

/** A mouth sprite with its natural pixel dimensions and a target width. */
interface MouthSprite {
  img: HTMLImageElement;
  natW: number;
  natH: number;
  /** Rendered width as a fraction of the body width. */
  widthFactor: number;
}

function mouth(
  file: string,
  natW: number,
  natH: number,
  widthFactor: number,
): MouthSprite {
  const img = createImage(`./sprites/frog/${file}`);
  return { img, natW, natH, widthFactor };
}

// One sprite per expression, keeping each drawing's own aspect ratio.
const mouths: Record<Expression, MouthSprite> = {
  neutral: mouth("mouth_normal.png", 157, 87, 0.14),
  happy: mouth("mouth_happy.png", 140, 105, 0.16),
  uwu: mouth("mouth_uwu.png", 123, 50, 0.15),
  surprised: mouth("mouth_surprised.png", 90, 92, 0.095),
  sleepy: mouth("mouth_straight.png", 113, 32, 0.12),
  tongue: mouth("mouth_tongue.png", 135, 71, 0.15),
  kiss: mouth("mouth_kiss.png", 79, 80, 0.085),
};

/** How each expression drives the eye. */
type EyeMode = "blink" | "wide" | "droop" | "shut";
const eyeModeFor: Record<Expression, EyeMode> = {
  neutral: "blink",
  happy: "blink",
  uwu: "shut",
  surprised: "wide",
  sleepy: "shut",
  tongue: "blink",
  kiss: "shut",
};

// Horizontal eye size relative to the baked bead, per expression.
const eyeWidthFactor: Record<Expression, number> = {
  neutral: 1,
  happy: 1,
  uwu: 1,
  surprised: 1.18,
  sleepy: 1,
  tongue: 1,
  kiss: 1,
};

/**
 * Sprite-Based Kawaii Frog Loaf Mascot.
 */
export class FaceMascot implements Mascot {
  private cursor: Vec;
  private present = false;
  private center: Vec;
  private normPos: Vec;
  private screenSize: Size;
  private readonly blink = new Blink();
  private readonly mood = new Mood();
  private look: Vec = { x: 0, y: 0 };
  private desired: Vec = { x: 0, y: 0 };
  private time = 0;

  // Dragging state
  private dragging = false;
  private dragMoved = false;
  private dragOffset: Vec = { x: 0, y: 0 };

  // Jump animation state
  private jumpProgress = -1; // -1 = idle, 0..1 = jumping
  private readonly jumpDuration = 680; // ms
  private jumpStart: Vec = { x: 0, y: 0 };
  private jumpTarget: Vec = { x: 0, y: 0 };
  private facing: 1 | -1 = 1; // 1 = right, -1 = left

  // Entrance jump animation state (hopping into viewport from outside on new tab)
  private entryProgress = -1; // -1 = idle, 0..1 = entering
  private readonly entryDuration = 840; // ms
  private entryStart: Vec = { x: 0, y: 0 };
  private entryTarget: Vec = { x: 0, y: 0 };

  // Landing squash animation state (after drag drop)
  private landProgress = -1; // -1 = idle, 0..1 = landing squash
  private readonly landDuration = 180; // ms

  // Vibe / Music listening state
  private isVibing = false;
  private vibeTime = 0;
  private musicParticleTimer = 0;
  private readonly particles = new ParticleSystem();

  // Disco Stage state
  private isDisco = false;
  private readonly discoStage = new DiscoStage();

  // Fly snack interaction
  private activeFly: Fly | null = null;
  private tongueProgress = -1; // -1 = idle, 0..1 = shooting & retracting
  private readonly tongueDuration = 240; // ms
  private tongueTarget: Vec = { x: 0, y: 0 };

  // Typing / Hacker laptop state
  private isTyping = false;
  private typingTimeout = 0; // ms remaining before returning to loaf
  private typingActiveTimer = 0; // ms active tapping window (flutters paws while > 0)
  private typingSmashTimer = 0; // ms brief smash timer for Space/Enter (both paws)
  private typingAnimClock = 0; // continuous time accumulator for smooth paw cadence
  private typingHandIndex = 0; // 0 = left paw, 1 = right paw
  private readonly typingDuration = 800; // ms

  private entryCallbacks: Array<() => void> = [];
  private hasEntryCompleted = false;

  constructor(
    private config: FaceConfig,
    size: Size,
    normPos?: Vec,
  ) {
    this.screenSize = size;
    this.normPos = normPos ? { ...normPos } : { x: 0.5, y: 0.5 };

    this.center = this.clampCenter(this.normPos, size, 16);
    this.cursor = { ...this.center };

    this.playEntryAnimation();
  }

  /** Rendered body width/height derived from the configured size. */
  private get bodyDims(): { w: number; h: number } {
    const w = this.config.size * BODY_WIDTH_SCALE;
    return { w, h: w * BODY_ASPECT };
  }

  /**
   * Clamp a normalized position to on-screen bounds for the given size,
   * keeping the body fully visible with `padExtra` px of breathing room.
   */
  private clampCenter(norm: Vec, size: Size, padExtra: number): Vec {
    const { w: bodyW, h: bodyH } = this.bodyDims;
    const padX = bodyW * 0.5 + padExtra;
    const padY = bodyH * 0.5 + padExtra;
    return {
      x: clamp(norm.x * size.w, padX, Math.max(padX, size.w - padX)),
      y: clamp(norm.y * size.h, padY, Math.max(padY, size.h - padY)),
    };
  }

  /** True while a finite keyframe animation owns the body pose. */
  private isBusyWithKeyframe(): boolean {
    return this.dragging || this.entryProgress >= 0 || this.jumpProgress >= 0;
  }

  /** Trigger bongo typing animation on keystroke. */
  triggerTyping(key?: string): void {
    if (this.isBusyWithKeyframe()) return;
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

  /** Spawn a fly snack for Maka to catch! */
  spawnFly(pos: Vec): void {
    if (this.dragging || this.entryProgress >= 0) return;
    if (this.activeFly && this.activeFly.state === "buzzing") {
      this.activeFly.anchor = { ...pos };
      return;
    }
    this.activeFly = new Fly(pos);
    this.mood.notifyActivity();
  }

  /** Check if a fly snack is currently active. */
  hasActiveFly(): boolean {
    return this.activeFly !== null && this.activeFly.state !== "eaten";
  }

  /** Trigger a dramatic, joyful entrance leap from outside the screen! */
  playEntryAnimation(): void {
    if (this.dragging) return;

    const { w: bodyW, h: bodyH } = this.bodyDims;
    const { x: targetX, y: targetY } = this.clampCenter(
      this.normPos,
      this.screenSize,
      24,
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
      const { w: bodyW, h: bodyH } = this.bodyDims;
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

  /** Set or toggle disco club stage effect. */
  setDiscoActive(active: boolean): void {
    this.isDisco = active;
  }

  /** Check if disco stage is currently active. */
  isDiscoActive(): boolean {
    return this.isDisco && this.isVibing;
  }

  setPointerPresent(present: boolean): void {
    this.present = present;
  }

  setEnv(size: Size): void {
    this.screenSize = size;
    const target = this.clampCenter(this.normPos, size, 16);

    if (this.entryProgress < 0) {
      this.center = target;
    } else {
      this.entryTarget = target;
    }
  }

  hitTest(pos: Vec): boolean {
    const { w: bodyW, h: bodyH } = this.bodyDims;
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
    this.tongueProgress = -1;
    if (this.activeFly) {
      this.activeFly.state = "eaten";
      this.activeFly = null;
    }
    this.dragOffset = {
      x: pos.x - this.center.x,
      y: pos.y - this.center.y,
    };
  }

  dragTo(pos: Vec): void {
    if (!this.dragging) return;
    this.dragMoved = true;
    const { w: bodyW, h: bodyH } = this.bodyDims;
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

  getBubbleAnchor(): Vec {
    const { h } = this.bodyDims;
    return {
      x: this.center.x,
      y: this.center.y - h * 0.52,
    };
  }

  onEntryComplete(cb: () => void): void {
    if (this.hasEntryCompleted || this.entryProgress < 0) {
      cb();
    } else {
      this.entryCallbacks.push(cb);
    }
  }

  onWake(cb: () => void): void {
    this.mood.onWake(cb);
  }

  setNormalizedPos(pos: Vec): void {
    this.normPos = { ...pos };
    this.setEnv(this.screenSize);
  }

  update(dtScale: number, reduced: boolean): void {
    const dtMs = dtScale * MS_PER_FRAME;
    let gazeTarget = this.cursor;
    let hasGazeOverride = this.present;

    // Track active fly snack with eyes and handle tongue catch trigger
    if (this.activeFly && this.activeFly.state !== "eaten") {
      this.activeFly.update(dtScale);
      gazeTarget = this.activeFly.pos;
      hasGazeOverride = true;

      // Face toward the fly
      if (this.activeFly.pos.x < this.center.x - 15) {
        this.facing = -1;
      } else if (this.activeFly.pos.x > this.center.x + 15) {
        this.facing = 1;
      }

      if (
        this.activeFly.state === "targeted" &&
        this.tongueProgress < 0 &&
        this.jumpProgress < 0 &&
        this.entryProgress < 0 &&
        !this.dragging
      ) {
        // Launch tongue!
        this.tongueProgress = 0;
        this.activeFly.state = "caught";
        this.tongueTarget = { ...this.activeFly.pos };
        this.mood.poke();
      }
    }

    let desired: Vec = { x: 0, y: 0 };
    if (hasGazeOverride) {
      const to = sub(gazeTarget, this.center);
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
      this.entryProgress += dtMs / this.entryDuration;
      if (this.entryProgress >= 1) {
        this.entryProgress = -1;
        this.center = { ...this.entryTarget };
        this.normPos = {
          x: this.center.x / Math.max(1, this.screenSize.w),
          y: this.center.y / Math.max(1, this.screenSize.h),
        };
        this.mood.pet(); // Trigger cute happy/uwu face on successful landing!
        this.hasEntryCompleted = true;
        const cbs = this.entryCallbacks;
        this.entryCallbacks = [];
        for (const cb of cbs) {
          cb();
        }
      }
    }

    // Advance typing animation timeout and active cadence clock
    if (this.isTyping) {
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

    // Advance tongue strike and catch animation
    if (this.tongueProgress >= 0) {
      this.tongueProgress += dtMs / this.tongueDuration;
      if (this.tongueProgress >= 1) {
        this.tongueProgress = -1;
        if (this.activeFly) {
          this.activeFly.state = "eaten";
          this.activeFly = null;
        }
        // Emit cute burp bubble from mouth
        const { w: bodyW } = this.bodyDims;
        const mouthSpawnPos = {
          x: this.center.x + (this.facing === 1 ? bodyW * 0.22 : -bodyW * 0.22),
          y: this.center.y - bodyW * 0.08,
        };
        this.particles.emitBurp(mouthSpawnPos);
        this.mood.pet(); // cute happy/uwu face while enjoying snack!
      }
    }

    // Advance the jump regardless of reduced motion; a triggered hop must
    // always finish (otherwise it freezes mid-air and blocks isSettled()).
    if (this.jumpProgress >= 0) {
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
      this.vibeTime += dtMs;
      this.musicParticleTimer += dtMs;
      if (this.musicParticleTimer >= 600) {
        this.musicParticleTimer = 0;
        const { w: bodyW, h: bodyH } = this.bodyDims;
        const spawnX = this.center.x + (Math.random() - 0.5) * bodyW * 0.55;
        const spawnY = this.center.y - bodyH * 0.42;
        this.particles.emitMusicNote({ x: spawnX, y: spawnY });
      }
    }
    this.particles.update(dtScale);

    this.discoStage.update(
      dtScale,
      this.center,
      this.isDisco && this.isVibing,
      reduced,
    );
  }

  /** Resolve eye-open amount, letting the current expression override blink. */
  private eyeOpen(mode: EyeMode): number {
    switch (mode) {
      case "wide":
        return 1;
      case "droop":
        return 0.35;
      case "shut":
        return 0;
      default:
        return this.blink.currentOpen();
    }
  }

  /** Draw the procedural eye (bead + glint, or a cute closed arc). */
  private drawEye(
    ctx: CanvasRenderingContext2D,
    expr: Expression,
    baseX: number,
    baseY: number,
    eyeR: number,
  ): void {
    const mode = eyeModeFor[expr];
    const palette = this.config.palette;

    if (mode === "shut") {
      // Cute closed "smile" eye.
      const r = eyeR * 0.95;
      ctx.beginPath();
      ctx.arc(baseX, baseY - r * 0.35, r, Math.PI * 0.18, Math.PI * 0.82);
      ctx.lineWidth = eyeR * 0.3;
      ctx.lineCap = "round";
      ctx.strokeStyle = palette.eye;
      ctx.stroke();
      return;
    }

    const openness = clamp(this.eyeOpen(mode), 0, 1);
    const rx = eyeR * eyeWidthFactor[expr];
    const ry = rx * clamp(openness, 0.06, 1);

    // Black eye bead (shrinks vertically as it closes).
    ctx.beginPath();
    ctx.ellipse(baseX, baseY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = palette.eye;
    ctx.fill();

    // White specular glint fades/shrinks as the lid lowers.
    if (openness > 0.2) {
      const fade = clamp((openness - 0.2) / 0.8, 0, 1);
      const glintR = rx * 0.38 * (0.6 + 0.4 * fade);
      const maxTravel = rx * 0.42;
      const lookX = this.look.x * this.facing;
      const gx = baseX + lookX * maxTravel;
      const gy = baseY + this.look.y * maxTravel;

      ctx.beginPath();
      ctx.arc(gx, gy, glintR, 0, Math.PI * 2);
      ctx.fillStyle = palette.pupil;
      ctx.fill();

      // Secondary sparkle only while wide open.
      if (fade > 0.5) {
        const g2 = glintR * 0.42;
        const g2x = baseX + lookX * (maxTravel * 0.5) + rx * 0.34;
        const g2y = baseY + this.look.y * (maxTravel * 0.5) + ry * 0.32;
        ctx.beginPath();
        ctx.arc(g2x, g2y, g2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * fade})`;
        ctx.fill();
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, size: Size): void {
    const isDiscoPlaying = this.isDisco && this.isVibing;
    if (isDiscoPlaying) {
      this.discoStage.drawBackground(ctx, size, this.center, false);
    }

    let expr = this.mood.current();
    const breath = Math.sin(this.time) * 0.02;

    const { w: bodyW, h: bodyH } = this.bodyDims;

    let curCenterX = this.center.x;
    let curCenterY = this.center.y;
    const maxHeight = bodyH * 0.85;
    let frameIdx = -1;
    let yJump = 0;
    let airRatio = 0;

    if (this.dragging) {
      // Crouch pose while holding & dragging across the screen
      frameIdx = 0;
      yJump = 0;
    } else if (this.entryProgress >= 0) {
      // Leaping into viewport from outside on new tab open!
      const p = clamp(this.entryProgress, 0, 1);
      const arcHeight = Math.max(
        bodyH * 1.35,
        (this.entryStart.y - this.entryTarget.y) * 0.38 + bodyH * 0.75,
      );

      if (p < 0.08) {
        curCenterX = this.entryStart.x;
        curCenterY = this.entryStart.y;
        frameIdx = 0;
        yJump = 0;
        airRatio = 0;
      } else if (p < 0.74) {
        const u = (p - 0.08) / (0.74 - 0.08);
        curCenterX = lerp(this.entryStart.x, this.entryTarget.x, u);
        curCenterY = lerp(this.entryStart.y, this.entryTarget.y, u);
        yJump = -Math.sin(u * Math.PI) * arcHeight;
        airRatio = Math.sin(u * Math.PI);
        frameIdx = u < 0.44 ? 1 : 2;
        expr = "happy";
      } else if (p < 0.92) {
        curCenterX = this.entryTarget.x;
        curCenterY = this.entryTarget.y;
        frameIdx = 3; // Land squash impact
        yJump = 0;
        airRatio = 0;
        expr = "uwu";
      } else {
        curCenterX = this.entryTarget.x;
        curCenterY = this.entryTarget.y;
        frameIdx = -1;
        yJump = 0;
        airRatio = 0;
        expr = "happy";
      }
    } else if (this.jumpProgress >= 0) {
      // Hopping Jump Animation Branch
      const p = clamp(this.jumpProgress, 0, 1);

      if (p < 0.16) {
        curCenterX = this.jumpStart.x;
        curCenterY = this.jumpStart.y;
        frameIdx = 0;
        yJump = 0;
        airRatio = 0;
      } else if (p < 0.76) {
        const u = (p - 0.16) / (0.76 - 0.16);
        curCenterX = lerp(this.jumpStart.x, this.jumpTarget.x, u);
        curCenterY = lerp(this.jumpStart.y, this.jumpTarget.y, u);
        yJump = -Math.sin(u * Math.PI) * maxHeight;
        airRatio = clamp(-yJump / maxHeight, 0, 1);
        frameIdx = p < 0.46 ? 1 : 2;
      } else if (p < 0.94) {
        curCenterX = this.jumpTarget.x;
        curCenterY = this.jumpTarget.y;
        frameIdx = 3;
        yJump = 0;
        airRatio = 0;
      } else {
        curCenterX = this.jumpTarget.x;
        curCenterY = this.jumpTarget.y;
        frameIdx = -1;
        yJump = 0;
        airRatio = 0;
      }
    } else if (this.landProgress >= 0) {
      // Land squash impact on drop
      frameIdx = 3;
      yJump = 0;
    }

    ctx.save();
    ctx.translate(curCenterX, curCenterY);
    if (this.facing === -1) {
      ctx.scale(-1, 1);
    }

    // 1. Dynamic ground drop shadow
    const isIdle =
      !this.dragging &&
      this.entryProgress < 0 &&
      this.jumpProgress < 0 &&
      this.landProgress < 0;
    const isSquash =
      (this.entryProgress >= 0 &&
        this.entryProgress >= 0.74 &&
        this.entryProgress < 0.92) ||
      this.landProgress >= 0;
    const shadowScale = isSquash
      ? 1.18
      : (1 - airRatio * 0.48) * (isIdle ? 1 + breath * 0.2 : 1);
    const shadowAlpha = isSquash ? 0.26 : 0.22 * (1 - airRatio * 0.7);

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      0,
      bodyH / 2 - 2,
      bodyW * 0.38 * shadowScale,
      bodyH * 0.09 * shadowScale,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = `rgba(18, 18, 18, ${shadowAlpha})`;
    ctx.fill();
    ctx.restore();

    if (frameIdx >= 0) {
      // Active Jump / Drag Frame (0: crouch, 1: launch, 2: apex, 3: land)
      const frame = jumpFrames[frameIdx];
      const curW = bodyW * (frame.natW / 566);
      const curH = curW * (frame.natH / frame.natW);
      const drawX = -curW / 2;
      const drawY = bodyH / 2 + yJump - curH;

      if (frame.img.complete && frame.img.naturalWidth > 0) {
        ctx.drawImage(frame.img, drawX, drawY, curW, curH);
      } else if (bodyImg.complete && bodyImg.naturalWidth > 0) {
        ctx.drawImage(bodyImg, -bodyW / 2, -bodyH / 2 + yJump, bodyW, bodyH);
      }

      // Procedural tracking eye anchored to frame
      const eyeBaseX = drawX + (frame.eyeAnchor.x / frame.natW) * curW;
      const eyeBaseY = drawY + (frame.eyeAnchor.y / frame.natH) * curH;
      const eyeR = curW * (frame.eyeAnchor.r / frame.natW);
      this.drawEye(ctx, expr, eyeBaseX, eyeBaseY, eyeR);

      // Mouth anchored to frame
      const m = mouths[expr] ?? mouths.neutral;
      const mouthX = drawX + (frame.mouthAnchor.x / frame.natW) * curW;
      const mouthY = drawY + (frame.mouthAnchor.y / frame.natH) * curH;
      const mW = curW * m.widthFactor;
      const mH = mW * (m.natH / m.natW);

      if (m.img.complete && m.img.naturalWidth > 0) {
        ctx.drawImage(m.img, mouthX - mW / 2, mouthY - mH / 2, mW, mH);
      }
    } else if (this.isTyping) {
      // Bongo Hacker Frog Laptop Typing Pose
      // Frame selection:
      // - If brief smash timer active (Space / Enter): type_3_both (index 3)
      // - If actively typing (within active window): alternate type_1_left (1) and type_2_right (2) continuously
      // - If paused/idle between sentences: type_0_idle (0) (hands resting on laptop)
      let tfIdx = 0;
      if (this.typingSmashTimer > 0) {
        tfIdx = 3; // Both paws up smash
      } else if (this.typingActiveTimer > 0) {
        // Active typing: alternating left and right paws rapidly!
        const step = Math.floor(this.typingAnimClock) % 2;
        tfIdx = step === 0 ? 1 : 2;
      } else {
        tfIdx = 0; // Both paws resting at laptop
      }

      const frame = typingFrames[tfIdx];

      // Subtle vertical rhythmic head/body bounce while actively typing
      const isActivelyTapping =
        this.typingActiveTimer > 0 || this.typingSmashTimer > 0;
      const typeBounce = isActivelyTapping
        ? -Math.abs(Math.sin(this.typingAnimClock * Math.PI)) * 2.5
        : 0;

      // Exact pixel-perfect scaling to match frog body size and baseline 1:1 with idle loaf
      const scale = (406 / frame.frogHeight) * (bodyH / 450);
      const curW = frame.natW * scale;
      const curH = frame.natH * scale;

      // Center the frog body horizontally (frog body center is at x=0)
      const drawX = -frame.frogCenterX * scale;
      // Align bottom baseline of frog body with loaf baseline on ground (+ micro bounce)
      const drawY =
        bodyH * (447 / 450 - 0.5) - frame.frogBottomY * scale + typeBounce;

      if (frame.img.complete && frame.img.naturalWidth > 0) {
        ctx.drawImage(frame.img, drawX, drawY, curW, curH);
      } else if (bodyImg.complete && bodyImg.naturalWidth > 0) {
        ctx.drawImage(
          bodyImg,
          -bodyW / 2,
          -bodyH / 2 + typeBounce,
          bodyW,
          bodyH,
        );
      }

      // Draw mouth under sunglasses
      const typeExpr = expr === "sleepy" ? "happy" : expr;
      const m = mouths[typeExpr] ?? mouths.happy;
      const mouthX = drawX + (frame.mouthAnchor.x / frame.natW) * curW;
      const mouthY = drawY + (frame.mouthAnchor.y / frame.natH) * curH;
      const mW = bodyW * m.widthFactor;
      const mH = mW * (m.natH / m.natW);

      if (m.img.complete && m.img.naturalWidth > 0) {
        ctx.drawImage(m.img, mouthX - mW / 2, mouthY - mH / 2, mW, mH);
      }
    } else if (this.isVibing) {
      // Vibe / Headphone chill groove animation loop (2-pose groove)
      const vibeCycle = 560; // ms per full beat loop (~107 BPM)
      const p = (this.vibeTime % vibeCycle) / vibeCycle;
      const vibeIdx = p < 0.5 ? 0 : 1;
      const u = p < 0.5 ? p * 2 : (p - 0.5) * 2;

      // Vertical rhythmic bouncing and head tilt
      const yVibe = -Math.sin(u * Math.PI) * (vibeIdx === 0 ? 4 : 8);
      const vibeAngle = (vibeIdx === 0 ? 1 : -1) * Math.sin(u * Math.PI) * 0.04;

      const frame = vibeFrames[vibeIdx];
      ctx.rotate(vibeAngle);

      const curW = bodyW * (frame.natW / 566);
      const curH = curW * (frame.natH / frame.natW);
      const drawX = -curW / 2;
      const drawY = bodyH / 2 + yVibe - curH;

      if (frame.img.complete && frame.img.naturalWidth > 0) {
        ctx.drawImage(frame.img, drawX, drawY, curW, curH);
      } else if (bodyImg.complete && bodyImg.naturalWidth > 0) {
        ctx.drawImage(bodyImg, -bodyW / 2, -bodyH / 2 + yVibe, bodyW, bodyH);
      }

      // Procedural tracking eye anchored to frame (default to uwu when vibing if neutral)
      const vibeExpr = expr === "neutral" ? "uwu" : expr;
      const eyeBaseX = drawX + (frame.eyeAnchor.x / frame.natW) * curW;
      const eyeBaseY = drawY + (frame.eyeAnchor.y / frame.natH) * curH;
      const eyeR = curW * (frame.eyeAnchor.r / frame.natW);
      this.drawEye(ctx, vibeExpr, eyeBaseX, eyeBaseY, eyeR);

      // Mouth anchored to frame
      const m = mouths[vibeExpr] ?? mouths.neutral;
      const mouthX = drawX + (frame.mouthAnchor.x / frame.natW) * curW;
      const mouthY = drawY + (frame.mouthAnchor.y / frame.natH) * curH;
      const mW = curW * m.widthFactor;
      const mH = mW * (m.natH / m.natW);

      if (m.img.complete && m.img.naturalWidth > 0) {
        ctx.drawImage(m.img, mouthX - mW / 2, mouthY - mH / 2, mW, mH);
      }
    } else {
      // Standard Idle Resting Body
      ctx.scale(1 + breath * 0.4, 1 - breath * 0.5);

      const drawX = -bodyW / 2;
      const drawY = -bodyH / 2;

      if (bodyImg.complete && bodyImg.naturalWidth > 0) {
        ctx.drawImage(bodyImg, drawX, drawY, bodyW, bodyH);
      }

      const eyeBaseX = drawX + (EYE_NAT.x / 566) * bodyW;
      const eyeBaseY = drawY + (EYE_NAT.y / 450) * bodyH;
      const eyeR = bodyW * (EYE_NAT.r / 566);
      this.drawEye(ctx, expr, eyeBaseX, eyeBaseY, eyeR);

      const m = mouths[expr] ?? mouths.neutral;
      const mouthX = drawX + (MOUTH_NAT.x / 566) * bodyW;
      const mouthY = drawY + (MOUTH_NAT.y / 450) * bodyH;
      const mW = bodyW * m.widthFactor;
      const mH = mW * (m.natH / m.natW);

      if (m.img.complete && m.img.naturalWidth > 0) {
        ctx.drawImage(m.img, mouthX - mW / 2, mouthY - mH / 2, mW, mH);
      }

      if (expr === "sleepy") {
        ctx.save();
        ctx.fillStyle = this.config.palette.eye;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const chars = ["z", "z", "Z"];
        const sizeMultipliers = [0.048, 0.068, 0.092];
        const offsetsX = [0.72, 0.81, 0.9];
        const baseHeights = [0.08, -0.04, -0.16];

        for (let i = 0; i < 3; i++) {
          const p = (this.time * 0.35 + i * 0.33) % 1;
          const alpha = Math.sin(p * Math.PI);
          const floatY = p * bodyH * 0.22;
          const driftX = Math.sin(p * Math.PI * 2) * (bodyW * 0.02);

          const x = drawX + bodyW * offsetsX[i] + driftX;
          const y = drawY + bodyH * baseHeights[i] - floatY;

          ctx.globalAlpha = clamp(alpha * 0.85, 0, 1);
          ctx.font = `bold ${Math.round(bodyW * sizeMultipliers[i])}px system-ui, -apple-system, sans-serif`;
          ctx.fillText(chars[i], x, y);
        }

        ctx.restore();
      }
    }

    ctx.restore();

    // 2. Draw active tongue strike curve
    if (this.tongueProgress >= 0) {
      const mouthOffsetX = (MOUTH_NAT.x / 566 - 0.5) * bodyW * this.facing;
      const mouthOffsetY = (MOUTH_NAT.y / 450 - 0.5) * bodyH;
      const mouthWorld = {
        x: curCenterX + mouthOffsetX,
        y: curCenterY + mouthOffsetY,
      };

      const p = clamp(this.tongueProgress, 0, 1);
      let tongueTip: Vec;
      if (p < 0.48) {
        // Extending to fly
        const u = p / 0.48;
        tongueTip = {
          x: lerp(
            mouthWorld.x,
            this.tongueTarget.x,
            Math.sin(u * Math.PI * 0.5),
          ),
          y: lerp(
            mouthWorld.y,
            this.tongueTarget.y,
            Math.sin(u * Math.PI * 0.5),
          ),
        };
      } else {
        // Retracting back with caught fly
        const u = (p - 0.48) / (1 - 0.48);
        tongueTip = {
          x: lerp(this.tongueTarget.x, mouthWorld.x, u * u),
          y: lerp(this.tongueTarget.y, mouthWorld.y, u * u),
        };
        if (this.activeFly) {
          this.activeFly.pos = { ...tongueTip };
        }
      }

      ctx.save();
      // Curved stretchy tongue
      ctx.beginPath();
      ctx.moveTo(mouthWorld.x, mouthWorld.y);
      const cpX = (mouthWorld.x + tongueTip.x) * 0.5;
      const cpY =
        (mouthWorld.y + tongueTip.y) * 0.5 +
        Math.min(18, Math.abs(tongueTip.x - mouthWorld.x) * 0.15);
      ctx.quadraticCurveTo(cpX, cpY, tongueTip.x, tongueTip.y);

      ctx.lineWidth = Math.max(3.5, bodyW * 0.038);
      ctx.lineCap = "round";
      ctx.strokeStyle = "#ff6584";
      ctx.stroke();

      // Tongue highlight gloss
      ctx.lineWidth = Math.max(1.2, bodyW * 0.012);
      ctx.strokeStyle = "#ffa5be";
      ctx.stroke();

      // Sticky bulb tip
      ctx.beginPath();
      ctx.arc(
        tongueTip.x,
        tongueTip.y,
        Math.max(4.5, bodyW * 0.035),
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "#ff4f72";
      ctx.fill();
      ctx.restore();
    }

    // 3. Draw active fly snack
    if (this.activeFly && this.activeFly.state !== "eaten") {
      this.activeFly.draw(ctx);
    }

    // 4. Global floating particles (e.g. musical notes, burp bubbles)
    this.particles.draw(ctx);

    // 5. Disco Stage Foreground (Lasers, Spotlight Cone, Equalizer Bars)
    if (isDiscoPlaying) {
      this.discoStage.drawForeground(ctx, size, this.center, false);
    }
  }

  isSettled(): boolean {
    return (
      !this.dragging &&
      !this.isTyping &&
      !this.isDiscoActive() &&
      this.entryProgress < 0 &&
      this.jumpProgress < 0 &&
      this.landProgress < 0 &&
      this.tongueProgress < 0 &&
      this.activeFly === null &&
      !this.particles.hasActive() &&
      !this.isVibing &&
      !this.mood.isBusy() &&
      this.mood.current() === "sleepy" &&
      Math.abs(this.look.x - this.desired.x) < 0.01 &&
      Math.abs(this.look.y - this.desired.y) < 0.01
    );
  }
}
