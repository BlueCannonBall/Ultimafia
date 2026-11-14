// Renders every page family with the existing production-component fixtures and
// compares their structure. This is the discovery step: it does not need a list
// of known flaws, only the grouping in test/ui-audit/families.cjs.
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { spawnSync } = require("node:child_process");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "/tmp/opencode/redesign-tools/node_modules/playwright");
const { familySignature } = require("./ui-audit/family-signature.cjs");
const { compareFamilies } = require("./ui-audit/compare-families.cjs");
const { families, generatedCases, memberOf, caseOverrides } = require("./ui-audit/families.cjs");

const cwd = path.resolve(__dirname, "..");
const repo = path.resolve(cwd, "..");
const bundle = path.resolve(process.env.FAMILY_BUNDLE_DIR || "/tmp/opencode/ultimafia-family-browser");
const publicDir = path.join(cwd, "public");
const output = path.resolve(process.env.FAMILY_OUTPUT || path.join(repo, "docs/frontend-redesign/families"));
const widths = (process.env.FAMILY_WIDTHS || "1440").split(",").map(Number).filter(Boolean);
const theme = process.env.FAMILY_THEME || "dark";
const only = process.env.FAMILY_CASES ? new Set(process.env.FAMILY_CASES.split(",")) : null;
const runName = `run-${new Date().toISOString().replace(/[:.]/g, "-")}`;

const mime = {
  ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".woff": "font/woff", ".woff2": "font/woff2",
  ".ttf": "font/ttf", ".ico": "image/x-icon", ".json": "application/json", ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg", ".wav": "audio/wav", ".webm": "video/webm", ".mp4": "video/mp4",
};
const fixtureSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="320"><rect width="960" height="320" fill="#263e49"/><path d="M0 230L180 120 360 240 520 100 720 240 960 120V320H0Z" fill="#527b85"/><circle cx="800" cy="70" r="32" fill="#d7b77c"/></svg>';

function build() {
  if (process.env.FAMILY_SKIP_BUILD === "1") return;
  console.log("building route-review bundle…");
  const result = spawnSync(
    path.join(cwd, "node_modules/.bin/rsbuild"),
    ["build", "--no-env", "--config", "rsbuild.route-review-test.config.ts"],
    { cwd, env: { ...process.env, ROUTE_BUNDLE_DIR: bundle }, stdio: "inherit" },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`rsbuild exited ${result.status}`);
}

function serve() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    if (request.method !== "GET" && request.method !== "HEAD") { response.writeHead(405); return response.end(); }
    if (pathname.startsWith("/uploads/fixture-")) {
      response.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" });
      return response.end(fixtureSvg);
    }
    if (pathname.startsWith("/api/") || pathname.startsWith("/uploads/")) { response.writeHead(501); return response.end(); }
    let file;
    for (const base of [bundle, publicDir]) {
      const candidate = path.resolve(base, "." + pathname);
      if (candidate.startsWith(base + path.sep) && mime[path.extname(candidate)] && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) { file = candidate; break; }
    }
    if (!file && !path.extname(pathname)) file = path.join(bundle, "index.html");
    if (!file) { response.writeHead(404); return response.end(); }
    response.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function openPage(browser, origin, viewport) {
  const context = await browser.newContext({
    viewport, colorScheme: theme, reducedMotion: "reduce", serviceWorkers: "block",
    locale: "en-US", timezoneId: "UTC",
  });
  const page = await context.newPage();
  const observed = { runtimeErrors: [], consoleErrors: [], blocked: [] };
  page.on("pageerror", (error) => observed.runtimeErrors.push(error.stack || error.message));
  page.on("console", (message) => { if (message.type() === "error") observed.consoleErrors.push(message.text()); });
  page.on("dialog", (dialog) => dialog.dismiss());
  await context.route("**/*", (route) => {
    const target = new URL(route.request().url());
    if (target.origin === origin || ["data:", "blob:"].includes(target.protocol)) return route.continue();
    observed.blocked.push(target.toString());
    return route.abort("blockedbyclient");
  });
  await context.addInitScript(() => {
    const NativeDate = Date;
    const fixed = Date.UTC(2026, 10, 8, 16, 10);
    window.Date = class extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [fixed])); }
      static now() { return fixed; }
    };
    localStorage.setItem("cookieConsent", "rejected");
    localStorage.setItem("cookiePreferences", JSON.stringify({ essential: true, analytics: false, functional: false }));
    document.addEventListener("submit", (event) => event.preventDefault(), true);
  });
  return { page, context, observed };
}

