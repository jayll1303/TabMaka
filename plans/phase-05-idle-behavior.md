---
phase: 5
title: Idle Behavior
status: completed
priority: P1
dependencies:
  - 3
  - 4
effort: 2-3 ngay
---
<!-- Updated: Validation Session 1 - tru cot giu chan -->
<!-- Updated: Validation Session 2 - idle = wandering AI (creature tu di lang thang) thay cho ngap/ngu -->

# Phase 5: Idle Behavior

## Overview
Tru cot giu chan. Khi khong co chuot, creature TU DI LANG THANG (wandering AI): tu chon target ngau nhien, di toi, dung nghi, roi di tiep. Sinh dong va tu nhien hon animation ngap/ngu. KHONG duoc cat.

## Requirements
- Functional: state machine - FOLLOWING (co chuot) | WANDERING (tu chon target) | RESTING (dung nghi/tho nhe).
- Functional: wandering - chon target ngau nhien trong man hinh, di toi voi toc do cham hon follow, nghi ngau nhien roi di tiep.
- Functional: wake ve FOLLOWING khi co mousemove.
- Non-functional: khi RESTING lau, co the dung rAF loop de tiet kiem pin (phoi hop Phase 7).

## Architecture
- `src/engine/behavior.ts`: FSM (FOLLOWING/WANDERING/RESTING) + transition co xac suat + hen gio.
- Wandering: sinh target ngau nhien (tranh mep), di toi bang locomotion co san (Phase 4), do tre ngau nhien giua cac diem.
- Idle timer: khong mousemove X giay -> WANDERING; mousemove -> FOLLOWING (wake).
- Breathing/micro-motion o RESTING de khong "chet cung" (tru khi da dung loop tiet kiem pin).

## Related Code Files
- Create: `src/engine/behavior.ts`, `src/engine/behavior.test.ts`.
- Modify: `src/engine/locomotion.ts`, `src/main.ts`.

## Implementation Steps
1. Dinh nghia FSM states + bang transition (xac suat + thoi gian toi thieu).
2. Wandering: sinh target ngau nhien hop le, di toi, nghi, lap lai.
3. Idle timer: khong input X giay -> WANDERING; input -> FOLLOWING.
4. RESTING: micro-motion nhe (hoac dung loop neu nghi lau - xem Phase 7).
5. Unit test transition logic (inject seed/clock, khong flaky).

## Success Criteria
- [ ] De yen ~5-10s, creature tu di lang thang tu nhien; dong chuot no quay lai follow.
- [ ] Chuyen giua FOLLOWING/WANDERING/RESTING muot, khong giat.
- [ ] Wandering khong ra ngoai mep man hinh.
- [ ] Test FSM transition pass, khong flaky.

## Risk Assessment
- Wandering nham chan/may moc. Mitigation: do tre + target ngau nhien + toc do bien thien.
- rAF chay mai ton pin. Mitigation: dung loop khi RESTING lau + khi tab an (Phase 7).

