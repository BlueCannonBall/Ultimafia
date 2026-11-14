// Captures the surfaces that structural checks cannot judge: full pages plus the
// individual cards/comments/editor regions. Run after layout or card changes and
// inspect the images; a green structural report is not visual acceptance.
const fs = require("node:fs");
const path = require("node:path");
const { chromium, buildBundle, startServer, openPage, waitForRoute } = require("./ui-audit/browser-harness.cjs");

const cwd = path.resolve(__dirname, "..");
const repo = path.resolve(cwd, "..");
const bundle = path.resolve(process.env.UI_SHOTS_BUNDLE || "/tmp/opencode/ultimafia-family-browser");
const publicDir = path.join(cwd, "public");
const output = path.resolve(process.env.UI_SHOTS_OUTPUT || path.join(repo, "docs/frontend-redesign/shots"));
const theme = process.env.UI_SHOTS_THEME || "dark";

const shots = [
  {
    name: "profile-user-desktop",
    route: "/user/fixture-default",
    text: "ArianeSachi62",
    width: 1440,
    elements: [
      ["profile-user-stats", "#main-content .ui-card", "KUDOS"],
      ["profile-user-comments", ".profile-comments"],
      ["profile-user-ratings", "#main-content .ui-card", "Mafia Ratings"],
      ["profile-user-stock", "#main-content .ui-card", "Stock & Equity"],
    ],
  },
  {
    name: "profile-family-desktop",
    route: "/user/family/fixture-family",
    text: "The Harbor and a longer family name",
    width: 1440,
    elements: [["profile-family-comments", ".family-comments"]],
  },
  {
    name: "profile-custom-desktop",
    route: "/user/fixture-custom",
    text: "About me",
    width: 1440,
    elements: [
      ["profile-custom-comments", ".profile-comments"],
      ["profile-custom-stats", "#main-content .ui-card", "KUDOS"],
    ],
  },
  {
    name: "profile-user-phone",
    route: "/user/fixture-default",
    text: "ArianeSachi62",
    width: 390,
    elements: [["profile-user-comments-phone", ".profile-comments"]],
  },
  {
    name: "profile-family-phone",
    route: "/user/family/fixture-family",
    text: "The Harbor and a longer family name",
    width: 390,
    elements: [["profile-family-comments-phone", ".family-comments"]],
  },
  { name: "setup-statistics-desktop", route: "/learn/setup/fixture-setup-0", text: "Classic", tab: "Statistics", width: 1440, elements: [["setup-game-type-filter", ".ui-segmented-shell"]] },
  { name: "host-desktop", route: "/play/host", text: "Host a game", width: 1440, elements: [["host-collections", ".ui-segmented-shell"]] },
  { name: "lobby-desktop", route: "/play", selector: ".lobby-status-tabs", width: 1440, elements: [["lobby-status", ".ui-segmented-shell"]] },
  { name: "character-decks-desktop", route: "/play/decks?game=Mafia", selector: ".deck-library-toolbar", width: 1440 },
  { name: "activity-desktop", route: "/activity/metrics", text: "Site activity", width: 1440 },
  { name: "shop-desktop", route: "/user/shop", text: "Shop", width: 1440 },
  { name: "hall-of-fame-desktop", route: "/fame/hall-of-fame", text: "Hall of Fame", width: 1440 },
  { name: "stocks-desktop", route: "/fame/stocks", text: "Stock Market", width: 1440 },
  { name: "competitive-desktop", route: "/fame/competitive", text: "Season 1 standings", width: 1440 },
  { name: "authentication-desktop", route: "/auth/login", mode: "guest", selector: 'input[type="password"]', width: 1440 },
  { name: "forum-thread-desktop", route: "/community/forums/thread/fixture-thread-0", anyContent: true, width: 1440 },
  { name: "reference-role-desktop", route: "/learn/role/Cop", text: "Each night, you can choose to visit one player", width: 1440 },
  { name: "reference-setup-desktop", route: "/learn/setup/fixture-setup-0", text: "Classic", width: 1440 },
  { name: "competitive-faq-desktop", route: "/fame/competitive/faq", text: "Competitive FAQ", width: 1440, elements: [["competitive-faq-table", ".ui-table"]] },
  { name: "ban-appeals-desktop", route: "/policy/moderation/ban-appeals", mode: "staff", selector: ".ui-table", width: 1440, elements: [["ban-appeals-table", ".ui-table"]] },
  { name: "editor-mafia-desktop", route: "/play/create?game=Mafia&copy=fixture-setup-0", selector: ".setup-wizard", width: 1440 },
  { name: "editor-jotto-desktop", route: "/play/create?game=Jotto", selector: ".setup-wizard", width: 1440 },
  { name: "editor-chess-desktop", route: "/play/create?game=Chess", selector: ".setup-wizard", width: 1440 },
  { name: "editor-chess-phone", route: "/play/create?game=Chess", selector: ".setup-wizard", width: 390 },
];

