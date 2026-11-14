# UI family comparison

Generated 2026-11-14T05:41:13.040Z from controlled production-component fixtures. Widths: 1440, 390. Theme: dark.

This is a structural comparison, not visual acceptance. It finds pages of the same kind that disagree about their parts, containers, typography or spacing. It does not judge taste.

## Summary

- Routes rendered: **136/136**
- Findings: **108** (14 high, 94 medium, 0 low)
- Render failures: **0**

| Family | Compared | High | Medium | Low |
|---|---|---|---|---|
| Identity profiles (1440px) | 7 | 0 | 13 | 0 |
| Identity profiles (390px) | 7 | 0 | 13 | 0 |
| Reference detail pages (1440px) | 2 | 2 | 2 | 0 |
| Reference detail pages (390px) | 2 | 2 | 2 | 0 |
| Directories and standings (1440px) | 11 | 2 | 9 | 0 |
| Directories and standings (390px) | 11 | 2 | 9 | 0 |
| Forums (1440px) | 3 | 0 | 3 | 0 |
| Forums (390px) | 3 | 0 | 3 | 0 |
| Setup editors (one skeleton) (1440px) | 12 | 0 | 0 | 0 |
| Setup editors (one skeleton) (390px) | 12 | 0 | 0 | 0 |
| Deck and word-deck editors (1440px) | 2 | 0 | 0 | 0 |
| Deck and word-deck editors (390px) | 2 | 0 | 0 | 0 |
| Settings (1440px) | 7 | 0 | 1 | 0 |
| Settings (390px) | 7 | 0 | 1 | 0 |
| Moderation workspace (1440px) | 11 | 1 | 12 | 0 |
| Moderation workspace (390px) | 11 | 1 | 12 | 0 |
| Long-form documents (1440px) | 6 | 1 | 2 | 0 |
| Long-form documents (390px) | 6 | 1 | 2 | 0 |
| Activity (1440px) | 2 | 1 | 2 | 0 |
| Activity (390px) | 2 | 1 | 2 | 0 |

## Site-wide value census

Distinct values actually rendered across the compared routes. A long tail here is the measurable form of "inconsistent".

**Card radii** — 1 distinct

| Value | Elements | Routes |
|---|---|---|
| 6 | 230 | 23 |

**Card containers** — 2 distinct

| Value | Elements | Routes |
|---|---|---|
| ui-card | 220 | 21 |
| mui-paper | 10 | 2 |

**Heading font sizes** — 7 distinct

| Value | Elements | Routes |
|---|---|---|
| 18 | 242 | 31 |
| 20 | 146 | 45 |
| 24 | 134 | 66 |
| 16 | 118 | 12 |
| 14 | 8 | 2 |
| 18.4 | 2 | 1 |
| 17.6 | 2 | 1 |

**Action heights** — 12 distinct

| Value | Elements | Routes |
|---|---|---|
| 40 | 653 | 60 |
| 44 | 598 | 57 |
| 32 | 364 | 15 |
| 64 | 22 | 5 |
| 23.19 | 14 | 2 |
| 27.69 | 12 | 2 |
| 26.11 | 10 | 1 |
| 54 | 6 | 1 |
| 24 | 6 | 1 |
| 157.5 | 4 | 2 |
| 97.91 | 2 | 1 |
| 28 | 2 | 1 |

**List primitives** — 11 distinct

| Value | Elements | Routes |
|---|---|---|
| MuiList-root | 50 | 3 |
| ui-reference-list | 20 | 10 |
| ul | 10 | 5 |
| ui-list | 6 | 3 |
| player-directory-list | 4 | 1 |
| deck-library-list | 4 | 2 |
| acknowledgement-list | 4 | 2 |
| moderation-list | 4 | 2 |
| ol | 2 | 1 |
| family-directory-list | 2 | 1 |
| host-setup-list | 2 | 1 |

## Off-scale elements

**0** rendered values fall outside the approved scale. This is the tail the cleanup has to remove.

| Property | Elements | Routes | Offending values |
|---|---|---|---|
| Heading size | 0 | 0 | — |
| Card radius | 0 | 0 | — |
| Card padding | 0 | 0 | — |
| Action height | 0 | 0 | — |
| Action radius | 0 | 0 | — |

## Findings by family

