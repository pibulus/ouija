# Quick Start

## Start The App

```bash
deno task start
```

Open `http://localhost:8000`.

## Test The Ritual

1. Open the page.
2. Wait for the summon button to enable after the board image loads.
3. Tap **Summon**.
4. Confirm the planchette eye lands on the letters.
5. Confirm the final action says **Ask Tomorrow**.
6. Reload with the same browser cookie and confirm today's message stays the
   same.

## Useful Commands

```bash
deno task check
deno task build
```

## Where To Change Things

- Message deck: `utils/oracleMessages.ts`
- Board image pool: `static/ghostboard*.png` / `.jpg` / `.webp` with lowercase
  letter, digit, or hyphen suffixes
- Board animation and audio: `islands/PlanchetteBoard.tsx`
- Board image discovery: `utils/boardImages.ts`
- Metadata and page shell: `routes/_app.tsx`
- Security headers: `routes/_middleware.ts`
- Styling and mobile layout: `static/styles.css`
- Agent brief and parked ideas: `CLAUDE.md`
- Project terms: `GLOSSARY.md`
