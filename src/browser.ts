import { chromium, type BrowserContext, type Page } from "playwright";
import { stealth } from "@mr_ozio/playwright-stealth";
import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync } from "node:fs";

const USER_DATA_DIR = join(homedir(), ".chrome-dev-tools", "profile");
const stealthChromium = stealth(chromium);

/**
 * Resolve a Chromium-based browser executable.
 *
 * Playwright's `channel: "chrome"` only knows the Google Chrome install paths
 * (`/opt/google/chrome/chrome` on Linux), so launch fails with
 * `Chromium distribution 'chrome' is not found at ...` on machines that ship
 * Chromium instead (NixOS, Arch without chrome, …).
 *
 * Order: PI_CHROME_EXECUTABLE -> Google Chrome -> packaged Chromium -> PATH.
 */
function resolveExecutable(): string | undefined {
  if (process.env.PI_CHROME_EXECUTABLE) return process.env.PI_CHROME_EXECUTABLE;

  const known = [
    "/opt/google/chrome/chrome",
    "/etc/profiles/per-user/" + (process.env.USER ?? "") + "/bin/chromium",
    "/run/current-system/sw/bin/chromium",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ];
  const fromKnown = known.find((path) => existsSync(path));
  if (fromKnown) return fromKnown;

  const names = ["google-chrome-stable", "google-chrome", "chromium", "chromium-browser"];
  for (const dir of (process.env.PATH ?? "").split(":")) {
    if (!dir) continue;
    for (const name of names) {
      const candidate = join(dir, name);
      if (existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

let context: BrowserContext | null = null;

export async function ensureBrowser(): Promise<BrowserContext> {
  if (context) {
    try {
      await context.pages()[0]?.title();
      return context;
    } catch {
      context = null;
    }
  }

  const executablePath = resolveExecutable();

  context = await stealthChromium.launchPersistentContext(USER_DATA_DIR, {
    ...(executablePath ? { executablePath } : { channel: "chrome" }),
    headless: false,
    viewport: null,
    // --use-mock-keychain makes cookies unreadable across automated and manual
    // launches of this profile (different encryption keys), which breaks the
    // "sign in to Google manually, reuse the session under automation" flow.
    // --enable-automation is a bot-detection signal.
    ignoreDefaultArgs: ["--use-mock-keychain", "--enable-automation"],
    args: ["--disable-blink-features=AutomationControlled"],
  });

  context.on("close", () => {
    context = null;
  });

  return context;
}

export async function getActivePage(): Promise<Page> {
  const ctx = await ensureBrowser();
  const pages = ctx.pages();
  return pages[pages.length - 1] ?? (await ctx.newPage());
}

export async function closeBrowser(): Promise<void> {
  if (context) {
    await context.close();
    context = null;
  }
}


