import PlanchetteBoard from "../islands/PlanchetteBoard.tsx";
import { AboutModal } from "../islands/AboutModal.tsx";

export default function Home() {
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
          incomingMessage="HELLO FROM THE OTHER SIDE"
          eyebrow="Ghost Node"
          heading="Today's transmission is arriving…"
          subtitle="Receive a message, leave one behind, and watch the planchette spell the next trace."
        />
      </main>
    </>
  );
}
