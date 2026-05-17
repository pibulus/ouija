const ORACLE_MESSAGES = [
  "KEEP THE LINE SOFT",
  "WAIT FOR THE SMALL LIGHT",
  "TURN TOWARD THE QUIET",
  "THE DOOR OPENS INWARD",
  "LET THE STATIC SETTLE",
  "FOLLOW THE SECOND SIGN",
  "SAY LESS AND LISTEN",
  "THE ANSWER IS NEAR",
  "MOVE WHEN THE AIR CHANGES",
  "TRUST THE SLOW SIGNAL",
  "A HIDDEN PATH IS WARM",
  "ASK AGAIN AFTER DARK",
  "THE NOISE IS ALSO NEWS",
  "CARRY THE SPARK HOME",
  "PAUSE BEFORE THE YES",
  "THE MOON KEEPS RECEIPTS",
  "MAKE ROOM FOR THE STRANGE",
  "THE THREAD IS NOT BROKEN",
  "GO WHERE IT FEELS ALIVE",
  "LEAVE ONE DOOR UNLOCKED",
  "TODAY WANTS A SOFTER HAND",
  "THE SIGN ARRIVES SIDEWAYS",
  "NOT ALL SILENCE IS EMPTY",
  "THE CURRENT KNOWS YOUR NAME",
  "A TINY OMEN IS ENOUGH",
];

export function drawOracleMessage() {
  // The deck is local by design; Web Crypto makes each page load a clean draw
  // without pretending there is a hidden inbox or external spirit feed.
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return ORACLE_MESSAGES[buffer[0] % ORACLE_MESSAGES.length];
}

export function getOracleMessageCount() {
  return ORACLE_MESSAGES.length;
}
