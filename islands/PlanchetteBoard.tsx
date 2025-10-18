import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { AboutLink } from "./AboutModal.tsx";

type RawCoord = { key: string; x: number; y: number };

const RAW_COORDS: RawCoord[] = [
  // YES and NO at the top
  { key: "YES", x: 0.16, y: 0.12 },
  { key: "NO", x: 0.84, y: 0.12 },

  // First row: A-M (arced across top third)
  { key: "A", x: 0.125, y: 0.37 },
  { key: "B", x: 0.185, y: 0.38 },
  { key: "C", x: 0.245, y: 0.388 },
  { key: "D", x: 0.305, y: 0.393 },
  { key: "E", x: 0.365, y: 0.396 },
  { key: "F", x: 0.425, y: 0.398 },
  { key: "G", x: 0.485, y: 0.398 },
  { key: "H", x: 0.545, y: 0.396 },
  { key: "I", x: 0.605, y: 0.393 },
  { key: "J", x: 0.665, y: 0.388 },
  { key: "K", x: 0.725, y: 0.38 },
  { key: "L", x: 0.785, y: 0.37 },
  { key: "M", x: 0.845, y: 0.355 },

  // Second row: N-Z (arced below first row)
  { key: "N", x: 0.155, y: 0.535 },
  { key: "O", x: 0.21, y: 0.545 },
  { key: "P", x: 0.265, y: 0.552 },
  { key: "Q", x: 0.32, y: 0.556 },
  { key: "R", x: 0.375, y: 0.558 },
  { key: "S", x: 0.43, y: 0.558 },
  { key: "T", x: 0.485, y: 0.556 },
  { key: "U", x: 0.54, y: 0.552 },
  { key: "V", x: 0.595, y: 0.545 },
  { key: "W", x: 0.65, y: 0.535 },
  { key: "X", x: 0.705, y: 0.52 },
  { key: "Y", x: 0.76, y: 0.5 },
  { key: "Z", x: 0.815, y: 0.475 },

  // Numbers row at bottom
  { key: "1", x: 0.215, y: 0.68 },
  { key: "2", x: 0.27, y: 0.685 },
  { key: "3", x: 0.325, y: 0.687 },
  { key: "4", x: 0.38, y: 0.688 },
  { key: "5", x: 0.435, y: 0.688 },
  { key: "6", x: 0.49, y: 0.687 },
  { key: "7", x: 0.545, y: 0.685 },
  { key: "8", x: 0.6, y: 0.682 },
  { key: "9", x: 0.655, y: 0.677 },
  { key: "0", x: 0.71, y: 0.67 },

  // GOOD BYE at the bottom
  { key: "GOODBYE", x: 0.5, y: 0.82 },
];

type Vec2 = { x: number; y: number };

type Props = {
  incomingMessage?: string;
  idleDelayMs?: number;
  pauseMs?: number;
  speedPxPerSec?: number;
  heading?: string;
  subtitle?: string;
  eyebrow?: string;
};

const PLANCHETTE_SIZE = 168;
const INPUT_IDLE_MS = 4500;
const WINDOW_Y_OFFSET = 0.024;

