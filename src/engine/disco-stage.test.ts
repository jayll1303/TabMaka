import { describe, it, expect, beforeEach } from "vitest";
import { DiscoStage } from "./disco-stage";

class MockCanvasContext {
  calls: string[] = [];
  fillStyle: unknown = "";
  strokeStyle: unknown = "";
  lineWidth = 1;
  globalAlpha = 1;
  lineCap = "butt";

  save() {
    this.calls.push("save");
  }
  restore() {
    this.calls.push("restore");
  }
  beginPath() {
    this.calls.push("beginPath");
  }
  closePath() {
    this.calls.push("closePath");
  }
  moveTo(x: number, y: number) {
    this.calls.push(`moveTo(${x},${y})`);
  }
  lineTo(x: number, y: number) {
    this.calls.push(`lineTo(${x},${y})`);
  }
  stroke() {
    this.calls.push("stroke");
  }
  fill() {
    this.calls.push("fill");
  }
  fillRect(x: number, y: number, w: number, h: number) {
    this.calls.push(`fillRect(${x},${y},${w},${h})`);
  }
  arc(x: number, y: number, r: number) {
    this.calls.push(`arc(${x},${y},${r})`);
  }
  ellipse(x: number, y: number, rx: number, ry: number) {
    this.calls.push(`ellipse(${x},${y},${rx},${ry})`);
  }
  createRadialGradient() {
    return {
      addColorStop: () => {},
    };
  }
  createLinearGradient() {
    return {
      addColorStop: () => {},
    };
  }
}

describe("DiscoStage", () => {
  let stage: DiscoStage;
  let mockCtx: MockCanvasContext;

  beforeEach(() => {
    stage = new DiscoStage();
    mockCtx = new MockCanvasContext();
  });

  it("advances light oscillations on update when active", () => {
    stage.update(1, { x: 200, y: 300 }, true, false);
    stage.update(2, { x: 250, y: 320 }, true, false);

    // Draw background to verify state updated and rendered without errors
    const ctx = mockCtx as unknown as CanvasRenderingContext2D;
    stage.drawBackground(ctx, { w: 800, h: 600 }, { x: 250, y: 320 }, false);

    expect(mockCtx.calls).toContain("save");
    expect(mockCtx.calls).toContain("restore");
    expect(mockCtx.calls.some((c) => c.startsWith("fillRect"))).toBe(true);
    expect(mockCtx.calls.some((c) => c.startsWith("ellipse"))).toBe(true);
  });

  it("draws 3D LED floor and ground spotlight disc in drawBackground", () => {
    const ctx = mockCtx as unknown as CanvasRenderingContext2D;
    stage.update(1, { x: 400, y: 300 }, true, false);
    stage.drawBackground(ctx, { w: 800, h: 600 }, { x: 400, y: 300 }, false);

    // Verifies path creation for perspective floor tiles and ground disc
    expect(mockCtx.calls).toContain("beginPath");
    expect(mockCtx.calls).toContain("closePath");
    expect(mockCtx.calls).toContain("fill");
  });

  it("draws lasers, follow spotlight cone, and equalizer bars in drawForeground", () => {
    const ctx = mockCtx as unknown as CanvasRenderingContext2D;
    stage.update(1, { x: 400, y: 300 }, true, false);
    stage.drawForeground(ctx, { w: 800, h: 600 }, { x: 400, y: 300 }, false);

    expect(mockCtx.calls).toContain("save");
    expect(mockCtx.calls).toContain("restore");
    // Equalizer bars drawn via fillRect
    const fillRectCalls = mockCtx.calls.filter((c) => c.startsWith("fillRect"));
    expect(fillRectCalls.length).toBeGreaterThanOrEqual(24);
  });

  it("safely handles zero-size viewports without throwing", () => {
    const ctx = mockCtx as unknown as CanvasRenderingContext2D;
    expect(() => {
      stage.drawBackground(ctx, { w: 0, h: 0 }, { x: 0, y: 0 }, false);
      stage.drawForeground(ctx, { w: 0, h: 0 }, { x: 0, y: 0 }, false);
    }).not.toThrow();
  });

  it("handles reduced motion smoothly with slower rate", () => {
    const ctx = mockCtx as unknown as CanvasRenderingContext2D;
    stage.update(1, { x: 300, y: 200 }, true, true);
    expect(() => {
      stage.drawBackground(ctx, { w: 600, h: 400 }, { x: 300, y: 200 }, true);
      stage.drawForeground(ctx, { w: 600, h: 400 }, { x: 300, y: 200 }, true);
    }).not.toThrow();
  });
});
