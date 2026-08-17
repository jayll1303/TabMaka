import type { CreatureConfig } from "../creatures/types";
import { type Vec, add, normalize, scale, sub } from "./vec";
import type { Spine } from "./spine";
import { buildOutline, headAngle } from "./skin";

/** Draw a smooth closed hull through the outline points using quadratic curves. */
function traceHull(ctx: CanvasRenderingContext2D, points: Vec[]): void {
  if (points.length < 2) return;
  for (let i = 0; i < points.length - 1; i++) {
    const cur = points[i];
    const next = points[i + 1];
    const mid = { x: (cur.x + next.x) / 2, y: (cur.y + next.y) / 2 };
    ctx.quadraticCurveTo(cur.x, cur.y, mid.x, mid.y);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
}

/** Draw a flowing translucent tail fin along the spine. */
function drawFin(
  ctx: CanvasRenderingContext2D,
  spine: Spine,
  config: CreatureConfig,
): void {
  const { palette } = config;
  const { joints } = spine;
  if (joints.length < 6) return;

  const finStart = Math.floor(joints.length * 0.35);
  const finLeft: Vec[] = [];
  const finRight: Vec[] = [];

  for (let i = finStart; i < joints.length; i++) {
    const here = joints[i];
    const next = joints[Math.min(i + 1, joints.length - 1)];
    const prev = joints[Math.max(i - 1, 0)];
    const dir = normalize(sub(next, prev));
    const perp = { x: -dir.y, y: dir.x };

    // Fin expands smoothly in the middle of the tail then tapers
    const progress = (i - finStart) / (joints.length - 1 - finStart);
    const finWidth = Math.sin(progress * Math.PI) * 16 + 6;

    finLeft.push(add(here, scale(perp, finWidth)));
    finRight.push(add(here, scale(perp, -finWidth)));
  }

  const lastIndex = joints.length - 1;
  const tailDir = normalize(sub(joints[lastIndex], joints[lastIndex - 1]));
  const finTip = add(joints[lastIndex], scale(tailDir, 14));

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(finLeft[0].x, finLeft[0].y);
  traceHull(ctx, finLeft);
  ctx.lineTo(finTip.x, finTip.y);
  traceHull(ctx, [...finRight].reverse());
  ctx.closePath();

  ctx.fillStyle = palette.fin ?? "rgba(216, 180, 254, 0.35)";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = palette.fin ? palette.outline : "rgba(106, 49, 130, 0.25)";
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.restore();
}

/** Draw rosy cheeks on the sides of the head. */
function drawCheeks(
  ctx: CanvasRenderingContext2D,
  spine: Spine,
  config: CreatureConfig,
): void {
  const { palette, eyes } = config;
  if (!palette.blush) return;

  const base = spine.joints[Math.min(eyes.segment, spine.joints.length - 1)];
  const heading = headAngle(spine);
  const perp = { x: -Math.sin(heading), y: Math.cos(heading) };
  const back = { x: -Math.cos(heading), y: -Math.sin(heading) };

  const blushOffset = eyes.offset * 1.05;
  const blushBack = 4;
  const r = eyes.radius * 0.95;

  const centers: Vec[] = [
    add(add(base, scale(perp, blushOffset)), scale(back, blushBack)),
    add(add(base, scale(perp, -blushOffset)), scale(back, blushBack)),
  ];

  ctx.save();
  for (const center of centers) {
    const grad = ctx.createRadialGradient(
      center.x,
      center.y,
      0,
      center.x,
      center.y,
      r * 1.4,
    );
    grad.addColorStop(0, palette.blush);
    grad.addColorStop(1, "rgba(244, 114, 182, 0)");

    ctx.beginPath();
    ctx.arc(center.x, center.y, r * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.restore();
}

export function drawCreature(
  ctx: CanvasRenderingContext2D,
  spine: Spine,
  config: CreatureConfig,
  lookAt: Vec,
  eyeOpen: number,
): void {
  // 1. Flowing translucent fin membrane
  drawFin(ctx, spine, config);

  const outline = buildOutline(spine, config);
  const { palette } = config;

  // 2. Main body hull: nose -> left side -> tail cap -> right side (reversed) -> back.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(outline.nose.x, outline.nose.y);
  traceHull(ctx, outline.left);
  ctx.lineTo(outline.tail.x, outline.tail.y);
  traceHull(ctx, [...outline.right].reverse());
  ctx.closePath();

  // Watercolor body gradient
  const headPos = spine.joints[0];
  const tailPos = spine.joints[spine.joints.length - 1];
  const bodyGrad = ctx.createLinearGradient(
    headPos.x,
    headPos.y,
    tailPos.x,
    tailPos.y,
  );
  bodyGrad.addColorStop(0, palette.body);
  bodyGrad.addColorStop(0.65, palette.belly);
  bodyGrad.addColorStop(1, palette.body);

  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = palette.outline;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();

  // 3. Rosy cheeks
  drawCheeks(ctx, spine, config);

  // 4. Eyes with Ghibli specular highlights
  drawEyes(ctx, spine, config, lookAt, eyeOpen);
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  spine: Spine,
  config: CreatureConfig,
  lookAt: Vec,
  eyeOpen: number,
): void {
  const { eyes, palette } = config;
  const seg = Math.min(eyes.segment, spine.joints.length - 1);
  const base = spine.joints[seg];
  const heading = headAngle(spine);
  const perp = { x: -Math.sin(heading), y: Math.cos(heading) };

  const centers: Vec[] = [
    add(base, scale(perp, eyes.offset)),
    add(base, scale(perp, -eyes.offset)),
  ];

  for (const center of centers) {
    if (eyeOpen <= 0.35) {
      // Cute blinking closed eye arc (eyelash curve)
      ctx.save();
      ctx.beginPath();
      const p1 = add(center, scale(perp, -eyes.radius * 0.9));
      const p2 = add(center, scale(perp, eyes.radius * 0.9));
      const mid = add(
        center,
        scale({ x: Math.cos(heading), y: Math.sin(heading) }, eyes.radius * 0.4),
      );
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(mid.x, mid.y, p2.x, p2.y);
      ctx.strokeStyle = palette.outline;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
      continue;
    }

    // Eye white base (warm ivory)
    ctx.beginPath();
    ctx.ellipse(
      center.x,
      center.y,
      eyes.radius,
      eyes.radius * eyeOpen,
      heading,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = palette.eye;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = palette.outline;
    ctx.stroke();

    // Pupil
    const toTarget = normalize(sub(lookAt, center));
    const maxPupilTravel = (eyes.radius - eyes.pupilRadius) * 0.75;
    const pupil = add(center, scale(toTarget, maxPupilTravel));

    ctx.beginPath();
    ctx.arc(pupil.x, pupil.y, eyes.pupilRadius, 0, Math.PI * 2);
    ctx.fillStyle = palette.pupil;
    ctx.fill();

    // Primary specular highlight (crisp bright white dot facing light/target)
    const hlDir = normalize(add(toTarget, { x: 0, y: -0.4 }));
    const hlOffset = eyes.pupilRadius * 0.38;
    const hlCenter = add(pupil, scale(hlDir, hlOffset));
    const hlR = Math.max(1, eyes.pupilRadius * 0.42);

    ctx.beginPath();
    ctx.arc(hlCenter.x, hlCenter.y, hlR, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Secondary smaller twinkle dot (opposite corner)
    const hl2Center = add(pupil, scale(hlDir, -hlOffset * 0.9));
    const hl2R = Math.max(0.6, eyes.pupilRadius * 0.22);

    ctx.beginPath();
    ctx.arc(hl2Center.x, hl2Center.y, hl2R, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fill();
  }
}

/** Setup a crisp canvas for the current devicePixelRatio; returns CSS-pixel size. */
export function resizeCanvas(canvas: HTMLCanvasElement): { w: number; h: number } {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  return { w, h };
}
