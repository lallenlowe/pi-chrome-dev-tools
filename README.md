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
- Google Chrome installed

### Headless servers (Linux)

By default Chrome launches in **headed mode** (`headless: false`) so you can watch it work. On a headless server, you need a virtual framebuffer:

```bash
sudo apt install xvfb
xvfb-run --auto-servernum --server-args="-screen 0 1920x1080x24" pi
```

Or set `DISPLAY` if you already have Xvfb running:

```bash
export DISPLAY=:99
```

Alternatively, run in headless mode:

```bash
CHROME_HEADLESS=true pi
```

### Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `CHROME_USER_DATA_DIR` | `~/.chrome-dev-tools/profile` | Chrome profile directory (preserves logins/cookies) |
| `CHROME_HEADLESS` | `false` | Set to `true` for headless mode |

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
- **Persistent profile** at `~/.chrome-dev-tools/profile` (override with `CHROME_USER_DATA_DIR`) preserves logins
- **System Chrome** via `channel: "chrome"` — no Chromium download
- **Stealth** via `@mr_ozio/playwright-stealth` — patches `navigator.webdriver`, plugin arrays, permissions API, and more
- **Lazy launch** — Chrome only starts when a tool is first called
- **Auto-cleanup** — browser closes when the pi session ends
- **Headed by default** — set `CHROME_HEADLESS=true` for headless mode

---

## License

MIT
