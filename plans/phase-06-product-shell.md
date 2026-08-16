---
phase: 6
title: Product Shell
status: completed
priority: P2
dependencies:
  - 2
effort: 1-2 ngay
---
<!-- Updated: Validation Session 1 - chot cho dat ten + luu seed nhan vat -->
<!-- Updated: Validation Session 2 - luu creature da chon + ten (thay seed generator) -->

# Phase 6: Product Shell

## Overview
Boc san pham quanh creature: dong ho, persistence (creature da chon + ten + tuy chon), settings toi gian, first-run. Giu single-purpose - khong nhoi widget.

## Requirements
- Functional: dong ho + loi chao theo gio; luu creature da chon (id preset) + ten + tuy chon qua chrome.storage.local; settings gon; first-run onboarding.
- Functional: cho user DAT TEN creature (tang gan bo cam xuc - da chot).
- Functional: (khi co >1 creature) cho user chon creature (vi du eel/fish). Neu MVP chi co 1, phan nay an di.
- Non-functional: khong lam roi mat creature; UI toi gian; KHONG analytics/tracking.

## Architecture
- `src/ui/clock.ts`, `src/ui/settings.ts`, `src/storage.ts` (wrapper chrome.storage.local async).
- Luu `creatureId` (preset da chon) + `name` + tuy chon dong ho.
- Settings CHI: bat/tat dong ho, format 12/24h, dat ten creature, (khi co) chon creature. KHONG hon.
- First-run: gioi thieu creature + moi dat ten, luu da xem.

## Related Code Files
- Create: `src/ui/clock.ts`, `src/ui/settings.ts`, `src/storage.ts`.
- Modify: `index.html`, `src/main.ts`.

## Implementation Steps
1. Wrapper storage async (get/set + default: creature dau tien + ten trong).
2. Dong ho + loi chao theo gio.
3. Settings gon: toggle dong ho, format 12/24h, dat ten creature, (khi co) chon creature.
4. First-run: gioi thieu + moi dat ten, luu da xem.
5. Xac nhan refresh/tab moi giu dung creature + ten + cau hinh.

## Success Criteria
- [ ] Dong ho + loi chao hoat dong, khong roi mat.
- [ ] creatureId + ten + cau hinh persist qua tab moi/refresh.
- [ ] User dat duoc ten creature.
- [ ] Settings dung pham vi toi gian (khong scope creep).
- [ ] KHONG co analytics/network call.

## Risk Assessment
- Scope creep settings. Mitigation: gioi han cung danh sach tuy chon o tren.
- Single-purpose policy cua store (xu ly o Phase 8).

