export const MAX_STICKERS_PER_BATCH = 20;

export const STICKERS_PER_SELECTION = 20;

export const TOTAL_ALBUM_STICKERS = 670;

export function parseStickerCodes(input: string): string[] {
  const matches = input.toUpperCase().match(/[A-Z]{3}\d+/g);
  return Array.from(new Set(matches ?? []));
}

export function normalizeStickerCode(code: string) {
  return code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}
