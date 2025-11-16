import { useEffect, useRef, useState } from "preact/hooks";
import PartySocket from "partysocket";

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
  message?: string;
}

interface UseOuijaPartyOptions {
  host?: string;
  room?: string;
  onMessageReceived?: (text: string) => void;
  onPresenceChange?: (count: number) => void;
  onError?: (error: string) => void;
}

export function useOuijaParty({
  host = "localhost:1999", // PartyKit dev server
  room = "main",
  onMessageReceived,
  onPresenceChange,
  onError,
}: UseOuijaPartyOptions = {}) {
  const socketRef = useRef<PartySocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [presenceCount, setPresenceCount] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Create PartySocket connection
    const socket = new PartySocket({
      host,
      room,
      party: "ouija",
    });

    socket.addEventListener("open", () => {
      console.log("👻 Connected to spirit board server");
      setConnected(true);
    });

    socket.addEventListener("close", () => {
      console.log("👻 Disconnected from spirit board server");
      setConnected(false);
    });

    socket.addEventListener("error", (event) => {
      console.error("👻 Spirit board connection error:", event);
      onError?.("Connection error");
    });

    socket.addEventListener("message", (event) => {
      try {
        const data: OuijaPartyMessage = JSON.parse(event.data);

        switch (data.type) {
          case "dispense":
            if (data.text) {
              console.log("👻 Received message from the ether:", data.text);
              onMessageReceived?.(data.text);
            }
            break;

          case "queue_empty":
            console.log("👻 The queue is empty - no messages from beyond");
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
            setSending(false);
            break;

          case "new_message_queued":
            console.log(
              "👻 Someone added a message. Queue:",
              data.queueLength,
            );
            break;

          case "error":
            console.error("👻 Server error:", data.message);
            onError?.(data.message || "Unknown error");
            setSending(false);
            break;
        }
      } catch (error) {
        console.error("👻 Failed to parse message:", error);
      }
    });

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [host, room]);

  /**
   * Send a message to the queue
   */
  const sendMessage = (text: string) => {
    if (!socketRef.current || !connected) {
      onError?.("Not connected to server");
      return;
    }

    if (sending) {
      onError?.("Already sending a message");
      return;
    }

    setSending(true);

    socketRef.current.send(JSON.stringify({
      type: "send",
      text,
    }));
  };

  return {
    connected,
    presenceCount,
    sending,
    sendMessage,
  };
}