### Identity profiles (1440px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| medium | family-leader `/user/family/fixture-family-leader` | `section.paddingTop` | 16 | 0 | "section" paddingTop is 16 against 0 (family spread 16). |
| medium | family-leader `/user/family/fixture-family-leader` | `section.paddingLeft` | 16 | 0 | "section" paddingLeft is 16 against 0 (family spread 16). |
| medium | family-leader `/user/family/fixture-family-leader` | `section.headingFontSize` | 18 | 24 | "section" headingFontSize is 18 against 24 (family spread 6). |
| medium | family-leader `/user/family/fixture-family-leader` | `section.headingLevel` | h3 | h1 | "section" is headed h3 here, h1 in the family. |
| medium | family-leader `/user/family/fixture-family-leader` | `actions` | absent | 5/7 members have it | A "actions" block is missing. |
| medium | family-profile `/user/family/fixture-family` | `section.paddingTop` | 16 | 0 | "section" paddingTop is 16 against 0 (family spread 16). |
| medium | family-profile `/user/family/fixture-family` | `section.paddingLeft` | 16 | 0 | "section" paddingLeft is 16 against 0 (family spread 16). |
| medium | family-profile `/user/family/fixture-family` | `section.headingFontSize` | 18 | 24 | "section" headingFontSize is 18 against 24 (family spread 6). |
| medium | family-profile `/user/family/fixture-family` | `section.headingLevel` | h3 | h1 | "section" is headed h3 here, h1 in the family. |
| medium | family-profile `/user/family/fixture-family` | `actions` | absent | 5/7 members have it | A "actions" block is missing. |
| medium | profile-custom `/user/fixture-custom` | `section.paddingTop` | 16 | 0 | "section" paddingTop is 16 against 0 (family spread 16). |
| medium | profile-custom `/user/fixture-custom` | `section.paddingLeft` | 16 | 0 | "section" paddingLeft is 16 against 0 (family spread 16). |
| medium | profile-minimal `/user/fixture-minimal` | `prose` | absent | 6/7 members have it | A "prose" block is missing. |

### Identity profiles (390px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| medium | family-leader `/user/family/fixture-family-leader` | `section.paddingTop` | 16 | 0 | "section" paddingTop is 16 against 0 (family spread 16). |
| medium | family-leader `/user/family/fixture-family-leader` | `section.paddingLeft` | 16 | 0 | "section" paddingLeft is 16 against 0 (family spread 16). |
| medium | family-leader `/user/family/fixture-family-leader` | `section.headingFontSize` | 18 | 24 | "section" headingFontSize is 18 against 24 (family spread 6). |
| medium | family-leader `/user/family/fixture-family-leader` | `section.headingLevel` | h3 | h1 | "section" is headed h3 here, h1 in the family. |
| medium | family-leader `/user/family/fixture-family-leader` | `actions` | absent | 5/7 members have it | A "actions" block is missing. |
| medium | family-profile `/user/family/fixture-family` | `section.paddingTop` | 16 | 0 | "section" paddingTop is 16 against 0 (family spread 16). |
| medium | family-profile `/user/family/fixture-family` | `section.paddingLeft` | 16 | 0 | "section" paddingLeft is 16 against 0 (family spread 16). |
| medium | family-profile `/user/family/fixture-family` | `section.headingFontSize` | 18 | 24 | "section" headingFontSize is 18 against 24 (family spread 6). |
| medium | family-profile `/user/family/fixture-family` | `section.headingLevel` | h3 | h1 | "section" is headed h3 here, h1 in the family. |
| medium | family-profile `/user/family/fixture-family` | `actions` | absent | 5/7 members have it | A "actions" block is missing. |
| medium | profile-custom `/user/fixture-custom` | `section.paddingTop` | 16 | 0 | "section" paddingTop is 16 against 0 (family spread 16). |
| medium | profile-custom `/user/fixture-custom` | `section.paddingLeft` | 16 | 0 | "section" paddingLeft is 16 against 0 (family spread 16). |
| medium | profile-minimal `/user/fixture-minimal` | `prose` | absent | 6/7 members have it | A "prose" block is missing. |

