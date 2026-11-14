# Profile captures

After the card unification: both user and family pages build panels from
`UiCard`, and comments keep their own card surface on authored backgrounds.

Profiles went from 13 high findings per width to zero. Cards are verified by
computed style, not class name: 16px padding on all four sides, `#242124`
background, 6px radius. Card-to-card gaps are 16px; the desktop column gap is
24px, matching the family page. The banner card keeps 0 padding so the image stays
edge-to-edge, but is clipped to the same radius.

The remaining medium findings compare the family header (a text card) with a
user banner (a media card), plus the family actions block; they are content
differences, not container or typography divergence.

- `user-profile.png`, `family-profile.png` — desktop.
- `user-profile-390.png`, `family-profile-390.png` — phone.
- `user-comments.png`, `family-comments.png` — comment cards, including the removed
  trailing 16px on the last row.
- `user-profile-full.png` — full page, showing the even 16px card rhythm.
- `../shots/profile-user-ratings.png` — restored pie chart; the redundant "total
  games" text is gone and the card has one 16px spacing stack.
- `../shots/profile-user-stock.png` — the stock card with only the card's 16px
  padding, no nested inner panel.
- `../shots/` — the `npm run ui:shots` contact sheet and the current card crops.
