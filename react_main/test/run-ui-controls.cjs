// Renders the route-review fixtures and compares the control and heading
// treatments across pages. This is deliberately about repeated roles, not
// about whether a page contains a section: one control role, one look.
//
//   npm run ui:controls
//   UI_CONTROL_CASES=setup-detail,role-detail npm run ui:controls
//   UI_CONTROL_WIDTHS=1440,390 npm run ui:controls
const fs = require("node:fs");
const path = require("node:path");
const { buildBundle, startServer, openPage, waitForRoute, chromium } = require("./ui-audit/browser-harness.cjs");
const { controlSignature } = require("./ui-audit/control-signature.cjs");

const cwd = path.resolve(__dirname, "..");
const repo = path.resolve(cwd, "..");
const bundle = path.resolve(process.env.UI_CONTROL_BUNDLE || "/tmp/opencode/ultimafia-family-browser");
const output = path.resolve(process.env.UI_CONTROL_OUTPUT || path.join(repo, "docs/frontend-redesign/controls"));
const widths = (process.env.UI_CONTROL_WIDTHS || "1440").split(",").map(Number).filter(Boolean);
const theme = process.env.UI_CONTROL_THEME || "dark";
const only = process.env.UI_CONTROL_CASES ? new Set(process.env.UI_CONTROL_CASES.split(",")) : null;

// Controls can live behind a tab. A step is the same route after one click, so
// the comparison sees the Statistics filter, not only the default tab.
const steps = {
  "setup-detail": [{ name: "statistics", tab: "Statistics" }],
  "profile-default": [{ name: "profile", any: true }],
};

function fingerprint(control) {
  // Compare the treatment, not the surrounding layout: a vertical vote's
  // height is set by the comment row, and its icon colour by whether the
  // viewer voted. Tabs are navigation and are checked for registration only.
  if (control.kind === "vote") {
    const item = control.item || {};
    return JSON.stringify({
      variant: control.variant,
      item: { height: item.height, radius: item.radius, borderWidth: item.borderWidth, fontSize: item.fontSize, fontWeight: item.fontWeight, paddingX: item.paddingX },
    });
  }
  const group = { ...control.group };
  delete group.display;
  return JSON.stringify({ group, item: control.item, selected: control.selected });
}

function describe(control) {
  const item = control.item || {};
  return `${control.itemCount}× ${item.height}px, ${item.fontSize}px/${item.fontWeight}, r${item.radius}, pad ${item.paddingX}, selected ${control.selected?.background || "none"}`;
}

async function capture(browser, origin, item, width) {
  const { page, context, observed } = await openPage({ browser, origin, viewport: { width, height: width >= 900 ? 1000 : 844 }, theme });
  const entry = { name: item.name, route: item.route, width, ok: false, steps: [] };
  try {
    await waitForRoute(page, origin, { route: item.route, mode: item.mode || "member", theme, selector: item.selector, text: item.text, anyContent: item.anyContent });
    entry.steps.push({ name: "default", ...(await page.evaluate(controlSignature)) });
    for (const step of steps[item.name] || []) {
      if (step.any) continue;
      const tab = page.getByRole("tab", { name: step.tab }).first();
      if (!(await tab.count())) continue;
      await tab.click();
      await page.waitForFunction(() => window.__routeReview.pending === 0 && performance.now() - window.__routeReview.lastRequestAt > 300, null, { timeout: 15000, polling: 50 });
      await page.waitForTimeout(250);
      entry.steps.push({ name: step.name, ...(await page.evaluate(controlSignature)) });
    }
    if (observed.runtimeErrors.length) throw new Error(`runtime error: ${observed.runtimeErrors[0].split("\n")[0]}`);
    entry.ok = true;
  } catch (error) {
    entry.error = error.message;
  } finally {
    await context.close();
  }
  console.log(`${entry.ok ? "ok" : "FAILED"} ${item.name} ${width}${entry.steps.map((step) => ` ${step.name}:${step.controls.length}c/${step.headings.length}h`).join("")}`);
  return entry;
}

