// Differential render audit: captures the same route from a baseline bundle and
// the current bundle, then reports the changed region. This is how a regression
// is distinguished from a claim: the pixels move, and the changed crop is saved.
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const { chromium, startServer, openPage, waitForRoute } = require("./ui-audit/browser-harness.cjs");

const cwd = path.resolve(__dirname, "..");
const output = path.resolve(process.env.RENDER_DIFF_OUTPUT || "/tmp/opencode/render-diff");
const baselineBundle = path.resolve(process.env.RENDER_DIFF_BASELINE || "/tmp/opencode/ultimafia-head-browser");
const baselinePublic = path.resolve(process.env.RENDER_DIFF_BASELINE_PUBLIC || "/tmp/opencode/ultimafia-head/react_main/public");
const currentBundle = path.resolve(process.env.RENDER_DIFF_CURRENT || "/tmp/opencode/ultimafia-family-browser");
const currentPublic = path.resolve(process.env.RENDER_DIFF_CURRENT_PUBLIC || path.join(cwd, "public"));
const widths = (process.env.RENDER_DIFF_WIDTHS || "1440").split(",").map(Number).filter(Boolean);
const only = process.env.RENDER_DIFF_CASES ? new Set(process.env.RENDER_DIFF_CASES.split(",")) : null;
const theme = process.env.RENDER_DIFF_THEME || "dark";
const threshold = Number(process.env.RENDER_DIFF_THRESHOLD || 16);
const padding = 32;

async function casesFrom(browser, origin) {
  const { page, context } = await openPage({ browser, origin, viewport: { width: 1440, height: 1000 }, theme });
  try {
    await page.goto(`${origin}/policy/rules?fixtureMode=member&theme=${theme}`, { waitUntil: "load" });
    await page.waitForFunction(() => window.__routeReview?.ready, { timeout: 20000 });
    return await page.evaluate(() => window.__routeReview.cases);
  } finally {
    await context.close();
  }
}

async function capture(browser, origin, item, width, target) {
  const { page, context } = await openPage({ browser, origin, viewport: { width, height: width >= 900 ? 1000 : 844 }, theme });
  try {
    await waitForRoute(page, origin, {
      route: item.route,
      mode: item.mode || "member",
      theme,
      selector: item.selector,
      text: item.text,
      anyContent: item.anyContent,
    });
    await page.screenshot({ path: target, fullPage: true, animations: "disabled" });
    return true;
  } catch (error) {
    return error.message.split("\n")[0];
  } finally {
    await context.close();
  }
}

async function compare(basePath, currentPath, name, width) {
  const base = await sharp(basePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const current = await sharp(currentPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const widthPx = Math.min(base.info.width, current.info.width);
  const heightPx = Math.min(base.info.height, current.info.height);
  let count = 0;
  let minX = widthPx, minY = heightPx, maxX = -1, maxY = -1;
  const diff = Buffer.alloc(widthPx * heightPx * 4);
  for (let y = 0; y < heightPx; y++) {
    for (let x = 0; x < widthPx; x++) {
      const bi = (y * base.info.width + x) * 4;
      const ci = (y * current.info.width + x) * 4;
      const delta = Math.max(
        Math.abs(base.data[bi] - current.data[ci]),
        Math.abs(base.data[bi + 1] - current.data[ci + 1]),
        Math.abs(base.data[bi + 2] - current.data[ci + 2]),
      );
      const di = (y * widthPx + x) * 4;
      if (delta > threshold) {
        count++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        diff[di] = 255; diff[di + 1] = 0; diff[di + 2] = 0; diff[di + 3] = 255;
      } else {
        const grey = Math.round((base.data[bi] + base.data[bi + 1] + base.data[bi + 2]) / 3);
        diff[di] = grey; diff[di + 1] = grey; diff[di + 2] = grey; diff[di + 3] = 60;
      }
    }
  }

  const result = {
    name, width,
    baseSize: [base.info.width, base.info.height],
    currentSize: [current.info.width, current.info.height],
    dimensionChanged: base.info.width !== current.info.width || base.info.height !== current.info.height,
    changedPixels: count,
    percent: Number(((count / (widthPx * heightPx)) * 100).toFixed(3)),
  };

  if (!count) return result;

  const x0 = Math.max(0, minX - padding);
  const y0 = Math.max(0, minY - padding);
  const w = Math.min(widthPx - x0, maxX - minX + 1 + padding * 2);
  const h = Math.min(heightPx - y0, maxY - minY + 1 + padding * 2);
  result.box = [x0, y0, w, h];

  fs.mkdirSync(path.join(output, "crops"), { recursive: true });
  await sharp(basePath).extract({ left: x0, top: y0, width: w, height: h }).png().toFile(path.join(output, "crops", `${name}-${width}-baseline.png`));
  await sharp(currentPath).extract({ left: x0, top: y0, width: w, height: h }).png().toFile(path.join(output, "crops", `${name}-${width}-current.png`));
  await sharp(diff, { raw: { width: widthPx, height: heightPx, channels: 4 } }).extract({ left: x0, top: y0, width: w, height: h }).png().toFile(path.join(output, "crops", `${name}-${width}-diff.png`));
  return result;
}

async function main() {
  fs.mkdirSync(path.join(output, "baseline"), { recursive: true });
  fs.mkdirSync(path.join(output, "current"), { recursive: true });
  const baseServer = await startServer({ bundle: baselineBundle, publicDir: baselinePublic });
  const currentServer = await startServer({ bundle: currentBundle, publicDir: currentPublic });
  const baseOrigin = `http://127.0.0.1:${baseServer.address().port}`;
  const currentOrigin = `http://127.0.0.1:${currentServer.address().port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const baseCases = await casesFrom(browser, baseOrigin);
    const currentCases = await casesFrom(browser, currentOrigin);
    const currentByName = new Map(currentCases.map((item) => [item.name, item]));
    let cases = baseCases.filter((item) => currentByName.has(item.name));
    if (only) cases = cases.filter((item) => only.has(item.name));

    const results = [];
    for (const width of widths) {
      for (const baseItem of cases) {
        const currentItem = currentByName.get(baseItem.name);
        const baseFile = path.join(output, "baseline", `${baseItem.name}-${width}.png`);
        const currentFile = path.join(output, "current", `${currentItem.name}-${width}.png`);
        const baseError = await capture(browser, baseOrigin, baseItem, width, baseFile);
        if (baseError !== true) { console.log(`BASE FAILED ${baseItem.name} ${width}: ${baseError}`); continue; }
        const currentError = await capture(browser, currentOrigin, currentItem, width, currentFile);
        if (currentError !== true) { console.log(`CURRENT FAILED ${currentItem.name} ${width}: ${currentError}`); continue; }
        const result = await compare(baseFile, currentFile, baseItem.name, width);
        results.push(result);
        console.log(`${result.changedPixels ? "DIFF" : "same"} ${baseItem.name} ${width} ${result.changedPixels}px ${result.percent}%${result.dimensionChanged ? " size changed" : ""}`);
      }
    }
    fs.writeFileSync(path.join(output, "summary.json"), JSON.stringify({
      generatedAt: new Date().toISOString(),
      baselineBundle, currentBundle, widths, theme, threshold,
      results: results.sort((a, b) => b.changedPixels - a.changedPixels),
    }, null, 2));
    console.log(`summary: ${path.join(output, "summary.json")}`);
  } finally {
    await browser.close();
    baseServer.close();
    currentServer.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