function contactSheet(entries) {
  const lines = [];
  lines.push("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">");
  lines.push("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">");
  lines.push("<title>UltiMafia visual review</title>");
  lines.push("<style>body{background:#191719;color:#f4eef0;font-family:'Fira Sans',system-ui,sans-serif;margin:0;padding:32px}main{width:min(1180px,100%);margin:auto}h1{font-size:24px}h2{font-size:18px;margin-top:40px;border-bottom:1px solid #423a3e;padding-bottom:8px}figure{margin:0 0 28px}figcaption{font-size:13px;color:#bcb0b6;margin-bottom:8px}img{max-width:100%;height:auto;border:1px solid #423a3e;border-radius:6px;display:block}a{color:#ed7c87}</style></head><body><main>");
  lines.push("<h1>UltiMafia visual review</h1>");
  lines.push("<p style=\"color:#bcb0b6\">Captured from production route components with controlled fixtures. Inspect these after layout or card changes; the structural report is not visual acceptance.</p>");
  const groups = new Map();
  for (const entry of entries) {
    if (!groups.has(entry.group)) groups.set(entry.group, []);
    groups.get(entry.group).push(entry);
  }
  for (const [group, items] of groups) {
    lines.push(`<h2>${group}</h2>`);
    for (const item of items) {
      lines.push(`<figure><figcaption>${item.name}${item.viewport ? ` — ${item.viewport}px` : ""}</figcaption><a href="${item.file}"><img src="${item.file}" alt="${item.name}" loading="lazy"></a></figure>`);
    }
  }
  lines.push("</main></body></html>");
  return lines.join("\n");
}

async function main() {
  buildBundle({ cwd, bundle, skip: process.env.UI_SHOTS_SKIP_BUILD === "1" });
  fs.mkdirSync(output, { recursive: true });
  const server = await startServer({ bundle, publicDir });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true });
  const captured = [];
  try {
    for (const shot of shots) {
      const { page, context } = await openPage({
        browser, origin, viewport: { width: shot.width, height: shot.width >= 900 ? 1100 : 844 }, theme,
      });
      try {
        await waitForRoute(page, origin, {
          route: shot.route, mode: shot.mode || "member", theme,
          text: shot.text, selector: shot.selector, anyContent: shot.anyContent,
        });
        if (shot.tab) {
          await page.getByRole("tab", { name: shot.tab }).first().click();
          await page.waitForTimeout(900);
        }
        const fullName = `${shot.name}.png`;
        await page.screenshot({ path: path.join(output, fullName), fullPage: true, animations: "disabled" });
        captured.push({ group: "Pages", name: shot.name, file: fullName, viewport: shot.width });
        for (const element of shot.elements || []) {
          const [name, selector, contains] = element;
          const locator = contains
            ? page.locator(selector).filter({ hasText: contains }).first()
            : page.locator(selector).first();
          if (!(await locator.count())) { console.log(`skip ${name}: no ${selector}`); continue; }
          const file = `${name}.png`;
          await locator.screenshot({ path: path.join(output, file), animations: "disabled" });
          captured.push({ group: "Regions", name, file, viewport: shot.width });
        }
        console.log(`${shot.name} (${shot.width}px)`);
      } catch (error) {
        console.log(`${shot.name} FAILED: ${error.message.split("\n")[0]}`);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  fs.writeFileSync(path.join(output, "index.html"), contactSheet(captured));
  fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), theme, screenshots: captured }, null, 2));
  console.log(`contact sheet: ${path.relative(repo, path.join(output, "index.html"))}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
