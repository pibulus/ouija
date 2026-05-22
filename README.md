# Ghost Note

**A digital spirit board that draws one cosmic message and spells it through the
planchette.**

Ghost Note is intentionally simple now: open `https://ghostnote.rip` and the
reading begins. No accounts, no chat, no guestbook, no queue, no onboarding
modal. The whole app is the little moment of watching the board move.

## What It Does

- Draws one warning from a local oracle deck on each page load.
- Animates the planchette across the board coordinates.
- Tracks the planchette on mobile by panning the oversized board underneath it.
- Leaves the message on the board instead of transcribing it afterwards.
- Offers a single **Draw Again** action for a fresh message.
- Attempts ambient audio and soft generated tones when the browser allows it.
- Keeps the message source explicit: no hidden inbox, no user-submitted text.

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
  _app.tsx              App shell, metadata, global stylesheet
  index.tsx             Draws the message and renders the board
  _404.tsx              Branded lost-signal page
islands/
  PlanchetteBoard.tsx   Board animation, single-message ritual, audio cues
utils/
  oracleMessages.ts     Local oracle deck and crypto-random draw
static/
  ghostboard.png        Main board artwork
  planchette.png        Planchette artwork
  ambient_loop.mp3      Background audio loop
```

## Flow

1. Server draws one message with `drawOracleMessage()`.
2. The page opens directly into the reading.
3. The planchette spells the message across the board, through the eye.
4. **Draw Again** appears after the board has finished.

## Message Source

Messages currently come from `utils/oracleMessages.ts`: a local deck of taopunk
altar truths, spirit quips, tiny instructions, Day of the Dead flavored
soothsaying, and transformed motifs from reported Ouija folklore selected
server-side with `crypto.getRandomValues()`. The deck is built to feel like a
spirit got one useful sentence through: blunt, cute, guilty, loving, ominous, or
weirdly tender. That is the whole source of truth for now. If this grows later,
moon phase, weather, astronomy, or another public signal should be folded into
that module so the origin stays obvious.

## Built By Pablo

Part of the SoftStack experiments: small tools with personality, texture, and a
little bit of transmission static.
