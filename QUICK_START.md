# Quick Start

## Start The App

```bash
deno task start
```

Open `http://localhost:8000`.

## Test The Ritual

1. Open the page.
2. Watch the planchette start spelling automatically.
3. Confirm the final message appears.
4. Tap **Draw Again** for a fresh message.

## Useful Commands

```bash
deno task check
deno task build
```

## Where To Change Things

- Message deck: `utils/oracleMessages.ts`
- Board animation and audio: `islands/PlanchetteBoard.tsx`
- Metadata and page shell: `routes/_app.tsx`
- Styling and mobile layout: `static/styles.css`
