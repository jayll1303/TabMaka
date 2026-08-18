# Changelog

All notable changes to TabMaka will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
