# TabMaka v0.2.3 - Zero Browsing Permissions 🐸🔒

A privacy and polish release. TabMaka now installs asking for **only** local
storage, with no browsing-related permission warning, plus a big internal
clean-up to keep the frog easy to build on.

### 🌟 What's New in v0.2.3

- 🔒 **Zero browsing permissions**: Removed the `tabs` permission entirely. The music-reactive headphone groove works from a simple yes/no "is any tab playing sound?" signal that needs no permission, so a fresh install now requests **only** `storage`. Nothing about which site is playing is ever read, stored, or sent.
- 📝 **Clearer privacy policy**: Documented exactly how the audio-reactive animation works and confirmed `storage` is the only permission.
- 🧱 **Cleaner codebase**: Split the large frog mascot file into focused modules (state, rendering, eye, and sprite catalog). Purely internal — behavior is unchanged.
- 📐 **Architecture docs**: Added `docs/system-architecture.md` so contributors (and AI coding agents) can navigate the project quickly.
- 🚀 **Safer release pipeline**: Chrome Web Store submission is now a deliberate manual step; cutting a GitHub Release just builds and attaches the packaged zip.

### 🔄 Upgrade notes

No action needed. Your frog's position, greeting, theme, and clock settings are
preserved. Existing installs will simply stop holding the unused `tabs`
permission.
