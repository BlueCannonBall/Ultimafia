# Custom profile color

## Why it was broken

`panelStyle.backgroundColor` set the full user color inline on the cards that
received `panelStyle`. Comments and ratings did not receive it, and an
`!important` rule forced some sections back to the theme surface. The result was
a patchwork: some cards teal, some dark, with the color reading as large boxy
blocks.

## Options rendered on the real custom profile

- `current.png` — the patchwork.
- `tint.png` — every content card gets 24% of the color mixed into the theme
  surface; this early preview kept the full color on the header.
- `full.png` — every card gets the full color. Cohesive but heavy, and it makes
  arbitrary light colors a contrast problem.
- `canvas.png` — the page canvas is the color and cards stay theme-colored. This
  reproduces the thick colored frame around cards that looked wrong before.
- `after.png` — the implemented tint on the real profile.

## Chosen rule

- Content cards and the header: `color-mix(in srgb, <user color> 24%,
  var(--scheme-color))`. The full color is not used behind header text; the banner
  image provides the strong color instead.
- Comments, ratings and other cards use the same tinted surface; nested cards are
  transparent.
- This keeps text readable for arbitrary user colors, removes the header contrast
  problem, and makes every profile card agree.