function analyse(entries) {
  const findings = [];
  const byKind = new Map();

  for (const entry of entries) {
    if (!entry.ok) continue;
    for (const step of entry.steps) {
      for (const control of step.controls) {
        const member = { name: entry.name, route: entry.route, width: entry.width, step: step.name, control };
        if (!control.registered) {
          findings.push({
            severity: "high",
            check: "unregistered-control",
            member: entry.name,
            route: entry.route,
            width: entry.width,
            step: step.name,
            property: control.kind || control.label || control.tag,
            observed: describe(control),
            detail: `Hand-built ${control.tag} group "${control.label}" is not a shared control.`,
          });
          continue;
        }
        if (control.kind === "tabs") continue; // navigation height tracks the page, not a treatment
        // Responsive treatments differ by design; compare within a width.
        const key = `${control.kind}|${control.variant}|${entry.width}`;
        if (!byKind.has(key)) byKind.set(key, []);
        byKind.get(key).push(member);
      }
      for (const heading of step.headings) {
        // Headings that follow leading controls in a row (avatar, vote) are
        // row titles, not section starts; their indent is the control width.
        if (heading.startsSection && heading.offset != null && Math.abs(heading.offset) > 1) {
          findings.push({
            severity: "high",
            check: "heading-misaligned",
            member: entry.name,
            route: entry.route,
            width: entry.width,
            step: step.name,
            property: heading.text || heading.tag,
            observed: `${heading.offset > 0 ? "+" : ""}${heading.offset}px from its container edge`,
            detail: `${heading.tag} at x=${heading.left}, container starts at x=${heading.origin} (${heading.container}).`,
          });
        }
        if (heading.level === 0) {
          findings.push({
            severity: "medium",
            check: "unregistered-heading",
            member: entry.name,
            route: entry.route,
            width: entry.width,
            step: step.name,
            property: heading.text,
            observed: `${heading.fontSize}px/${heading.fontWeight} ${heading.tag}`,
            detail: "Heading-sized bold text without a heading element. Use UiSection or a heading.",
          });
        }
      }
    }
  }

  // Same role, different treatment. One implementation is the contract.
  for (const [key, members] of byKind) {
    const groups = new Map();
    for (const member of members) {
      const print = fingerprint(member.control);
      if (!groups.has(print)) groups.set(print, []);
      groups.get(print).push(member);
    }
    if (groups.size <= 1) continue;
    const variants = [...groups.entries()].map(([print, list]) => ({
      fingerprint: JSON.parse(print),
      routes: [...new Set(list.map((member) => member.name))],
      count: list.length,
      summary: describe(list[0].control),
    }));
    for (const variant of variants) {
      for (const route of variant.routes) {
        findings.push({
          severity: "high",
          check: "control-divergence",
          member: route,
          width: members.find((member) => member.name === route)?.width || widths[0],
          step: members.find((member) => member.name === route)?.step || "default",
          property: `${key}`,
          observed: variant.summary,
          familyValue: variants.filter((entry) => entry !== variant).map((entry) => entry.summary).join(" | "),
          detail: `The same control role has ${groups.size} treatments: ${variants.map((entry) => `${entry.routes.join("/")}: ${entry.summary}`).join("; ")}.`,
        });
      }
    }
  }

  // A page-level vote lives in the page header, like the role and setup pages.
  for (const entry of entries) {
    if (!entry.ok) continue;
    for (const step of entry.steps) for (const control of step.controls) {
      if (control.kind === "vote" && control.variant === "page" && !control.inPageHeader) {
        findings.push({
          severity: "high",
          check: "control-placement",
          member: entry.name,
          route: entry.route,
          width: entry.width,
          step: step.name,
          property: "page vote",
          observed: "outside the page header",
          detail: "Page-level voting belongs in the page header, next to the page actions.",
        });
      }
    }
  }

  const summary = {
    routes: entries.length,
    rendered: entries.filter((entry) => entry.ok).length,
    failed: entries.filter((entry) => !entry.ok).length,
    findings: findings.length,
    high: findings.filter((finding) => finding.severity === "high").length,
    medium: findings.filter((finding) => finding.severity === "medium").length,
    low: findings.filter((finding) => finding.severity === "low").length,
    width: widths,
    theme,
  };
  return { summary, findings, entries };
}

function report(result) {
  const lines = [
    "# UI control and heading consistency",
    "",
    `Generated ${new Date().toISOString()} from controlled production-component fixtures. Widths: ${widths.join(", ")}. Theme: ${theme}.`,
    "",
    "A control role is compared across routes: a segmented filter, a page vote, a heading. One role must have one treatment. A hand-built group is reported even when it is the only one, because that is how a parallel implementation starts.",
    "",
    "## Summary",
    "",
    `- Routes rendered: **${result.summary.rendered}/${result.summary.routes}**`,
    `- Findings: **${result.summary.findings}** (${result.summary.high} high, ${result.summary.medium} medium, ${result.summary.low} low)`,
    "",
    "## Findings",
    "",
  ];
  if (!result.findings.length) {
    lines.push("No divergent controls, unregistered controls or misaligned headings.", "");
  } else {
    lines.push("| Severity | Check | Page | Step | Property | Observed | Detail |");
    lines.push("|---|---|---|---|---|---|---|");
    for (const finding of result.findings) {
      const clean = (value) => String(value ?? "").replace(/\|/g, "\\|");
      lines.push(`| ${finding.severity} | ${finding.check} | ${finding.member}${finding.route ? ` \`${finding.route}\`` : ""} | ${finding.step} | ${clean(finding.property)} | ${clean(finding.observed)} | ${clean(finding.detail)} |`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  buildBundle({ cwd, bundle, skip: process.env.UI_CONTROL_SKIP_BUILD === "1" });
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

    const entries = [];
    for (const width of widths) for (const item of cases) entries.push(await capture(browser, origin, item, width));

    const result = analyse(entries);
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify(result, null, 2));
    fs.writeFileSync(path.join(output, "findings.json"), JSON.stringify(result.findings, null, 2));
    fs.writeFileSync(path.join(output, "report.md"), report(result));
    console.log(JSON.stringify(result.summary, null, 2));
    console.log(`report: ${path.join(output, "report.md")}`);
    if (result.summary.failed || (process.env.UI_CONTROL_FAIL_ON_FINDINGS === "1" && result.summary.findings)) process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
