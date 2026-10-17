# Changelog

## Unreleased

- Run on machines without Google Chrome: when `channel: "chrome"` cannot find
  `/opt/google/chrome/chrome`, fall back to a local Chromium (`chromium`,
  `chromium-browser`, NixOS profile paths) or to `PI_CHROME_EXECUTABLE`

## 0.1.0 (2026-05-06)

Initial release.

- 19 browser tools: navigate, snapshot, click, type, press_key, execute_js, screenshot, scroll, list_tabs, switch_tab, new_tab, close_tab, page_info, wait, wait_for_load, go_back, go_forward, reload, close
- Lazy Chrome launch on first tool call — no startup delay
- Persistent user profile at `~/.chrome-dev-tools/profile`
- System Chrome via Playwright `channel: "chrome"`
- Bot detection avoidance via `@mr_ozio/playwright-stealth`
- Accessibility tree snapshot with CDP-based `@(x,y)` click coordinates
- Collapsed `renderResult` for snapshot tool (expand with Ctrl+O)
- Auto-cleanup on session shutdown