### Reference detail pages (1440px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| high | setup-detail `/learn/setup/fixture-setup-0` | `section.container` | ui-section | split: section / ui-section | Members disagree about the container for "section": ui-section here, section elsewhere. |
| high | setup-detail `/learn/setup/fixture-setup-0` | `comments.container` | ui-section | split: section / ui-section | Members disagree about the container for "comments": ui-section here, section elsewhere. |
| medium | role-detail `/learn/role/Cop` | `section.gap` | 24 | 18 | "section" gap is 24 against 18 (family spread 12). |
| medium | role-detail `/learn/role/Cop` | `list.primitive` | ul, ol | one list treatment | This page uses 2 list treatments: ul, ol. |
| medium | setup-detail `/learn/setup/fixture-setup-0` | `section.gap` | 12 | 18 | "section" gap is 12 against 18 (family spread 12). |

### Reference detail pages (390px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| high | setup-detail `/learn/setup/fixture-setup-0` | `section.container` | ui-section | split: section / ui-section | Members disagree about the container for "section": ui-section here, section elsewhere. |
| high | setup-detail `/learn/setup/fixture-setup-0` | `comments.container` | ui-section | split: section / ui-section | Members disagree about the container for "comments": ui-section here, section elsewhere. |
| medium | role-detail `/learn/role/Cop` | `section.gap` | 24 | 18 | "section" gap is 24 against 18 (family spread 12). |
| medium | role-detail `/learn/role/Cop` | `list.primitive` | ul, ol | one list treatment | This page uses 2 list treatments: ul, ol. |
| medium | setup-detail `/learn/setup/fixture-setup-0` | `section.gap` | 12 | 18 | "section" gap is 12 against 18 (family spread 12). |

### Directories and standings (1440px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| high | players `/community/users` | `section.container` | ui-section | split: ui-section / ui-card / mui-paper / mui-paper | Members disagree about the container for "section": ui-section here, ui-card, mui-paper, mui-paper elsewhere. |
| high | tutorial `/play/tutorial` | `section.container` | ui-card | split: ui-section / ui-card / mui-paper / mui-paper | Members disagree about the container for "section": ui-card here, ui-section, mui-paper, mui-paper elsewhere. |
| medium | competitive `/fame/competitive` | `section.headingFontSize` | 18 | 20 | "section" headingFontSize is 18 against 20 (family spread 2). |
| medium | competitive `/fame/competitive` | `section.headingLevel` | h3 | h2 | "section" is headed h3 here, h2 in the family. |
| medium | competitive `/fame/competitive` | `list` | absent | 8/11 members have it | A "list" block is missing. |
| medium | players `/community/users` | `section.radius` | 0 | 6 | "section" radius is 0 against 6 (family spread 6). |
| medium | players `/community/users` | `section.paddingTop` | 0 | 16 | "section" paddingTop is 0 against 16 (family spread 16). |
| medium | players `/community/users` | `section.paddingLeft` | 0 | 16 | "section" paddingLeft is 0 against 16 (family spread 16). |
| medium | rankings `/fame/hall-of-fame` | `list` | absent | 8/11 members have it | A "list" block is missing. |
| medium | tutorial `/play/tutorial` | `section.headingLevel` | h6 | h2 | "section" is headed h6 here, h2 in the family. |
| medium | tutorial `/play/tutorial` | `list` | absent | 8/11 members have it | A "list" block is missing. |
| medium | tutorial `/play/tutorial` | `h6.fontSize` | 14–20px | one size per level | Same-level headings differ by 6px: 14px "Frontier Justice (9 players). Tap or hover a role to read it"; 16px "Choose your role"; 20px "Cop"; 20px "Sheriff". |

