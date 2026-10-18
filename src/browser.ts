import { chromium, type BrowserContext, type Page } from "playwright";
import { stealth } from "@mr_ozio/playwright-stealth";
import { join } from "node:path";
import { homedir } from "node:os";

const USER_DATA_DIR = join(homedir(), ".chrome-dev-tools", "profile");
const stealthChromium = stealth(chromium);

let context: BrowserContext | null = null;
let activePage: Page | null = null;

/** Remember the tab that subsequent page tools should operate on. */
export function setActivePage(page: Page | null): void {
  activePage = page;
}

export async function ensureBrowser(): Promise<BrowserContext> {
  if (context) {
    try {
      await context.pages()[0]?.title();
      return context;
    } catch {
      context = null;
    }
  }

  context = await stealthChromium.launchPersistentContext(USER_DATA_DIR, {
    channel: "chrome",
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
  if (activePage && !activePage.isClosed()) return activePage;
  const pages = ctx.pages();
  activePage = pages[pages.length - 1] ?? (await ctx.newPage());
  return activePage;
}

export async function closeBrowser(): Promise<void> {
  if (context) {
    await context.close();
    context = null;
    activePage = null;
  }
}


