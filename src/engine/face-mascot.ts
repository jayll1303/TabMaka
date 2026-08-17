import type { FaceConfig } from "../creatures/face-types";
import { type Vec, clamp, lerp, normalize, sub, len } from "./vec";
import { Blink } from "./blink";
import type { Mascot, Size } from "./mascot";

// Load sprite images
const bodyImg = new Image();
bodyImg.src = "./sprites/frog/frog_body.png";

const eyeHalfImg = new Image();
eyeHalfImg.src = "./sprites/frog/eye_left_half.png";

const eyeClosedImg = new Image();
eyeClosedImg.src = "./sprites/frog/eye_left_closed.png";

const mouthNormalImg = new Image();
mouthNormalImg.src = "./sprites/frog/mouth_normal.png";

/**
 * Sprite-Based Kawaii Frog Loaf Mascot.
 * Features:
 * - 100% pixel-perfect sprite from user artwork
 * - Exact mathematically centered eye anchor (313.3, 85.8 on 566x450)
 * - Scaled relative ratios: 100% responsive and distortion-free on any screen size
 * - Interactive white specular glint tracking cursor smoothly within the black eye
 * - 3-stage eyelid blinking (open -> half -> closed)
 * - Gentle idle breathing
 */
export class FaceMascot implements Mascot {
  private cursor: Vec;
  private present = false;
  private center: Vec;
  private readonly blink = new Blink();
  private look: Vec = { x: 0, y: 0 };
  private desired: Vec = { x: 0, y: 0 };
  private time = 0;

  constructor(
    private config: FaceConfig,
    size: Size,
  ) {
    this.center = { x: size.w / 2, y: size.h / 2 };
    this.cursor = { ...this.center };
  }

  setCursor(pos: Vec): void {
    this.present = true;
    this.cursor = pos;
  }

  setPointerPresent(present: boolean): void {
    this.present = present;
  }

  setEnv(size: Size): void {
    this.center = { x: size.w / 2, y: size.h / 2 };
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

  draw(ctx: CanvasRenderingContext2D, _size: Size): void {
    void _size;
    const { size } = this.config;
    const cx = this.center.x;
    const cy = this.center.y;

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

    // 1. Draw original frog body (with solid black eye baked in)
    if (bodyImg.complete && bodyImg.naturalWidth > 0) {
      ctx.drawImage(bodyImg, drawX, drawY, bodyW, bodyH);
    }

    // Exact geometric eye center verified on 566x450 sprite: (313.3, 85.8), radius: 38.8px
    const eyeBaseX = drawX + (313.3 / 566) * bodyW;
    const eyeBaseY = drawY + (85.8 / 450) * bodyH;
    const eyeRadius = bodyW * (38.8 / 566);
    const eyeOpen = this.blink.currentOpen();

    // 2. Specular white glint / Blinking
    if (eyeOpen > 0.6) {
      // Main white specular bead: sized to fit comfortably inside black eye
      const glintRadius = eyeRadius * 0.36;
      // Max travel constrained so glint stays cleanly inside black bead
      const maxTravel = eyeRadius * 0.48;

      const gx = eyeBaseX + this.look.x * maxTravel;
      const gy = eyeBaseY + this.look.y * maxTravel;

      // Primary shiny glint
      ctx.beginPath();
      ctx.arc(gx, gy, glintRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Secondary tiny sparkle on opposite diagonal
      const g2Radius = glintRadius * 0.42;
      const g2x = eyeBaseX + this.look.x * (maxTravel * 0.5) + eyeRadius * 0.36;
      const g2y = eyeBaseY + this.look.y * (maxTravel * 0.5) + eyeRadius * 0.30;

      ctx.beginPath();
      ctx.arc(g2x, g2y, g2Radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fill();
    } else if (eyeOpen > 0.25) {
      // Half-closed eyelid
      const eW = bodyW * 0.22;
      const eH = eW * (108 / 144);
      if (eyeHalfImg.complete && eyeHalfImg.naturalWidth > 0) {
        ctx.drawImage(eyeHalfImg, eyeBaseX - eW / 2, eyeBaseY - eH / 2, eW, eH);
      }
    } else {
      // Fully closed eyelid slit
      const eW = bodyW * 0.16;
      const eH = eW * (25 / 104);
      if (eyeClosedImg.complete && eyeClosedImg.naturalWidth > 0) {
        ctx.drawImage(eyeClosedImg, eyeBaseX - eW / 2, eyeBaseY - eH / 2 + 4, eW, eH);
      }
    }

    // 3. Draw exact squiggly mouth PNG
    const mouthX = drawX + (405 / 566) * bodyW;
    const mouthY = drawY + (100 / 450) * bodyH;
    const mW = bodyW * 0.14;
    const mH = mW * (87 / 157);

    if (mouthNormalImg.complete && mouthNormalImg.naturalWidth > 0) {
      ctx.drawImage(mouthNormalImg, mouthX - mW / 2, mouthY - mH / 2, mW, mH);
    }

    ctx.restore();
  }

  isSettled(): boolean {
    return (
      Math.abs(this.look.x - this.desired.x) < 0.01 &&
      Math.abs(this.look.y - this.desired.y) < 0.01
    );
  }
}
