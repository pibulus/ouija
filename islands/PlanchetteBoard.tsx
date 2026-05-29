import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

type RawCoord = { key: string; x: number; y: number };
type Vec2 = { x: number; y: number };
type HauntProfile = {
  name: "restless" | "heavy" | "shy" | "sharp";
  speedMultiplier: number;
  pauseMultiplier: number;
  driftMultiplier: number;
  overshootChance: number;
  hesitationChance: number;
  grainOpacity: number;
  grainContrast: number;
  toneShift: number;
  finalHoldMs: number;
};

type Props = {
  message: string;
  boardImageSrc?: string;
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
const LANDING_DRIFT_PX = 16;
const GOODBYE_DRIFT_PX = 10;
const FILM_GRAIN_MIN_FRAME_MS = 72;
const FILM_GRAIN_FRAME_JITTER_MS = 96;
const HAUNT_PROFILES: HauntProfile[] = [
  {
    name: "restless",
    speedMultiplier: 1.05,
    pauseMultiplier: 0.88,
    driftMultiplier: 1.22,
    overshootChance: 0.5,
    hesitationChance: 0.22,
    grainOpacity: 0.28,
    grainContrast: 1.5,
    toneShift: 1.08,
    finalHoldMs: 1250,
  },
  {
    name: "heavy",
    speedMultiplier: 0.78,
    pauseMultiplier: 1.28,
    driftMultiplier: 0.84,
    overshootChance: 0.32,
    hesitationChance: 0.28,
    grainOpacity: 0.22,
    grainContrast: 1.24,
    toneShift: 0.82,
    finalHoldMs: 1850,
  },
  {
    name: "shy",
    speedMultiplier: 0.9,
    pauseMultiplier: 1.18,
    driftMultiplier: 1,
    overshootChance: 0.24,
    hesitationChance: 0.34,
    grainOpacity: 0.2,
    grainContrast: 1.18,
    toneShift: 0.94,
    finalHoldMs: 1600,
  },
  {
    name: "sharp",
    speedMultiplier: 1,
    pauseMultiplier: 0.96,
    driftMultiplier: 1.12,
    overshootChance: 0.44,
    hesitationChance: 0.18,
    grainOpacity: 0.25,
    grainContrast: 1.38,
    toneShift: 1.18,
    finalHoldMs: 1300,
  },
];

function createHauntProfile() {
  return HAUNT_PROFILES[Math.floor(Math.random() * HAUNT_PROFILES.length)];
}

export default function PlanchetteBoard({
  message,
  boardImageSrc = "/ghostboard.png",
  startDelayMs = 760,
  pauseMs = 340,
  speedPxPerSec = 330,
}: Props) {
  const sceneRef = useRef<HTMLElement | null>(null);
  const boardWrapRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const planchetteRef = useRef<HTMLDivElement | null>(null);
  const boardImageRef = useRef<HTMLImageElement | null>(null);
  const filmCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const boardReadyRef = useRef(false);
  const hauntRef = useRef(createHauntProfile());
  const keyElementsRef = useRef(new Map<string, HTMLElement>());
  const keyCentersRef = useRef(new Map<string, Vec2>());
  const boardSizeRef = useRef<Vec2>({ x: 0, y: 0 });
  const sceneSizeRef = useRef<Vec2>({ x: 0, y: 0 });
  const boardWrapSizeRef = useRef<Vec2>({ x: 0, y: 0 });
  const planchetteSizeRef = useRef<Vec2>({
    x: PLANCHETTE_SIZE,
    y: Math.round(PLANCHETTE_SIZE * 2 / 3),
  });
  const cameraOffsetRef = useRef<Vec2>({ x: 0, y: 0 });
  const runningRef = useRef(false);
  const cancelledRef = useRef(false);
  const [phase, setPhase] = useState<"summoning" | "spelling" | "complete">(
    "summoning",
  );
  const [boardReady, setBoardReady] = useState(false);

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
    let cancelled = false;
    boardReadyRef.current = false;
    setBoardReady(false);

    const markReady = async () => {
      try {
        await img.decode();
      } catch {
        // A failed decode should not trap the user on the summon screen.
      }
      if (cancelled) return;
      recomputeLayout();
      boardReadyRef.current = true;
      setBoardReady(true);
    };

    if (img.complete) {
      void markReady();
    } else {
      img.addEventListener("load", markReady, { once: true });
      img.addEventListener("error", markReady, { once: true });
    }

    return () => {
      cancelled = true;
      img.removeEventListener("load", markReady);
      img.removeEventListener("error", markReady);
    };
  }, [boardImageSrc]);

  useEffect(() => {
    const planchette = planchetteRef.current;
    if (!planchette) return;
    planchette.style.opacity = "0";
    planchette.style.transform = "translate(-9999px, -9999px)";
  }, []);

  useEffect(() => {
    const canvas = filmCanvasRef.current;
    if (!canvas || shouldReduceMotion()) return;
    return startFilmGrain(canvas, hauntRef.current);
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    setPhase("summoning");

    return () => {
      cancelledRef.current = true;
      keyElementsRef.current.forEach((el) => {
        el.classList.remove("active");
        el.classList.remove("haunted");
      });
      backgroundAudioRef.current?.pause();
    };
  }, [message]);

  useEffect(() => {
    if (phase !== "summoning" || shouldReduceMotion()) return;
    let stopped = false;
    let timer: number | undefined;

    const schedule = () => {
      timer = globalThis.setTimeout(() => {
        if (stopped || phase !== "summoning") return;
        pulseWaitingLetter();
        schedule();
      }, randomBetween(1150, 2600));
    };

    schedule();

    return () => {
      stopped = true;
      if (timer !== undefined) globalThis.clearTimeout(timer);
      keyElementsRef.current.forEach((el) => el.classList.remove("haunted"));
    };
  }, [phase]);

  function handleSummon() {
    if (runningRef.current || phase !== "summoning" || !boardReadyRef.current) {
      return;
    }
    cancelledRef.current = false;
    cueBackgroundAudio();
    openingTone();
    beginReading();
  }

  function beginReading() {
    if (runningRef.current) return;
    setPhase("spelling");
    runningRef.current = true;
    void (async () => {
      try {
        if (!shouldReduceMotion()) {
          await delay(startDelayMs);
        }
        if (cancelledRef.current) return;
        await waitForBoardImage();
        if (cancelledRef.current) return;
        await waitForBoardLayout();
        if (cancelledRef.current) return;
        if (shouldReduceMotion()) {
          setCameraOffset({ x: 0, y: 0 });
          await delay(250);
        } else {
          await animateMessage(message);
        }
        if (!cancelledRef.current) setPhase("complete");
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
    const planchetteHeight = planchetteSizeRef.current.y || PLANCHETTE_SIZE;
    const margin = planchetteHeight * 0.18;
    const start = {
      x: boardSize.x * 0.86,
      y: Math.min(boardSize.y - margin, boardSize.y * 0.84),
    };
    const exit = {
      x: boardSize.x * 0.2,
      y: Math.min(boardSize.y - margin * 0.6, boardSize.y * 0.86),
    };
    const haunt = hauntRef.current;
    const readingSpeed = speedPxPerSec * haunt.speedMultiplier;
    const readingPause = pauseMs * haunt.pauseMultiplier;
    setPlanchettePosition(planchette, start);
    await fade(planchette, 0, 1, 620);
    if (cancelledRef.current) return;
    let cursor = { ...start };
    let lastKey: string | null = null;
    for (const { key, point } of targets) {
      if (cancelledRef.current) return;
      const landing = driftLanding(
        point,
        (key === "GOODBYE" ? GOODBYE_DRIFT_PX : LANDING_DRIFT_PX) *
          haunt.driftMultiplier,
      );
      if (key === lastKey) {
        const liftPoint = {
          x: cursor.x + randomBetween(-10, 10),
          y: cursor.y - randomBetween(38, 64),
        };
        await movePlanchetteWithSpring(
          planchette,
          cursor,
          liftPoint,
          readingSpeed * 0.74,
          false,
        );
        if (cancelledRef.current) return;
        await delay(randomBetween(145, 235));
        if (cancelledRef.current) return;
        await movePlanchetteWithSpring(
          planchette,
          liftPoint,
          landing,
          readingSpeed * 0.78,
        );
      } else {
        const falseTarget = pickHesitationTarget(key, point);
        if (falseTarget && Math.random() < haunt.hesitationChance) {
          const falseLanding = driftLanding(
            falseTarget.point,
            LANDING_DRIFT_PX * 0.72 * haunt.driftMultiplier,
          );
          await movePlanchetteWithSpring(
            planchette,
            cursor,
            falseLanding,
            readingSpeed * 0.66,
            false,
          );
          if (cancelledRef.current) return;
          setKeyHaunted(falseTarget.key, true);
          softKnock();
          await delay(randomBetween(170, 320) * haunt.pauseMultiplier);
          if (cancelledRef.current) return;
          setKeyHaunted(falseTarget.key, false);
          cursor = falseLanding;
        }
        if (cancelledRef.current) return;
        await movePlanchetteWithSpring(
          planchette,
          cursor,
          landing,
          readingSpeed,
        );
      }
      if (cancelledRef.current) return;
      setKeyActive(key, true);
      softBlip();
      if (key === "GOODBYE") goodbyeTone();
      await delay(readingPause + randomBetween(-50, 120));
      if (cancelledRef.current) return;
      setKeyActive(key, false);
      cursor = landing;
      lastKey = key;
    }
    await delay(haunt.finalHoldMs);
    if (cancelledRef.current) return;
    await movePlanchetteWithSpring(
      planchette,
      cursor,
      exit,
      readingSpeed * 0.82,
    );
    if (cancelledRef.current) return;
    await fade(planchette, 1, 0, 700);
    if (cancelledRef.current) return;
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
      aria-busy={phase === "spelling"}
    >
      <div class="board-wrap" ref={boardWrapRef}>
        <div class="board-grid" ref={boardRef}>
          <img
            ref={boardImageRef}
            src={boardImageSrc}
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
          <canvas
            ref={filmCanvasRef}
            class="film-grain"
            aria-hidden="true"
          />
        </div>
      </div>
      <audio
        ref={backgroundAudioRef}
        src="/ambient_loop.mp3"
        preload="none"
        loop
        playsInline
        class="ambient-player"
      />
      <p
        class={`oracle-result ${phase === "complete" ? "is-complete" : ""}`}
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {phase === "complete"
          ? (
            <>
              The board says <span>{message}</span>.
            </>
          )
          : phase === "spelling"
          ? "The board is moving."
          : boardReady
          ? "The board is waiting."
          : "The board is waking."}
      </p>
      {phase === "summoning" && (
        <div class="summon-actions">
          <button
            class="oracle-action summon-action"
            type="button"
            disabled={!boardReady}
            onClick={handleSummon}
            aria-label="Summon the board"
          >
            Summon
          </button>
        </div>
      )}
      {phase === "complete" && (
        <div class="reading-actions">
          <a
            class="oracle-action"
            href="/"
            aria-label="Return for another omen tomorrow"
          >
            Ask Tomorrow
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

  function setKeyHaunted(key: string, active: boolean) {
    const el = keyElementsRef.current.get(key);
    if (!el) return;
    el.classList.toggle("haunted", active);
  }

  function pulseWaitingLetter() {
    const keys = RAW_COORDS.filter(({ key }) => key.length === 1);
    const key = keys[Math.floor(Math.random() * keys.length)]?.key;
    if (!key) return;
    setKeyHaunted(key, true);
    globalThis.setTimeout(
      () => setKeyHaunted(key, false),
      randomBetween(
        420,
        760,
      ),
    );
  }

  function pickHesitationTarget(targetKey: string, targetPoint: Vec2) {
    if (targetKey === "GOODBYE") return null;
    const candidates = Array.from(keyCentersRef.current.entries())
      .filter(([key]) => key !== targetKey && key.length === 1)
      .map(([key, point]) => ({
        key,
        point,
        distance: Math.hypot(point.x - targetPoint.x, point.y - targetPoint.y),
      }))
      .filter(({ distance }) => distance > 42 && distance < 190);
    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  async function movePlanchetteWithSpring(
    el: HTMLElement,
    start: Vec2,
    end: Vec2,
    speed: number,
    allowOvershoot = true,
  ) {
    const shouldOvershoot = allowOvershoot &&
      Math.hypot(end.x - start.x, end.y - start.y) > 90 &&
      Math.random() < hauntRef.current.overshootChance;

    if (shouldOvershoot) {
      const overshoot = overshootPoint(start, end);
      await movePlanchetteArc(
        el,
        start,
        overshoot,
        speed * randomBetween(0.9, 1.04),
        randomBetween(0.12, 0.19),
      );
      if (cancelledRef.current) return;
      await delay(randomBetween(70, 150));
      if (cancelledRef.current) return;
      await movePlanchetteArc(
        el,
        overshoot,
        end,
        speed * randomBetween(0.52, 0.66),
        randomBetween(0.02, 0.07),
      );
      return;
    }

    await movePlanchetteArc(
      el,
      start,
      end,
      speed,
      randomBetween(0.09, 0.17),
    );
  }

  async function movePlanchetteArc(
    el: HTMLElement,
    start: Vec2,
    end: Vec2,
    speed: number,
    arcStrength: number,
  ) {
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const duration = Math.max(560, (distance / Math.max(speed, 1)) * 1000);
    const control = controlForArc(start, end, arcStrength);
    await rafTween(duration, (t) => {
      if (cancelledRef.current) return;
      const eased = easeInOutSine(t);
      const point = quadBezier(start, control, end, eased);
      setPlanchettePosition(el, point);
    });
  }

  function driftLanding(point: Vec2, radius: number): Vec2 {
    const angle = Math.random() * Math.PI * 2;
    const amount = Math.random() ** 0.72 * radius;
    return constrainToBoard({
      x: point.x + Math.cos(angle) * amount,
      y: point.y + Math.sin(angle) * amount,
    });
  }

  function overshootPoint(start: Vec2, end: Vec2): Vec2 {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1) return { ...end };
    const stretch = randomBetween(18, 42);
    const sideSlip = randomBetween(-16, 16);
    const nx = dx / distance;
    const ny = dy / distance;
    return constrainToBoard({
      x: end.x + nx * stretch - ny * sideSlip,
      y: end.y + ny * stretch + nx * sideSlip,
    });
  }

  function constrainToBoard(point: Vec2): Vec2 {
    const board = boardSizeRef.current;
    if (!board.x || !board.y) return point;
    const padding = Math.max(14, planchetteSizeRef.current.y * 0.08);
    return {
      x: clamp(point.x, padding, board.x - padding),
      y: clamp(point.y, padding, board.y - padding),
    };
  }

  function setPlanchettePosition(el: HTMLElement, point: Vec2) {
    const { x: width, y: height } = planchetteSizeRef.current;
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

    const viewport = sceneSizeRef.current;
    const board = boardWrapSizeRef.current;
    if (!viewport.x || !viewport.y || !board.x || !board.y) {
      return { x: 0, y: 0 };
    }
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
    if (cancelledRef.current) return;
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
      if (cancelledRef.current) return;
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

  function startFilmGrain(canvas: HTMLCanvasElement, haunt: HauntProfile) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let stopped = false;
    let timer: number | undefined;

    const resize = () => {
      const width = Math.max(
        180,
        Math.min(520, Math.floor(globalThis.innerWidth / 2.2)),
      );
      const height = Math.max(
        140,
        Math.min(360, Math.floor(globalThis.innerHeight / 2.2)),
      );
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const render = () => {
      if (stopped) return;
      resize();
      drawFilmGrainFrame(ctx, canvas.width, canvas.height);
      canvas.style.setProperty(
        "--grain-jitter-x",
        `${(Math.random() * 10 - 5).toFixed(2)}px`,
      );
      canvas.style.setProperty(
        "--grain-jitter-y",
        `${(Math.random() * 8 - 4).toFixed(2)}px`,
      );
      canvas.style.setProperty(
        "--grain-opacity",
        (haunt.grainOpacity + Math.random() * 0.07).toFixed(3),
      );
      canvas.style.setProperty(
        "--grain-contrast",
        (haunt.grainContrast + Math.random() * 0.18).toFixed(3),
      );
    };

    const schedule = () => {
      timer = globalThis.setTimeout(() => {
        render();
        if (!stopped) schedule();
      }, FILM_GRAIN_MIN_FRAME_MS + Math.random() * FILM_GRAIN_FRAME_JITTER_MS);
    };

    render();
    schedule();
    globalThis.addEventListener("resize", resize);

    return () => {
      stopped = true;
      if (timer !== undefined) globalThis.clearTimeout(timer);
      globalThis.removeEventListener("resize", resize);
    };
  }

  function drawFilmGrainFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    const image = ctx.createImageData(width, height);
    const data = image.data;
    const baseAlpha = 15 + Math.random() * 14;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      const speck = Math.random() > 0.56 ? baseAlpha : baseAlpha * 0.42;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = speck;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.putImageData(image, 0, 0);

    ctx.save();
    drawDust(ctx, width, height);
    drawScratches(ctx, width, height);
    drawGateFlicker(ctx, width, height);
    ctx.restore();
  }

  function drawDust(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    const count = 8 + Math.floor(Math.random() * 18);
    for (let i = 0; i < count; i += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 0.4 + Math.random() * 1.7;
      ctx.globalAlpha = 0.06 + Math.random() * 0.18;
      ctx.fillStyle = Math.random() > 0.35 ? "#f8e6bd" : "#0b0710";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawScratches(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    if (Math.random() > 0.68) return;
    const count = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i += 1) {
      const x = Math.random() * width;
      const lean = Math.random() * 12 - 6;
      ctx.globalAlpha = 0.05 + Math.random() * 0.15;
      ctx.strokeStyle = Math.random() > 0.2 ? "#fff0c8" : "#1c1420";
      ctx.lineWidth = 0.5 + Math.random() * 1.3;
      ctx.beginPath();
      ctx.moveTo(x, Math.random() * height * 0.12);
      ctx.lineTo(x + lean, height - Math.random() * height * 0.18);
      ctx.stroke();
    }
  }

  function drawGateFlicker(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    if (Math.random() > 0.48) return;
    const y = Math.random() * height;
    const bandHeight = 2 + Math.random() * 10;
    ctx.globalAlpha = 0.035 + Math.random() * 0.055;
    ctx.fillStyle = Math.random() > 0.5 ? "#fff1cc" : "#160f1d";
    ctx.fillRect(0, y, width, bandHeight);
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

  function randomBetween(min: number, max: number) {
    return min + Math.random() * (max - min);
  }

  async function rafTween(
    durationMs: number,
    render: (progress: number) => void,
  ) {
    const start = performance.now();
    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        if (cancelledRef.current) {
          resolve();
          return;
        }
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
      if (cancelledRef.current) return;
      recomputeLayout();
      const boardSize = boardSizeRef.current;
      if (boardSize.x > 0 && boardSize.y > 0 && keyCentersRef.current.size) {
        return;
      }
      await delay(50);
    }
  }

  async function waitForBoardImage() {
    for (let attempts = 0; attempts < 80; attempts += 1) {
      if (cancelledRef.current || boardReadyRef.current) return;
      await delay(50);
    }
  }

  function recomputeLayout() {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    const scene = sceneRef.current;
    const boardWrap = boardWrapRef.current;
    if (scene) {
      sceneSizeRef.current = { x: scene.clientWidth, y: scene.clientHeight };
    }
    if (boardWrap) {
      boardWrapSizeRef.current = {
        x: boardWrap.offsetWidth,
        y: boardWrap.offsetHeight,
      };
    }
    const bounds = boardEl.getBoundingClientRect();
    boardSizeRef.current = { x: bounds.width, y: bounds.height };
    const planchette = planchetteRef.current;
    if (planchette) {
      const width = planchette.offsetWidth || PLANCHETTE_SIZE;
      planchetteSizeRef.current = {
        x: width,
        y: planchette.offsetHeight || Math.round(width * 2 / 3),
      };
    }
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

  function getSpiritAudioContext() {
    try {
      const spiritGlobal = globalThis as typeof globalThis & {
        __spiritAudio?: AudioContext;
      };
      const ctx = spiritGlobal.__spiritAudio ?? new AudioContext();
      spiritGlobal.__spiritAudio = ctx;
      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => {});
      }
      return ctx;
    } catch {
      return null;
    }
  }

  function openingTone() {
    const ctx = getSpiritAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const shift = hauntRef.current.toneShift;
    playTone(ctx, "sine", 88 * shift, 0.024, now, 0.08, 1.1);
    playTone(ctx, "triangle", 132 * shift, 0.012, now + 0.18, 0.12, 0.95);
  }

  function softBlip() {
    const ctx = getSpiritAudioContext();
    if (!ctx) return;
    const shift = hauntRef.current.toneShift;
    playTone(
      ctx,
      "sine",
      (285 + Math.random() * 85) * shift,
      0.017,
      ctx.currentTime,
      0.035,
      0.2,
    );
  }

  function softKnock() {
    const ctx = getSpiritAudioContext();
    if (!ctx) return;
    const shift = hauntRef.current.toneShift;
    playTone(
      ctx,
      "triangle",
      (62 + Math.random() * 28) * shift,
      0.034,
      ctx.currentTime,
      0.01,
      0.18,
    );
  }

  function goodbyeTone() {
    const ctx = getSpiritAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const shift = hauntRef.current.toneShift;
    playTone(ctx, "sine", 164 * shift, 0.014, now, 0.06, 0.8);
    playTone(ctx, "sine", 109 * shift, 0.016, now + 0.12, 0.08, 1.2);
  }

  function playTone(
    ctx: AudioContext,
    type: OscillatorType,
    frequency: number,
    volume: number,
    start: number,
    attack: number,
    duration: number,
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.00001, start);
    gain.gain.linearRampToValueAtTime(volume, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.00001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.04);
  }
}
