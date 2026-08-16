---
phase: 8
title: "Package and Publish"
status: pending
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
- [ ] Repo public voi README chin chu + MIT.
- [ ] Privacy page ro rang.
- [ ] Mo ta store neu ro single-purpose.

## Risk Assessment
- New-tab override bi soi ky (vector malware pho bien) + single-purpose policy. Mitigation: mo ta trung thuc, quyen toi thieu, chua buffer cho reject vong dau va tra loi review.
