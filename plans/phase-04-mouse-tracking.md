---
phase: 4
title: Mouse Tracking
status: completed
priority: P1
dependencies:
  - 3
effort: 1-2 ngay
---
<!-- Updated: Validation Session 2 - dau spine follow chuot (locomotion huu co), thay cho xoay dau -->

# Phase 4: Mouse Tracking

## Overview
Reactive layer - dau spine (S0) di toi con tro chuot, ca than uon luon huu co theo sau. Day la "wow moment" that su cua ky thuat procedural (manh hon nhieu so voi chi xoay dau). GIF demo de marketing.

## Requirements
- Functional: dot dau di toi vi tri chuot voi easing; ca chain bam theo tao chuyen dong huu co.
- Functional: mat/con nguoi huong ve chuot; blink tu dong.
- Functional: hover reaction khi chuot lai gan dau creature.
- Non-functional: vong lap rAF tach update/render; throttle input (chi tiet toi uu o Phase 7).
- Non-functional: body banking - than hoi nghieng khi re gat (dua tren d(theta)/dt).

## Architecture
- `src/engine/locomotion.ts`: target = vi tri chuot; dau spine di toi target voi lerp/max-speed.
- Blink controller: chu ky ngau nhien tu nhien.
- Hover: hitbox quanh dau creature -> phan ung rieng.
- Body banking: theo dao ham goc quay dau spine.

## Related Code Files
- Create: `src/engine/locomotion.ts`, `src/engine/blink.ts`.
- Modify: `src/main.ts`, `src/engine/creature.ts`.

## Implementation Steps
1. Bat mousemove, luu toa do (khong xu ly nang trong handler).
2. Vong lap rAF: dau spine di toi target voi easing/max-speed; spine chain cap nhat theo.
3. Mat/con nguoi huong ve chuot; blink ngau nhien.
4. Hover reaction khi chuot vao vung dau.
5. (Tuy chon) body banking khi re gat.

## Success Criteria
- [ ] Di chuot quanh man hinh, dau creature di toi va ca than uon luon muot theo.
- [ ] Mat huong ve chuot; blink tu nhien.
- [ ] Hover cho phan ung rieng.
- [ ] Quay duoc GIF demo 5s dung lam anh hero.

## Risk Assessment
- Chuyen dong giat/lag khi chuot nhanh. Mitigation: easing + max-speed + tach input khoi render; do fps.
- Novelty tang 1 de mon. Mitigation: chinh la ly do Phase 5 (wandering/idle) khong duoc cat.

