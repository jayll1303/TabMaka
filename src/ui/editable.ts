/**
 * Detects whether an event target or active element is currently receiving text input.
 * Used to avoid intercepting shortcut keys (like Space for jump, M for vibe)
 * when the user is typing in inputs, textareas, or contenteditable elements (e.g., greeting).
 */
export function isEditableTarget(
  target: EventTarget | null,
  activeEl: Element | null = typeof document !== "undefined" ? document.activeElement : null,
): boolean {
  const elements = [
    target as HTMLElement | null,
    activeEl as HTMLElement | null,
  ].filter(Boolean) as HTMLElement[];

  for (const el of elements) {
    if (el.isContentEditable) return true;
    if (typeof el.closest === "function" && el.closest("[contenteditable='true'], [contenteditable='']")) {
      return true;
    }
    const tag = (el.tagName ?? "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
  }

  return false;
}
