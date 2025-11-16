# 🎈 PartyKit Integration Roadmap

## Overview
Adding real-time multiplayer messaging and presence to the Ouija board app using PartyKit.

## What We're Building

**Spirit Board Message Queue**: An async messaging system where users:
- Leave messages (max 50 chars) that persist in a queue
- Receive messages from others when they visit
- See presence indicators when other "spirits" are online
- Experience the board differently based on who's there

---

## Implementation Steps

### Phase 1: Setup & Basic PartyKit Server ✅ (Next)

1. **Install PartyKit**
   ```bash
   npm install partykit partysocket
   ```

2. **Create PartyKit Server**
   - File: `party/ouija-room.ts`
   - Implements message queue
   - Handles presence tracking
   - Stores messages in PartyKit storage

3. **Add Client Connection**
   - Update `PlanchetteBoard.tsx` to connect via PartySocket
   - Handle incoming messages
   - Send user messages to server

4. **Update Config**
   - Add PartyKit config to project
   - Set up local dev server

### Phase 2: Message Queue System

**Server Features:**
- Store messages with timestamps
- Max message length: 50 characters
- FIFO queue (or random dispense - you decide!)
- Message persistence via `room.storage`
- Broadcast new messages to all connected clients

**Client Features:**
- Send typed messages to queue
- Receive and animate dispensed messages
- Show "sending..." state
- Handle message errors

### Phase 3: Presence Indicators

**What to Show:**
- Number of spirits currently connected
- Subtle visual changes when others are present:
  - Faster candle flicker
  - Additional ambient sounds
  - Faint glow around board edges
  - "3 spirits present" counter

**Implementation:**
- Track connections in `onConnect`/`onClose`
- Broadcast presence count changes
- Update UI based on presence state

### Phase 4: Advanced Features (Optional)

- **Message cooldown**: 30 second delay between sends
- **Ephemeral messages**: Auto-delete after 24 hours
- **Message reactions**: Simple emoji reactions
- **Spectral cursors**: See ghostly mouse positions of others
- **Private rooms**: Named rooms via URL params

---

## File Structure

```
/home/user/ouija/
├── party/
│   └── ouija-room.ts          # PartyKit server
├── islands/
│   └── PlanchetteBoard.tsx    # Updated with PartySocket client
├── routes/
│   └── index.tsx              # Main route (minimal changes)
├── partykit.json              # PartyKit config
└── PARTYKIT_ROADMAP.md        # This file
```

---

## API Design

### Server → Client Messages

```typescript
// New message added to queue
{type: 'new_message', text: string, timestamp: number}

// Dispense message to this user
{type: 'dispense', text: string}

// Presence update
{type: 'presence', count: number}

// Error
{type: 'error', message: string}
```

### Client → Server Messages

```typescript
// Send message to queue
{type: 'send', text: string}

// Request next message (optional)
{type: 'request_next'}
```

---

## Key Configuration

### Message Rules
- **Max length**: 50 characters
- **Allowed chars**: A-Z, 0-9, space, ?, !
- **Sanitization**: Auto-uppercase, trim, dedupe spaces
- **Cooldown**: 30 seconds per user

### Queue Behavior
- **Dispense**: On connect, send one queued message
- **Storage**: Messages persist across deploys
- **Limit**: Max 100 messages in queue
- **Expiry**: Messages older than 24 hours auto-delete

### Presence
- **Update frequency**: On connect/disconnect only
- **Max connections**: Unlimited (PartyKit handles this)
- **Idle timeout**: 5 minutes of inactivity

---

## Testing Plan

1. **Local Dev**
   - Run `npm run dev` (Deno Fresh)
   - Run `npx partykit dev` (PartyKit server)
   - Test message send/receive
   - Test multi-tab presence

2. **Deploy**
   - Deploy Fresh app to Deno Deploy
   - Deploy PartyKit to Cloudflare
   - Update client to use production PartyKit URL

---

## Current Status

### ✅ Completed
- Planchette positioning fixed (WINDOW_Y_OFFSET: -0.012)
- Modal styling updated (dark flat theme)
- PartyKit research complete
- Architecture planned

### 🚧 In Progress
- PartyKit server scaffolding
- Client integration

### 📋 Todo
- Message queue implementation
- Presence indicators
- Deploy & test
- Polish UX

---

## Quick Start (Resume Work)

```bash
# Install dependencies
npm install partykit partysocket

# Start Fresh dev server
deno task start

# Start PartyKit dev server (in another terminal)
npx partykit dev

# Test in browser
open http://localhost:8000
```

---

## Resources

- [PartyKit Docs](https://docs.partykit.io)
- [PartyKit GitHub Examples](https://github.com/partykit/partykit/tree/main/examples)
- [Cursor Party Example](https://github.com/partykit/cursor-party)

---

## Notes & Ideas

- Could add "spirit names" - random mystical names for anonymous users
- Message queue could prioritize older messages to clear backlog
- Visual effect: board "shimmers" when new message arrives
- Sound: Different tone for sending vs receiving
- Analytics: Track message count, popular times, etc.

---

**Last Updated**: 2025-11-14
**Status**: Ready to implement Phase 1
