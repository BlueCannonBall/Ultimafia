# UI page families — draft for review

**Status: revised after your review.** The remaining open questions are at the bottom.
This is the input that lets a machine find structural inconsistencies without anyone
writing a list of flaws.

## Your decisions, as I understood them

| Item | Decision |
|---|---|
| User profiles and family profiles | Same family. They must *appear* similar; how much code they share is a separate question. |
| Stock market | Not a directory. Table on desktop, cards on mobile. |
| Invoices | Moderation workspace. |
| Chat | A window only. Not a page. |
| `/play/host` | A directory page, grouped with the deck pages. It is the only real setup listing. |

Correct me if any of those are wrong.

## How this is checked

`npm run ui:families` renders every member of every family from the existing
production route components and synthetic fixtures, then compares the rendered
structure. It writes `docs/frontend-redesign/families/report.md` and `findings.json`.

- `FAMILY_SKIP_BUILD=1` reuses a built bundle.
- `FAMILY_CASES=profile-custom,role-detail` narrows a run.
- `FAMILY_WIDTHS=1440,390` sets the viewports.
- `FAMILY_FAIL_ON_FINDINGS=1` fails the command while any finding remains.

The comparison does not use screenshots or a list of known flaws. It measures every
visible block on every route: presence, container, heading level, typography,
spacing, horizontal overflow and text contrast. It also checks each page against
itself (mixed card containers, same-level heading sizes, list treatments) and
reports a site-wide census of rendered values.

`npm run ui:dialogs` covers the click-only surfaces. It opens dialog-like overlays
by clicking production controls and measures each one it reaches, writing
`docs/frontend-redesign/dialogs/report.md`. The source inventory is the denominator,
and routes where no overlay was reached are listed as unverified rather than clean.

`npm run ui:shots` captures full pages plus the cards, comments and editor regions
to `docs/frontend-redesign/shots/`, and writes a contact sheet at
`docs/frontend-redesign/shots/index.html`. Run it after layout or card changes and
inspect the images. The structural report cannot see computed padding overrides,
card rhythm or inner spacing on its own.

The scale decision is rendered at `docs/frontend-redesign/scale-preview.html`, with
PNG captures beside it: six type sizes, five corner roles, four control heights and
the before/after component treatment.

The approved scale is encoded in `components/ui/designTokens.js` and enforced by the
checker: 6px cards, 8px controls, 12px dialogs, 12–24px type, 32/40/44/64 control
heights and the 4–32px spacing steps. The family report's **off-scale elements** count
is the regression gate. It reached zero on the measured routes after the shared-kit
migration; new raw values will raise it again.

Source-level debt is tracked separately: `npm run ui:debt` writes
`docs/frontend-redesign/debt/queue.md` and enforces a burn-down baseline at
`react_main/test/ui-scale-debt.json`. Confirmation dialogs use the shared
`confirmAction` / `ConfirmHost` rather than `window.confirm`.

Not covered yet: overlays that only open from a row action, long press or other
state the generic scan cannot reach; the light theme; pages whose authored
background is not marked `data-custom-background`; and judgements of taste or
content order.

## Progress (2026-11-13)

- **Setup editors:** one wizard in `CreateBrowser`. Steps are content-driven: roles,
  modifiers, then game settings, and a step is omitted when the game has no content
  for it. All 17 editors measured zero structural findings at 1440 and 390. Jotto
  and Wacky Words have roles but no game settings, so they open on roles and never
  show an empty settings step.
- **Profiles:** user and family panels are `ui-card` with a verified computed
  surface: 16px padding, theme background, 6px radius; the banner card stays
  edge-to-edge. Comments have their own card on both kinds, including authored
  backgrounds. Profiles have zero high findings. Card gaps are 16px, the desktop
  column gap is 24px, padding is equal on all sides, and the last comment row no
  longer adds trailing padding. The ratings card has the pie chart back under the
  summary, one 16px spacing stack, and no duplicate count in its title. The stock
  card uses only the card's 16px padding. Custom profile colors tint every card (24% into
  the theme surface), including the header, so comments, ratings and the header no
  longer sit on a different or low-contrast surface. Remaining medium findings compare the family text
  header with the user media banner and the family actions block; they are content
  differences, not container or typography divergence.
