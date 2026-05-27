import type { RouteConfig } from "$fresh/server.ts";
import PlanchetteBoard from "../islands/PlanchetteBoard.tsx";
import { drawBoardImageSrc } from "../utils/boardImages.ts";
import { drawOracleMessage } from "../utils/oracleMessages.ts";

export const config: RouteConfig = {
  csp: true,
};

export default function Home() {
  const message = drawOracleMessage();
  const boardImageSrc = drawBoardImageSrc();

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
