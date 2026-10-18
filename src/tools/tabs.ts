import { Type } from "typebox";
import type { ToolDefinition } from "@mariozechner/pi-coding-agent";
import { ensureBrowser, setActivePage } from "../browser.js";
import { textResult, errorResult, wrapError } from "../tool-result.js";

const EmptyParams = Type.Object({});

export const listTabsTool: ToolDefinition<typeof EmptyParams> = {
  name: "chrome_list_tabs",
  label: "Chrome List Tabs",
  description: "List all open tabs with their URLs and titles.",
  promptSnippet: "List open browser tabs",
  parameters: EmptyParams,
  async execute() {
    try {
      const ctx = await ensureBrowser();
      const pages = ctx.pages();
      const lines = await Promise.all(
        pages.map(async (p, i) => {
          const title = await p.title().catch(() => "(untitled)");
          return `[${i}] ${p.url()} — ${title}`;
        }),
      );
      return textResult(lines.length > 0 ? lines.join("\n") : "No tabs open.");
    } catch (err) {
      return errorResult(wrapError(err));
    }
  },
};

const SwitchTabParams = Type.Object({
  index: Type.Integer({ minimum: 0, description: "Tab index from chrome_list_tabs" }),
});

export const switchTabTool: ToolDefinition<typeof SwitchTabParams> = {
  name: "chrome_switch_tab",
  label: "Chrome Switch Tab",
  description: "Switch to a tab by index (from chrome_list_tabs).",
  promptSnippet: "Switch to a browser tab by index",
  parameters: SwitchTabParams,
  async execute(_id, args) {
    try {
      const ctx = await ensureBrowser();
      const pages = ctx.pages();
      if (args.index >= pages.length) {
        return textResult(`Tab index ${args.index} out of range (${pages.length} tabs open).`);
      }
      const page = pages[args.index]!;
      await page.bringToFront();
      setActivePage(page);
      const title = await page.title();
      return textResult(`Switched to tab ${args.index}: ${page.url()} — ${title}`);
    } catch (err) {
      return errorResult(wrapError(err));
    }
  },
};

const NewTabParams = Type.Object({
  url: Type.Optional(Type.String({ description: "URL to open. Defaults to about:blank." })),
});

export const newTabTool: ToolDefinition<typeof NewTabParams> = {
  name: "chrome_new_tab",
  label: "Chrome New Tab",
  description: "Open a new tab, optionally navigating to a URL.",
  promptSnippet: "Open a new browser tab",
  parameters: NewTabParams,
  async execute(_id, args) {
    try {
      const ctx = await ensureBrowser();
      const page = await ctx.newPage();
      setActivePage(page);
      if (args.url) {
        await page.goto(args.url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      }
      const title = await page.title();
      const idx = ctx.pages().indexOf(page);
      return textResult(`New tab [${idx}]: ${page.url()} — ${title}`);
    } catch (err) {
      return errorResult(wrapError(err));
    }
  },
};

const CloseTabParams = Type.Object({
  index: Type.Optional(Type.Integer({ minimum: 0, description: "Tab index. Defaults to active tab." })),
});

export const closeTabTool: ToolDefinition<typeof CloseTabParams> = {
  name: "chrome_close_tab",
  label: "Chrome Close Tab",
  description: "Close a tab by index. Defaults to the active (last) tab.",
  promptSnippet: "Close a browser tab",
  parameters: CloseTabParams,
  async execute(_id, args) {
    try {
      const ctx = await ensureBrowser();
      const pages = ctx.pages();
      const idx = args.index ?? pages.length - 1;
      if (idx >= pages.length) {
        return textResult(`Tab index ${idx} out of range (${pages.length} tabs open).`);
      }
      const page = pages[idx]!;
      const url = page.url();
      await page.close();
      const remaining = ctx.pages();
      setActivePage(remaining[remaining.length - 1] ?? null);
      return textResult(`Closed tab ${idx}: ${url}`);
    } catch (err) {
      return errorResult(wrapError(err));
    }
  },
};
