---
phase: 1
title: Concept and Art
status: completed
priority: P1
dependencies: []
effort: 1-2 ngay
---
<!-- Updated: Validation Session 1 - procedural generation + nhan vat goc khong meo -->
<!-- Updated: Validation Session 2 - chuyen sang procedural creature animation (argonaut technique), art = creature config -->

# Phase 1: Concept and Art

## Overview
Gate quan trong nhat, nhung da nhe di nhieu nho ky thuat procedural animation (spine chain + skinning). Art KHONG con la "ve nhan vat" ma la DINH NGHIA CREATURE CONFIG: sinh vat goc (khong meo) duoc mo ta bang tham so toan hoc + palette. Chuyen dong huu co tu math tao ra "hon", khong phu thuoc tay nghe ve.

## Requirements
- Functional: creature config cho >= 1 sinh vat mau. Sinh vat dau tien: RAN/LUON (chi can spine + skinning, chua can IK chan).
- Functional: config gom - so dot xuong (n), ban kinh than theo tung dot (body profile), khoang cach dot (d), palette, tham so mat/vay.
- Functional: nhan vat goc, KHONG meo, KHONG nhai san pham khac.
- Functional: dat ten + branding + style guide (palette + hinh khoi).
- Non-functional: config dang data thuan (JSON/TS object), de them sinh vat moi ma khong sua engine.

## Architecture
- Creature dinh nghia bang data, KHONG phai asset ve tay:
  - `segments`: n dot, moi dot co radius (tao body profile: phinh giua, thon duoi).
  - `spacing` d: khoang cach co dinh giua cac dot.
  - `palette`: mau than, vien, mat.
  - `eyes`: offset theo phap tuyen dau + kich thuoc.
  - (sau) `legs`: cap chan + tham so IK cho thang lan.
- Render bang Canvas 2D (xem Phase 3) - ve lai moi frame tu vi tri spine.
- Curated: chon body profile dep san (khong random tu do).

## Related Code Files
- Create: `src/creatures/*.ts` (creature configs, vi du `eel.ts`), `src/creatures/types.ts`.
- Create: `docs/branding.md` (ten, tagline, palette), `docs/art-style.md` (creature style guide).

## Implementation Steps
1. Chot 1 concept sinh vat goc dau tien (ran/luon), art style + palette; ghi `docs/art-style.md`.
2. Dinh nghia `CreatureConfig` type + config cho sinh vat dau tien (segments, radii, spacing, palette, eyes).
3. Tinh body profile dep (mang radius theo dot) - test bang cach ve tay tren canvas.
4. Chot ten + tagline + palette (`docs/branding.md`).
5. (Tuy chon) phac config sinh vat thu 2 (ca) de kiem tra engine du tong quat.

## Success Criteria
- [ ] Co CreatureConfig type + >= 1 config sinh vat goc (ran/luon).
- [ ] Body profile cho hinh dang dep khi render (phinh giua, thon duoi).
- [ ] Sinh vat goc, khong nhai san pham khac.
- [ ] Ten + branding + art-style guide da chot.

## Risk Assessment
- Rui ro: config khong ra hinh dep. Mitigation: curated body profile; test render som o Phase 3.
- Rui ro phap ly: sinh vat + ten hoan toan goc.
- Loi the moi: khong con phu thuoc ky nang ve tay - giam manh rui ro art so voi plan cu.

