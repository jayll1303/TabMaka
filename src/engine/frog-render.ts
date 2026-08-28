import type { FaceConfig } from "../creatures/face-types";
import { type Vec, clamp, lerp } from "./vec";
import type { Expression } from "./mood";
import type { ParticleSystem } from "./particles";
import { drawFrogEye } from "./frog-eye";
import {
  bodyImg,
  bodyMetrics,
  EYE_NAT,
  jumpFrames,
  mouths,
  typingFrames,
  vibeFrames,
} from "./frog-sprites";

/**
 * Read-only view of the mascot state the renderer needs. FaceMascot owns and
 * mutates this state; the renderer only reads it, keeping drawing free of
 * side effects and decoupled from the mascot's private internals.
 */
export interface FrogView {
  readonly config: FaceConfig;
  readonly center: Vec;
  readonly facing: 1 | -1;
  readonly time: number;
  readonly look: Vec;
  readonly dragging: boolean;
  readonly entryProgress: number;
  readonly entryStart: Vec;
  readonly entryTarget: Vec;
  readonly jumpProgress: number;
  readonly jumpStart: Vec;
  readonly jumpTarget: Vec;
  readonly landProgress: number;
  readonly isTyping: boolean;
  readonly typingSmashTimer: number;
  readonly typingActiveTimer: number;
  readonly typingAnimClock: number;
  readonly isVibing: boolean;
  readonly vibeTime: number;
  readonly particles: ParticleSystem;
  /** Current mood expression. */
  currentExpression(): Expression;
  /** Current blink open amount [0,1]. */
  blinkOpen(): number;
}

