// Renders every route fixture and reports controls that overlap, sit flush
// against an unrelated control, or clip their own content.
//
//   npm run ui:collisions
//   UI_COLLISION_CASES=setup-detail,host npm run ui:collisions
const fs = require("node:fs");
const path = require("node:path");
const { buildBundle, startServer, openPage, waitForRoute, chromium } = require("./ui-audit/browser-harness.cjs");
const { collisionSignature } = require("./ui-audit/collision-signature.cjs");

const cwd = path.resolve(__dirname, "..");
const repo = path.resolve(cwd, "..");
const bundle = path.resolve(process.env.UI_COLLISION_BUNDLE || "/tmp/opencode/ultimafia-family-browser");
const output = path.resolve(process.env.UI_COLLISION_OUTPUT || path.join(repo, "docs/frontend-redesign/collisions"));
const widths = (process.env.UI_COLLISION_WIDTHS || "1440").split(",").map(Number).filter(Boolean);
const theme = process.env.UI_COLLISION_THEME || "dark";
const only = process.env.UI_COLLISION_CASES ? new Set(process.env.UI_COLLISION_CASES.split(",")) : null;

async function main() {
  buildBundle({ cwd, bundle, skip: process.env.UI_COLLISION_SKIP_BUILD === "1" });
  fs.mkdirSync(output, { recursive: true });
  const server = await startServer({ bundle, publicDir: path.join(cwd, "public") });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const bootstrap = await openPage({ browser, origin, viewport: { width: 1440, height: 1000 }, theme });
    await bootstrap.page.goto(`${origin}/policy/rules?fixtureMode=member&theme=${theme}`, { waitUntil: "load" });
    await bootstrap.page.waitForFunction(() => window.__routeReview?.ready, { timeout: 20000 });
    let cases = await bootstrap.page.evaluate(() => window.__routeReview.cases);
    await bootstrap.context.close();
    if (only) cases = cases.filter((item) => only.has(item.name));

    const results = [];
    for (const width of widths) {
      for (const item of cases) {
        const { page, context } = await openPage({ browser, origin, viewport: { width, height: width >= 900 ? 1000 : 844 }, theme });
        try {
          await waitForRoute(page, origin, {
            route: item.route, mode: item.mode || "member", theme,
            selector: item.selector, text: item.text, anyContent: item.anyContent,
          });
          const signature = await page.evaluate(collisionSignature);
          results.push({ name: item.name, route: item.route, width, ...signature });
          console.log(`${item.name} ${width} overlaps:${signature.overlaps.length} touches:${signature.touches.length} clipped:${signature.clipped.length}`);
        } catch (error) {
          results.push({ name: item.name, route: item.route, width, error: error.message.split("\n")[0] });
          console.log(`FAILED ${item.name} ${width}: ${error.message.split("\n")[0]}`);
        } finally {
          await context.close();
        }
      }
    }

    const findings = [];
    for (const entry of results) {
      for (const overlap of entry.overlaps || []) findings.push({ severity: "high", check: "overlap", name: entry.name, route: entry.route, width: entry.width, ...overlap });
      for (const touch of entry.touches || []) findings.push({ severity: "medium", check: "touching", name: entry.name, route: entry.route, width: entry.width, ...touch });
      for (const clip of entry.clipped || []) findings.push({ severity: "medium", check: "clipped", name: entry.name, route: entry.route, width: entry.width, ...clip });
    }
    const summary = {
      routes: results.length,
      failed: results.filter((entry) => entry.error).length,
      overlaps: findings.filter((finding) => finding.check === "overlap").length,
      touches: findings.filter((finding) => finding.check === "touching").length,
      clipped: findings.filter((finding) => finding.check === "clipped").length,
      width: widths, theme,
    };
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({ summary, results }, null, 2));
    fs.writeFileSync(path.join(output, "findings.json"), JSON.stringify(findings, null, 2));
    const lines = [
      "# UI control collisions",
      "",
      `Generated ${new Date().toISOString()}. Widths: ${widths.join(", ")}. Theme: ${theme}.`,
      "",
      `- Routes rendered: **${summary.routes - summary.failed}/${summary.routes}**`,
      `- Overlapping controls: **${summary.overlaps}**`,
      `- Unrelated controls sharing an edge: **${summary.touches}**`,
      `- Controls clipping their own content: **${summary.clipped}**`,
      "",
      "## Findings",
      "",
    ];
    if (!findings.length) lines.push("No overlaps, flush controls or clipped controls found.", "");
    else {
      lines.push("| Severity | Check | Page | Width | Control A | Control B | Detail |");
      lines.push("|---|---|---|---|---|---|---|");
      for (const finding of findings) {
        const clean = (value) => String(value ?? "").replace(/\|/g, "\\|");
        lines.push(`| ${finding.severity} | ${finding.check} | ${finding.name} \`${finding.route}\` | ${finding.width} | ${clean(finding.a?.label)} | ${clean(finding.b?.label || "")} | ${clean(finding.overlap ? `${finding.overlap[0]}×${finding.overlap[1]}px` : `${finding.clientWidth}/${finding.scrollWidth}`)} |`);
      }
      lines.push("");
    }
    fs.writeFileSync(path.join(output, "report.md"), lines.join("\n"));
    console.log(JSON.stringify(summary, null, 2));
    console.log(`report: ${path.join(output, "report.md")}`);
    if (summary.failed || (process.env.UI_COLLISION_FAIL_ON_FINDINGS === "1" && findings.length)) process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
