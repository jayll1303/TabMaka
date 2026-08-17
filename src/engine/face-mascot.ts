import type { FaceConfig } from "../creatures/face-types";
import { type Vec, clamp, lerp, normalize, sub, len } from "./vec";
import { Blink } from "./blink";
import { Mood, type Expression } from "./mood";
import type { Mascot, Size } from "./mascot";

// Load body sprite. The baked-in black eye bead has been removed from the
// source PNG (see scripts/clean-frog-eye.mjs); the eye is drawn entirely in
// code so the mood system has full control (blink, wide, sleepy, closed, ...).
const bodyImg = new Image();
bodyImg.src = "./sprites/frog/frog_body.png";

// Natural eye geometry on the 566x450 body sprite.
const EYE_NAT = { x: 313.3, y: 85.8, r: 38.8 };

/** A mouth sprite with its natural pixel dimensions and a target width. */
interface MouthSprite {
  img: HTMLImageElement;
  natW: number;
  natH: number;
  /** Rendered width as a fraction of the body width. */
  widthFactor: number;
}

function mouth(file: string, natW: number, natH: number, widthFactor: number): MouthSprite {
  const img = new Image();
  img.src = `./sprites/frog/${file}`;
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
  sleepy: "droop",
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
 * Features:
 * - Pixel-perfect body sprite; baked eye bead is repainted so the eye is drawn
 *   entirely in code and never conflicts with expression eyes.
 * - Expression/mood system: neutral, happy, uwu, surprised, sleepy, tongue, kiss.
 * - Cursor-driven reactions (fast approach -> surprised, gentle hover -> content,
 *   click -> playful) plus an idle drift into sleepy.
 * - Procedural eye: black bead scaled by openness + white specular glint that
 *   tracks the cursor; smile-arc closed eyes for shut expressions.
 * - Gentle idle breathing and drag-and-drop repositioning.
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
  private lastCursorAt = 0;

  // Dragging state
  private dragging = false;
  private dragOffset: Vec = { x: 0, y: 0 };

  constructor(
    private config: FaceConfig,
    size: Size,
    normPos?: Vec,
  ) {
    this.screenSize = size;
    this.normPos = normPos ? { ...normPos } : { x: 0.5, y: 0.5 };
    this.center = {
      x: this.normPos.x * size.w,
      y: this.normPos.y * size.h,
    };
    this.cursor = { ...this.center };
  }

  setCursor(pos: Vec): void {
    const now = performance.now();
    const dt = Math.max(1, now - this.lastCursorAt);
    const speed = len(sub(pos, this.cursor)) / dt; // px per ms
    this.lastCursorAt = now;

    this.present = true;
    this.cursor = pos;
    this.mood.notifyActivity();

    // React based on how the cursor moves near the frog.
    const near = len(sub(pos, this.center)) < this.config.size * 1.6;
    if (near) {
      if (speed > 1.5) this.mood.startle();
      else this.mood.pet();
    }
  }

  /** Click / tap on the frog. */
  poke(): void {
    this.mood.poke();
  }

  setPointerPresent(present: boolean): void {
    this.present = present;
  }

  setEnv(size: Size): void {
    this.screenSize = size;
    const bodyW = this.config.size * 2.2;
    const bodyH = bodyW * (450 / 566);
    const padX = bodyW * 0.5 + 16;
    const padY = bodyH * 0.5 + 16;

    this.center = {
      x: clamp(this.normPos.x * size.w, padX, Math.max(padX, size.w - padX)),
      y: clamp(this.normPos.y * size.h, padY, Math.max(padY, size.h - padY)),
    };
  }

  hitTest(pos: Vec): boolean {
    const bodyW = this.config.size * 2.2;
    const bodyH = bodyW * (450 / 566);
    const dx = (pos.x - this.center.x) / (bodyW * 0.52);
    const dy = (pos.y - this.center.y) / (bodyH * 0.52);
    return dx * dx + dy * dy <= 1.0;
  }

  startDrag(pos: Vec): void {
    this.dragging = true;
    this.dragOffset = {
      x: pos.x - this.center.x,
      y: pos.y - this.center.y,
    };
  }

  dragTo(pos: Vec): void {
    if (!this.dragging) return;
    const bodyW = this.config.size * 2.2;
    const bodyH = bodyW * (450 / 566);
    const padX = bodyW * 0.5 + 16;
    const padY = bodyH * 0.5 + 16;

    this.center.x = clamp(pos.x - this.dragOffset.x, padX, Math.max(padX, this.screenSize.w - padX));
    this.center.y = clamp(pos.y - this.dragOffset.y, padY, Math.max(padY, this.screenSize.h - padY));

    this.normPos = {
      x: this.center.x / Math.max(1, this.screenSize.w),
      y: this.center.y / Math.max(1, this.screenSize.h),
    };
  }

  endDrag(): Vec {
    this.dragging = false;
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
      const gx = baseX + this.look.x * maxTravel;
      const gy = baseY + this.look.y * maxTravel;

      ctx.beginPath();
      ctx.arc(gx, gy, glintR, 0, Math.PI * 2);
      ctx.fillStyle = palette.pupil;
      ctx.fill();

      // Secondary sparkle only while wide open.
      if (fade > 0.5) {
        const g2 = glintR * 0.42;
        const g2x = baseX + this.look.x * (maxTravel * 0.5) + rx * 0.34;
        const g2y = baseY + this.look.y * (maxTravel * 0.5) + ry * 0.32;
        ctx.beginPath();
        ctx.arc(g2x, g2y, g2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * fade})`;
        ctx.fill();
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, _size: Size): void {
    void _size;
    const { size } = this.config;
    const cx = this.center.x;
    const cy = this.center.y;

    const expr = this.mood.current();
    const breath = Math.sin(this.time) * 0.02;

    // Body aspect ratio: 566 x 450
    const bodyW = size * 2.2;
    const bodyH = bodyW * (450 / 566);

    ctx.save();
    ctx.translate(cx, cy);
    // Subtle idle breathing
    ctx.scale(1 + breath * 0.4, 1 - breath * 0.5);

    const drawX = -bodyW / 2;
    const drawY = -bodyH / 2;

    // 1. Draw the frog body (cleaned of the baked eye when ready).
    if (bodyImg.complete && bodyImg.naturalWidth > 0) {
      ctx.drawImage(bodyImg, drawX, drawY, bodyW, bodyH);
    }

    // 2. Draw the eye at the exact baked-bead anchor.
    const eyeBaseX = drawX + (EYE_NAT.x / 566) * bodyW;
    const eyeBaseY = drawY + (EYE_NAT.y / 450) * bodyH;
    const eyeR = bodyW * (EYE_NAT.r / 566);
    this.drawEye(ctx, expr, eyeBaseX, eyeBaseY, eyeR);

    // 3. Draw the mouth sprite for the current expression.
    const m = mouths[expr] ?? mouths.neutral;
    const mouthX = drawX + (405 / 566) * bodyW;
    const mouthY = drawY + (100 / 450) * bodyH;
    const mW = bodyW * m.widthFactor;
    const mH = mW * (m.natH / m.natW);

    if (m.img.complete && m.img.naturalWidth > 0) {
      ctx.drawImage(m.img, mouthX - mW / 2, mouthY - mH / 2, mW, mH);
    }

    ctx.restore();
  }

  isSettled(): boolean {
    return (
      !this.dragging &&
      !this.mood.isBusy() &&
      Math.abs(this.look.x - this.desired.x) < 0.01 &&
      Math.abs(this.look.y - this.desired.y) < 0.01
    );
  }
}


