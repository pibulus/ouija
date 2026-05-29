# Glossary

## Ask Tomorrow

The final action shown after a reading completes. The same browser gets a new
server-side message and board image on the next UTC day.

## Board Image Pool

Deployable static board artwork matching `static/ghostboard*.png`, `.jpg`, or
`.webp`. The server chooses one image per daily reading in
`utils/boardImages.ts`.

## Board Keys

Invisible-to-assistive-tech coordinate targets overlaid on the board art. The
planchette eye moves through these points while spelling.

## Daily Device Cookie

The anonymous `ghost_note_device` cookie used to keep a browser/device on one
message and board image per UTC day. It is not an account or cross-device
identity.

## Film Grain

Canvas-based visual noise in `PlanchetteBoard.tsx` that updates over time to
make the board feel alive.

## Haunt Profile

A random movement/audio/texture profile chosen client-side for each reading. It
changes speed, pause timing, drift, overshoot, hesitation, grain, and tone.

## Oracle Deck

The local list of possible messages in `utils/oracleMessages.ts`. It is selected
server-side from the anonymous daily device seed and is the only message source.

## Planchette

The movable pointer artwork in `static/planchette.png`. The animation aligns the
eye of the planchette with board key coordinates.

## Summon

The required user gesture that starts the ritual. It protects browser audio
policy, prevents silent automatic movement, and gives the user a clear start.

## Audio Cues

Ambient audio and generated tones that start only from the required **Summon**
gesture.
