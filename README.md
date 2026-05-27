# Ghost Note

**A digital spirit board that draws one cosmic message and spells it through the
planchette.**

Ghost Note is intentionally simple now: open `https://ghostnote.rip`, summon the
board, and receive one message. No accounts, no chat, no guestbook, no queue, no
onboarding modal. The whole app is the little moment of watching the board move.

## What It Does

- Draws one warning from a local oracle deck on each page load.
- Randomly chooses one `static/ghostboard*.png`, `.jpg`, or `.webp` board image
  on each page load; suffixes can use lowercase letters, digits, or hyphens.
- Waits for the user to click **Summon** before animation or sound begins.
- Offers a visible **Sound On/Off** toggle before summoning.
- Animates the planchette across the board coordinates.
- Tracks the planchette on mobile by panning the oversized board underneath it.
- Reveals the final omen after the spelling finishes.
- Offers a single **Ask Again** action for a fresh message.
- Plays ambient audio and soft generated tones only after a user gesture and
  only when sound is enabled.
- Keeps the message source explicit: no hidden inbox, no user-submitted text.
- Ships with a route CSP plus security headers from middleware.

## Run Locally

```bash
deno task start
```

Open `http://localhost:8000`.

## Checks

```bash
deno task check
deno task build
```

## Project Map

```text
routes/
  _app.tsx              App shell, metadata, CSP directives, global stylesheet
  _middleware.ts        Security headers
  index.tsx             Draws the message/board image and renders the board
  _404.tsx              Branded lost-signal page
islands/
  PlanchetteBoard.tsx   Summon gate, board animation, audio cues, film grain
utils/
  oracleMessages.ts     Local oracle deck and crypto-random draw
  boardImages.ts        Static board image discovery and crypto-random draw
static/
  ghostboard*.png       Board artwork pool
  planchette.png        Planchette artwork
  ambient_loop.mp3      Background audio loop
```

## Flow

1. Server draws one message with `drawOracleMessage()`.
2. Server draws one board image with `drawBoardImageSrc()`.
3. The page renders a summon state while the selected board image decodes.
4. The user clicks **Summon**; audio starts only if sound is enabled.
5. The planchette spells the message across the board, through the eye.
6. The final omen and **Ask Again** appear after the board has finished.

## Message Source

Messages currently come from `utils/oracleMessages.ts`: a local deck of taopunk
altar truths, spirit quips, tiny instructions, Day of the Dead flavored
soothsaying, and transformed motifs from reported Ouija folklore selected
server-side with `crypto.getRandomValues()`. The deck is built to feel like a
spirit got one useful sentence through: blunt, cute, guilty, loving, ominous, or
weirdly tender. That is the whole source of truth for now. If this grows later,
moon phase, weather, astronomy, or another public signal should be folded into
that module so the origin stays obvious.

## Notes For Future Agents

- `CLAUDE.md` is the repo-local agent brief.
- `GLOSSARY.md` defines the project-specific terms used in code and docs.
- The parked next-pass idea is an optional pool of original Poe/cosmic-horror
  style epigraph fragments, revealed subtly before summon or after the omen.

## Built By Pablo

Part of the SoftStack experiments: small tools with personality, texture, and a
little bit of transmission static.
