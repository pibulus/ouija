import type * as Party from "partykit/server";

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

interface PresenceInfo {
  count: number;
}

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
    const stored = await this.room.storage.get<Message[]>("messages");
    if (stored) {
      this.messages = stored;
      // Clean up old messages (>24 hours)
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      this.messages = this.messages.filter(m => m.timestamp > dayAgo);
      await this.saveMessages();
    }
  }

  /**
   * Handle new connection - send presence + dispense a message
   */
  async onConnect(conn: Party.Connection) {
    console.log(`👻 Spirit ${conn.id} entered the séance`);

    // Broadcast updated presence count to everyone
    this.broadcastPresence();

    // Dispense a message from the queue to this new visitor
    const message = this.messages.shift();
    if (message) {
      conn.send(JSON.stringify({
        type: "dispense",
        text: message.text,
        timestamp: message.timestamp,
      }));
      await this.saveMessages();
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
        await this.handleSendMessage(data.text, sender);
      }
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

    this.messages.push(newMessage);

    // Enforce max queue size (100 messages)
    if (this.messages.length > 100) {
      this.messages.shift(); // Remove oldest
    }

    await this.saveMessages();

    // Update rate limit
    this.lastSendTime.set(sender.id, Date.now());

    // Confirm to sender
    sender.send(JSON.stringify({
      type: "message_sent",
      text: sanitized,
    }));

    // Broadcast to everyone that a new message was added
    this.room.broadcast(JSON.stringify({
      type: "new_message_queued",
      queueLength: this.messages.length,
    }), [sender.id]);

    console.log(`📝 New message queued: "${sanitized}" (queue: ${this.messages.length})`);
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
    await this.room.storage.put("messages", this.messages);
  }
}

// Export the server to make PartyKit happy
OuijaRoom satisfies Party.Worker;