async function loadCase(browser, origin, viewport, item, index, total) {
  const { page, context, observed } = await openPage(browser, origin, viewport);
  const entry = { name: item.name, route: item.route, family: memberOf.get(item.name) || null, width: viewport.width, theme, ok: false };
  try {
    const url = new URL(item.route, origin);
    url.searchParams.set("fixtureMode", item.mode || "member");
    url.searchParams.set("theme", theme);
    entry.captureRoute = url.pathname + url.search;
    await page.goto(String(url), { waitUntil: "load" });
    await page.waitForFunction(() => window.__routeReview?.ready, { timeout: 20000 });
    const content = page.locator("#main-content");
    if (item.selector) await content.locator(item.selector).first().waitFor({ state: "attached", timeout: 15000 });
    else if (item.anyContent) await page.locator("#main-content > *").first().waitFor({ state: "attached", timeout: 15000 });
    else if (item.text) await content.getByText(item.text, { exact: false }).first().waitFor({ state: "attached", timeout: 15000 });
    else await content.locator(".ui-page, .inner-content, h1").first().waitFor({ state: "attached", timeout: 15000 });
    await page.waitForFunction(() => window.__routeReview.pending === 0 && performance.now() - window.__routeReview.lastRequestAt > 400, null, { timeout: 15000, polling: 50 });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      await Promise.all([...document.images].filter((image) => image.currentSrc).map((image) => image.decode().catch(() => {})));
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    if (await page.locator("[data-route-review-failure]").count()) {
      const detail = await page.locator("[data-route-review-failure]").first().innerText().catch(() => "");
      throw new Error(`production route error boundary displayed: ${detail.replace(/\s+/g, " ").slice(0, 300)}`);
    }
    const fixture = await page.evaluate(() => ({
      errors: window.__routeReview.errors || [],
      unresolved: window.__routeReview.unresolved || [],
    }));
    if (fixture.errors.length || fixture.unresolved.length) throw new Error(`fixture contract failed: ${JSON.stringify(fixture.errors[0] || fixture.unresolved[0])}`);
    if (observed.runtimeErrors.length) throw new Error(`runtime error: ${observed.runtimeErrors[0].split("\n")[0]}`);
    entry.signature = await page.evaluate(familySignature);
    if (memberOf.get(item.name) === "editors-setup") {
      const settingsButton = page.getByRole("button", { name: "Game settings" }).first();
      if (await settingsButton.count()) {
        await settingsButton.click();
        await page.waitForTimeout(250);
        entry.settingsSignature = await page.evaluate(familySignature);
        entry.hasSettingsStep = true;
      } else if (await page.locator(".setup-settings-step:not([hidden])").count()) {
        entry.settingsSignature = entry.signature;
        entry.hasSettingsStep = true;
      } else {
        entry.hasSettingsStep = false;
      }
    }
    entry.ok = true;
  } catch (error) {
    entry.error = error.message;
    entry.observed = observed;
  } finally {
    await context.close();
  }
  console.log(`[${index + 1}/${total}] ${entry.family || "?"} ${item.name} ${viewport.width} ${entry.ok ? `ok ${entry.signature.blocks.length} blocks` : `FAILED ${entry.error}`}`);
  return entry;
}

