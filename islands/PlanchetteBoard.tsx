import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

type RawCoord = { key: string; x: number; y: number };
type Vec2 = { x: number; y: number };

type Props = {
  message: string;
  startDelayMs?: number;
  pauseMs?: number;
  speedPxPerSec?: number;
};

const RAW_COORDS: RawCoord[] = [
  { key: "YES", x: 0.192, y: 0.158 },
  { key: "NO", x: 0.771, y: 0.158 },
  { key: "A", x: 0.144, y: 0.422 },
  { key: "B", x: 0.204, y: 0.373 },
  { key: "C", x: 0.255, y: 0.344 },
  { key: "D", x: 0.316, y: 0.323 },
  { key: "E", x: 0.372, y: 0.305 },
  { key: "F", x: 0.425, y: 0.289 },
  { key: "G", x: 0.487, y: 0.296 },
  { key: "H", x: 0.558, y: 0.299 },
  { key: "I", x: 0.613, y: 0.312 },
  { key: "J", x: 0.656, y: 0.33 },
  { key: "K", x: 0.711, y: 0.349 },
  { key: "L", x: 0.768, y: 0.383 },
  { key: "M", x: 0.837, y: 0.421 },
  { key: "N", x: 0.153, y: 0.573 },
  { key: "O", x: 0.203, y: 0.53 },
  { key: "P", x: 0.25, y: 0.489 },
  { key: "Q", x: 0.308, y: 0.471 },
  { key: "R", x: 0.362, y: 0.445 },
  { key: "S", x: 0.421, y: 0.434 },
  { key: "T", x: 0.473, y: 0.418 },
  { key: "U", x: 0.53, y: 0.432 },
  { key: "V", x: 0.591, y: 0.44 },
  { key: "W", x: 0.66, y: 0.472 },
  { key: "X", x: 0.724, y: 0.516 },
  { key: "Y", x: 0.78, y: 0.55 },
  { key: "Z", x: 0.83, y: 0.603 },
  { key: "1", x: 0.249, y: 0.645 },
  { key: "2", x: 0.296, y: 0.643 },
  { key: "3", x: 0.357, y: 0.642 },
  { key: "4", x: 0.418, y: 0.642 },
  { key: "5", x: 0.477, y: 0.64 },
  { key: "6", x: 0.536, y: 0.643 },
  { key: "7", x: 0.594, y: 0.633 },
  { key: "8", x: 0.648, y: 0.643 },
  { key: "9", x: 0.709, y: 0.642 },
  { key: "0", x: 0.754, y: 0.642 },
  { key: "GOODBYE", x: 0.502, y: 0.775 },
];

const PLANCHETTE_SIZE = 168;
const PLANCHETTE_EYE_ANCHOR = { x: 0.5, y: 0.37 };

