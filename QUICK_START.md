# 🚀 Quick Start Guide - PartyKit Integration

## What Just Got Added

✅ **PartyKit Server** (`party/ouija-room.ts`)
- Message queue with 50 char max
- 30 second rate limiting
- Presence tracking
- Persistent storage

✅ **Client Hook** (`hooks/useOuijaParty.ts`)
- Auto-connects to PartyKit
- Handles messages in/out
- Presence updates
- Error handling

✅ **UI Updates** (`islands/PlanchetteBoard.tsx`)
- Integrated PartyKit hook
- Presence indicator (top-right when >1 user)
- Error messages
- Messages now sync across all connected users

---

## How to Run

### Terminal 1: Fresh Dev Server
```bash
deno task start
```
Open http://localhost:8000

### Terminal 2: PartyKit Server
```bash
npm run party:dev
```
Runs on http://localhost:1999

---

## Testing It Out

1. Open http://localhost:8000 in **2 browser tabs**
2. In tab 1, type a message and press Enter
3. In tab 2, you should see the message animate on the board!
4. Watch the presence indicator update (top-right corner)

---

## Current Behavior

- **Typing a message**: Sends to PartyKit queue + animates locally
- **Opening the app**: Receives one message from queue (if any)
- **Others online**: See "👻 X spirits present" indicator
- **Rate limit**: 30 seconds between messages
- **Max length**: 50 characters (auto-enforced)

---

## What's Next

### Easy Tweaks
- Adjust cooldown in `party/ouija-room.ts` (line 78)
- Change max length in `party/ouija-room.ts` (line 95)
- Update presence indicator styling in `PlanchetteBoard.tsx` (line 439-460)

### Possible Enhancements
- Add sound effect when receiving messages
- Different visual effects based on presence count
- Show "sending..." state while message is in flight
- Message history panel
- Named rooms (via URL params)

---

## Deploying to Production

### 1. Deploy PartyKit
```bash
npm run party:deploy
```
Note the URL (e.g., `ouija-board.yourname.partykit.dev`)

### 2. Update Client
Edit `islands/PlanchetteBoard.tsx` line 104:
```typescript
: "ouija-board.yourname.partykit.dev", // Your actual PartyKit URL
```

### 3. Deploy Fresh App
```bash
deno task build
# Deploy to Deno Deploy, Vercel, etc.
```

---

## Troubleshooting

### PartyKit won't start
- Make sure you ran `npm install`
- Check port 1999 isn't in use
- Try `npx partykit dev` instead

### Messages not syncing
- Check browser console for errors
- Make sure both terminals are running
- Verify WebSocket connection in Network tab

### "Not connected" error
- PartyKit server might not be running
- Check the host URL in `useOuijaParty` hook
- Look for CORS issues in console

---

## Architecture

```
┌─────────────┐
│  Browser 1  │──┐
└─────────────┘  │
                 │    WebSocket
┌─────────────┐  │   ┌──────────────┐
│  Browser 2  │──┼──▶│  PartyKit    │
└─────────────┘  │   │  Server      │
                 │   │ (ouija-room) │
┌─────────────┐  │   └──────────────┘
│  Browser 3  │──┘          │
└─────────────┘             │
                            ▼
                    ┌──────────────┐
                    │ Message Queue│
                    │  (Storage)   │
                    └──────────────┘
```

---

## Files Changed/Added

```
✨ New Files:
- party/ouija-room.ts          # PartyKit server
- hooks/useOuijaParty.ts       # Client hook
- partykit.json                # PartyKit config
- PARTYKIT_ROADMAP.md          # Full roadmap
- QUICK_START.md               # This file

📝 Modified:
- islands/PlanchetteBoard.tsx  # Integrated PartyKit
- package.json                 # Added PartyKit scripts

✅ Already Fixed:
- Planchette positioning
- Modal styling
```

---

**Last Updated**: 2025-11-14
**Status**: Ready to test! 🎉
