import type { Palette } from "../creatures/types";
import type { Expression } from "./mood";
import { type Vec, clamp } from "./vec";
import { type EyeMode, eyeModeFor, eyeWidthFactor } from "./frog-sprites";

/**
 * Procedural frog eye: a black bead scaled by openness plus a white specular
 * glint that tracks the cursor, or a cute closed "smile" arc for shut moods.
 * Kept as pure functions so it can be unit-tested and reused by the renderer.
 */

/** Resolve eye-open amount [0,1], letting the expression override the blink. */
export function eyeOpenAmount(mode: EyeMode, blinkOpen: number): number {
  switch (mode) {
    case "wide":
      return 1;
    case "droop":
      return 0.35;
    case "shut":
      return 0;
    default:
      return blinkOpen;
  }
}

export interface EyeDrawParams {
  expr: Expression;
  baseX: number;
  baseY: number;
  eyeR: number;
  /** Normalized cursor look direction [-1,1]. */
  look: Vec;
  /** Facing sign so the glint tracks correctly when the sprite is flipped. */
  facing: 1 | -1;
  palette: Palette;
  /** Current blink open amount [0,1] (used when the mood doesn't override). */
  blinkOpen: number;
}

/** Draw the procedural eye (bead + glint, or a cute closed arc). */
export function drawFrogEye(
  ctx: CanvasRenderingContext2D,
  { expr, baseX, baseY, eyeR, look, facing, palette, blinkOpen }: EyeDrawParams,
): void {
  const mode = eyeModeFor[expr];

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

  const openness = clamp(eyeOpenAmount(mode, blinkOpen), 0, 1);
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
    const lookX = look.x * facing;
    const gx = baseX + lookX * maxTravel;
    const gy = baseY + look.y * maxTravel;

    ctx.beginPath();
    ctx.arc(gx, gy, glintR, 0, Math.PI * 2);
    ctx.fillStyle = palette.pupil;
    ctx.fill();

    // Secondary sparkle only while wide open.
    if (fade > 0.5) {
      const g2 = glintR * 0.42;
      const g2x = baseX + lookX * (maxTravel * 0.5) + rx * 0.34;
      const g2y = baseY + look.y * (maxTravel * 0.5) + ry * 0.32;
      ctx.beginPath();
      ctx.arc(g2x, g2y, g2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * fade})`;
      ctx.fill();
    }
  }
}
