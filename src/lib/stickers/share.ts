import type { StickerStatus } from "@/lib/supabase/types";

type ShareMode = "missing" | "duplicate" | "all";

type ShareStickerItem = {
  status: StickerStatus;
  stickers: {
    code: string;
    country: string | null;
    player_name: string | null;
  } | null;
};

const SELECTION_FLAGS: Record<string, string> = {
  MEX: "🇲🇽",
  RSA: "🇿🇦",
  KOR: "🇰🇷",
  CZE: "🇨🇿",
  CAN: "🇨🇦",
  BIH: "🇧🇦",
  QAT: "🇶🇦",
  SUI: "🇨🇭",
  BRA: "🇧🇷",
  MAR: "🇲🇦",
  HAI: "🇭🇹",
  SCO: "🏴",
  USA: "🇺🇸",
  PAR: "🇵🇾",
  AUS: "🇦🇺",
  TUR: "🇹🇷",
  GER: "🇩🇪",
  CUW: "🇨🇼",
  CIV: "🇨🇮",
  ECU: "🇪🇨",
  NED: "🇳🇱",
  JPN: "🇯🇵",
  SWE: "🇸🇪",
  TUN: "🇹🇳",
  BEL: "🇧🇪",
  EGY: "🇪🇬",
  IRN: "🇮🇷",
  NZL: "🇳🇿",
  ESP: "🇪🇸",
  CPV: "🇨🇻",
  KSA: "🇸🇦",
  URU: "🇺🇾",
  FRA: "🇫🇷",
  SEN: "🇸🇳",
  IRQ: "🇮🇶",
  NOR: "🇳🇴",
  ARG: "🇦🇷",
  ALG: "🇩🇿",
  AUT: "🇦🇹",
  JOR: "🇯🇴",
  POR: "🇵🇹",
  COD: "🇨🇩",
  UZB: "🇺🇿",
  COL: "🇨🇴",
  ENG: "🏴",
  CRO: "🇭🇷",
  PAN: "🇵🇦",
  GHA: "🇬🇭"
};

function formatSelectionTitle(selection: string) {
  const flag = SELECTION_FLAGS[selection];

  return flag ? `${flag} ${selection}` : selection;
}

function getSelectionPrefix(code: string) {
  const match = code.match(/^[A-Z]+/i);
  return match ? match[0].toUpperCase() : "OUTRAS";
}

function getStickerNumber(code: string) {
  const match = code.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function sortStickerCodes(codes: string[]) {
  return [...codes].sort((a, b) => {
    const prefixCompare = getSelectionPrefix(a).localeCompare(getSelectionPrefix(b));
    if (prefixCompare !== 0) return prefixCompare;

    return getStickerNumber(a) - getStickerNumber(b);
  });
}

function groupCodesBySelection(codes: string[]) {
  const groups = new Map<string, string[]>();

  for (const code of sortStickerCodes(codes)) {
    const prefix = getSelectionPrefix(code);
    const current = groups.get(prefix) ?? [];

    current.push(code);
    groups.set(prefix, current);
  }

  return groups;
}

function formatGroupedCodes(codes: string[]) {
  const groups = groupCodesBySelection(codes);
  const lines: string[] = [];

  for (const [selection, selectionCodes] of groups.entries()) {
    lines.push(formatSelectionTitle(selection));
    lines.push(selectionCodes.join(", "));
    lines.push("");
  }

  return lines.join("\n").trim();
}

function getCodesByStatus(items: ShareStickerItem[], status: StickerStatus) {
  return items
    .filter((item) => item.status === status)
    .map((item) => item.stickers?.code)
    .filter((code): code is string => Boolean(code));
}

export function buildStickerShareMessage(items: ShareStickerItem[], mode: ShareMode) {
  const missingCodes = getCodesByStatus(items, "missing");
  const duplicateCodes = getCodesByStatus(items, "duplicate");

  const lines: string[] = ["🏆 TrocaCopa — Copa 2026", ""];

  if (mode === "missing" || mode === "all") {
    lines.push("🔎 Estou procurando:");

    if (missingCodes.length) {
      lines.push(formatGroupedCodes(missingCodes));
    } else {
      lines.push("Nenhuma figurinha faltante cadastrada.");
    }

    lines.push("");
  }

  if (mode === "duplicate" || mode === "all") {
    lines.push("🔁 Tenho repetidas para troca:");

    if (duplicateCodes.length) {
      lines.push(formatGroupedCodes(duplicateCodes));
    } else {
      lines.push("Nenhuma figurinha repetida cadastrada.");
    }

    lines.push("");
  }

  lines.push("Me chama se quiser trocar!");

  return lines.join("\n").trim();
}

export function buildWhatsAppShareUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
