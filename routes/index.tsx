import PlanchetteBoard from "../islands/PlanchetteBoard.tsx";
import { drawOracleMessage } from "../utils/oracleMessages.ts";

export default function Home() {
  const message = drawOracleMessage();

  return (
    <>
      {/* Spooky atmosphere overlays */}
      <div class="spooky-vignette" aria-hidden="true"></div>
      <div class="spooky-noise" aria-hidden="true"></div>
      <div class="film-grain" aria-hidden="true"></div>
      <div class="chromatic-aberration" aria-hidden="true"></div>
      <div class="violet-wash" aria-hidden="true"></div>

      <main class="page-shell flicker-candle" aria-label="Ghost Note oracle">
        <h1 class="sr-only">Ghost Note</h1>
        <p class="sr-only">
          A one-message spirit board. The reading starts automatically and the
          final omen appears as text after the planchette finishes spelling.
        </p>
        <PlanchetteBoard message={message} />
      </main>
    </>
  );
}