- **Confirmations:** 37 `window.confirm` sites use the shared `confirmAction` /
  `ConfirmHost`; two deliberate exceptions remain.
- **Debt baseline:** 307 sites, 252 actionable on site routes.
- **Global comparison:** 108 findings, 14 high, 0 off-scale at 1440/390.
  Geometry checks cover per-side card padding, card gap spread, cross-page gap
  divergence, comment tail padding and double card padding.
- **Remaining high findings:** 14, in reference, directories, moderation, longform
  and activity — mostly table/section primitive splits.

## Why families

A page can be wrong without any single value being wrong. The family profile is built
from cards; the user profile is built from bare `div`s with inline styles. Both could
use 14px text and 8px corners and still not look like each other. Counting text sizes
cannot see that. Comparing the two page skeletons can.

**A family is an appearance contract, not a code-sharing requirement.** Two pages can
share a skeleton without sharing a single component. The check compares what is
rendered — which parts are present, in what order, inside what kind of container — not
what is imported. That matters here because you are unsure how much code these pages
can practically share, and the answer does not have to be decided before the
differences can be found.

For each family the checker renders every member and compares:

1. **Skeleton** — the same parts in the same order (header, identity block, stats,
   body, comments).
2. **Containers** — the same container for the same kind of content. If one page uses
   a card and the other a floating block, that is a finding even if both look tidy.
3. **Contract** — the same treatment for the same job (list, row, vote control, stat,
   empty state).

Differences become the to-do list.

---

## 1. Identity profiles

**Members**

- `/user` — your own profile (`pages/User/Profile.jsx`)
- `/user/:userId` — another player's profile (same file)
- `/user/family/:familyId` — family profile (`pages/User/Family.jsx`)

**Must match:** page header, banner, identity row (avatar, name, tags, actions),
authored bio block, stats grid, member/friend list, comments placement.

**Diverges today**

- Family is built from `Paper className="ui-card"` five times
  (`Family.jsx:353, 450, 473, 509, 520`).
- Profile is built from `div className="box-panel"` with inline `style={panelStyle}`
  (`Profile.jsx:1616, 1657, 1711, 1721, 1825`), plus a bare `Paper` with inline
  `sx` at `Profile.jsx:2030`.
- Only Profile sets `data-custom-background` (`Profile.jsx:1607`), so the two pages
  already have different rules for user-authored backgrounds.

**Direction:** the target is that both read as the same kind of surface. That means
adding a proper container to the user profile, not stripping the cards out of the
family page — which is what the previous attempt did.

## 2. Reference detail pages

**Members**

- `/learn/setup/:setupId` — setup info (`pages/Learn/Setup/SetupPage.jsx`)
- `/learn/role/:RoleName` — role info (`pages/Learn/role/RolePage.jsx`)

**Must match:** title area, description prose, stat rows, vote/like control,
comments, related links.

**Diverges today**

- Role page has its own private design language: `role-hero`, `role-meta-row`,
  `role-tags`, `role-hero-actions`, `role-vote-pill`, `role-skin-control`,
  `role-info-section` (`RolePage.jsx:330-345`, `199-264`).
- Setup page mixes two container systems on the same page: `div.box-panel`
  (`SetupPage.jsx:876, 912`) and `UiSection className="ui-card"` (`SetupPage.jsx:923`),
  with raw `Typography` alongside the newer UI components.
- Votes are rendered differently on the two pages.

**Question (still open):** should role pages become a reference page built from the
same sections as setup pages, or does a role page need a different skeleton
(portrait/skin, tags, alignment) enough to be its own family?

## 3. Directories and standings

**Members**

