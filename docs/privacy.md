# Privacy Policy

TabMaka is designed to run entirely on your device.

## What we collect

Nothing. TabMaka does not collect, transmit, or sell any personal
data. There is no analytics, no telemetry, no advertising, and no network
requests to any server.

## What is stored, and where

The extension saves a small set of preferences using `chrome.storage.local`
(with a `localStorage` fallback):

- Companion position (`posX`, `posY`)
- Custom greeting message
- Background color / ambient theme choice
- Whether the clock is shown and the 12/24-hour setting
- Whether you have seen the first-run onboarding

This data never leaves your browser. It is not synced to any account or
server by the extension. Uninstalling the extension removes it.

## Permissions and why

- `storage`: to remember the preferences listed above between sessions.

`storage` is the only permission the extension requests. It also overrides the
new-tab page (`chrome_url_overrides.newtab`) to display the companion. It does
not read, modify, or transmit the contents of any other web page.

## The music-reactive animation

When a tab plays sound, the companion does a little headphone groove. To know
when to start, TabMaka checks a single yes/no signal Chrome exposes to any
extension: "is at least one tab currently playing audio?" This does not require
any permission and reveals nothing about which site is playing, its URL, title,
or contents. Nothing about this signal is stored or transmitted; it only toggles
an on-screen animation.

## Contact

Questions about privacy can be filed as an issue on the project's GitHub
repository.

_Last updated: 2026-08-28_
