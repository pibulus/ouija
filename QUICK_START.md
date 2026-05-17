# Quick Start

## 1. Install Dependencies

```bash
npm install
```

Fresh uses Deno imports from `deno.json`; PartyKit and PartySocket are managed
through npm.

## 2. Start The Fresh App

```bash
deno task start
```

Fresh serves the app at `http://localhost:8000`.

## 3. Start PartyKit

In a second terminal:

```bash
npm run party:dev
```

PartyKit serves the Ouija room at `localhost:1999`.

## 4. Test The Ritual

1. Open `http://localhost:8000`.
2. Wait for the planchette to spell the first message.
3. Leave a short message.
4. Open a second tab to confirm another visitor can receive and contribute.

## Useful Commands

```bash
deno task check
deno task build
npm run party:deploy
```

## Where To Change Things

- Board copy and first message: `routes/index.tsx`
- Board animation and input behavior: `islands/PlanchetteBoard.tsx`
- PartyKit host and room: `islands/PlanchetteBoard.tsx`
- Message queue, cooldown, retention: `party/ouija-room.ts`
- Metadata and page shell: `routes/_app.tsx`
- Styling and mobile layout: `static/styles.css`

## Current Defaults

- Client message length: 32 characters
- Server message length: 50 characters
- Send cooldown: 30 seconds
- Message retention: 7 days
- Production PartyKit host: `ouija-board.pibulus.partykit.dev`
