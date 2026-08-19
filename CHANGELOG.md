# Changelog

All notable changes to TabMaka will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-08-19

### Added
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