function writeReport(result) {
  const lines = [];
  lines.push("# UI family comparison", "");
  lines.push(`Generated ${new Date().toISOString()} from controlled production-component fixtures. Widths: ${result.summary.width.join(", ")}. Theme: ${result.summary.theme}.`);
  lines.push("", "This is a structural comparison, not visual acceptance. It finds pages of the same kind that disagree about their parts, containers, typography or spacing. It does not judge taste.");
  lines.push("", "## Summary", "");
  lines.push(`- Routes rendered: **${result.summary.rendered}/${result.summary.routes}**`);
  lines.push(`- Findings: **${result.summary.findings}** (${result.summary.high} high, ${result.summary.medium} medium, ${result.summary.low} low)`);
  lines.push(`- Render failures: **${result.summary.failed}**`);
  lines.push("");
  lines.push("| Family | Compared | High | Medium | Low |");
  lines.push("|---|---|---|---|---|");
  for (const family of result.families) {
    lines.push(`| ${family.label} (${family.width}px) | ${family.compared.length} | ${family.high} | ${family.medium} | ${family.low} |`);
  }
  lines.push("", "## Site-wide value census", "");
  lines.push("Distinct values actually rendered across the compared routes. A long tail here is the measurable form of \"inconsistent\".");
  lines.push("");
  for (const [label, key] of [["Card radii", "cardRadii"], ["Card containers", "cardContainers"], ["Heading font sizes", "headingSizes"], ["Action heights", "actionHeights"], ["List primitives", "listPrimitives"]]) {
    const values = result.census[key].slice(0, 12);
    lines.push(`**${label}** — ${result.census[key].length} distinct`);
    lines.push("");
    lines.push("| Value | Elements | Routes |");
    lines.push("|---|---|---|");
    for (const value of values) lines.push(`| ${value.value} | ${value.count} | ${value.routes} |`);
    lines.push("");
  }
  lines.push("## Off-scale elements", "");
  lines.push(`**${result.summary.offScaleElements}** rendered values fall outside the approved scale. This is the tail the cleanup has to remove.`, "");
  lines.push("| Property | Elements | Routes | Offending values |");
  lines.push("|---|---|---|---|");
  for (const [label, key] of [["Heading size", "headings"], ["Card radius", "cardRadii"], ["Card padding", "cardPadding"], ["Action height", "actionHeights"], ["Action radius", "actionRadii"]]) {
    const entry = result.offScale[key];
    lines.push(`| ${label} | ${entry.elements} | ${entry.routes} | ${entry.values.slice(0, 8).map((value) => `${value.value}px ×${value.count}`).join(", ") || "—"} |`);
  }
  lines.push("");
  lines.push("## Findings by family", "");
  for (const family of result.families) {
    const findings = result.findings.filter((finding) => finding.family === family.family && (!finding.width || finding.width === family.width));
    lines.push(`### ${family.label} (${family.width}px)`, "");
    if (family.note) lines.push(family.note, "");
    if (family.compared.length < 2) { lines.push("Not enough rendered members to compare.", ""); continue; }
    if (!findings.length) { lines.push("No structural divergence found.", ""); continue; }
    lines.push("| Severity | Page | Property | Observed | Family norm | Detail |");
    lines.push("|---|---|---|---|---|---|");
    for (const finding of findings.slice(0, 30)) {
      const route = finding.route ? `\`${finding.route}\`` : "";
      lines.push(`| ${finding.severity} | ${finding.member} ${route} | \`${finding.property}\` | ${String(finding.observed).replace(/\|/g, "\\|")} | ${String(finding.familyValue).replace(/\|/g, "\\|")} | ${String(finding.detail || "").replace(/\|/g, "\\|")} |`);
    }
    if (findings.length > 30) lines.push(`| … | | | | | ${findings.length - 30} more in findings.json |`);
    lines.push("");
  }
  if (result.failures.length) {
    lines.push("## Cases that did not render", "");
    lines.push("| Page | Width | Error |");
    lines.push("|---|---|---|");
    for (const failure of result.failures) lines.push(`| ${failure.name} ` + "`" + failure.route + "`" + ` | ${failure.width} | ${String(failure.error).replace(/\|/g, "\\|")} |`);
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  if (process.env.FAMILY_REPORT_ONLY === "1") {
    const result = JSON.parse(fs.readFileSync(path.join(output, "results.json")));
    const comparison = compareFamilies({ ...result, families });
    fs.writeFileSync(path.join(output, "findings.json"), JSON.stringify(comparison, null, 2));
    fs.writeFileSync(path.join(output, "report.md"), writeReport(comparison));
    console.log(JSON.stringify(comparison.summary, null, 2));
    return;
  }
  build();
  fs.mkdirSync(output, { recursive: true });
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const bootstrap = await openPage(browser, origin, { width: 1440, height: 1000 });
    await bootstrap.page.goto(`${origin}/policy/rules?fixtureMode=member&theme=${theme}`, { waitUntil: "load" });
    await bootstrap.page.waitForFunction(() => window.__routeReview?.ready, { timeout: 20000 });
    const configured = await bootstrap.page.evaluate(() => window.__routeReview.cases);
    await bootstrap.context.close();

    const cases = [...configured];
    for (const generated of generatedCases) if (!cases.some((item) => item.name === generated.name)) cases.push(generated);
    const byName = new Map(cases.map((item) => [item.name, item]));
    for (const [name, override] of Object.entries(caseOverrides)) {
      const base = byName.get(name);
      if (base) byName.set(name, { ...base, ...override });
    }

    const missing = [...memberOf.keys()].filter((name) => !byName.has(name));
    if (missing.length) console.log(`family members with no route case: ${missing.join(", ")}`);

    let selected = [...memberOf.keys()].map((name) => byName.get(name)).filter(Boolean);
    if (only) selected = selected.filter((item) => only.has(item.name));

    const result = { runName, generatedAt: new Date().toISOString(), widths, theme, cases: [] };
    const resultsPath = path.join(output, "results.json");
    let index = 0;
    for (const width of widths) for (const item of selected) {
      const viewport = { width, height: width >= 900 ? 1000 : 844 };
      const entry = await loadCase(browser, origin, viewport, item, index, selected.length * widths.length);
      result.cases.push(entry);
      index++;
      fs.writeFileSync(resultsPath, JSON.stringify(result, null, 2));
    }

    const comparison = compareFamilies({ ...result, families });
    fs.writeFileSync(path.join(output, "findings.json"), JSON.stringify(comparison, null, 2));
    fs.writeFileSync(path.join(output, "report.md"), writeReport(comparison));
    console.log(JSON.stringify(comparison.summary, null, 2));
    console.log(`report: ${path.join(output, "report.md")}`);
    if (comparison.summary.failed || (process.env.FAMILY_FAIL_ON_FINDINGS === "1" && comparison.summary.findings)) process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
