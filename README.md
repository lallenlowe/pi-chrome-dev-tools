# pi-chrome-dev-tools

Lazy-launch browser control for [pi](https://github.com/mariozechner/pi) agents. Uses your **system Chrome** with a persistent profile — logins, cookies, and extensions carry across sessions. Stealth-patched to avoid bot detection out of the box.

---

## Why chrome-dev-tools?

| | chrome-dev-tools | pi-browser-harness | Playwright MCP |
|---|:---:|:---:|:---:|
| **Zero setup** — no remote debugging, no flags | ✅ | ❌ manual Chrome config | ❌ |
| **Instant startup** — browser launches on first tool call | ✅ | ❌ connects at pi start | ❌ |
| **Persistent login** — cookies survive across sessions | ✅ | ✅ | ❌ |
| **Bot detection avoidance** — stealth patches built in | ✅ | ❌ | ❌ |
| **System Chrome** — no Chromium download | ✅ | ✅ | ❌ 150MB+ download |
| **AX tree + click coordinates** | ✅ | ✅ | partial |
| **Pi-native** — no MCP overhead | ✅ | ✅ | ❌ |

---

## Quick Start

```bash
pi install npm:pi-chrome-dev-tools
```

That's it. No Chrome flags, no remote debugging setup. The first `chrome_navigate` call launches Chrome automatically.

### Requirements

- [pi](https://github.com/mariozechner/pi) (latest)
- Node.js ≥ 22
- Google Chrome or Chromium installed

  Chromium works too: when Google Chrome is missing, a local Chromium install is detected automatically (tested on NixOS). Override the lookup with `PI_CHROME_EXECUTABLE=/path/to/chrome`.

---

## Tools

### Page Inspection

| Tool | Purpose |
|------|---------|
| `chrome_snapshot` | **DEFAULT** — accessibility tree with `@(x,y)` click coordinates |
| `chrome_execute_js` | Evaluate JS in page context — surgical DOM reads |
| `chrome_page_info` | URL, title, viewport size, scroll position |
| `chrome_screenshot` | Capture PNG (visual verification only) |

### Navigation

| Tool | Purpose |
|------|---------|
| `chrome_navigate` | Navigate to a URL (launches Chrome on first call) |
| `chrome_go_back` / `chrome_go_forward` | History navigation |
| `chrome_reload` | Reload current page |
| `chrome_wait` / `chrome_wait_for_load` | Wait N seconds or for page load |

### Interaction

| Tool | Purpose |
|------|---------|
| `chrome_click` | Click at viewport coordinates from `chrome_snapshot` |
| `chrome_type` | Type text into focused element |
| `chrome_press_key` | Press a key (Enter, Tab, Escape, arrows, etc.) |
| `chrome_scroll` | Scroll the page |

### Tabs

| Tool | Purpose |
|------|---------|
| `chrome_list_tabs` | List open tabs with URLs |
| `chrome_switch_tab` | Switch to tab by index |
| `chrome_new_tab` | Open a new tab |
| `chrome_close_tab` | Close a tab |

### Lifecycle

| Tool | Purpose |
|------|---------|
| `chrome_close` | Close browser (relaunches on next tool call) |

---

## Patterns

### Page inspection (default workflow)

```
chrome_snapshot()           → AX tree with @(x,y) per interactive element
chrome_execute_js(expr)     → surgical reads for specific values
chrome_screenshot()         → ONLY for visual verification
```

### Form filling

```
chrome_snapshot()                        # find the input @(x,y)
chrome_click({ x, y })                   # focus it
chrome_type({ text: "hello" })           # type
chrome_press_key({ key: "Tab" })         # next field
```

### Data extraction

```js
chrome_execute_js({ expression: "document.querySelector('.price').innerText" })
```

### Multi-tab research

```
chrome_new_tab({ url: "https://..." })
chrome_list_tabs()
chrome_switch_tab({ index: 0 })
```

---

## How it works

- **Playwright** drives a dedicated Chrome instance via CDP
- **Persistent profile** at `~/.chrome-dev-tools/profile` preserves logins
- **System Chrome or Chromium** via `channel: "chrome"` — no Chromium download; when Google Chrome is absent the extension falls back to a local Chromium (`chromium`, `chromium-browser`, NixOS profile paths) or to `PI_CHROME_EXECUTABLE`
- **Stealth** via `@mr_ozio/playwright-stealth` — patches `navigator.webdriver`, plugin arrays, permissions API, and more
- **Lazy launch** — Chrome only starts when a tool is first called
- **Auto-cleanup** — browser closes when the pi session ends

---

## License

MIT
