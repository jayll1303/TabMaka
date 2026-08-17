---
phase: 8
title: "Package and Publish"
status: in-progress
priority: P2
dependencies: [6, 7]
effort: "1-2 ngay + cho review"
---

# Phase 8: Package and Publish

## Overview
Dong goi va publish len Chrome Web Store + Edge Add-ons + repo GitHub OSS. Luu y store review kho voi new-tab override.

## Requirements
- Functional: store listing (icon, ten, mo ta, screenshot/GIF), privacy page, repo public + license MIT.
- Non-functional: mo ta ro single-purpose de qua review; chua buffer thoi gian bi reject vong dau.

## Architecture
- Assets: icon nhieu size, GIF tracking la anh hero, screenshot idle behavior.
- Privacy page tinh: nhan manh 100% local, no tracking, list quyen va ly do.
- README: mo ta, GIF, build tu source, dong gop, license.

## Related Code Files
- Create: `store/` (listing assets, privacy.md), `README.md`, `LICENSE` (MIT).
- Create: `docs/privacy.md`.

## Implementation Steps
1. Chuan bi icon + screenshot + GIF hero (tu Phase 4/5).
2. Viet privacy page ro rang (100% local, quyen toi thieu + ly do).
3. Chrome Web Store: dang ky dev ($5 mot lan), viet mo ta nhan manh single-purpose, submit.
4. Edge Add-ons: submit (free).
5. README + LICENSE MIT + repo public.

## Success Criteria
- [ ] Extension live tren ca Chrome Web Store va Edge Add-ons.
- [x] README chin chu + LICENSE MIT (repo public la buoc thu cong).
- [x] Privacy page ro rang (docs/privacy.md).
- [x] Mo ta store + single-purpose statement (store/listing.md).

## Risk Assessment
- New-tab override bi soi ky (vector malware pho bien) + single-purpose policy. Mitigation: mo ta trung thuc, quyen toi thieu, chua buffer cho reject vong dau va tra loi review.


## Build-out Log

### Session 3 - 2026-08-17
Cook code deliverables cua Phase 8 (moi thu tru cac buoc thu cong tren store/GitHub):
- Icons: sinh procedural `public/icons/icon-{16,32,48,128}.png` bang `scripts/gen-icons.mjs` (pure Node PNG encoder, khong them dependency). Them script `npm run gen:icons`.
- `manifest.json`: them block `icons` (16/32/48/128). Build xac nhan icons copy vao `dist/`.
- `README.md`: mo ta, features, kien truc engine, huong dan dev + load unpacked (Chrome/Edge), privacy, contributing, MIT.
- `LICENSE`: MIT.
- `docs/privacy.md`: 100% local, list quyen + ly do (chi `storage`), khong tracking.
- `store/listing.md`: name, summary, detailed description, single-purpose statement (bat buoc cho new-tab override), permission justification.
- `store/assets/README.md`: checklist icon/screenshot/GIF + kich thuoc + shot list.
- eslint: them block Node globals cho `scripts/**/*.mjs`.

Verify: `npm run lint` clean, `npm test` 27/27 pass, `npm run build` OK (JS 15KB / 5.55KB gzip), `dist/` chua manifest + icons.

Con lai (buoc thu cong, ngoai code): dang ky Chrome dev ($5), submit Chrome + Edge, public repo GitHub, host privacy.md lay URL, chup screenshot/GIF theo checklist.
