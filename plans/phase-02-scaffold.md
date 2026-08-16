---
phase: 2
title: Scaffold
status: completed
priority: P1
dependencies: []
effort: 0.5-1 ngay
---

# Phase 2: Scaffold

## Overview
Dung khung extension MV3 chay duoc tren ca Chrome va Edge, build 1 lenh. Doc lap voi Phase 1, co the lam song song.

## Requirements
- Functional: new-tab override hien trang cua minh tren Chrome + Edge.
- Non-functional: build 1 lenh ra `dist/` load duoc dang unpacked; khong loi console.
- Non-functional: rang buoc load nhanh - khong network dong bo, inline critical asset.

## Architecture
- Vite + TypeScript, `manifest.json` MV3 voi `chrome_url_overrides.newtab` -> `index.html`.
- Cau truc: `src/` (ts), `public/` (static), `manifest.json`, output `dist/`.
- Permissions toi thieu: ly tuong chi `storage` (them khi that su can).

## Related Code Files
- Create: `manifest.json`, `index.html`, `src/main.ts`, `vite.config.ts`, `tsconfig.json`.
- Create: `.eslintrc`, `.prettierrc`, `package.json`.

## Implementation Steps
1. `npm init` + cai Vite + TypeScript + Vitest + ESLint + Prettier.
2. Viet `manifest.json` MV3 (manifest_version 3, chrome_url_overrides.newtab, icons, minimal permissions).
3. Config Vite build ra `dist/` giu dung cau truc extension (index.html + assets).
4. tsconfig strict = true.
5. Load unpacked vao Chrome (chrome://extensions) va Edge (edge://extensions), xac nhan new-tab hien.

## Success Criteria
- [ ] Mo tab moi thay trang cua minh tren ca Chrome va Edge.
- [ ] `npm run build` ra `dist/` load duoc, khong loi console.
- [ ] tsconfig strict bat, ESLint + Prettier chay sach.
- [ ] Manifest chi xin quyen toi thieu.

## Risk Assessment
- Vite output khong dung cau truc extension. Mitigation: cau hinh rollupOptions/base cho asset path tuong doi; test load unpacked som.

