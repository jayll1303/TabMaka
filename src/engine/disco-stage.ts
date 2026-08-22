import type { Size } from "./mascot";
import { type Vec, clamp, lerp } from "./vec";

/**
 * High-performance Canvas 2D Nightclub Disco Stage Engine:
 * - 3D Perspective LED Checkerboard Dance Floor
 * - Follow Spotlight with Volumetric Cone & Ground Light Disc
 * - 4 Sweeping Neon Laser Beams (Pink, Cyan, Lime, Purple)
 * - Animated Audio Equalizer Visualizer Bars with Floating Peak Dots
 * - Ambient Strobe & Color-shifting Atmosphere
 */
export class DiscoStage {
  private time = 0;
  private spotPos: Vec = { x: 0, y: 0 };
  private initialized = false;

  // Equalizer bar heights & peak holders
  private readonly numEqBars = 24;
  private eqPeaks: number[] = new Array(24).fill(0);

  constructor() {}

  /**
   * Advance stage physics and light oscillations.
   */
  update(
    dtScale: number,
    targetPos: Vec,
    active: boolean,
    reduced: boolean,
  ): void {
    if (!active) return;

    const rate = reduced ? 0.015 : 0.045;
    this.time += dtScale * rate;

    // Smoothly follow target position (Mascot center)
    if (!this.initialized) {
      this.spotPos = { ...targetPos };
      this.initialized = true;
    } else {
      const followSpeed = reduced ? 1.0 : clamp(0.18 * dtScale, 0, 1);
      this.spotPos.x = lerp(this.spotPos.x, targetPos.x, followSpeed);
      this.spotPos.y = lerp(this.spotPos.y, targetPos.y, followSpeed);
    }
  }

