/**
 * Build a tapered body profile (array of radii per segment). The body starts at
 * `head`, swells to `peak` around `peakFrac` of the length, then eases down to
 * `tail`. Shared by all creatures so shapes stay consistent and tunable.
 */
export function taperedProfile(
  count: number,
  opts: { head: number; peak: number; peakFrac: number; tail: number },
): number[] {
  const { head, peak, peakFrac, tail } = opts;
  const peakAt = Math.round((count - 1) * peakFrac);
  const radii: number[] = [];
  for (let i = 0; i < count; i++) {
    let r: number;
    if (i <= peakAt) {
      const t = i / Math.max(1, peakAt);
      r = head + (peak - head) * t;
    } else {
      const t = (i - peakAt) / Math.max(1, count - 1 - peakAt);
      r = peak + (tail - peak) * t;
    }
    radii.push(Math.max(2, r));
  }
  return radii;
}
