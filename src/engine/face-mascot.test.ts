import { describe, it, expect } from "vitest";
import { FaceMascot } from "./face-mascot";
import { frog } from "../creatures/frog";

describe("FaceMascot Entry Animation", () => {
  const size = { w: 1000, h: 800 };

  it("starts entrance jump automatically on creation", () => {
    const mascot = new FaceMascot(frog, size, { x: 0.5, y: 0.5 });
    // While entry animation is in flight, mascot is not settled
    expect(mascot.isSettled()).toBe(false);
  });

  it("settles after entrance jump completes and mood becomes sleepy", () => {
    const mascot = new FaceMascot(frog, size, { x: 0.5, y: 0.5 });

    // Simulate 60 frames (~1000ms at 60fps) to complete the 840ms entry jump
    for (let i = 0; i < 60; i++) {
      mascot.update(1, false);
    }

    // Now entry jump is complete and normal idle runs
    const pos = mascot.endDrag();
    expect(pos.x).toBeCloseTo(0.5, 1);
    expect(pos.y).toBeCloseTo(0.5, 1);
  });

  it("cancels entrance jump immediately if user starts dragging", () => {
    const mascot = new FaceMascot(frog, size, { x: 0.5, y: 0.5 });
    expect(mascot.isSettled()).toBe(false);

    // User grabs frog mid-air
    mascot.startDrag({ x: 500, y: 400 });
    expect(mascot.isDragging()).toBe(true);

    mascot.dragTo({ x: 600, y: 450 });
    const newPos = mascot.endDrag();
    expect(mascot.isDragging()).toBe(false);
    expect(newPos.x).toBeGreaterThan(0.5);
  });

  it("can replay entrance jump on demand via playEntryAnimation", () => {
    const mascot = new FaceMascot(frog, size, { x: 0.5, y: 0.5 });
    mascot.playEntryAnimation();
    expect(mascot.isSettled()).toBe(false);

    // Advance until finished
    for (let i = 0; i < 60; i++) {
      mascot.update(1, false);
    }
  });

  it("activates bongo hacker typing animation and settles after timeout", () => {
    const mascot = new FaceMascot(frog, size, { x: 0.5, y: 0.5 });
    // Advance entry jump
    for (let i = 0; i < 60; i++) {
      mascot.update(1, false);
    }

    expect(mascot.isTypingActive?.()).toBe(false);

    // Keystroke triggers typing
    mascot.triggerTyping?.("a");
    expect(mascot.isTypingActive?.()).toBe(true);
    expect(mascot.isSettled()).toBe(false);

    // Alternate typing strokes
    mascot.triggerTyping?.("b");
    expect(mascot.isTypingActive?.()).toBe(true);

    // Advance 65 frames (~1080ms at 60fps) to exceed the 900ms typingDuration
    for (let i = 0; i < 65; i++) {
      mascot.update(1, false);
    }

    // Typing mode should expire and settle back to normal loaf
    expect(mascot.isTypingActive?.()).toBe(false);
  });
});