  /**
   * Draw background layers: LED 3D Dance Floor & Background Ambient Strobe.
   * Rendered BEFORE the mascot.
   */
  drawBackground(
    ctx: CanvasRenderingContext2D,
    size: Size,
    targetPos: Vec,
    reduced: boolean,
  ): void {
    const { w, h } = size;
    if (w <= 0 || h <= 0) return;

    ctx.save();

    // 1. Ambient Strobe Flash
    const beat = Math.sin(this.time * 3.5);
    const strobeAlpha = reduced ? 0.05 : 0.08 + Math.max(0, beat) * 0.12;

    const bgGrad = ctx.createRadialGradient(
      w * 0.5,
      h * 0.4,
      50,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.8,
    );
    bgGrad.addColorStop(0, `rgba(180, 50, 255, ${strobeAlpha * 0.6})`);
    bgGrad.addColorStop(0.5, `rgba(0, 180, 255, ${strobeAlpha * 0.3})`);
    bgGrad.addColorStop(1, "rgba(9, 7, 20, 0)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. 3D Perspective LED Checkerboard Dance Floor
    this.drawLedDanceFloor(ctx, size, reduced);

    // 3. Ground Spotlight Disc beneath Mascot
    this.drawGroundSpotlight(ctx, targetPos);

    ctx.restore();
  }

  /**
   * Draw foreground layers: Volumetric Follow Spotlight Cone, Sweeping Laser Beams, Equalizer Bars.
   * Rendered AFTER the mascot.
   */
  drawForeground(
    ctx: CanvasRenderingContext2D,
    size: Size,
    targetPos: Vec,
    reduced: boolean,
  ): void {
    const { w, h } = size;
    if (w <= 0 || h <= 0) return;

    ctx.save();

    // 1. Sweeping Laser Beams
    this.drawLasers(ctx, size, reduced);

    // 2. Volumetric Spotlight Cone beaming from top to mascot
    this.drawSpotlightBeam(ctx, size, targetPos);

    // 3. Audio Equalizer Sound Wave Bars at bottom edge
    this.drawEqualizerBars(ctx, size, reduced);

    ctx.restore();
  }

  /**
   * Render 3D perspective LED checkerboard tiles.
   */
  private drawLedDanceFloor(
    ctx: CanvasRenderingContext2D,
    size: Size,
    reduced: boolean,
  ): void {
    const { w, h } = size;
    const horizonY = h * 0.44;
    const floorH = h - horizonY;
    if (floorH <= 0) return;

    const numRows = 7;
    const numCols = 10;
    const vanishX = w * 0.5;

    // Palette of vibrant neon nightclub tile colors
    const tilePalettes = [
      "rgba(255, 0, 128, 0.42)", // Neon Magenta
      "rgba(0, 230, 255, 0.4)", // Electric Cyan
      "rgba(160, 32, 240, 0.45)", // Ultraviolet
      "rgba(0, 255, 170, 0.38)", // Spring Neon
      "rgba(255, 215, 0, 0.38)", // Gold Strobe
      "rgba(40, 80, 220, 0.35)", // Deep Indigo
    ];

    const cycleStep = reduced ? 0 : Math.floor(this.time * 2.5);

    for (let r = 0; r < numRows; r++) {
      // Perspective row heights (closer = taller)
      const p1 = Math.pow(r / numRows, 2.1);
      const p2 = Math.pow((r + 1) / numRows, 2.1);
      const y1 = horizonY + p1 * floorH;
      const y2 = horizonY + p2 * floorH;

      for (let c = 0; c < numCols; c++) {
        // Perspective column spread (closer = wider)
        const spread1 = (c / numCols - 0.5) * 2.8;
        const spread2 = ((c + 1) / numCols - 0.5) * 2.8;

        const x1L = vanishX + spread1 * w * 0.5 * (0.15 + 0.85 * p1);
        const x1R = vanishX + spread2 * w * 0.5 * (0.15 + 0.85 * p1);
        const x2L = vanishX + spread1 * w * 0.5 * (0.15 + 0.85 * p2);
        const x2R = vanishX + spread2 * w * 0.5 * (0.15 + 0.85 * p2);

        const colorIdx =
          Math.abs(r * 3 + c * 2 + cycleStep) % tilePalettes.length;
        const baseColor = tilePalettes[colorIdx];

        ctx.beginPath();
        ctx.moveTo(x1L, y1);
        ctx.lineTo(x1R, y1);
        ctx.lineTo(x2R, y2);
        ctx.lineTo(x2L, y2);
        ctx.closePath();

        // Tile fill with distance fade
        ctx.fillStyle = baseColor;
        ctx.globalAlpha = 0.2 + 0.8 * p2;
        ctx.fill();

        // Glowing grid line borders
        ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
        ctx.lineWidth = Math.max(0.8, 1.6 * p2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * Draw the ground glow disc under the mascot's feet.
   */
  private drawGroundSpotlight(
    ctx: CanvasRenderingContext2D,
    targetPos: Vec,
  ): void {
    const pos = this.spotPos.x ? this.spotPos : targetPos;
    const pulse = 1.0 + Math.sin(this.time * 4) * 0.08;

    const rx = 110 * pulse;
    const ry = 36 * pulse;
    const groundY = pos.y + 42;

    const spotGrad = ctx.createRadialGradient(
      pos.x,
      groundY,
      10,
      pos.x,
      groundY,
      rx,
    );
    spotGrad.addColorStop(0, "rgba(255, 235, 180, 0.55)");
    spotGrad.addColorStop(0.35, "rgba(255, 100, 200, 0.35)");
    spotGrad.addColorStop(0.7, "rgba(0, 220, 255, 0.18)");
    spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(pos.x, groundY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = spotGrad;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw Volumetric Follow Spotlight Cone.
   */
  private drawSpotlightBeam(
    ctx: CanvasRenderingContext2D,
    size: Size,
    targetPos: Vec,
  ): void {
    const pos = this.spotPos.x ? this.spotPos : targetPos;
    const sourceX = size.w * 0.5 + Math.sin(this.time * 1.2) * 60;
    const sourceY = -30;

    const beamW = 100;
    const groundY = pos.y + 40;

    const coneGrad = ctx.createLinearGradient(
      sourceX,
      sourceY,
      pos.x,
      groundY + 20,
    );
    coneGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
    coneGrad.addColorStop(0.2, "rgba(255, 180, 230, 0.22)");
    coneGrad.addColorStop(0.6, "rgba(0, 220, 255, 0.12)");
    coneGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sourceX - 12, sourceY);
    ctx.lineTo(sourceX + 12, sourceY);
    ctx.lineTo(pos.x + beamW * 0.85, groundY);
    ctx.lineTo(pos.x - beamW * 0.85, groundY);
    ctx.closePath();

    ctx.fillStyle = coneGrad;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw 4 Sweeping Neon Laser Beams from corners.
   */
  private drawLasers(
    ctx: CanvasRenderingContext2D,
    size: Size,
    reduced: boolean,
  ): void {
    const { w, h } = size;
    const t = this.time * (reduced ? 0.4 : 1.2);

    interface LaserDef {
      origin: Vec;
      angle: number;
      color: string;
      halo: string;
    }

    const lasers: LaserDef[] = [
      // 1. Top-Left Laser (Hot Pink)
      {
        origin: { x: 0, y: 0 },
        angle: Math.PI * 0.22 + Math.sin(t * 1.4) * 0.38,
        color: "#ffffff",
        halo: "rgba(255, 0, 128, 0.85)",
      },
      // 2. Top-Right Laser (Neon Cyan)
      {
        origin: { x: w, y: 0 },
        angle: Math.PI * 0.78 + Math.cos(t * 1.6) * 0.38,
        color: "#ffffff",
        halo: "rgba(0, 230, 255, 0.85)",
      },
      // 3. Bottom-Left Laser (Lime Green)
      {
        origin: { x: 0, y: h },
        angle: -Math.PI * 0.2 + Math.sin(t * 1.8 + 1.2) * 0.32,
        color: "#ffffff",
        halo: "rgba(57, 255, 20, 0.82)",
      },
      // 4. Bottom-Right Laser (Ultraviolet)
      {
        origin: { x: w, y: h },
        angle: -Math.PI * 0.8 + Math.cos(t * 1.5 + 2.1) * 0.32,
        color: "#ffffff",
        halo: "rgba(180, 50, 255, 0.85)",
      },
    ];

    const beamLen = Math.hypot(w, h) * 1.2;

    ctx.save();
    for (const l of lasers) {
      const endX = l.origin.x + Math.cos(l.angle) * beamLen;
      const endY = l.origin.y + Math.sin(l.angle) * beamLen;

      // Outer Glowing Halo
      ctx.beginPath();
      ctx.moveTo(l.origin.x, l.origin.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = l.halo;
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.stroke();

      // Sharp Core Beam
      ctx.beginPath();
      ctx.moveTo(l.origin.x, l.origin.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = l.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Origin Emitter Glow Point
      ctx.beginPath();
      ctx.arc(l.origin.x, l.origin.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = l.halo;
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Draw Animated Audio Equalizer Sound Wave Bars at bottom edge.
   */
  private drawEqualizerBars(
    ctx: CanvasRenderingContext2D,
    size: Size,
    reduced: boolean,
  ): void {
    const { w, h } = size;
    const n = this.numEqBars;
    const totalW = Math.min(w * 0.88, 560);
    const startX = (w - totalW) * 0.5;
    const barW = Math.max(4, (totalW / n) * 0.62);
    const gap = (totalW - barW * n) / (n - 1);
    const maxBarH = Math.min(84, h * 0.16);

    const t = this.time * (reduced ? 0.6 : 2.8);

    ctx.save();

    for (let i = 0; i < n; i++) {
      // Simulate rich audio spectrum with harmonic sine superposition
      const wave1 = Math.sin(t * 1.8 + i * 0.45);
      const wave2 = Math.cos(t * 3.2 - i * 0.6);
      const wave3 = Math.sin(t * 5.1 + i * 0.9);
      const normHeight = clamp(
        (wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.2 + 1) * 0.5,
        0.08,
        1,
      );

      const barH = normHeight * maxBarH;
      const x = startX + i * (barW + gap);
      const y = h - barH - 4;

      // Update and decay peak hold dot
      if (normHeight > (this.eqPeaks[i] ?? 0)) {
        this.eqPeaks[i] = normHeight;
      } else {
        this.eqPeaks[i] = Math.max(0, (this.eqPeaks[i] ?? 0) - 0.015);
      }
      const peakY = h - (this.eqPeaks[i] ?? 0) * maxBarH - 8;

      // Gradient color from bottom to top (Cyan -> Magenta -> Yellow)
      const grad = ctx.createLinearGradient(x, h, x, y);
      grad.addColorStop(0, "rgba(0, 230, 255, 0.75)");
      grad.addColorStop(0.55, "rgba(255, 0, 128, 0.85)");
      grad.addColorStop(1, "rgba(255, 230, 0, 0.95)");

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);

      // Peak dot
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, peakY, barW, 2.5);
    }

    ctx.restore();
  }
}
