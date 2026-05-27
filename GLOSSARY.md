# Glossary

## Ask Again

The final action shown after a reading completes. It reloads the page for a new
server-side message and board image draw.

## Board Image Pool

Deployable static board artwork matching `static/ghostboard*.png`, `.jpg`, or
`.webp`. The server chooses one image per page load in `utils/boardImages.ts`.

## Board Keys

Invisible-to-assistive-tech coordinate targets overlaid on the board art. The
planchette eye moves through these points while spelling.

## Film Grain

Canvas-based visual noise in `PlanchetteBoard.tsx` that updates over time to
make the board feel alive.

## Haunt Profile

A random movement/audio/texture profile chosen client-side for each reading. It
changes speed, pause timing, drift, overshoot, hesitation, grain, and tone.

## Oracle Deck

The local list of possible messages in `utils/oracleMessages.ts`. It is selected
server-side with Web Crypto and is the only message source.

## Planchette

The movable pointer artwork in `static/planchette.png`. The animation aligns the
eye of the planchette with board key coordinates.

## Summon

The required user gesture that starts the ritual. It protects browser audio
policy, prevents silent automatic movement, and gives the user a clear start.

## Sound Toggle

The pre-summon quiet path. When set to **Sound Off**, the animation still runs
but ambient audio and generated tones stay muted.
