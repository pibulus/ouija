# Ouija

**A real-time digital spirit board for leaving and receiving tiny messages.**

Ouija is a simple ritual object: receive a message, leave one behind, and watch
the planchette spell the next trace across the board. It is playful, slow on
purpose, and built around the feeling of asynchronous presence rather than chat.

## What It Does

- Shows a full-screen spirit board with an animated planchette.
- Dispenses one queued message to each visitor.
- Lets the visitor leave a short message for someone else.
- Uses PartyKit for real-time presence and persistent message storage.
- Falls back to local messages when the live connection is unavailable.
- Plays ambient audio and soft generated tones after user interaction.

## Run Locally

Fresh app:

```bash
deno task start
```

PartyKit room:

```bash
npm run party:dev
```

Open `http://localhost:8000`. PartyKit runs on `localhost:1999`.

## Checks

```bash
deno task check
deno task build
```

`my-party/` and `.partykit/` are local PartyKit scaffold/runtime folders and are
intentionally excluded from Deno checks.

## Project Map

```text
routes/
  _app.tsx              App shell, metadata, global stylesheet
  index.tsx             Main board page
  _404.tsx              Branded lost-signal page
islands/
  PlanchetteBoard.tsx   Board animation, message entry, audio cues
  AboutModal.tsx        About dialog
hooks/
  useOuijaParty.ts      PartySocket client, seen-message memory, queue requests
party/
  ouija-room.ts         PartyKit message queue, storage, presence, rate limits
static/
  ghostboard.png        Main board artwork
  planchette.png        Planchette artwork
  ambient_loop.mp3      Background audio loop
```

## Message Flow

1. Visitor opens the board.
2. `useOuijaParty` connects to PartyKit room `main`.
3. `ouija-room.ts` sends an unseen queued message, or a seeded fallback.
4. `PlanchetteBoard` animates the planchette across the board letters.
5. The message entry appears.
6. Visitor leaves a short message.
7. PartyKit stores it and the visitor receives the next queued message.

## Production Notes

- PartyKit deploy target is configured in `partykit.json`.
- The client currently points production traffic at
  `ouija-board.pibulus.partykit.dev`.
- Message retention is one week.
- Message length is capped at 50 characters server-side and 32 characters in the
  current UI.
- Send cooldown is 30 seconds per connection.

## Built By Pablo

Part of the SoftStack experiments: small tools with personality, texture, and a
little bit of transmission static.
