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

export function drawCreature(
  ctx: CanvasRenderingContext2D,
  spine: Spine,
  config: CreatureConfig,
  lookAt: Vec,
  eyeOpen: number,
): void {
  const outline = buildOutline(spine, config);
  const { palette } = config;

  // Body hull: nose -> left side -> tail cap -> right side (reversed) -> back.
  ctx.beginPath();
  ctx.moveTo(outline.nose.x, outline.nose.y);
  traceHull(ctx, outline.left);
  ctx.lineTo(outline.tail.x, outline.tail.y);
  traceHull(ctx, [...outline.right].reverse());
  ctx.closePath();

  ctx.fillStyle = palette.body;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = palette.outline;
  ctx.stroke();

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

    if (eyeOpen > 0.35) {
      const toTarget = normalize(sub(lookAt, center));
      const pupil = add(center, scale(toTarget, eyes.radius - eyes.pupilRadius));
      ctx.beginPath();
      ctx.arc(pupil.x, pupil.y, eyes.pupilRadius, 0, Math.PI * 2);
      ctx.fillStyle = palette.pupil;
      ctx.fill();
    }
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