export default function PlanchetteBoard({
  incomingMessage = "HELLO PABLO",
  idleDelayMs = 2000,
  pauseMs = 820,
  speedPxPerSec = 240,
  heading = "Today’s transmission is arriving…",
  subtitle =
    "Watch the planchette, then leave your own trace without ever touching a text field.",
  eyebrow = "Ghost Node",
}: Props) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const planchetteRef = useRef<HTMLDivElement | null>(null);
  const boardImageRef = useRef<HTMLImageElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const keyElementsRef = useRef(new Map<string, HTMLElement>());
  const keyCentersRef = useRef(new Map<string, Vec2>());
  const boardSizeRef = useRef<Vec2>({ x: 0, y: 0 });
  const queueRef = useRef<string[]>([]);
  const runningRef = useRef(false);
  const pendingBufferRef = useRef<string>("");
  const sendTimerRef = useRef<number | null>(null);
  const [typedPreview, setTypedPreview] = useState("");
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const initial = sanitizeMessage(incomingMessage);
    if (initial) {
      queueRef.current.push(initial);
      processQueue();
    }
  }, [incomingMessage]);

  useEffect(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    const recompute = () => recomputeLayout();
    recompute();
    const resizeObserver = new ResizeObserver(recompute);
    resizeObserver.observe(boardEl);
    globalThis.addEventListener("resize", recompute);
    return () => {
      resizeObserver.disconnect();
      globalThis.removeEventListener("resize", recompute);
    };
  }, []);

  useEffect(() => {
    const img = boardImageRef.current;
    if (!img) return;
    const handle = () => recomputeLayout();
    if (img.complete) {
      handle();
      return;
    }
    img.addEventListener("load", handle);
    return () => img.removeEventListener("load", handle);
  }, []);

  useEffect(() => {
    const attempt = () => cueBackgroundAudio();
    globalThis.addEventListener("pointerdown", attempt, { once: true });
    globalThis.addEventListener("keydown", attempt, { once: true });
    return () => {
      globalThis.removeEventListener("pointerdown", attempt);
      globalThis.removeEventListener("keydown", attempt);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (handleSpecialKeys(event.key)) {
        event.preventDefault();
        return;
      }
      const key = normalizeToKey(event.key);
      if (!key) return;
      event.preventDefault();
      handleLetterInput(key);
    };
    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const planchette = planchetteRef.current;
    if (!planchette) return;
    planchette.style.opacity = "0";
    planchette.style.transform = `translate(-9999px, -9999px)`;
  }, []);

  function handleSpecialKeys(raw: string): boolean {
    if (raw === "Backspace") {
      if (!pendingBufferRef.current) return true;
      pendingBufferRef.current = pendingBufferRef.current.slice(0, -1);
      setTypedPreview(pendingBufferRef.current);
      return true;
    }
    if (raw === "Enter") {
      flushPendingBuffer();
      return true;
    }
    if (raw === "Escape") {
      pendingBufferRef.current = "";
      setTypedPreview("");
      return true;
    }
    return false;
  }

  function handleLetterInput(key: string) {
    cueBackgroundAudio();
    flashKey(key);
    const appendedChar = keyToMessageChar(key);
    pendingBufferRef.current += appendedChar;
    setTypedPreview(pendingBufferRef.current);
    if (sendTimerRef.current) {
      clearTimeout(sendTimerRef.current);
    }
    sendTimerRef.current = globalThis.setTimeout(() => {
      flushPendingBuffer();
    }, INPUT_IDLE_MS);
  }

  function flushPendingBuffer() {
    if (sendTimerRef.current) {
      clearTimeout(sendTimerRef.current);
      sendTimerRef.current = null;
    }
    const next = sanitizeMessage(pendingBufferRef.current);
    pendingBufferRef.current = "";
    setTypedPreview("");
    if (!next) return;
    queueRef.current.push(next);
    processQueue();
  }

  function processQueue() {
    if (runningRef.current) return;
    runningRef.current = true;
    void (async () => {
      try {
        cueBackgroundAudio();
        await delay(idleDelayMs);
        while (queueRef.current.length) {
          const next = queueRef.current.shift();
          if (!next) continue;
          await animateMessage(next);
        }
      } finally {
        runningRef.current = false;
      }
    })();
  }

  async function animateMessage(message: string) {
    const planchette = planchetteRef.current;
    const board = boardRef.current;
    if (!planchette || !board) return;
    recomputeLayout();
    const targets = buildTargets(message);
    if (!targets.length) return;
    const boardSize = boardSizeRef.current;
    const planchetteHeight = planchette.offsetHeight || PLANCHETTE_SIZE;
    const margin = planchetteHeight * 0.18;
    const start = {
      x: boardSize.x * 0.9,
      y: Math.min(boardSize.y - margin, boardSize.y * 0.88),
    };
    const exit = {
      x: boardSize.x * 0.18,
      y: Math.min(boardSize.y - margin * 0.6, boardSize.y * 0.9),
    };
    setPlanchettePosition(planchette, start);
    await fade(planchette, 0, 1, 720);
    let cursor = { ...start };
    let lastKey: string | null = null;
    for (const { key, point } of targets) {
      // If same letter twice, lift off and return
      if (key === lastKey) {
        const liftPoint = { x: cursor.x, y: cursor.y - 80 };
        await movePlanchetteWithSpring(
          planchette,
          cursor,
          liftPoint,
          speedPxPerSec * 1.5,
        );
        await delay(200);
        await movePlanchetteWithSpring(
          planchette,
          liftPoint,
          point,
          speedPxPerSec * 1.5,
        );
      } else {
        await movePlanchetteWithSpring(
          planchette,
          cursor,
          point,
          speedPxPerSec,
        );
      }
      setKeyActive(key, true);
      await softBlip();
      await delay(pauseMs);
      setKeyActive(key, false);
      cursor = point;
      lastKey = key;
    }
    await movePlanchetteWithSpring(
      planchette,
      cursor,
      exit,
      speedPxPerSec * 0.85,
    );
    await fade(planchette, 1, 0, 680);
    planchette.style.transform = `translate(-9999px, -9999px)`;
  }

  function buildTargets(message: string) {
    const centers = keyCentersRef.current;
    const results: { key: string; point: Vec2 }[] = [];
    for (const char of message) {
      const key = normalizeToKey(char);
      if (!key) continue;
      const point = centers.get(key);
      if (!point) continue;
      results.push({ key, point });
    }
    return results;
  }

  return (
    <section class="board-scene">
      <div class="board-wrap">
        {showIntro && (
          <aside class="page-header">
            <div class="header-meta">
              <p class="eyebrow">{eyebrow}</p>
              <h1>{heading}</h1>
              <p class="subtitle">{subtitle}</p>
              <div class="header-links">
                <AboutLink label="About" className="header-link" />
                <a
                  href="https://ko-fi.com/pibulus"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="header-link"
                >
                  Support
                </a>
              </div>
            </div>
            <button
              type="button"
              class="header-close"
              onClick={() => setShowIntro(false)}
              aria-label="Dismiss intro"
            >
              ×
            </button>
          </aside>
        )}
        <div class="board-grid" ref={boardRef}>
          <img
            ref={boardImageRef}
            src="/ghostboard.png"
            alt="Spirit board"
            draggable={false}
          />
          <div class="board-keys">
            {RAW_COORDS.map(({ key, x, y }) => {
              const extra = key === "GOODBYE" ? " goodbye" : "";
              return (
                <button
                  key={key}
                  type="button"
                  class={`board-key ${key.toLowerCase()}${extra}`}
                  data-key={key}
                  style={{
                    left: `${(x * 100).toFixed(2)}%`,
                    top: `${(y * 100).toFixed(2)}%`,
                  } as JSX.CSSProperties}
                  onClick={() => handleLetterInput(key)}
                  ref={(el) => {
                    if (!el) {
                      keyElementsRef.current.delete(key);
                      return;
                    }
                    keyElementsRef.current.set(key, el);
                  }}
                >
                  <span>{key}</span>
                </button>
              );
            })}
          </div>
          <div
            ref={planchetteRef}
            class="planchette"
          >
            <img
              src="/planchette.png"
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          </div>
        </div>
        <audio
          ref={backgroundAudioRef}
          src="/ambient_loop.mp3"
          preload="auto"
          loop
          playsInline
          class="ambient-player"
        >
        </audio>
        <div class="typed-preview" aria-live="polite">
          {typedPreview
            ? <span>Composing: {typedPreview}</span>
            : (
              <span class="hint">
                Start typing or tap letters to send a message.
              </span>
            )}
        </div>
      </div>
    </section>
  );

  function normalizeToKey(input: string): string | null {
    const upper = input.toUpperCase();
    if (/^[A-Z0-9]$/.test(upper)) return upper;
    if (upper === " ") return "GOODBYE";
    if (upper === "?" || upper === "¿") return "YES";
    if (upper === "!" || upper === "¡") return "NO";
    return null;
  }

  function keyToMessageChar(key: string): string {
    if (key === "GOODBYE") return " ";
    if (key === "YES") return "?";
    if (key === "NO") return "!";
    return key;
  }

  function sanitizeMessage(raw: string): string {
    return raw.trim().replace(/\s+/g, " ").toUpperCase();
  }

  function setKeyActive(key: string, active: boolean) {
    const el = keyElementsRef.current.get(key);
    if (!el) return;
    el.classList.toggle("active", active);
  }

  function flashKey(key: string) {
    const el = keyElementsRef.current.get(key);
    if (!el) return;
    el.classList.add("flash");
    globalThis.setTimeout(() => el.classList.remove("flash"), 240);
  }

  async function movePlanchette(
    el: HTMLElement,
    start: Vec2,
    end: Vec2,
    speed: number,
  ) {
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const duration = Math.max(620, (distance / Math.max(speed, 1)) * 1000);
    const control = controlForArc(start, end);
    await rafTween(duration, (t) => {
      const eased = easeInOutSine(t);
      const point = quadBezier(start, control, end, eased);
      setPlanchettePosition(el, point);
    });
  }

  async function movePlanchetteWithSpring(
    el: HTMLElement,
    start: Vec2,
    end: Vec2,
    speed: number,
  ) {
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const duration = Math.max(620, (distance / Math.max(speed, 1)) * 1000);
    const control = controlForArc(start, end);
    await rafTween(duration, (t) => {
      // Spring easing with overshoot
      const eased = easeOutBack(t);
      const point = quadBezier(start, control, end, eased);
      setPlanchettePosition(el, point);
    });
  }

  function setPlanchettePosition(el: HTMLElement, point: Vec2) {
    const halfWidth = (el.offsetWidth || PLANCHETTE_SIZE) / 2;
    const halfHeight = (el.offsetHeight || PLANCHETTE_SIZE) / 2;
    el.style.transform = `translate(${point.x - halfWidth}px, ${
      point.y - halfHeight
    }px)`;
  }

  function controlForArc(a: Vec2, b: Vec2, strength = 0.2): Vec2 {
    const mid = midpoint(a, b);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (length < 2) return { ...mid };
    const nx = -dy / length;
    const ny = dx / length;
    const offset = length * strength;
    return { x: mid.x + nx * offset, y: mid.y + ny * offset };
  }

  function midpoint(a: Vec2, b: Vec2): Vec2 {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function quadBezier(p0: Vec2, p1: Vec2, p2: Vec2, t: number): Vec2 {
    const oneMinusT = 1 - t;
    return {
      x: oneMinusT ** 2 * p0.x + 2 * oneMinusT * t * p1.x + t ** 2 * p2.x,
      y: oneMinusT ** 2 * p0.y + 2 * oneMinusT * t * p1.y + t ** 2 * p2.y,
    };
  }

  function easeInOutSine(t: number) {
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
  }

  function easeOutBack(t: number) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  async function rafTween(
    durationMs: number,
    render: (progress: number) => void,
  ) {
    const start = performance.now();
    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        render(t);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  async function fade(
    el: HTMLElement,
    from: number,
    to: number,
    duration: number,
  ) {
    await rafTween(duration, (t) => {
      const eased = easeInOutSine(t);
      const value = from + (to - from) * eased;
      el.style.opacity = value.toString();
    });
  }

  function delay(ms: number) {
    return new Promise<void>((resolve) => {
      globalThis.setTimeout(resolve, ms);
    });
  }

  function recomputeLayout() {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    const bounds = boardEl.getBoundingClientRect();
    boardSizeRef.current = { x: bounds.width, y: bounds.height };
    const centers = new Map<string, Vec2>();
    for (const { key } of RAW_COORDS) {
      const el = keyElementsRef.current.get(key);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const localX = rect.left - bounds.left + rect.width / 2;
      const localY = rect.top - bounds.top + rect.height / 2 -
        bounds.height * WINDOW_Y_OFFSET;
      const clampedY = Math.max(
        rect.height * 0.35,
        Math.min(bounds.height - rect.height * 0.35, localY),
      );
      centers.set(key, { x: localX, y: clampedY });
    }
    keyCentersRef.current = centers;
  }

  function cueBackgroundAudio() {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    audio.volume = 0.38;
    const playPromise = audio.play();
    if (playPromise) playPromise.catch(() => {});
  }

  async function softBlip() {
    try {
      const ctx = (globalThis as typeof globalThis & {
        __spiritAudio?: AudioContext;
      }).__spiritAudio ?? new AudioContext();
      (globalThis as typeof globalThis & { __spiritAudio?: AudioContext })
        .__spiritAudio = ctx;
      await ctx.resume().catch(() => {});
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 330 + Math.random() * 40;
      gain.gain.value = 0.00001;
      osc.connect(gain).connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.linearRampToValueAtTime(0.02, now + 0.05);
      gain.gain.linearRampToValueAtTime(0.00001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch {
      // no audio available
    }
  }
}
