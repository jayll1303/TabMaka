import type { Vec } from "./vec";

export interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxLife: number;
  life: number;
}

export class ParticleSystem {
  private bubbles: Bubble[] = [];
  private readonly maxBubbles: number = 24;

  /**
   * Spawn a gentle water bubble at position with slight random velocity.
   */
  emit(pos: Vec, driftDir?: Vec): void {
    if (this.bubbles.length >= this.maxBubbles) {
      this.bubbles.shift();
    }

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.7;
    const baseVx = driftDir ? -driftDir.x * 0.5 : 0;
    const baseVy = driftDir ? -driftDir.y * 0.5 : 0;

    this.bubbles.push({
      x: pos.x + (Math.random() - 0.5) * 6,
      y: pos.y + (Math.random() - 0.5) * 6,
      vx: baseVx + Math.cos(angle) * speed,
      vy: baseVy + Math.sin(angle) * speed - 0.4, // Slight upward buoyancy
      radius: 2 + Math.random() * 3.5,
      maxLife: 35 + Math.floor(Math.random() * 25),
      life: 0,
    });
  }

  update(dtScale: number): void {
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.life += dtScale;
      if (b.life >= b.maxLife) {
        this.bubbles.splice(i, 1);
        continue;
      }
      b.x += b.vx * dtScale;
      b.y += b.vy * dtScale;
      // Slight upward float acceleration
      b.vy -= 0.01 * dtScale;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.bubbles.length === 0) return;

    ctx.save();
    for (const b of this.bubbles) {
      const progress = b.life / b.maxLife;
      const alpha = Math.sin(progress * Math.PI) * 0.5; // Smooth fade in and out

      // Bubble outline
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Soft bubble inner glow
      ctx.fillStyle = `rgba(220, 240, 255, ${alpha * 0.15})`;
      ctx.fill();

      // Specular highlight glint on top-left of the bubble
      const glintX = b.x - b.radius * 0.35;
      const glintY = b.y - b.radius * 0.35;
      const glintR = Math.max(0.6, b.radius * 0.28);
      ctx.beginPath();
      ctx.arc(glintX, glintY, glintR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
      ctx.fill();
    }
    ctx.restore();
  }

  clear(): void {
    this.bubbles = [];
  }
}
