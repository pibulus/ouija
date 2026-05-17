import type * as Party from "partykit/server";

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // keep messages for a week
const MAX_MESSAGES = 500;
const SEED_MESSAGES = [
  "HELLO FROM THE OTHER SIDE",
  "LEAVE A QUESTION AND LISTEN",
  "THE LINE IS ALWAYS OPEN",
  "YOUR MESSAGE COULD SPARK THE NEXT OMEN",
];

/**
 * 👻 Ouija Board Message Queue Server
 *
 * Handles async message passing between users and tracks presence.
 */

interface Message {
  text: string;
  timestamp: number;
  id: string;
}

type QueueStorage = {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
};

export default class OuijaRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  // In-memory message queue (also persisted to storage)
  private messages: Message[] = [];

  // Rate limiting per connection
  private lastSendTime = new Map<string, number>();

  /**
   * Initialize server - load messages from storage
   */
  async onStart() {
    const stored = await this.storage.get<Message[]>("messages");
    if (stored) {
      this.messages = stored;
      this.pruneExpiredMessages();
      this.trimToMaxMessages();
      await this.saveMessages();
    }

    if (!this.messages.length) {
      this.messages = this.createSeedMessages();
      await this.saveMessages();
    }
  }

  /**
   * Handle new connection - send presence + dispense a message
   */
  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`👻 Spirit ${conn.id} entered the séance`);

    // Broadcast updated presence count to everyone
    this.broadcastPresence();

    const seenSet = this.extractSeenSet(ctx);
    const message = this.pickMessageForVisitor(seenSet);
    if (message) {
      this.sendDispense(conn, message);
    } else {
      // Queue is empty
      conn.send(JSON.stringify({
        type: "queue_empty",
      }));
    }
  }

  /**
   * Handle incoming messages from clients
   */
  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);

      if (data.type === "send") {
        if (typeof data.text !== "string") {
          sender.send(JSON.stringify({
            type: "error",
            message: "Message text must be a string",
          }));
          return;
        }
        await this.handleSendMessage(data.text, sender);
        return;
      }

      if (data.type === "request_next") {
        const rawSeen = data.seen as unknown;
        const seenArray: string[] = Array.isArray(rawSeen)
          ? rawSeen.filter((id): id is string => typeof id === "string")
          : typeof rawSeen === "string"
          ? rawSeen.split(",")
          : [];
        const seenSet = new Set<string>(
          seenArray.filter((id) => id.length),
        );
        const message = this.pickMessageForVisitor(seenSet);
        if (message) {
          this.sendDispense(sender, message);
        } else {
          sender.send(JSON.stringify({ type: "queue_empty" }));
        }
        return;
      }

      sender.send(JSON.stringify({
        type: "error",
        message: "Unknown message type",
      }));
    } catch (error) {
      console.error("Error parsing message:", error);
      sender.send(JSON.stringify({
        type: "error",
        message: "Invalid message format",
      }));
    }
  }

  /**
   * Handle user disconnection
   */
  onClose(conn: Party.Connection) {
    console.log(`👻 Spirit ${conn.id} left the séance`);
    this.broadcastPresence();
  }

  /**
   * Handle sending a message to the queue
   */
  private async handleSendMessage(text: string, sender: Party.Connection) {
    // Rate limiting: 30 second cooldown
    const lastSent = this.lastSendTime.get(sender.id) || 0;
    const cooldown = 30 * 1000; // 30 seconds
    const timeSinceLastSend = Date.now() - lastSent;

    if (timeSinceLastSend < cooldown) {
      const remaining = Math.ceil((cooldown - timeSinceLastSend) / 1000);
      sender.send(JSON.stringify({
        type: "error",
        message: `Please wait ${remaining} seconds before sending again`,
      }));
      return;
    }

    // Sanitize message
    const sanitized = this.sanitizeMessage(text);

    if (!sanitized) {
      sender.send(JSON.stringify({
        type: "error",
        message: "Invalid message",
      }));
      return;
    }

    // Enforce max length
    const maxLength = 50;
    if (sanitized.length > maxLength) {
      sender.send(JSON.stringify({
        type: "error",
        message: `Message too long (max ${maxLength} characters)`,
      }));
      return;
    }

    // Add to queue
    const newMessage: Message = {
      text: sanitized,
      timestamp: Date.now(),
      id: `${sender.id}-${Date.now()}`,
    };

    this.pruneExpiredMessages();
    this.messages.push(newMessage);
    this.trimToMaxMessages();

    await this.saveMessages();

    // Update rate limit
    this.lastSendTime.set(sender.id, Date.now());

    // Confirm to sender
    sender.send(JSON.stringify({
      type: "message_sent",
      text: sanitized,
      id: newMessage.id,
    }));

    this.broadcastNewMessage(newMessage, sender);

    console.log(
      `📝 New message queued: "${sanitized}" (queue: ${this.messages.length})`,
    );
  }

  /**
   * Sanitize message - allow only A-Z, 0-9, space, ?, !
   */
  private sanitizeMessage(text: string): string {
    return text
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .replace(/[^A-Z0-9 ?!]/g, ""); // Remove invalid chars
  }

  /**
   * Drop any messages older than the retention window
   */
  private pruneExpiredMessages() {
    if (!this.messages.length) return;
    const cutoff = Date.now() - RETENTION_MS;
    this.messages = this.messages.filter((message) =>
      message.timestamp > cutoff
    );
  }

  /**
   * Ensure we keep the most recent messages within MAX_MESSAGES
   */
  private trimToMaxMessages() {
    if (this.messages.length <= MAX_MESSAGES) return;
    this.messages.splice(0, this.messages.length - MAX_MESSAGES);
  }

  /**
   * Broadcast presence count to all connected clients
   */
  private broadcastPresence() {
    const connections = [...this.room.getConnections()];
    const count = connections.length;

    this.room.broadcast(JSON.stringify({
      type: "presence",
      count,
    }));

    console.log(`👻 Presence update: ${count} spirits connected`);
  }

  /**
   * Save messages to persistent storage
   */
  private async saveMessages() {
    await this.storage.put("messages", this.messages);
  }

  private get storage(): QueueStorage {
    return this.room.storage as unknown as QueueStorage;
  }

  /**
   * Notify connected clients when the queue grows
   */
  private broadcastNewMessage(message: Message, sender: Party.Connection) {
    this.room.broadcast(
      JSON.stringify({
        type: "new_message_queued",
        queueLength: this.messages.length,
        text: message.text,
        timestamp: message.timestamp,
        id: message.id,
      }),
      [sender.id],
    );
  }

  /**
   * Pick a message the visitor hasn't seen yet, fallback to any message
   */
  private pickMessageForVisitor(seen: Set<string>): Message | null {
    if (!this.messages.length) return null;
    const unseen = this.messages.filter((message) => !seen.has(message.id));
    const pool = unseen.length ? unseen : this.messages;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    return choice ?? null;
  }

  private extractSeenSet(ctx?: Party.ConnectionContext): Set<string> {
    try {
      if (!ctx) return new Set();
      const url = new URL(ctx.request.url);
      const seenParam = url.searchParams.get("seen");
      if (!seenParam) return new Set();
      const ids = seenParam.split(",").map((id) => id.trim()).filter(Boolean);
      return new Set(ids);
    } catch {
      return new Set();
    }
  }

  private sendDispense(target: Party.Connection, message: Message) {
    target.send(JSON.stringify({
      type: "dispense",
      text: message.text,
      timestamp: message.timestamp,
      id: message.id,
    }));
  }

  private createSeedMessages(): Message[] {
    const now = Date.now();
    return SEED_MESSAGES.map((raw, index) => ({
      text: this.sanitizeMessage(raw),
      timestamp: now - index * 1000,
      id: `seed-${index}`,
    }));
  }
}

// Export the server to make PartyKit happy
OuijaRoom satisfies Party.Worker;
