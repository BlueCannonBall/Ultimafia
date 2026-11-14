# Control and heading consistency

This directory is the evidence for `npm run ui:controls`. The pass renders every
route fixture at 1440 and 390 and compares repeated control roles instead of page
blocks. A role must have one implementation.

## What it measures

- **Segmented choice:** one `UiSegmentedControl` for filters and data views.
- **Page vote:** one `UiVoteControl` pill in the page header; comments and rows
  keep `VoteWidget` inline variants.
- **Tabs:** `UiTabs`, not raw MUI `Tabs`.
- **Section title:** `UiSection` (or an aligned heading), not a bold paragraph.

On phones the segmented control is as wide as its choices, not the column. It
scrolls only when the choices do not fit, and a right-edge fade appears only
while more content is available. The selected label uses the theme text color;
the accent supplies the tint and border, so a custom accent cannot make the
selected label unreadable.

The checks are `unregistered-control`, `control-divergence`,
`heading-misaligned`, `unregistered-heading` and `control-placement`. Responsive
treatments are compared within a width.

## Current result

- 73 routes × 2 widths = **146 renders**, 0 failures.
- **0 findings** at 1440 and 390.
- 0 off-scale values in the structural pass.

## What this pass found in its first run

The point of the pass is that it found these without a list of known defects:

| Surface | Finding |
|---|---|
| Role detail | Fanart title 8px right of every other section heading, and a bold paragraph instead of a heading |
| Setup statistics | Game type was square outlined buttons; Win Rates was a separate pill; profile ratings was a third square variant |
| Host page | Setup collections was a hand-built row of ghost buttons, visually unrelated to the setup filter |
| Lobby, decks, activity | Three more hand-built pressed-state groups, each with its own height, radius and selected fill |
| Shop, Hall of Fame, stocks, competitive, auth | Raw MUI tab strips outside `UiTabs` |
| Setup page | "Strategies" was 14px body text; the strategy vote was a vertical stack inside a one-line row |

The named fixes are the shared components plus their call sites. The structural
family pass still reports 6 highs in activity/directories page containers; those
are page-structure findings, not control-role divergence.

## Files

- `diff/` — baseline (left) and current (right) crops from `test/render-diff.cjs`,
  compared against the last commit. These are the actual changed regions, not
  mockups.
- `report.md` / `findings.json` / `results.json` — latest run.
- `../shots/setup-statistics-desktop.png`, `host-desktop.png`,
  `character-decks-desktop.png`, `activity-desktop.png`, `shop-desktop.png`,
  `hall-of-fame-desktop.png`, `stocks-desktop.png`,
  `authentication-desktop.png`, `forum-thread-desktop.png` — visual check of the
  converted surfaces.
