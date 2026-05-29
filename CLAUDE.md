# Ghost Note Agent Brief

Ghost Note is a Deno Fresh single-page web ritual. Keep it small, physical, and
oracle-shaped: one server-drawn daily message, one board image, one summon
gesture, one final omen.

## Current Behavior

- The home route draws one oracle message and board image per anonymous
  browser/device each UTC day.
- The board renders in a summon state until the selected board image decodes.
- The planchette only starts after the user clicks **Summon**.
- Sound starts only from that summon gesture.
- The final omen and **Ask Tomorrow** action appear after spelling finishes.
- Random board images are loaded from `static/ghostboard*.png`, `.jpg`, or
  `.webp`; suffixes may use lowercase letters, digits, or hyphens.

## Important Files

- `routes/index.tsx`: draws the message and board image, renders the island.
- `routes/_app.tsx`: metadata, app shell, global stylesheet, CSP directives.
- `routes/_middleware.ts`: security headers.
- `islands/PlanchetteBoard.tsx`: summon gate, movement, sound, film grain, final
  state.
- `utils/oracleMessages.ts`: local oracle deck.
- `utils/boardImages.ts`: static board image discovery and random selection.
- `static/styles.css`: full-screen board layout and responsive styling.

## Working Rules

- Do not add chat, accounts, persistent state, or user-submitted messages unless
  the product direction explicitly changes.
- Keep the message source obvious and local unless a new public signal is
  deliberately introduced.
- Keep the daily lock anonymous and device-scoped unless the product direction
  explicitly adds identity.
- Preserve the user gesture before audio starts.
- When changing CSP, verify island hydration in a browser, not just with
  `deno task check`.
- Keep board assets in `static/` and make sure new deployable assets are not
  ignored by `.gitignore`.

## Parked Ideas

- Add original Poe/cosmic-horror-style epigraph fragments as faint found text
  before summon or as a marginal note after the omen. Avoid direct famous
  quotes; make the lines feel old and haunted without name-dropping.
