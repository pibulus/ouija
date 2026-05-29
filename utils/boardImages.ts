const STATIC_DIR = new URL("../static/", import.meta.url);
const FALLBACK_BOARD_IMAGE = "/ghostboard.png";
const BOARD_IMAGE_PATTERN = /^ghostboard[a-z0-9-]*\.(?:png|jpe?g|webp)$/i;

export function drawBoardImageSrc() {
  const images = listBoardImageSources();

  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return getBoardImageSourceAt(buffer[0], images);
}

export function getBoardImageSourceAt(
  index: number,
  images = listBoardImageSources(),
) {
  if (!images.length) return FALLBACK_BOARD_IMAGE;
  return images[normalizeIndex(index, images.length)];
}

export function listBoardImageSources() {
  try {
    return Array.from(Deno.readDirSync(STATIC_DIR))
      .filter((entry) => entry.isFile && BOARD_IMAGE_PATTERN.test(entry.name))
      .map((entry) => `/${entry.name}`)
      .sort((a, b) => {
        if (a === FALLBACK_BOARD_IMAGE) return -1;
        if (b === FALLBACK_BOARD_IMAGE) return 1;
        return a.localeCompare(b);
      });
  } catch (error) {
    console.warn(
      `Could not read static board image pool; falling back to ${FALLBACK_BOARD_IMAGE}.`,
      error,
    );
    return [FALLBACK_BOARD_IMAGE];
  }
}

function normalizeIndex(index: number, length: number) {
  return ((Math.trunc(index) % length) + length) % length;
}
