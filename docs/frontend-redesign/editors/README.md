# Setup editor captures

After the unified-wizard change. The comparison report holds the before counts:
editors went from 18 high + 54 medium findings per width to zero at 1440 and 390.
Steps are content-driven: roles come from `siteInfo.roles[gameType]`, modifiers
from `siteInfo.modifiers[gameType]`, and game settings from
`siteInfo.gamesettings[gameType]`. Jotto and Wacky Words have roles but no game
settings, so they must not show an empty settings step.

- `mafia-step0-1440.png` — three-step wizard, roles catalog and selected roles.
- `mafia-step0-390.png` — phone roles summary and sticky step navigation.
- `jotto-roles-1440.png` — Jotto has roles but no game settings, so the roles step is the whole editor.
- `chess-single-390.png` — fixed roles note and sticky Create setup action.
