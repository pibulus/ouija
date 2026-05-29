const ORACLE_MESSAGES = [
  "THE DOOR IS TIRED",
  "ASK WHAT IT COST",
  "KEEP ONE LIGHT ON",
  "THE HOUSE HEARD",
  "A SMALL DEBT WAITS",
  "LEAVE BEFORE DAWN",
  "THE RIVER KNOWS",
  "YOUR NAME ECHOES",
  "BURY THE KEY",
  "COUNT THE CROWS",
  "THE MIRROR LIED",
  "ONE ROOM REMAINS",
  "DO NOT LOOK BACK",
  "THE FLOOR REMEMBERS",
  "SALT THE THRESHOLD",
  "THE WELL IS OPEN",
  "A WARM HAND WAITS",
  "THE OLD LOVE STAYS",
  "YOU WERE SEEN",
  "MEND IT TONIGHT",
  "THE BONE AGREES",
  "LISTEN TO ASH",
  "NOTHING LEFT YOU",
  "THE LATCH IS LOOSE",
  "CARRY THE MATCH",
  "THE MOON WAS PAID",
  "HIDE THE RING",
  "RETURN THE LOCKET",
  "SHE KEPT WATCH",
  "HE MEANT TO CALL",
  "THE SONG IS TRUE",
  "GRIEF HAS TEETH",
  "JOY HAS CLAWS",
  "LOVE IS A SIGN",
  "SHAME IS SMOKE",
  "FEAR IS A DOOR",
  "THE DEAD ARE BUSY",
  "NO ONE IS GONE",
  "SPEAK LESS SOON",
  "WAIT FOR RAIN",
  "THE MOTH CHOSE YOU",
  "THE COIN IS WARM",
  "OPEN THE WINDOW",
  "CLOSE THE BOX",
  "THE DUST ANSWERS",
  "FOLLOW THE HUM",
  "THE ALTAR IS HUNGRY",
  "FEED IT FLOWERS",
  "KISS THE LIVING",
  "FORGIVE THE BODY",
  "YOUR BLOOD SINGS",
  "THE VEIL IS THIN",
  "ONE WORD REMAINS",
  "CLEAN THE KNIFE",
  "CALL HER SOFTLY",
  "HE LEFT A SIGN",
  "THE BLACK DOG WAITS",
  "THE ROAD BENDS",
  "THE GATE IS SHY",
  "BONES HOLD MERCY",
  "ASH HOLDS MEMORY",
  "THE CANDLE SAW",
  "THERE IS A WITNESS",
  "YOUR DOUBT IS LOUD",
  "THE ROOM FORGIVES",
  "DO NOT BARGAIN",
  "THE DREAM WAS TRUE",
  "COME BACK CLEAN",
  "PAY THE KIND DEBT",
  "LET THE BAD ONE GO",
  "THE GOOD ONE KNOWS",
  "SOON IS NOT TIME",
  "TIME IS A CIRCLE",
  "LA VIDA TE VE",
  "LA MUERTE BAILA",
  "CENIZA TE CUIDA",
  "LA CASA RECUERDA",
  "FLOR PARA EL MUERTO",
  "NO FUE TU CULPA",
  "CANTA MAS BAJO",
  "EL AMOR VUELVE",
];

export function drawOracleMessage() {
  // The deck is local by design; random draws are only used outside the daily
  // route seed, without pretending there is a hidden inbox or spirit feed.
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return getOracleMessageAt(buffer[0]);
}

export function getOracleMessageAt(index: number) {
  return ORACLE_MESSAGES[normalizeIndex(index, ORACLE_MESSAGES.length)];
}

export function getOracleMessageCount() {
  return ORACLE_MESSAGES.length;
}

function normalizeIndex(index: number, length: number) {
  return ((Math.trunc(index) % length) + length) % length;
}