### Directories and standings (390px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| high | players `/community/users` | `section.container` | ui-section | split: ui-section / ui-card / mui-paper / mui-paper | Members disagree about the container for "section": ui-section here, ui-card, mui-paper, mui-paper elsewhere. |
| high | tutorial `/play/tutorial` | `section.container` | ui-card | split: ui-section / ui-card / mui-paper / mui-paper | Members disagree about the container for "section": ui-card here, ui-section, mui-paper, mui-paper elsewhere. |
| medium | competitive `/fame/competitive` | `section.headingLevel` | h3 | h2 | "section" is headed h3 here, h2 in the family. |
| medium | competitive `/fame/competitive` | `list` | absent | 8/11 members have it | A "list" block is missing. |
| medium | players `/community/users` | `section.radius` | 0 | 6 | "section" radius is 0 against 6 (family spread 6). |
| medium | players `/community/users` | `section.paddingTop` | 0 | 16 | "section" paddingTop is 0 against 16 (family spread 16). |
| medium | players `/community/users` | `section.paddingLeft` | 0 | 16 | "section" paddingLeft is 0 against 16 (family spread 16). |
| medium | players `/community/users` | `section.headingFontSize` | 20 | 18 | "section" headingFontSize is 20 against 18 (family spread 2.4). |
| medium | rankings `/fame/hall-of-fame` | `list` | absent | 8/11 members have it | A "list" block is missing. |
| medium | tutorial `/play/tutorial` | `section.headingLevel` | h6 | h2 | "section" is headed h6 here, h2 in the family. |
| medium | tutorial `/play/tutorial` | `list` | absent | 8/11 members have it | A "list" block is missing. |
| medium | tutorial `/play/tutorial` | `h6.fontSize` | 14–17.6px | one size per level | Same-level headings differ by 3.6px: 14px "Frontier Justice (9 players). Tap or hover a role to read it"; 16px "Choose your role"; 17.6px "Cop"; 17.6px "Sheriff". |

### Forums (1440px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| medium | forum-thread `/community/forums/thread/fixture-thread-0` | `pageHeader.level` | h2 | h1 | Page title is h2; the family uses h1. |
| medium | forum-thread `/community/forums/thread/fixture-thread-0` | `section` | absent | 2/3 members have it | A "section" block is missing. |
| medium | forum-thread `/community/forums/thread/fixture-thread-0` | `list` | absent | 2/3 members have it | A "list" block is missing. |

### Forums (390px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| medium | forum-thread `/community/forums/thread/fixture-thread-0` | `pageHeader.level` | h2 | h1 | Page title is h2; the family uses h1. |
| medium | forum-thread `/community/forums/thread/fixture-thread-0` | `section` | absent | 2/3 members have it | A "section" block is missing. |
| medium | forum-thread `/community/forums/thread/fixture-thread-0` | `list` | absent | 2/3 members have it | A "list" block is missing. |

### Setup editors (one skeleton) (1440px)

Compared on the shared Game settings step. The roles step is content-dependent and is verified by the editor shell check.

No structural divergence found.

### Setup editors (one skeleton) (390px)

Compared on the shared Game settings step. The roles step is content-dependent and is verified by the editor shell check.

No structural divergence found.

### Deck and word-deck editors (1440px)

No structural divergence found.

### Deck and word-deck editors (390px)

No structural divergence found.

### Settings (1440px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| medium | settings-account `/user/settings/account` | `section.paddingTop` | 24 | 16 | "section" paddingTop is 24 against 16 (family spread 8). |

### Settings (390px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| medium | settings-account `/user/settings/account` | `section.paddingTop` | 24 | 16 | "section" paddingTop is 24 against 16 (family spread 8). |

### Moderation workspace (1440px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| high | invoices `/policy/invoices` | `table.container` | ui-table | split: table / ui-table | Members disagree about the container for "table": ui-table here, table elsewhere. |
| medium | admin-intake `/policy/moderation/flagged-intake` | `section` | absent | 7/11 members have it | A "section" block is missing. |
| medium | invoices `/policy/invoices` | `section` | absent | 7/11 members have it | A "section" block is missing. |
| medium | moderation-ban-appeals `/policy/moderation/ban-appeals` | `section` | absent | 7/11 members have it | A "section" block is missing. |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `section.paddingTop` | 16 | 0 | "section" paddingTop is 16 against 0 (family spread 16). |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `section.headingFontSize` | 16 | 20 | "section" headingFontSize is 16 against 20 (family spread 4). |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `section.headingLevel` | h3 | h2 | "section" is headed h3 here, h2 in the family. |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `form.paddingTop` | 16 | 8 | "form" paddingTop is 16 against 8 (family spread 16). |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `form.headingFontSize` | 16 | 18 | "form" headingFontSize is 16 against 18 (family spread 4). |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `form.headingLevel` | h3 | h2 | "form" is headed h3 here, h2 in the family. |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `h3.fontSize` | 16–18px | one size per level | Same-level headings differ by 2px: 18px "Appeal from Moth"; 16px "Appeal"; 16px "Ban"; 16px "Report(s) behind the ban". |
| medium | moderation-volunteer `/policy/moderation/volunteer` | `section` | absent | 7/11 members have it | A "section" block is missing. |
| medium | moderation-volunteer `/policy/moderation/volunteer` | `form.paddingTop` | 0 | 8 | "form" paddingTop is 0 against 8 (family spread 16). |
| medium | moderation-volunteer `/policy/moderation/volunteer` | `form.headingFontSize` | 20 | 18 | "form" headingFontSize is 20 against 18 (family spread 4). |

