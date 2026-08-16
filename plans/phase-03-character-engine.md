---
phase: 3
title: Character Engine
status: completed
priority: P1
dependencies:
  - 1
  - 2
effort: 2-3 ngay
---
<!-- Updated: Validation Session 1 - them procedural generator tu part library -->
<!-- Updated: Validation Session 2 - Canvas 2D + spine chain (distance constraint) + organic skinning (bezier hull) -->

# Phase 3: Character Engine

## Overview
Dung engine procedural creature tren CANVAS 2D (doi tu SVG - da chot Session 2). Gom: (a) spine chain bang distance constraint, (b) organic skinning bang bezier hull tu tiep tuyen cac dot tron, (c) mat + chi tiet phu. Ve lai moi frame tu vi tri spine. Unit test cho math thuan.

## Requirements
- Functional: spine chain n dot - dot dau di toi target, dot con bam theo khoang cach co dinh d (atan2).
- Functional: angle constraint (gioi han |theta_i - theta_i-1|) de than khong gay khuc di dang.
- Functional: organic skinning - tinh normal vector moi dot, noi vien trai/phai bang bezier, bo tron dau/duoi.
- Functional: mat dat o dot dau, lech theo phap tuyen huong dau; con nguoi huong ve target.
- Non-functional: Canvas 2D voi devicePixelRatio (net tren Retina); math thuan tach khoi render de test bang Vitest.

## Architecture
- Canvas 2D full-screen, resize theo devicePixelRatio.
- `src/engine/spine.ts` (pure): update chuoi dot theo target + distance constraint + angle clamp.
- `src/engine/skin.ts` (pure): tu spine points + radii -> tinh tangent/normal -> danh sach diem vien trai/phai.
- `src/engine/render.ts` (DOM/canvas): ve bezier hull + mat len context.
- `src/engine/vec.ts` (pure): helpers vector (atan2, add, scale, normalize, clamp).
- Tach pure math (spine, skin, vec) khoi render de unit test.

## Related Code Files
- Create: `src/engine/vec.ts`, `src/engine/vec.test.ts`.
- Create: `src/engine/spine.ts`, `src/engine/spine.test.ts`.
- Create: `src/engine/skin.ts`, `src/engine/skin.test.ts`.
- Create: `src/engine/render.ts`, `src/engine/creature.ts` (rap config + spine + render).
- Modify: `index.html` (them canvas), `src/main.ts`.

## Implementation Steps
1. Setup Canvas 2D full-screen + devicePixelRatio + resize handler.
2. Viet `vec.ts` + test (atan2 angle, normalize, clamp edge cases).
3. Viet `spine.ts`: distance constraint chain + angle clamp; test voi target co dinh.
4. Viet `skin.ts`: tangent/normal -> vien trai/phai; test tinh dung diem vien.
5. Viet `render.ts`: bezier hull tu diem vien + bo tron dau/duoi + mat; ve voi target cung de kiem tra hinh.

## Success Criteria
- [ ] Spine chain bam target dung khoang cach, khong gay khuc (angle clamp hoat dong).
- [ ] Than ve muot bang bezier hull, hinh dang theo body profile (phinh giua, thon duoi).
- [ ] Mat + con nguoi hien dung vi tri.
- [ ] `npm run test` pass cho vec + spine + skin (edge cases).
- [ ] Canvas net tren Retina (devicePixelRatio), khong mo.

## Risk Assessment
- Bezier hull bi xoan/loi o khuc cong gat. Mitigation: angle clamp o spine; test render cac goc gat.
- Per-frame redraw ton CPU. Mitigation: chi tiet toi uu o Phase 7 (dung loop khi tab an/nghi).
- Transform/toa do sai tren Retina. Mitigation: chuan hoa devicePixelRatio ngay tu buoc 1.