export default function PlanchetteBoard({
  message,
  startDelayMs = 760,
  pauseMs = 280,
  speedPxPerSec = 440,
}: Props) {
  const sceneRef = useRef<HTMLElement | null>(null);
  const boardWrapRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const planchetteRef = useRef<HTMLDivElement | null>(null);
  const boardImageRef = useRef<HTMLImageElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const keyElementsRef = useRef(new Map<string, HTMLElement>());
  const keyCentersRef = useRef(new Map<string, Vec2>());
  const boardSizeRef = useRef<Vec2>({ x: 0, y: 0 });
  const cameraOffsetRef = useRef<Vec2>({ x: 0, y: 0 });
  const runningRef = useRef(false);
  const [phase, setPhase] = useState<"spelling" | "complete">("spelling");

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
    const planchette = planchetteRef.current;
    if (!planchette) return;
    planchette.style.opacity = "0";
    planchette.style.transform = "translate(-9999px, -9999px)";
  }, []);

  useEffect(() => {
    const startTimer = globalThis.setTimeout(() => {
      beginReading();
    }, startDelayMs);

    const wakeAudio = () => cueBackgroundAudio();
    globalThis.addEventListener("pointerdown", wakeAudio, { once: true });
    globalThis.addEventListener("keydown", wakeAudio, { once: true });

    return () => {
      globalThis.clearTimeout(startTimer);
      globalThis.removeEventListener("pointerdown", wakeAudio);
      globalThis.removeEventListener("keydown", wakeAudio);
    };
  }, [message, startDelayMs]);

  function beginReading() {
    if (runningRef.current) return;
    cueBackgroundAudio();
    setPhase("spelling");
    runningRef.current = true;
    void (async () => {
      try {
        await waitForBoardLayout();
        if (shouldReduceMotion()) {
          setCameraOffset({ x: 0, y: 0 });
          await delay(250);
        } else {
          await animateMessage(message);
        }
        setPhase("complete");
      } finally {
        runningRef.current = false;
      }
    })();
  }

  async function animateMessage(rawMessage: string) {
    const planchette = planchetteRef.current;
    const board = boardRef.current;
    if (!planchette || !board) return;
    recomputeLayout();
    const targets = buildTargets(sanitizeMessage(rawMessage));
    if (!targets.length) return;
    const boardSize = boardSizeRef.current;
    const planchetteHeight = planchette.offsetHeight || PLANCHETTE_SIZE;
    const margin = planchetteHeight * 0.18;
    const start = {
      x: boardSize.x * 0.86,
      y: Math.min(boardSize.y - margin, boardSize.y * 0.84),
    };
    const exit = {
      x: boardSize.x * 0.2,
      y: Math.min(boardSize.y - margin * 0.6, boardSize.y * 0.86),
    };
    setPlanchettePosition(planchette, start);
    await fade(planchette, 0, 1, 620);
    let cursor = { ...start };
    let lastKey: string | null = null;
    for (const { key, point } of targets) {
      if (key === lastKey) {
        const liftPoint = { x: cursor.x, y: cursor.y - 44 };
        await movePlanchetteWithSpring(
          planchette,
          cursor,
          liftPoint,
          speedPxPerSec * 0.92,
        );
        await delay(120);
        await movePlanchetteWithSpring(
          planchette,
          liftPoint,
          point,
          speedPxPerSec * 0.92,
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
      softBlip();
      await delay(pauseMs);
      setKeyActive(key, false);
      cursor = point;
      lastKey = key;
    }
    await delay(1080);
    await movePlanchetteWithSpring(
      planchette,
      cursor,
      exit,
      speedPxPerSec * 0.82,
    );
    await fade(planchette, 1, 0, 700);
    planchette.style.transform = "translate(-9999px, -9999px)";
    await settleCamera();
  }

  function buildTargets(spelledMessage: string) {
    const centers = keyCentersRef.current;
    const results: { key: string; point: Vec2 }[] = [];
    for (const char of spelledMessage) {
      const key = normalizeToKey(char);
      if (!key) continue;
      const point = centers.get(key);
      if (!point) continue;
      results.push({ key, point });
    }
    const goodbye = centers.get("GOODBYE");
    if (results.length && goodbye) {
      results.push({ key: "GOODBYE", point: goodbye });
    }
    return results;
  }

  return (
    <section
      class="board-scene"
      ref={sceneRef}
      aria-label="Spirit board reading"
      aria-busy={phase !== "complete"}
    >
      <div class="board-wrap" ref={boardWrapRef}>
        <div class="board-grid" ref={boardRef}>
          <img
            ref={boardImageRef}
            src="/ghostboard.png"
            alt="A dark spirit board used to spell the oracle message"
            draggable={false}
          />
          <div class="board-keys" aria-hidden="true">
            {RAW_COORDS.map(({ key, x, y }) => {
              const extra = key === "GOODBYE" ? " goodbye" : "";
              return (
                <span
                  key={key}
                  class={`board-key ${key.toLowerCase()}${extra}`}
                  data-key={key}
                  style={{
                    left: `${(x * 100).toFixed(2)}%`,
                    top: `${(y * 100).toFixed(2)}%`,
                  } as JSX.CSSProperties}
                  ref={(el) => {
                    if (!el) {
                      keyElementsRef.current.delete(key);
                      return;
                    }
                    keyElementsRef.current.set(key, el);
                  }}
                >
                  <span>{key}</span>
                </span>
              );
            })}
          </div>
          <div ref={planchetteRef} class="planchette" aria-hidden="true">
            <img
              src="/planchette.png"
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          </div>
        </div>
      </div>
      <audio
        ref={backgroundAudioRef}
        src="/ambient_loop.mp3"
        preload="auto"
        loop
        playsInline
        class="ambient-player"
      />
      <p
        class="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {phase === "complete"
          ? "The board has finished."
          : "The board is moving."}
      </p>
      {phase === "complete" && (
        <div class="reading-actions">
          <a class="oracle-action" href="/" aria-label="Draw another omen">
            Ask Again
          </a>
        </div>
      )}
    </section>
  );

  function normalizeToKey(input: string): string | null {
    const upper = input.toUpperCase();
    if (/^[A-Z0-9]$/.test(upper)) return upper;
    if (upper === "?" || upper === "¿") return "YES";
    if (upper === "!" || upper === "¡") return "NO";
    return null;
  }

  function sanitizeMessage(raw: string): string {
    return raw.trim().replace(/\s+/g, " ").toUpperCase();
  }

  function setKeyActive(key: string, active: boolean) {
    const el = keyElementsRef.current.get(key);
    if (!el) return;
    el.classList.toggle("active", active);
  }

  async function movePlanchetteWithSpring(
    el: HTMLElement,
    start: Vec2,
    end: Vec2,
    speed: number,
  ) {
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const duration = Math.max(420, (distance / Math.max(speed, 1)) * 1000);
    const control = controlForArc(start, end, 0.105);
    await rafTween(duration, (t) => {
      const eased = easeInOutCubic(t);
      const point = quadBezier(start, control, end, eased);
      setPlanchettePosition(el, point);
    });
  }

  function setPlanchettePosition(el: HTMLElement, point: Vec2) {
    const width = el.offsetWidth || PLANCHETTE_SIZE;
    const height = el.offsetHeight || Math.round(width * 2 / 3);
    const anchorX = width * PLANCHETTE_EYE_ANCHOR.x;
    const anchorY = height * PLANCHETTE_EYE_ANCHOR.y;
    const drift = performance.now();
    const rotation = Math.sin(drift / 210) * 1.45 +
      Math.sin(drift / 89) * 0.55;
    const scale = 1 + Math.sin(drift / 320) * 0.008;
    el.style.transform = `translate(${point.x - anchorX}px, ${
      point.y - anchorY
    }px) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    setCameraForPoint(point);
  }

  function setCameraForPoint(point: Vec2) {
    if (!isMobileCameraEnabled()) {
      if (cameraOffsetRef.current.x || cameraOffsetRef.current.y) {
        setCameraOffset({ x: 0, y: 0 });
      }
      return;
    }
    setCameraOffset(cameraOffsetForPoint(point));
  }

  function cameraOffsetForPoint(point: Vec2): Vec2 {
    const scene = sceneRef.current;
    const boardWrap = boardWrapRef.current;
    if (!scene || !boardWrap) return { x: 0, y: 0 };

    const viewport = { x: scene.clientWidth, y: scene.clientHeight };
    const board = {
      x: boardWrap.offsetWidth,
      y: boardWrap.offsetHeight,
    };
    const base = {
      x: (viewport.x - board.x) / 2,
      y: (viewport.y - board.y) / 2,
    };

    const desired = {
      x: viewport.x * 0.5 - base.x - point.x,
      y: viewport.y * 0.44 - base.y - point.y,
    };
    const xRange = cameraRange(viewport.x, board.x, base.x);
    const yRange = cameraRange(viewport.y, board.y, base.y);

    return {
      x: clamp(desired.x, xRange.min, xRange.max),
      y: clamp(desired.y, yRange.min, yRange.max),
    };
  }

  function cameraRange(viewport: number, board: number, base: number) {
    if (board > viewport) {
      return {
        min: viewport - board - base,
        max: -base,
      };
    }
    const range = Math.min(110, Math.max(0, (viewport - board) / 2));
    return { min: -range, max: range };
  }

  function setCameraOffset(offset: Vec2) {
    const boardWrap = boardWrapRef.current;
    if (!boardWrap) return;
    cameraOffsetRef.current = offset;
    boardWrap.style.setProperty("--camera-x", `${offset.x.toFixed(2)}px`);
    boardWrap.style.setProperty("--camera-y", `${offset.y.toFixed(2)}px`);
  }

  async function settleCamera() {
    if (!isMobileCameraEnabled()) {
      setCameraOffset({ x: 0, y: 0 });
      return;
    }

    const start = cameraOffsetRef.current;
    if (Math.hypot(start.x, start.y) < 1) return;
    await rafTween(700, (t) => {
      const eased = easeInOutSine(t);
      setCameraOffset({
        x: start.x * (1 - eased),
        y: start.y * (1 - eased),
      });
    });
  }

  function isMobileCameraEnabled() {
    return globalThis.matchMedia?.("(max-width: 720px)").matches ?? false;
  }

  function shouldReduceMotion() {
    return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")
      .matches ?? false;
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
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

  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

  async function waitForBoardLayout() {
    for (let attempts = 0; attempts < 30; attempts += 1) {
      recomputeLayout();
      const boardSize = boardSizeRef.current;
      if (boardSize.x > 0 && boardSize.y > 0 && keyCentersRef.current.size) {
        return;
      }
      await delay(50);
    }
  }

  function recomputeLayout() {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    const bounds = boardEl.getBoundingClientRect();
    boardSizeRef.current = { x: bounds.width, y: bounds.height };
    const centers = new Map<string, Vec2>();
    for (const { key, x, y } of RAW_COORDS) {
      const el = keyElementsRef.current.get(key);
      if (el) centers.set(key, { x: bounds.width * x, y: bounds.height * y });
    }
    keyCentersRef.current = centers;
  }

  function cueBackgroundAudio() {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    audio.volume = 0.28;
    const playPromise = audio.play();
    if (playPromise) playPromise.catch(() => {});
  }

  function softBlip() {
    try {
      const ctx = (globalThis as typeof globalThis & {
        __spiritAudio?: AudioContext;
      }).__spiritAudio ?? new AudioContext();
      (globalThis as typeof globalThis & { __spiritAudio?: AudioContext })
        .__spiritAudio = ctx;
      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 300 + Math.random() * 80;
      gain.gain.value = 0.00001;
      osc.connect(gain).connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.linearRampToValueAtTime(0.018, now + 0.04);
      gain.gain.linearRampToValueAtTime(0.00001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // no audio available
    }
  }
}
