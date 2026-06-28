import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto("http://localhost:3001/", { waitUntil: "networkidle" });

const logo = await page.locator('header a[href="#/"]').first();
await logo.waitFor({ state: "visible" });

const outDir = path.resolve(__dirname, "..", "tmp");

// Normal state
await logo.screenshot({ path: path.join(outDir, "nebula-logo-normal.png") });

// Hover state
await logo.hover();
await page.waitForTimeout(1200);
await logo.screenshot({ path: path.join(outDir, "nebula-logo-hover.png") });

await browser.close();
console.log("Screenshots saved to tmp/");
