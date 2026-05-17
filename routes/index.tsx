import PlanchetteBoard from "../islands/PlanchetteBoard.tsx";
import { AboutModal } from "../islands/AboutModal.tsx";
import { drawOracleMessage } from "../utils/oracleMessages.ts";

export default function Home() {
  const message = drawOracleMessage();

  return (
    <>
      {/* About modal */}
      <AboutModal />

      {/* Spooky atmosphere overlays */}
      <div class="spooky-vignette"></div>
      <div class="spooky-noise"></div>
      <div class="film-grain"></div>
      <div class="chromatic-aberration"></div>
      <div class="violet-wash"></div>

      <main class="page-shell flicker-candle">
        <PlanchetteBoard
          message={message}
          eyebrow="Ghost Node"
          heading="Your message is waiting"
          subtitle="Touch the board once. The planchette will spell what arrived."
        />
      </main>
    </>
  );
}