- `/community/users` — player search (`UserSearch.jsx`)
- `/community/families` — family directory (`FamilyDiscovery.jsx`)
- `/play/host` — setup directory (`Host/HostBrowser.jsx`)
- `/play/decks` (`Decks/DeckSelector.jsx` → `DeckLibrary.jsx`)
- `/play/tutorial` (`Tutorial/TutorialPicker.jsx`)
- `/play/wordDecks` (`WordDecks/WordDeckSelector.jsx`)
- `/fame/hall-of-fame` (`HallOfFame.jsx`)
- `/fame/contributors` (`Contributors.jsx`)
- `/fame/donors` (`Donors.jsx`)
- `/fame/competitive` (`Competitive.jsx`)
- `/user/notifications` — notification list (`Inbox.jsx`)

**Not a member:** `/fame/stocks` — table on desktop, cards on mobile. Recorded under
"pages with no sibling" as the reference for responsive data views.

**Must match:** header + description, filter/search row, list container, row anatomy
(leading identity, primary label, secondary meta, trailing action), empty state,
loading state, count/pagination.

**Diverges today**

Five different `<ul>` list primitives are in use for the same job, plus two pages
that use raw MUI `Stack` with inline `sx` instead of any list primitive at all:

- `ul.family-directory-list` (`FamilyDiscovery.jsx:85`)
- `ul.player-directory-list` (`UserSearch.jsx:85, 158`)
- `ul.host-setup-list` / `li.host-setup-row` (`HostBrowser.jsx:117`)
- `ul.deck-library-list` / `li.deck-library-row` (`DeckLibrary.jsx:79`)
- `Stack.standings-list` (`HallOfFame.jsx:157`)
- raw `Stack` with `sx` (`TutorialPicker.jsx:67`, `Inbox.jsx:154`)

**Note:** `/learn/games` is no longer in this family. It is a game *reference*
browser — pick a game type, then read its roles and items — not a list of setups.
`/play/host` is the setup listing. If the reference browser still feels like a
directory to you, say so and I will move it back.

## 4. Forums

**Members**

- `/community/forums` — categories (`Categories.jsx`)
- `/community/forums/board/:boardId` (`Board.jsx`)
- `/community/forums/thread/:threadId` (`Thread.jsx`)
- `/community/forums/search` (`SearchResults.jsx`)

**Must match:** breadcrumb, toolbar, list, post anatomy, reply composer, pagination.

**Note:** forum posts are a *separate renderer* from site comments
(`Thread.jsx:1279` uses `.post`; `Comment.jsx:54` uses `.comment-row`). See the
cross-cutting table.

## 5. Setup, deck and word-deck editors

**Members**

- `/play/create` — 16 editor variants (`pages/Play/CreateSetup/*.jsx`)
- `/play/createDeck` (`Decks/CreateDeck.jsx`)
- `/play/createWordDeck` (`WordDecks/CreateWordDeck.jsx`)

**Must match:** section/step layout, field set, validation display, footer actions
(cancel/save), unsaved-changes handling, how roles/items are picked.

**Decision:** one skeleton for all 16. They do essentially the same job and can be
nearly identical. The Mafia editor is the only one that currently reads as finished,
so it is the reference member for this family.

**Why this matters most:** 16 files where one game's editor is a sibling of the
other 15. This is the largest family and the likeliest place for drift.

## 6. Settings

**Members** — `/user/settings/{site, profile, game, account, github, cookies, family}`
(`Settings.jsx`, seven sections at `Settings.jsx:1173-1274`)

**Must match:** section navigation, field grouping, save/reset bar, destructive
confirmations, disabled/error states.

## 7. Moderation workspace

**Members**

- `/policy/moderation` (log), `/tools`, `/groups`
- `/policy/flagged-intake`, `/policy/github-links`
- `/policy/ban-appeals`, `/policy/ban-appeals/:appealId`
- `/policy/competitive`, `/policy/reports/*`
- `/policy/invoices` — donation invoices (`Invoices.jsx`)

**Must match:** side navigation, table/list treatment, shared dialogs, explicit
actions with cancellation, empty and failure states.

## 8. Long-form documents

**Members**

- `/policy/rules`, `/policy/tos`, `/policy/privacy`
- `/policy/handbook`
- `/learn/glossary`
- `/fame/competitive/faq`
- `/policy/volunteer` (if it is prose)

