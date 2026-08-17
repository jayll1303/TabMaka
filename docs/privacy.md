# Privacy Policy

TabMaka is designed to run entirely on your device.

## What we collect

Nothing. TabMaka does not collect, transmit, or sell any personal
data. There is no analytics, no telemetry, no advertising, and no network
requests to any server.

## What is stored, and where

The extension saves a small set of preferences using `chrome.storage.local`
(with a `localStorage` fallback):

- The companion you selected
- The name you gave your companion
- Whether the clock is shown and the 12/24-hour setting
- Whether you have seen the first-run onboarding

This data never leaves your browser. It is not synced to any account or
server by the extension. Uninstalling the extension removes it.

## Permissions and why

- `storage`: to remember the preferences listed above between sessions.

The extension also overrides the new-tab page (`chrome_url_overrides.newtab`)
to display the companion. It does not read, modify, or transmit the contents
of any other web page.

## Contact

Questions about privacy can be filed as an issue on the project's GitHub
repository.

_Last updated: 2026-08-17_
