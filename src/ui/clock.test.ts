import { describe, it, expect } from "vitest";
import { greetingFor } from "./clock";

describe("greetingFor", () => {
  it("greets by time of day", () => {
    expect(greetingFor(new Date(2020, 0, 1, 2))).toBe("Still up?");
    expect(greetingFor(new Date(2020, 0, 1, 9))).toBe("Good morning");
    expect(greetingFor(new Date(2020, 0, 1, 14))).toBe("Good afternoon");
    expect(greetingFor(new Date(2020, 0, 1, 20))).toBe("Good evening");
  });
});
