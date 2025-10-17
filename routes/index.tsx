import PlanchetteBoard from "../islands/PlanchetteBoard.tsx";

export default function Home() {
  return (
    <main class="page-shell">
      <PlanchetteBoard
        incomingMessage="HELLO FROM THE OTHER SIDE"
        eyebrow="Ghost Node"
        heading="Today’s transmission is arriving…"
        subtitle="Watch the planchette, then leave your own trace without ever touching a text field."
      />
    </main>
  );
}
