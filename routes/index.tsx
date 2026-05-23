import PlanchetteBoard from "../islands/PlanchetteBoard.tsx";
import { drawOracleMessage } from "../utils/oracleMessages.ts";

export default function Home() {
  const message = drawOracleMessage();

  return (
    <>
      <div class="spooky-vignette" aria-hidden="true"></div>

      <main class="page-shell" aria-label="Ghost Note oracle">
        <h1 class="sr-only">Ghost Note</h1>
        <p class="sr-only">
          A one-message spirit board. The reading starts automatically and the
          final omen is announced after the planchette finishes spelling.
        </p>
        <PlanchetteBoard message={message} />
      </main>
    </>
  );
}