/** Render the frog for the current frame onto an already-cleared context. */
export function drawFrog(ctx: CanvasRenderingContext2D, v: FrogView): void {
  const { size } = v.config;

  let expr = v.currentExpression();
  const breath = Math.sin(v.time) * 0.02;

  // Body aspect ratio: 566 x 450
  const { bodyW, bodyH } = bodyMetrics(size);

  let curCenterX = v.center.x;
  let curCenterY = v.center.y;
  const maxHeight = bodyH * 0.85;
  let frameIdx = -1;
  let yJump = 0;
  let airRatio = 0;

  if (v.dragging) {
    // Crouch pose while holding & dragging across the screen
    frameIdx = 0;
    yJump = 0;
  } else if (v.entryProgress >= 0) {
    // Leaping into viewport from outside on new tab open!
    const p = clamp(v.entryProgress, 0, 1);
    const arcHeight = Math.max(
      bodyH * 1.35,
      (v.entryStart.y - v.entryTarget.y) * 0.38 + bodyH * 0.75,
    );

    if (p < 0.08) {
      curCenterX = v.entryStart.x;
      curCenterY = v.entryStart.y;
      frameIdx = 0;
      yJump = 0;
      airRatio = 0;
    } else if (p < 0.74) {
      const u = (p - 0.08) / (0.74 - 0.08);
      curCenterX = lerp(v.entryStart.x, v.entryTarget.x, u);
      curCenterY = lerp(v.entryStart.y, v.entryTarget.y, u);
      yJump = -Math.sin(u * Math.PI) * arcHeight;
      airRatio = Math.sin(u * Math.PI);
      frameIdx = u < 0.44 ? 1 : 2;
      expr = "happy";
    } else if (p < 0.92) {
      curCenterX = v.entryTarget.x;
      curCenterY = v.entryTarget.y;
      frameIdx = 3; // Land squash impact
      yJump = 0;
      airRatio = 0;
      expr = "uwu";
    } else {
      curCenterX = v.entryTarget.x;
      curCenterY = v.entryTarget.y;
      frameIdx = -1;
      yJump = 0;
      airRatio = 0;
      expr = "happy";
    }
  } else if (v.jumpProgress >= 0) {
    // Hopping Jump Animation Branch
    const p = clamp(v.jumpProgress, 0, 1);

    if (p < 0.16) {
      curCenterX = v.jumpStart.x;
      curCenterY = v.jumpStart.y;
      frameIdx = 0;
      yJump = 0;
      airRatio = 0;
    } else if (p < 0.76) {
      const u = (p - 0.16) / (0.76 - 0.16);
      curCenterX = lerp(v.jumpStart.x, v.jumpTarget.x, u);
      curCenterY = lerp(v.jumpStart.y, v.jumpTarget.y, u);
      yJump = -Math.sin(u * Math.PI) * maxHeight;
      airRatio = clamp(-yJump / maxHeight, 0, 1);
      frameIdx = p < 0.46 ? 1 : 2;
    } else if (p < 0.94) {
      curCenterX = v.jumpTarget.x;
      curCenterY = v.jumpTarget.y;
      frameIdx = 3;
      yJump = 0;
      airRatio = 0;
    } else {
      curCenterX = v.jumpTarget.x;
      curCenterY = v.jumpTarget.y;
      frameIdx = -1;
      yJump = 0;
      airRatio = 0;
    }
  } else if (v.landProgress >= 0) {
    // Land squash impact on drop
    frameIdx = 3;
    yJump = 0;
  }

  ctx.save();
  ctx.translate(curCenterX, curCenterY);
  if (v.facing === -1) {
    ctx.scale(-1, 1);
  }

  // 1. Dynamic ground drop shadow
  const isIdle =
    !v.dragging &&
    v.entryProgress < 0 &&
    v.jumpProgress < 0 &&
    v.landProgress < 0;
  const isSquash =
    (v.entryProgress >= 0 &&
      v.entryProgress >= 0.74 &&
      v.entryProgress < 0.92) ||
    v.landProgress >= 0;
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
    drawFrogEye(ctx, {
      expr,
      baseX: eyeBaseX,
      baseY: eyeBaseY,
      eyeR,
      look: v.look,
      facing: v.facing,
      palette: v.config.palette,
      blinkOpen: v.blinkOpen(),
    });

    // Mouth anchored to frame
    const m = mouths[expr] ?? mouths.neutral;
    const mouthX = drawX + (frame.mouthAnchor.x / frame.natW) * curW;
    const mouthY = drawY + (frame.mouthAnchor.y / frame.natH) * curH;
    const mW = curW * m.widthFactor;
    const mH = mW * (m.natH / m.natW);

    if (m.img.complete && m.img.naturalWidth > 0) {
      ctx.drawImage(m.img, mouthX - mW / 2, mouthY - mH / 2, mW, mH);
    }
  } else if (v.isTyping) {
    // Bongo Hacker Frog Laptop Typing Pose
    // Frame selection:
    // - If brief smash timer active (Space / Enter): type_3_both (index 3)
    // - If actively typing (within active window): alternate type_1_left (1) and type_2_right (2) continuously
    // - If paused/idle between sentences: type_0_idle (0) (hands resting on laptop)
    let tfIdx = 0;
    if (v.typingSmashTimer > 0) {
      tfIdx = 3; // Both paws up smash
    } else if (v.typingActiveTimer > 0) {
      // Active typing: alternating left and right paws rapidly!
      const step = Math.floor(v.typingAnimClock) % 2;
      tfIdx = step === 0 ? 1 : 2;
    } else {
      tfIdx = 0; // Both paws resting at laptop
    }

    const frame = typingFrames[tfIdx];

    // Subtle vertical rhythmic head/body bounce while actively typing
    const isActivelyTapping =
      v.typingActiveTimer > 0 || v.typingSmashTimer > 0;
    const typeBounce = isActivelyTapping
      ? -Math.abs(Math.sin(v.typingAnimClock * Math.PI)) * 2.5
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
      ctx.drawImage(bodyImg, -bodyW / 2, -bodyH / 2 + typeBounce, bodyW, bodyH);
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
  } else if (v.isVibing) {
    // Vibe / Headphone chill groove animation loop (2-pose groove)
    const vibeCycle = 560; // ms per full beat loop (~107 BPM)
    const p = (v.vibeTime % vibeCycle) / vibeCycle;
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
    drawFrogEye(ctx, {
      expr: vibeExpr,
      baseX: eyeBaseX,
      baseY: eyeBaseY,
      eyeR,
      look: v.look,
      facing: v.facing,
      palette: v.config.palette,
      blinkOpen: v.blinkOpen(),
    });

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
    drawFrogEye(ctx, {
      expr,
      baseX: eyeBaseX,
      baseY: eyeBaseY,
      eyeR,
      look: v.look,
      facing: v.facing,
      palette: v.config.palette,
      blinkOpen: v.blinkOpen(),
    });

    const m = mouths[expr] ?? mouths.neutral;
    const mouthX = drawX + (405 / 566) * bodyW;
    const mouthY = drawY + (100 / 450) * bodyH;
    const mW = bodyW * m.widthFactor;
    const mH = mW * (m.natH / m.natW);

    if (m.img.complete && m.img.naturalWidth > 0) {
      ctx.drawImage(m.img, mouthX - mW / 2, mouthY - mH / 2, mW, mH);
    }

    if (expr === "sleepy") {
      ctx.save();
      ctx.fillStyle = v.config.palette.eye;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const chars = ["z", "z", "Z"];
      const sizeMultipliers = [0.048, 0.068, 0.092];
      const offsetsX = [0.72, 0.81, 0.9];
      const baseHeights = [0.08, -0.04, -0.16];

      for (let i = 0; i < 3; i++) {
        const p = (v.time * 0.35 + i * 0.33) % 1;
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

  // 2. Global floating particles (e.g. musical notes)
  v.particles.draw(ctx);
}
