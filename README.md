# Ouija

**A digital spirit board that draws one cosmic message and spells it through the
planchette.**

Ouija is intentionally simple now: open the board, tap **Begin**, receive one
message. No accounts, no chat, no guestbook, no queue. The whole app is the
little moment of watching the board move.

## What It Does

- Draws one message from a local oracle deck on each page load.
- Animates the planchette across the board coordinates.
- Reveals the message after the spelling completes.
- Offers a single **Draw Again** action for a fresh message.
- Plays ambient audio and soft generated tones after the user taps Begin.

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
  AboutModal.tsx        About dialog
utils/
  oracleMessages.ts     Local oracle deck and crypto-random draw
static/
  ghostboard.png        Main board artwork
  planchette.png        Planchette artwork
  ambient_loop.mp3      Background audio loop
```

## Flow

1. Server draws one message with `drawOracleMessage()`.
2. Visitor taps **Begin**.
3. The planchette spells the message across the board.
4. The message appears as text.
5. **Draw Again** reloads the page for a fresh draw.

## Built By Pablo

Part of the SoftStack experiments: small tools with personality, texture, and a
little bit of transmission static.
