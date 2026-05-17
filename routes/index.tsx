import PlanchetteBoard from "../islands/PlanchetteBoard.tsx";
import { drawOracleMessage } from "../utils/oracleMessages.ts";

export default function Home() {
  const message = drawOracleMessage();

  return (
    <>
      {/* Spooky atmosphere overlays */}
      <div class="spooky-vignette"></div>
      <div class="spooky-noise"></div>
      <div class="film-grain"></div>
      <div class="chromatic-aberration"></div>
      <div class="violet-wash"></div>

      <main class="page-shell flicker-candle">
        <h1 class="sr-only">Ouija</h1>
        <PlanchetteBoard message={message} />
      </main>
    </>
  );
}
