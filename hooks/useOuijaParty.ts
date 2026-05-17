import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { PartySocket } from "partysocket";

const SESSION_STORAGE_KEY = "ouija_session_id";
const SEEN_STORAGE_KEY = "ouija_seen_messages";
const SEEN_LIMIT = 50;

/**
 * 👻 Ouija Board PartyKit Hook
 *
 * Manages connection to the PartyKit server for message queue and presence.
 */

interface OuijaPartyMessage {
  type:
    | "dispense"
    | "queue_empty"
    | "presence"
    | "message_sent"
    | "new_message_queued"
    | "error";
  text?: string;
  timestamp?: number;
  count?: number;
  queueLength?: number;
  id?: string;
  message?: string;
}

interface UseOuijaPartyOptions {
  host?: string;
  room?: string;
  onMessageReceived?: (text: string) => void;
  onQueueEmpty?: () => void;
  onMessageSent?: (id?: string) => void;
  onPresenceChange?: (count: number) => void;
  onError?: (error: string) => void;
}

export function useOuijaParty({
  host = "localhost:1999", // PartyKit dev server
  room = "main",
  onMessageReceived,
  onQueueEmpty,
  onMessageSent,
  onPresenceChange,
  onError,
}: UseOuijaPartyOptions = {}) {
  const socketRef = useRef<PartySocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [presenceCount, setPresenceCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const pendingMessagesRef = useRef<string[]>([]);
  const seenIdsRef = useRef<string[]>([]);
  const seenSetRef = useRef<Set<string>>(new Set());
  const seenInitializedRef = useRef(false);
  const isBrowser = typeof document !== "undefined";
  const requestPendingRef = useRef(false);

  const sessionId = useMemo(() => {
    if (!isBrowser) {
      return crypto.randomUUID?.() ?? `${Date.now()}`;
    }
    const existing = globalThis.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    globalThis.localStorage.setItem(SESSION_STORAGE_KEY, fresh);
    return fresh;
  }, [isBrowser]);

  if (isBrowser && !seenInitializedRef.current) {
    try {
      const stored = globalThis.localStorage.getItem(SEEN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const trimmed = parsed.slice(-SEEN_LIMIT);
          seenIdsRef.current = trimmed;
          seenSetRef.current = new Set(trimmed);
        }
      }
    } catch (error) {
      console.error("👻 Failed to hydrate seen messages:", error);
      seenIdsRef.current = [];
      seenSetRef.current = new Set();
    }
    seenInitializedRef.current = true;
  }

  const rememberMessage = (id?: string) => {
    if (!isBrowser || !id) return;
    if (seenSetRef.current.has(id)) return;
    seenSetRef.current.add(id);
    seenIdsRef.current.push(id);
    while (seenIdsRef.current.length > SEEN_LIMIT) {
      const removed = seenIdsRef.current.shift();
      if (removed) {
        seenSetRef.current.delete(removed);
      }
    }
    try {
      globalThis.localStorage.setItem(
        SEEN_STORAGE_KEY,
        JSON.stringify(seenIdsRef.current),
      );
    } catch (error) {
      console.error("👻 Unable to persist seen messages:", error);
    }
  };

  useEffect(() => {
    if (!isBrowser) return;
    // Create PartySocket connection
    const socket = new PartySocket({
      host,
      room,
      party: "ouija",
      query: () => ({
        sessionId,
        seen: seenIdsRef.current.slice(-SEEN_LIMIT).join(","),
      }),
    });

    socket.addEventListener("open", () => {
      console.log("👻 Connected to spirit board server");
      setConnected(true);
    });

    socket.addEventListener("close", () => {
      console.log("👻 Disconnected from spirit board server");
      setConnected(false);
      if (requestPendingRef.current) {
        requestPendingRef.current = false;
        setRequesting(false);
      }
    });

    socket.addEventListener("error", (event: Event) => {
      console.error("👻 Spirit board connection error:", event);
      onError?.("Connection error");
    });

    socket.addEventListener("message", (event: MessageEvent<string>) => {
      try {
        const data: OuijaPartyMessage = JSON.parse(event.data);

        switch (data.type) {
          case "dispense":
            if (data.text) {
              console.log("👻 Received message from the ether:", data.text);
              rememberMessage(data.id);
              onMessageReceived?.(data.text);
            }
            if (requestPendingRef.current) {
              requestPendingRef.current = false;
              setRequesting(false);
            }
            break;

          case "queue_empty":
            console.log("👻 The queue is empty - no messages from beyond");
            if (requestPendingRef.current) {
              requestPendingRef.current = false;
              setRequesting(false);
            }
            onQueueEmpty?.();
            break;

          case "presence":
            if (typeof data.count === "number") {
              console.log("👻 Presence update:", data.count, "spirits");
              setPresenceCount(data.count);
              onPresenceChange?.(data.count);
            }
            break;

          case "message_sent":
            console.log("👻 Message sent to queue:", data.text);
            rememberMessage(data.id);
            setSending(false);
            onMessageSent?.(data.id);
            break;

          case "new_message_queued":
            console.log(
              "👻 Someone added a message. Queue:",
              data.queueLength,
            );
            if (data.text) {
              rememberMessage(data.id);
              onMessageReceived?.(data.text);
            }
            break;

          case "error":
            console.error("👻 Server error:", data.message);
            onError?.(data.message || "Unknown error");
            setSending(false);
            if (requestPendingRef.current) {
              requestPendingRef.current = false;
              setRequesting(false);
            }
            break;
        }
      } catch (error) {
        console.error("👻 Failed to parse message:", error);
      }
    });

    socketRef.current = socket;

    const flushPendingMessages = () => {
      if (!pendingMessagesRef.current.length) return;
      const queued = [...pendingMessagesRef.current];
      pendingMessagesRef.current = [];
      queued.forEach((pendingText) => {
        socket.send(JSON.stringify({
          type: "send",
          text: pendingText,
        }));
      });
      if (queued.length) {
        setSending(true);
      }
    };

    socket.addEventListener("open", flushPendingMessages);

    return () => {
      socket.removeEventListener("open", flushPendingMessages);
      socket.close();
    };
  }, [host, room, isBrowser, sessionId]);

  useEffect(() => {
    if (!isBrowser || !connected) return;
    const socket = socketRef.current;
    if (!socket) return;
    if (!pendingMessagesRef.current.length) return;
    const queued = [...pendingMessagesRef.current];
    pendingMessagesRef.current = [];
    queued.forEach((pendingText) => {
      socket.send(JSON.stringify({
        type: "send",
        text: pendingText,
      }));
    });
    setSending(true);
  }, [connected, isBrowser]);

  /**
   * Send a message to the queue
   */
  const sendMessage = (text: string) => {
    if (sending) {
      onError?.("Already sending a message");
      return;
    }

    if (!socketRef.current || !connected) {
      pendingMessagesRef.current.push(text);
      onError?.("Connection lost. Queued for resend.");
      return;
    }

    setSending(true);

    socketRef.current.send(JSON.stringify({
      type: "send",
      text,
    }));
  };

  const requestNextMessage = () => {
    if (!socketRef.current || !connected) {
      onError?.("Not connected to server");
      return;
    }

    if (requestPendingRef.current) {
      onError?.("Already summoning another message");
      return;
    }

    requestPendingRef.current = true;
    setRequesting(true);

    socketRef.current.send(JSON.stringify({
      type: "request_next",
      seen: seenIdsRef.current.slice(-SEEN_LIMIT),
    }));
  };

  return {
    connected,
    presenceCount,
    sending,
    requesting,
    sendMessage,
    requestNextMessage,
  };
}
