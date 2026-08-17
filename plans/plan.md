---
title: Interactive Companion New-Tab
description: >-
  New-tab extension (Chrome/Edge) voi mot creature procedural (spine chain +
  skinning) tuong tac thoi gian thuc voi con tro chuot + tu di lang thang khi
  idle. Portfolio project, free + donate, global (EN).
status: pending
priority: P2
branch: ''
tags:
  - chrome-extension
  - edge
  - new-tab
  - typescript
  - canvas
  - procedural-animation
  - portfolio
blockedBy: []
blocks: []
created: '2026-08-16T07:55:58.748Z'
createdBy: 'ck:plan'
source: skill
---

# Interactive Companion New-Tab

## Overview

New-tab extension cho Chrome/Edge hien thi mot CREATURE GOC (khong phai meo) tao bang procedural animation (ky thuat argonaut: spine chain + organic skinning + IK). Creature nhin/di theo con tro chuot (reactive) va tu di lang thang khi khong tuong tac (wandering idle). Muc tieu la portfolio project - thang bang delight + interaction real-time + engineering an tuong + open-source + 100% local.

Chien luoc thang: chiem o trong ma Tabby Cat (tinh, khong chieu sau) va Momentum (nang suat, kho khan) deu bo ngo - mot companion song dong bang toan hoc, vui, ma van sieu nhe va khong tracking.

## Nguyen tac
- YAGNI / KISS / DRY. Cat tan nhan moi thu ngoai core.
- Moat that su la procedural animation engine + chuyen dong huu co, khong phai code tracking. Ky thuat nay giam manh rui ro art (khong can ve tay).
- Performance + accessibility la rang buoc cung (per-frame rAF loop -> quan ly loop bat buoc).

## Quyet dinh ky thuat (da chot)
- Manifest V3, override `chrome_url_overrides.newtab`. Chay chung Chrome + Edge (Chromium).
- Vanilla TypeScript + Vite. KHONG framework runtime (load phai tuc thi).
- Render: CANVAS 2D (doi tu SVG o Session 2) - ve lai moi frame tu vi tri spine, devicePixelRatio cho net Retina.
- Creature = data config (segments/radii/spacing/palette/eyes), engine procedural chung cho moi creature.
- Ky thuat: spine chain (distance constraint + atan2), organic skinning (tangent/normal + bezier hull), (sau) 2-bone IK cho chan, procedural stepping.
- State: `chrome.storage.local` (luu creatureId + ten + tuy chon). KHONG cloud, KHONG account.
- Analytics: KHONG. Chi do bang so lieu store + GitHub stars + donate.
- Test: Vitest cho math thuan (vec, spine, skin, IK, behavior FSM).
- Permissions: toi thieu (chi `storage`).

## Dinh nghia MVP (ban dau tien public)
CO: creature goc (ran/luon) bang spine chain + skinning tren Canvas + dau di theo chuot + mat huong chuot + blink + hover + wandering idle + dat ten creature + dong ho + luu local + loop management (dung khi tab an/nghi) + prefers-reduced-motion.
KHONG (de sau): IK chan + thang lan 4 chan, nhieu creature, interact voi element tuy setup, nhieu theme, widget, sound, account, analytics.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Concept and Art](./phase-01-concept-and-art.md) | Completed |
| 2 | [Scaffold](./phase-02-scaffold.md) | Completed |
| 3 | [Character Engine](./phase-03-character-engine.md) | Completed |
| 4 | [Mouse Tracking](./phase-04-mouse-tracking.md) | Completed |
| 5 | [Idle Behavior](./phase-05-idle-behavior.md) | Completed |
| 6 | [Product Shell](./phase-06-product-shell.md) | Completed |
| 7 | [Performance and A11y](./phase-07-performance-and-a11y.md) | Completed |
| 8 | [Package and Publish](./phase-08-package-and-publish.md) | In-progress |
| 9 | [Launch](./phase-09-launch.md) | Pending |

