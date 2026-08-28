# Changelog

All notable changes to TabMaka will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Removed
- **`tabs` permission**: The music-vibe feature detects audio through a yes/no signal Chrome exposes to any extension, so the `tabs` permission was never actually required. Dropping it means a clean install with **only** the `storage` permission and no browsing-related permission warning.

### Changed
- **Frog mascot refactor**: Split the monolithic `face-mascot.ts` into focused modules — state/lifecycle (`face-mascot.ts`), rendering (`frog-render.ts`), procedural eye (`frog-eye.ts`), and the sprite/asset catalog (`frog-sprites.ts`). No behavior change; build, tests, and lint all pass.
- **Privacy policy**: Clarified how the audio-reactive animation works and confirmed `storage` is the only permission.

### Added
- **`docs/system-architecture.md`**: Documents the shipped architecture, the `Mascot` contract, and the dormant procedural spine engine.

## [0.2.2] - 2026-08-28

### Fixed
- **Vibe Headphones Transparency**: Removed the opaque white fill inside the headphone headband in both music-vibe poses, preserving the earcups and black outlines.

## [0.2.1] - 2026-08-19

### Added
- **Bongo Hacker Frog Typing Animation**: Maka wears cool hacker sunglasses and types along on a mini laptop whenever you press keys on your keyboard! Uses 4 custom keyframe sprites (`type_0_idle`, `type_1_left`, `type_2_right`, `type_3_both`) with continuous rapid paw flutter, energetic head bounce, space/enter smash accents, and 1:1 pixel-perfect body scaling.
- **Entrance Jump Animation**: Maka the frog now joyfully leaps into the viewport from off-screen on every new tab with realistic parabolic arc, dynamic squash-and-stretch poses, and responsive ground shadow.
- **Manual Entrance Shortcut (`E`)**: Press `E` anytime to replay the entrance leap animation.

### Fixed
- **Reduced Motion Loop Autostart**: Ensured render loop runs and completes keyframe animations before settling to prevent freezes on systems with reduced-motion preferences.
- **Keyboard Shortcut Isolation**: Added comprehensive editable target detection to prevent global shortcuts (`Space`, `M`, `E`) from interfering with inputs, textareas, and contenteditable elements.

## [0.2.0] - 2026-08-19

### Added
- **Music & Audio Vibe Mode**: TabMaka now detects whenever audio/music is playing in any browser tab. The frog dynamically sways and bops its head with happy expressions while listening to music.
- **Floating Musical Note & Sparkle Particles**: Emits cheerful floating musical notes (`♪`, `♫`, `♩`, `♬`) and glowing sparkles around your companion during audio playback.
- **Manual Vibe Shortcut (`M`)**: Press `M` anytime to instantly toggle and preview the music vibe animation.
- **Remotion Video Pipeline**: Motion graphics suite for automated promotional and social preview video generation.

### Fixed
- **Greeting Text Editing (Spacebar Bug)**: Fixed issue where pressing the Space key while inline-editing the custom welcome text triggered the mascot jump animation instead of inserting a space.

## [0.1.1] - 2026-08-18

### Added
- **Frog Jump Hop Animations**: The frog now playfully hops to nearby random positions on click/tap with realistic parabolic arc, directional facing, and multi-stage jump poses (crouch, apex, landing squash).
- **Drag & Drop Jump Poses**: Frog enters a jump crouch pose while being dragged and executes a satisfying landing squash on drop.
- **Curated Clock Styles & Offline Custom Fonts**: Added beautiful typography options for the clock with fully offline fonts (clean sans, retro serif, digital monospace, and playful rounded).
- **CI/CD Auto-Publishing**: Automated pipeline with GitHub Actions and Chrome Web Store API.

### Fixed
- Prevented accidental text selection on the clock and background when dragging the mascot.

## [0.1.0] - 2026-08-17

### Added
- **Kawaii Frog Mascot**: Doodle loaf mascot living on your new-tab page with real-time cursor-following eye tracking, expressive blinking, and natural breathing.
- **Drag & Drop & Poke**: Place your companion anywhere on the screen by dragging; poke or click it for playful bounce reactions.
- **Ambient Color Palette**: Instant background color switcher with soothing pastel tones at the bottom-left corner.
- **3-State Clock & Greeting**: Toggle between 12-hour, 24-hour, and hidden clock modes with customizable greeting.
- **Privacy First (100% Local)**: Zero analytics, zero telemetry, no external network requests. All preferences saved locally via `chrome.storage.local`.
- **Performance & Accessibility**: Respects system `prefers-reduced-motion` settings and automatically pauses the animation loop when the tab is hidden (~0% CPU idle).
- **Store Assets & Icons**: Added high-resolution icons (16px, 32px, 48px, 128px, 192px, 512px) and web favicons.