**Must match:** reading width, heading hierarchy, prose typography, link style,
tables inside prose, anchor/table-of-contents treatment.

## 9. Activity

**Members**

- `/activity/metrics` (`Metrics.jsx`)
- `/activity/livefeed` (`LiveFeed.jsx`)

**Must match:** window/filter control, row anatomy, timestamps, pagination or
"load more".

## 10. Floating windows

**Members**

- DM window — `components/dms/FloatingDmWindow.jsx`, which renders
  `pages/Chat/Chat.jsx`. This is the "chat" component; there is no separate chat
  page.
- Profile sheet / user card
- Strategy and guide windows (`FloatingStrategyWindows`)

**Must match:** window chrome and header, title, close/expand control, placement,
focus behaviour, scroll containment, mobile treatment.

**Excluded:** in-game chat belongs to the game workspace (section 11), not here.

## 11. Game workspace — excluded from unification

**Members** — `pages/Game/Game.jsx` plus 14 game-type views.

Per `AGENTS.md` this is a competitive workspace: preserve panel structure,
information density, role placement and phase controls. It should be checked for
breakage (overlap, clipping, unreadable text) but **not** restyled to match site
pages. Listing it here so it is explicitly excluded rather than forgotten.

---

## Cross-cutting contracts (not pages)

These must match wherever they appear, regardless of family. This is where the
comment problem lives.

| Contract | Where it appears | Problem today |
|---|---|---|
| **Comments** | Profile, Family, Setup, Role, Lobby, Forum thread | One shared renderer (`Comments.jsx` / `Comment.jsx`) plus a separate forum post renderer (`Thread.jsx:1279`). Two stylesheets. |
| Comment readability on authored backgrounds | Profiles, families with custom backgrounds | `.comment-row` has `background: transparent` (`css/comments.css:43`), so it has no surface of its own. Removing the surrounding panel is what made comments unreadable. |
| Identity row (avatar, name, role/tag, level) | Almost every list, card, comment, message | Not yet audited |
| Numbers and stat rows | Profiles, setups, roles, moderation, activity | Not yet audited |
| Vote / like / rating control | Setup page, role page, forum, comments | Setup and role differ |
| Action buttons (primary / secondary / destructive) | Everywhere | 54 MUI buttons + 53 native `<button>` in the legacy baseline |
| Dialogs and confirmations | Everywhere | 27 MUI dialogs + 39 `window.confirm` calls |
| Empty / loading / error states | Every list and detail page | Not yet audited |
| Tabs and section navigation | Learn, settings, moderation, shop, profiles | 12 MUI tabs + bespoke tab strips |
| Tables | Moderation, invoices, stocks, competitive | 28 MUI `Paper` wrappers, mixed with `UiTable`; stocks changes to cards on mobile |
| Tags / badges / alignment colours | Roles, setups, profiles, games | Not yet audited |
| Timestamps | Comments, forums, activity, notifications | Relative vs absolute varies |
| Pagination | Forums, directories, activity | Not yet audited |

## Pages with no sibling

These cannot be compared structurally; they need their own checklist rather than a
family.

- `/welcome` — front page (`Welcome.jsx`)
- `/play` — lobby browser (`LobbyBrowser.jsx`). Live games, not a directory; carries
  the ranked/competitive cue rules and the daily challenge and competitive rounds.
- `/banned` (`Banned.jsx`)
- `/user/shop` (`Shop.jsx`) — product grid
- `/community/feedback` (`Feedback.jsx`)
- `/user/developer` (`DeveloperApi.jsx`)
- `/fame/stocks` (`StockMarket.jsx`) — table on desktop, cards on mobile. Recorded as
  a page with no sibling; its phone behaviour is not being adopted as a site-wide
  pattern yet.

## Open questions

1. **Role pages** — same reference skeleton as setup pages, or their own family?

Resolved since the last draft: game editors share one skeleton (Mafia as reference);
`/learn/games` stays out of directories; the stock market's phone layout is not yet a
site-wide pattern.