## Dependency Graph (noi bo)
- Phase 1 (Creature config) -> gate, chan Phase 3.
- Phase 2 (Scaffold) -> DONE.
- Phase 3 (Engine: Canvas + spine + skinning) can Phase 1 + Phase 2.
- Phase 4 (Mouse Tracking: dau follow chuot) can Phase 3.
- Phase 5 (Idle: wandering AI) can Phase 3 + Phase 4.
- Phase 6 (Product Shell) can Phase 2 (+ Phase 3 cho creature/naming).
- Phase 7 (Performance + A11y: loop management) can Phase 4 + Phase 5.
- Phase 8 (Package + Publish) can Phase 6 + Phase 7.
- Phase 9 (Launch) can Phase 8.

## KPI (khong tracking)
- Store dashboard: install count (khong co retention - chap nhan gioi han nay).
- GitHub stars + contributors.
- Store rating (muc tieu >= 4.5).
- Donate (nhiet ke tinh cam, khong phai luong).

Muc tieu:
- 6 thang: 1.000+ installs, 200+ stars, 1 lan len front page HN/Reddit, rating >= 4.5.
- 12 thang: 5.000-10.000 installs, 500+ stars, vai contributor ngoai, donate du bu chi phi.

## Uoc tinh tong
~11-16 ngay cong cho MVP live (creature config + engine procedural + test + a11y; IK chan de sau). Chi phi tien mat nam 1: ~$20-30.

## Validation Log

### Session 1 - 2026-08-16
Verification pass: repo greenfield, moi "Related Code Files" deu la Create -> 0 FAILED. Quyet dinh: (1) Art procedural, (2) nhan vat goc khong meo, (3) khong analytics, (4) SVG rig thu cong, (5) cho dat ten. PROCEED.

### Session 2 - 2026-08-16 (sau khi user cung cap concept procedural animation)
User cung cap ky thuat procedural creature animation (argonaut: spine chain + skinning + IK + procedural stepping) tu knowledge base. Danh gia: manh hon plan cu - de-risk art (chuyen dong tu math, khong can ve tay), khoe engineering, khop hoan hao voi mouse-follow.

Quyet dinh da chot:
1. Render SVG -> CANVAS 2D. Ly do: engine ve lai toan than moi frame (bezier hull + IK), Canvas hop hon SVG DOM per-frame. Danh doi: tu lo devicePixelRatio + a11y kem hon (bu bang role/aria + reduced-motion frame tinh).
2. Art = creature config (data) thay cho part library SVG. Sinh vat mau dau tien: RAN/LUON (chi spine + skinning, chua can IK chan).
3. IK chan + thang lan 4 chan -> de sau MVP (vong 2).
4. Idle = wandering AI (creature tu di lang thang) thay cho ngap/ngu.
5. Loop management thanh trong tam Phase 7 (per-frame rAF -> phai dung khi tab an/nghi).

Propagation: phase-01 (creature config), phase-03 (Canvas + spine + skin), phase-04 (dau follow chuot), phase-05 (wandering), phase-06 (creatureId thay seed), phase-07 (loop management), plan.md (render Canvas, MVP, tags).

### Whole-Plan Consistency Sweep (Session 2)
- "SVG": chi con o cho lich su/phu dinh (Session 1 log, "doi tu SVG"); moi phase active dung Canvas - nhat quan.
- "seed/generator": da thay bang "creatureId/preset" o Phase 3 + Phase 6 - nhat quan.
- "part library": chi con o Session 1 log (lich su); Phase 1 hien la creature config - dung.
- "spine/skinning/Canvas": chuoi Phase 1 (config) -> 3 (engine) -> 4 (follow) -> 5 (wandering) -> 7 (loop) nhat quan.
- "analytics": van KHONG, KPI khong doi.
- Uoc tinh: quay ve 11-16 ngay (IK chan de sau MVP).
- Phase 2 = Completed (da cook), phan anh dung.
- Khong con mau thuan chua giai quyet.

Ket luan: PROCEED. San sang cook Phase 1 -> Phase 3.

