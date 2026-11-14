// Renders the standalone scale preview to PNG for review. No app build needed.
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "/tmp/opencode/redesign-tools/node_modules/playwright");

const root = path.resolve(__dirname, "..", "..");
const html = path.join(root, "docs/frontend-redesign/scale-preview.html");
const output = path.join(root, "docs/frontend-redesign");

const variants = [
  { file: "scale-preview-corners-6-title-24.png", query: "" },
  { file: "scale-preview-corners-12-title-32.png", query: "?corners=12&title=32" },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const variant of variants) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
      await page.goto(`file://${html}${variant.query}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(output, variant.file), fullPage: true });
      await page.close();
      console.log(path.join(output, variant.file));
    }
    const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await phone.goto(`file://${html}`, { waitUntil: "load" });
    await phone.evaluate(() => document.fonts.ready);
    await phone.screenshot({ path: path.join(output, "scale-preview-phone.png"), fullPage: true });
    await phone.close();
    console.log(path.join(output, "scale-preview-phone.png"));
  } finally {
    await browser.close();
  }
})();
