---
phase: 7
title: Performance and A11y
status: completed
priority: P1
dependencies:
  - 4
  - 5
effort: 1-2 ngay
---
<!-- Updated: Validation Session 2 - per-frame Canvas rAF loop management (rui ro pin cao hon) -->

# Phase 7: Performance and A11y

## Overview
Rang buoc cung - rating song-con. Canvas ve lai moi frame (rAF lien tuc) nen quan ly loop la trong tam: dung khi tab an, dung khi RESTING lau, ton trong prefers-reduced-motion.

## Requirements
- Non-functional: pause rAF khi tab an (Page Visibility API).
- Non-functional: dung rAF khi creature RESTING lau (khong co chuot + het wandering) -> khoi phuc khi co input.
- Non-functional: throttle mousemove; devicePixelRatio dung de net + khong ve du thua.
- Non-functional: prefers-reduced-motion -> ve 1 frame tinh (creature dung yen dep), khong animate.
- Non-functional: khong memory leak khi mo/dong nhieu tab.
- Muc tieu do luong: CPU idle < 1% (loop da dung), load new-tab < 100ms, fps on dinh khi follow.

## Architecture
- Page Visibility API: `document.hidden` -> cancelAnimationFrame; visible -> resume.
- Loop scheduler: chi chay rAF khi FOLLOWING hoac WANDERING; RESTING lau -> dung, cho input wake.
- Throttle mousemove; canvas resize theo devicePixelRatio.
- `matchMedia('(prefers-reduced-motion: reduce)')` -> ve frame tinh, bo loop.
- Cleanup listener/rAF de tranh leak.

## Related Code Files
- Create: `src/perf/loop.ts` (scheduler co the dung/chay), `src/perf/visibility.ts`, `src/perf/reduced-motion.ts`.
- Modify: `src/main.ts`, `src/engine/behavior.ts` (bao loop khi dung/chay).

## Implementation Steps
1. Loop scheduler: chay rAF khi active, cancel khi RESTING lau / tab an.
2. Pause khi document.hidden; resume khi visible + co ly do chay.
3. Throttle mousemove; xac nhan devicePixelRatio dung.
4. prefers-reduced-motion: ve frame tinh, khong animate.
5. Do CPU idle (target <1% khi loop dung), load time (<100ms), fps khi follow; kiem tra leak khi mo/dong 50+ tab.

## Success Criteria
- [ ] Creature RESTING lau -> rAF dung -> CPU gan 0.
- [ ] Tab an -> loop dung han.
- [ ] prefers-reduced-motion -> frame tinh, khong animate.
- [ ] Load new-tab < 100ms; fps on dinh khi follow.
- [ ] Khong memory leak khi mo/dong nhieu tab.

## Risk Assessment
- Per-frame rAF ton pin (an tu rating). Mitigation: loop tu dung khi nghi + khi tab an la BAT BUOC.
- Bo qua a11y. Mitigation: reduced-motion la success criteria, khong optional.
- Canvas mo tren Retina. Mitigation: devicePixelRatio.

