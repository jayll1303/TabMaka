import type { Expression } from "./mood";

/**
 * Frog sprite catalog: image loading, keyframe tables, and expression maps.
 *
 * This module owns all static art assets and their pixel geometry so the
 * mascot class and renderer stay focused on state and drawing. All sprites are
 * bundled locally under `public/sprites/frog/` (no network access).
 */

/** Natural pixel dimensions of the base body sprite (`frog_body.png`). */
export const BODY_NAT = { w: 566, h: 450 };

/** Body width as a multiple of the config `size` baseline. */
const BODY_WIDTH_SCALE = 2.2;

/** Rendered body width/height for a given config size (keeps sprite aspect). */
export function bodyMetrics(size: number): { bodyW: number; bodyH: number } {
  const bodyW = size * BODY_WIDTH_SCALE;
  const bodyH = bodyW * (BODY_NAT.h / BODY_NAT.w);
  return { bodyW, bodyH };
}

/** Create an image, degrading gracefully in non-DOM (test) environments. */
export function createImage(src: string): HTMLImageElement {
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

// Base body sprite. The baked-in black eye bead has been removed from the
// source PNG (see scripts/clean-frog-eye.mjs); the eye is drawn entirely in
// code so the mood system has full control (blink, wide, sleepy, closed, ...).
export const bodyImg = createImage("./sprites/frog/frog_body.png");

/** Natural eye geometry on the 566x450 body sprite. */
export const EYE_NAT = { x: 313.3, y: 85.8, r: 38.8 };

/** Jump animation keyframe specification. */
export interface JumpFrame {
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

export const jumpFrames: JumpFrame[] = [
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
export interface VibeFrame {
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

export const vibeFrames: VibeFrame[] = [
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
export interface TypingFrame {
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

export const typingFrames: TypingFrame[] = [
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
export interface MouthSprite {
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
export const mouths: Record<Expression, MouthSprite> = {
  neutral: mouth("mouth_normal.png", 157, 87, 0.14),
  happy: mouth("mouth_happy.png", 140, 105, 0.16),
  uwu: mouth("mouth_uwu.png", 123, 50, 0.15),
  surprised: mouth("mouth_surprised.png", 90, 92, 0.095),
  sleepy: mouth("mouth_straight.png", 113, 32, 0.12),
  tongue: mouth("mouth_tongue.png", 135, 71, 0.15),
  kiss: mouth("mouth_kiss.png", 79, 80, 0.085),
};

/** How each expression drives the eye. */
export type EyeMode = "blink" | "wide" | "droop" | "shut";

export const eyeModeFor: Record<Expression, EyeMode> = {
  neutral: "blink",
  happy: "blink",
  uwu: "shut",
  surprised: "wide",
  sleepy: "shut",
  tongue: "blink",
  kiss: "shut",
};

// Horizontal eye size relative to the baked bead, per expression.
export const eyeWidthFactor: Record<Expression, number> = {
  neutral: 1,
  happy: 1,
  uwu: 1,
  surprised: 1.18,
  sleepy: 1,
  tongue: 1,
  kiss: 1,
};
