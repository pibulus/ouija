# PartyKit Notes

PartyKit is already integrated. This file tracks the live behavior and the next
useful moves, not a speculative setup plan.

## Current Behavior

- `party/ouija-room.ts` owns the message queue.
- Messages persist in PartyKit storage under `messages`.
- Seed messages are created when storage is empty.
- Messages older than seven days are pruned.
- The room keeps at most 500 messages.
- Each connection has a 30-second send cooldown.
- Clients send `seen` message IDs so visitors avoid repeats where possible.
- Presence count broadcasts on connect and disconnect.

## Message Protocol

Server to client:

```ts
{ type: "dispense", text: string, timestamp: number, id: string }
{ type: "queue_empty" }
{ type: "presence", count: number }
{ type: "message_sent", text: string, id: string }
{ type: "new_message_queued", queueLength: number, text: string, timestamp: number, id: string }
{ type: "error", message: string }
```

Client to server:

```ts
{ type: "send", text: string }
{ type: "request_next", seen: string[] }
```

## Rules

- Server max length: 50 characters.
- UI max length: 32 characters.
- Allowed characters: `A-Z`, `0-9`, space, `?`, `!`.
- Sanitization: trim, uppercase, collapse spaces, strip unsupported characters.
- Retention: 7 days.
- Storage cap: 500 messages.

## Run

```bash
deno task start
npm run party:dev
```

The Fresh app runs on `localhost:8000`; PartyKit runs on `localhost:1999`.

## Deploy

```bash
npm run party:deploy
deno task build
```

The production client currently targets `ouija-board.pibulus.partykit.dev`.

## Next Useful Moves

- Add a canonical production URL once the app is deployed.
- Add an actual social preview image rather than relying only on metadata text.
- Consider making the UI/server message length the same value.
- Add a tiny admin/maintenance script for clearing or seeding the PartyKit
  queue.
- If traffic grows, add light abuse controls beyond per-connection cooldown.
