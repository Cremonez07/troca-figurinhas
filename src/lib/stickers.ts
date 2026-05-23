import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizeStickerCode,
  TOTAL_ALBUM_STICKERS
} from "@/lib/stickers/rules";
import type { Database, Profile, StickerStatus } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;
type MatchInventoryRow = { status: StickerStatus; stickers: { code: string } | null };
type MatchCandidateRow = { user_id: string; status: StickerStatus; stickers: { code: string } | null; profiles: Profile | null };

type StickerWithCode = {
  id: string;
  status: StickerStatus;
  created_at: string;
  stickers: { id: string; code: string; country: string | null; player_name: string | null } | null;
};

export type DashboardSummary = {
  progress: number;
  missingTotal: number;
  duplicateTotal: number;
  matchTotal: number;
  recent: StickerWithCode[];
};

export type TradeMatch = {
  collector: Profile;
  kind: "perfect" | "simple";
  priority: "ideal" | "good" | "partial";
  score: number;
  youGain: string[];
  youSend: string[];
};

function calculateMatchScore(match: Pick<TradeMatch, "kind" | "youGain" | "youSend">) {
  const kindScore = match.kind === "perfect" ? 100 : 0;
  const gainScore = match.youGain.length * 10;
  const sendScore = match.youSend.length * 5;

  return kindScore + gainScore + sendScore;
}

function getMatchPriority(score: number): TradeMatch["priority"] {
  if (score >= 120) return "ideal";
  if (score >= 20) return "good";
  return "partial";
}

export async function getCurrentUserId(supabase: Client) {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getProfile(supabase: Client, userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertProfile(supabase: Client, profile: Database["public"]["Tables"]["profiles"]["Insert"]) {
  const { data, error = null } = await supabase.from("profiles").upsert(profile).select().single();
  if (error) throw error;
  return data;
}

export async function ensureSticker(supabase: Client, code: string) {
  const normalizedCode = normalizeStickerCode(code);
  if (!normalizedCode) throw new Error("Código inválido");

  const { data: existing, error: lookupError } = await supabase
    .from("stickers")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data, error } = await supabase.from("stickers").insert({ code: normalizedCode }).select().single();
  if (error) throw error;
  return data;
}

export async function addUserSticker(supabase: Client, userId: string, code: string, status: StickerStatus) {
  const sticker = await ensureSticker(supabase, code);
  const oppositeStatus: StickerStatus = status === "missing" ? "duplicate" : "missing";

  const { error: deleteOppositeError } = await supabase
    .from("user_stickers")
    .delete()
    .eq("user_id", userId)
    .eq("sticker_id", sticker.id)
    .eq("status", oppositeStatus);

  if (deleteOppositeError) throw deleteOppositeError;

  const { data, error } = await supabase
    .from("user_stickers")
    .upsert(
      { user_id: userId, sticker_id: sticker.id, status },
      { onConflict: "user_id,sticker_id" }
    )
    .select("*, stickers(id, code, country, player_name)")
    .single();

  if (error) throw error;
  return data;
}

export async function addUserStickersBatch(supabase: Client, userId: string, codes: string[], status: StickerStatus) {
  const oppositeStatus: StickerStatus = status === "missing" ? "duplicate" : "missing";
  const savedStickers: StickerWithCode[] = [];

  for (const code of codes) {
    // Normaliza antes de qualquer checagem no loop
    const cleanCode = normalizeStickerCode(code);
    if (!cleanCode) continue;

    const sticker = await ensureSticker(supabase, cleanCode);

    await supabase
      .from("user_stickers")
      .delete()
      .eq("user_id", userId)
      .eq("sticker_id", sticker.id)
      .eq("status", oppositeStatus);

    const { data, error } = await supabase
      .from("user_stickers")
      .upsert(
        { user_id: userId, sticker_id: sticker.id, status },
        { onConflict: "user_id,sticker_id" }
      )
      .select("*, stickers(id, code, country, player_name)")
      .single();

    if (error) throw error;
    if (data) savedStickers.push(data as unknown as StickerWithCode);
  }

  return savedStickers;
}

export async function removeUserSticker(supabase: Client, userStickerId: string) {
  const { error } = await supabase.from("user_stickers").delete().eq("id", userStickerId);
  if (error) throw error;
}

export async function getRecentUserStickers(supabase: Client, userId: string, limit = 8) {
  const { data, error } = await supabase
    .from("user_stickers")
    .select("id, status, created_at, stickers(id, code, country, player_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as StickerWithCode[];
}

export async function getAllUserStickers(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("user_stickers")
    .select("id, status, created_at, stickers(id, code, country, player_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as StickerWithCode[];
}

export async function getDashboardSummary(supabase: Client, userId: string): Promise<DashboardSummary> {
  const [{ count: missingTotal }, { count: duplicateTotal }, recent, matches] = await Promise.all([
    supabase.from("user_stickers").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "missing"),
    supabase.from("user_stickers").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "duplicate"),
    getRecentUserStickers(supabase, userId, 5),
    getTradeMatches(supabase, userId)
  ]);

  const completed = Math.max(0, TOTAL_ALBUM_STICKERS - (missingTotal ?? 0));

  return {
    progress: Math.min(100, Math.round((completed / TOTAL_ALBUM_STICKERS) * 100)),
    missingTotal: missingTotal ?? 0,
    duplicateTotal: duplicateTotal ?? 0,
    matchTotal: matches.length,
    recent
  };
}

export async function getTradeMatches(supabase: Client, userId: string): Promise<TradeMatch[]> {
  const { data: mine, error: mineError } = await supabase
    .from("user_stickers")
    .select("status, stickers(id, code)")
    .eq("user_id", userId);

  if (mineError) throw mineError;

  const missingCodes = new Set(
    ((mine ?? []) as unknown as MatchInventoryRow[])
      .filter((item) => item.status === "missing" && item.stickers)
      .map((item) => item.stickers!.code)
  );

  const duplicateCodes = new Set(
    ((mine ?? []) as unknown as MatchInventoryRow[])
      .filter((item) => item.status === "duplicate" && item.stickers)
      .map((item) => item.stickers!.code)
  );

  if (missingCodes.size === 0 && duplicateCodes.size === 0) return [];

  const { data: candidates, error } = await supabase
    .from("user_stickers")
    .select("user_id, status, stickers(code), profiles!user_stickers_user_id_fkey(*)")
    .neq("user_id", userId)
    .in("status", ["missing", "duplicate"]);

  if (error) throw error;

  const byCollector = new Map<string, TradeMatch>();

  for (const row of (candidates ?? []) as unknown as MatchCandidateRow[]) {
    const code = row.stickers?.code;
    const profile = row.profiles;
    if (!code || !profile) continue;

    const givesMe = row.status === "duplicate" && missingCodes.has(code);
    const receivesFromMe = row.status === "missing" && duplicateCodes.has(code);
    if (!givesMe && !receivesFromMe) continue;

    const current = byCollector.get(row.user_id) ?? {
      collector: profile,
      kind: "simple" as const,
      priority: "partial" as const,
      score: 0,
      youGain: [],
      youSend: []
    };

    if (givesMe && !current.youGain.includes(code)) current.youGain.push(code);
    if (receivesFromMe && !current.youSend.includes(code)) current.youSend.push(code);

    current.kind = current.youGain.length > 0 && current.youSend.length > 0 ? "perfect" : "simple";
    current.score = calculateMatchScore(current);
    current.priority = getMatchPriority(current.score);

    byCollector.set(row.user_id, current);
  }

  return Array.from(byCollector.values()).sort((a, b) => b.score - a.score);
}