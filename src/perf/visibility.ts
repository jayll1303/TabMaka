/** Run a callback when the tab becomes hidden / visible. Returns unsubscribe. */
export function onVisibilityChange(
  onHidden: () => void,
  onVisible: () => void,
): () => void {
  const handler = (): void => {
    if (document.hidden) onHidden();
    else onVisible();
  };
  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);
}
