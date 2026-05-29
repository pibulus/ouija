import type { Handlers, PageProps, RouteConfig } from "$fresh/server.ts";
import { getCookies, setCookie } from "$std/http/cookie.ts";
import PlanchetteBoard from "../islands/PlanchetteBoard.tsx";
import {
  getBoardImageSourceAt,
  listBoardImageSources,
} from "../utils/boardImages.ts";
import {
  getOracleMessageAt,
  getOracleMessageCount,
} from "../utils/oracleMessages.ts";

export const config: RouteConfig = {
  csp: true,
};

type HomeData = {
  message: string;
  boardImageSrc: string;
};

const DEVICE_COOKIE = "ghost_note_device";
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const handler: Handlers<HomeData> = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const existingDeviceId = cookies[DEVICE_COOKIE];
    const deviceId = isDeviceId(existingDeviceId)
      ? existingDeviceId
      : crypto.randomUUID();
    const readingDay = getReadingDay();
    const boardImages = listBoardImageSources();

    const [messageIndex, boardImageIndex] = await Promise.all([
      getDailyIndex(deviceId, readingDay, "message", getOracleMessageCount()),
      getDailyIndex(deviceId, readingDay, "board", boardImages.length),
    ]);

    const response = await ctx.render({
      message: getOracleMessageAt(messageIndex),
      boardImageSrc: getBoardImageSourceAt(boardImageIndex, boardImages),
    });
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.append("Vary", "Cookie");

    if (deviceId !== existingDeviceId) {
      const url = new URL(req.url);
      const forwardedProto = req.headers.get("x-forwarded-proto");
      setCookie(headers, {
        name: DEVICE_COOKIE,
        value: deviceId,
        path: "/",
        maxAge: DEVICE_COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: "Lax",
        secure: url.protocol === "https:" || forwardedProto === "https",
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

export default function Home({ data }: PageProps<HomeData>) {
  const { message, boardImageSrc } = data;

  return (
    <>
      <div class="spooky-vignette" aria-hidden="true"></div>

      <main class="page-shell" aria-label="Ghost Note oracle">
        <h1 class="sr-only">Ghost Note</h1>
        <p class="sr-only">
          A one-message spirit board. Summon the reading, then the final omen is
          announced after the planchette finishes spelling.
        </p>
        <PlanchetteBoard message={message} boardImageSrc={boardImageSrc} />
      </main>
    </>
  );
}

function isDeviceId(value: string | undefined) {
  return value !== undefined && UUID_PATTERN.test(value);
}

function getReadingDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function getDailyIndex(
  deviceId: string,
  readingDay: string,
  label: string,
  length: number,
) {
  if (length <= 0) return 0;
  const encoded = new TextEncoder().encode(
    `ghost-note:${label}:${readingDay}:${deviceId}`,
  );
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return new DataView(digest).getUint32(0) % length;
}
