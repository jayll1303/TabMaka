import { describe, it, expect } from "vitest";
import { isEditableTarget } from "./editable";

class MockDomElement {
  tagName: string;
  isContentEditable: boolean;
  parent: MockDomElement | null = null;
  attributes: Record<string, string> = {};

  constructor(tagName: string, isContentEditable = false) {
    this.tagName = tagName.toUpperCase();
    this.isContentEditable = isContentEditable;
  }

  setAttribute(k: string, v: string) {
    this.attributes[k] = v;
    if (k === "contenteditable" && (v === "true" || v === "")) {
      this.isContentEditable = true;
    }
  }

  closest(selector: string): MockDomElement | null {
    if (selector.includes("contenteditable")) {
      if (
        this.isContentEditable ||
        this.attributes.contenteditable === "true" ||
        this.attributes.contenteditable === ""
      ) {
        return this;
      }
      return this.parent?.closest(selector) ?? null;
    }
    return null;
  }
}

describe("isEditableTarget", () => {
  it("returns false for non-editable elements", () => {
    const div = new MockDomElement("div") as unknown as HTMLElement;
    const canvas = new MockDomElement("canvas") as unknown as HTMLElement;
    expect(isEditableTarget(div, canvas)).toBe(false);
    expect(isEditableTarget(null, null)).toBe(false);
  });

  it("returns true for input elements", () => {
    const input = new MockDomElement("input") as unknown as HTMLElement;
    expect(isEditableTarget(input, null)).toBe(true);
    expect(isEditableTarget(null, input)).toBe(true);
  });

  it("returns true for textarea elements", () => {
    const textarea = new MockDomElement("textarea") as unknown as HTMLElement;
    expect(isEditableTarget(textarea, null)).toBe(true);
    expect(isEditableTarget(null, textarea)).toBe(true);
  });

  it("returns true for select elements", () => {
    const select = new MockDomElement("select") as unknown as HTMLElement;
    expect(isEditableTarget(select, null)).toBe(true);
    expect(isEditableTarget(null, select)).toBe(true);
  });

  it("returns true for contenteditable greeting element", () => {
    const greetingEl = new MockDomElement(
      "div",
      true,
    ) as unknown as HTMLElement;
    expect(isEditableTarget(greetingEl, null)).toBe(true);
    expect(isEditableTarget(null, greetingEl)).toBe(true);
  });

  it("returns true for child nodes inside a contenteditable element", () => {
    const container = new MockDomElement("div");
    container.setAttribute("contenteditable", "true");

    const span = new MockDomElement("span");
    span.parent = container;

    expect(isEditableTarget(span as unknown as HTMLElement, null)).toBe(true);
    expect(isEditableTarget(null, span as unknown as HTMLElement)).toBe(true);
  });
});
