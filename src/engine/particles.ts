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

export interface MusicNote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  symbol: string;
  size: number;
  rotation: number;
  vRot: number;
  maxLife: number;
  life: number;
}

export class ParticleSystem {
  private bubbles: Bubble[] = [];
  private notes: MusicNote[] = [];
  private readonly maxBubbles: number = 24;
  private readonly maxNotes: number = 16;
  private static readonly NOTE_SYMBOLS = ["♪", "♫", "♬"];

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

  /**
   * Spawn an adorable musical note drifting gently upwards.
   */
  emitMusicNote(pos: Vec): void {
    if (this.notes.length >= this.maxNotes) {
      this.notes.shift();
    }

    const symbols = ParticleSystem.NOTE_SYMBOLS;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.8; // Upward cone
    const speed = 0.6 + Math.random() * 0.6;

    this.notes.push({
      x: pos.x + (Math.random() - 0.5) * 8,
      y: pos.y + (Math.random() - 0.5) * 4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      symbol,
      size: 15 + Math.random() * 7,
      rotation: (Math.random() - 0.5) * 0.4,
      vRot: (Math.random() - 0.5) * 0.03,
      maxLife: 55 + Math.floor(Math.random() * 25),
      life: 0,
    });
  }

  update(dtScale: number): void {
    // Update bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.life += dtScale;
      if (b.life >= b.maxLife) {
        this.bubbles.splice(i, 1);
        continue;
      }
      b.x += b.vx * dtScale;
      b.y += b.vy * dtScale;
      b.vy -= 0.01 * dtScale;
    }

    // Update music notes
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const n = this.notes[i];
      n.life += dtScale;
      if (n.life >= n.maxLife) {
        this.notes.splice(i, 1);
        continue;
      }
      n.x += n.vx * dtScale + Math.sin(n.life * 0.1) * 0.4 * dtScale; // Soft wave drift
      n.y += n.vy * dtScale;
      n.rotation += n.vRot * dtScale;
      n.vy -= 0.005 * dtScale; // Light float
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.bubbles.length === 0 && this.notes.length === 0) return;

    ctx.save();

    // Draw bubbles
    for (const b of this.bubbles) {
      const progress = b.life / b.maxLife;
      const alpha = Math.sin(progress * Math.PI) * 0.5;

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = `rgba(220, 240, 255, ${alpha * 0.15})`;
      ctx.fill();

      const glintX = b.x - b.radius * 0.35;
      const glintY = b.y - b.radius * 0.35;
      const glintR = Math.max(0.6, b.radius * 0.28);
      ctx.beginPath();
      ctx.arc(glintX, glintY, glintR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
      ctx.fill();
    }

    // Draw music notes
    for (const n of this.notes) {
      const progress = n.life / n.maxLife;
      // Fade in quickly, float, then fade out smoothly
      const alpha = Math.sin(progress * Math.PI) * 0.85;

      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(n.rotation);
      ctx.font = `bold ${Math.round(n.size)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Shadow for subtle pop
      ctx.fillStyle = `rgba(18, 18, 18, ${alpha * 0.2})`;
      ctx.fillText(n.symbol, 1, 1);

      // Main musical note
      ctx.fillStyle = `rgba(28, 38, 22, ${alpha})`;
      ctx.fillText(n.symbol, 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }

  clear(): void {
    this.bubbles = [];
    this.notes = [];
  }
}