### Moderation workspace (390px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| high | invoices `/policy/invoices` | `table.container` | ui-table | split: table / ui-table | Members disagree about the container for "table": ui-table here, table elsewhere. |
| medium | admin-intake `/policy/moderation/flagged-intake` | `section` | absent | 7/11 members have it | A "section" block is missing. |
| medium | invoices `/policy/invoices` | `section` | absent | 7/11 members have it | A "section" block is missing. |
| medium | moderation-ban-appeals `/policy/moderation/ban-appeals` | `section` | absent | 7/11 members have it | A "section" block is missing. |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `section.paddingTop` | 16 | 0 | "section" paddingTop is 16 against 0 (family spread 16). |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `section.headingFontSize` | 16 | 20 | "section" headingFontSize is 16 against 20 (family spread 4). |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `section.headingLevel` | h3 | h2 | "section" is headed h3 here, h2 in the family. |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `form.paddingTop` | 16 | 8 | "form" paddingTop is 16 against 8 (family spread 16). |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `form.headingFontSize` | 16 | 18 | "form" headingFontSize is 16 against 18 (family spread 4). |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `form.headingLevel` | h3 | h2 | "form" is headed h3 here, h2 in the family. |
| medium | moderation-ban-case `/policy/moderation/ban-appeals/case1` | `h3.fontSize` | 16–18px | one size per level | Same-level headings differ by 2px: 18px "Appeal from Moth"; 16px "Appeal"; 16px "Ban"; 16px "Report(s) behind the ban". |
| medium | moderation-volunteer `/policy/moderation/volunteer` | `section` | absent | 7/11 members have it | A "section" block is missing. |
| medium | moderation-volunteer `/policy/moderation/volunteer` | `form.paddingTop` | 0 | 8 | "form" paddingTop is 0 against 8 (family spread 16). |
| medium | moderation-volunteer `/policy/moderation/volunteer` | `form.headingFontSize` | 20 | 18 | "form" headingFontSize is 20 against 18 (family spread 4). |

### Long-form documents (1440px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| high | competitive-faq `/fame/competitive/faq` | `table.container` | table | ui-table | "table" uses table here but ui-table is the family norm. |
| medium | rules `/policy/rules` | `list.paddingTop` | 0 | 8 | "list" paddingTop is 0 against 8 (family spread 8). |
| medium | rules `/policy/rules` | `list.paddingLeft` | 16 | 0 | "list" paddingLeft is 16 against 0 (family spread 16). |

### Long-form documents (390px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| high | competitive-faq `/fame/competitive/faq` | `table.container` | table | ui-table | "table" uses table here but ui-table is the family norm. |
| medium | rules `/policy/rules` | `list.paddingTop` | 0 | 8 | "list" paddingTop is 0 against 8 (family spread 8). |
| medium | rules `/policy/rules` | `list.paddingLeft` | 16 | 0 | "list" paddingLeft is 16 against 0 (family spread 16). |

### Activity (1440px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| high | activity-feed `/activity/livefeed` | `section.container` | plain | split: ui-section / plain | Members disagree about the container for "section": plain here, ui-section elsewhere. |
| medium | activity-feed `/activity/livefeed` | `section.paddingTop` | 16 | 8 | "section" paddingTop is 16 against 8 (family spread 16). |
| medium | activity-metrics `/activity/metrics` | `section.paddingTop` | 0 | 8 | "section" paddingTop is 0 against 8 (family spread 16). |

### Activity (390px)

| Severity | Page | Property | Observed | Family norm | Detail |
|---|---|---|---|---|---|
| high | activity-feed `/activity/livefeed` | `section.container` | plain | split: ui-section / plain | Members disagree about the container for "section": plain here, ui-section elsewhere. |
| medium | activity-feed `/activity/livefeed` | `section.paddingTop` | 16 | 8 | "section" paddingTop is 16 against 8 (family spread 16). |
| medium | activity-metrics `/activity/metrics` | `section.paddingTop` | 0 | 8 | "section" paddingTop is 0 against 8 (family spread 16). |
