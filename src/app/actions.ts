"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addUserSticker, getCurrentUserId, removeUserSticker, upsertProfile } from "@/lib/stickers";
import { createClient } from "@/lib/supabase/server";
import type { StickerStatus } from "@/lib/supabase/types";

export type ActionState = {
  ok: boolean;
  message: string;
};

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Extrai e remove duplicatas no próprio texto usando Set (otimização)
function parseStickerCodes(input: string): string[] {
  const normalizedInput = input.toUpperCase();
  const matches = normalizedInput.match(/[A-Z]{3}\d+/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}

export async function signInWithEmail(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = requireString(formData, "email");
  if (!email) return { ok: false, message: "Informe seu e-mail para receber o link mágico." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`
    }
  });

  if (error) {
    const isRateLimit = error.message.toLowerCase().includes("rate limit");
    return {
      ok: false,
      message: isRateLimit
        ? "Muitas tentativas em pouco tempo. Aguarde alguns minutos e use o último link recebido."
        : "Não foi possível enviar o link agora. Tente novamente em instantes."
    };
  }

  return { ok: true, message: "Enviamos um link de acesso para seu e-mail." };
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`
    }
  });

  if (error || !data.url) {
    redirect("/login?auth=google_error");
  }
  redirect(data.url);
}

export async function saveSticker(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const rawCodeInput = requireString(formData, "code");
  const status = requireString(formData, "status") as StickerStatus;

  if (!rawCodeInput) return { ok: false, message: "Digite o código da figurinha." };
  if (status !== "missing" && status !== "duplicate") {
    return { ok: false, message: "Escolha se ela está faltando ou repetida." };
  }

  const stickerCodes = parseStickerCodes(rawCodeInput);

  if (stickerCodes.length === 0) {
    return { ok: false, message: "Nenhum código de figurinha válido encontrado (Ex: BRA10, ARG07)." };
  }

  const MAX_STICKERS_PER_BATCH = 20;
  if (stickerCodes.length > MAX_STICKERS_PER_BATCH) {
    return {
      ok: false,
      message: `Envie no máximo ${MAX_STICKERS_PER_BATCH} figurinhas por vez. Você colou ${stickerCodes.length}.`
    };
  }

  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    for (const stickerCode of stickerCodes) {
      await addUserSticker(supabase, userId, stickerCode, status);
    }

    revalidatePath("/");
    revalidatePath("/adicionar");
    revalidatePath("/trocas");
    revalidatePath("/perfil");

    const statusLabel = status === "missing" ? "faltando" : "repetida";
    const statusLabelPlural = status === "missing" ? "faltando" : "repetidas";
    
    // Mensagem inteligente: não cospe uma string enorme no mobile
    const message = stickerCodes.length === 1
      ? `${stickerCodes[0]} salva como ${statusLabel}.`
      : `${stickerCodes.length} figurinhas salvas como ${statusLabelPlural}.`;

    return { ok: true, message };
  } catch (error) {
    console.error("Erro ao salvar lote de figurinhas:", error);
    return { ok: false, message: "Não foi possível salvar as figurinhas. Tente novamente." };
  }
}

export async function saveProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) redirect("/login");

  const fullName = requireString(formData, "full_name");
  const whatsapp = requireString(formData, "whatsapp");
  const city = requireString(formData, "city");
  const neighborhood = requireString(formData, "neighborhood");

  if (!fullName || !whatsapp || !city || !neighborhood) {
    return { ok: false, message: "Preencha nome, WhatsApp, cidade e bairro para salvar o perfil." };
  }

  try {
    await upsertProfile(supabase, {
      id: userId,
      full_name: fullName,
      whatsapp,
      city,
      neighborhood,
      exchange_point: requireString(formData, "exchange_point") || null
    });

    revalidatePath("/perfil");
    revalidatePath("/trocas");
    return { ok: true, message: "Perfil atualizado. Agora os colecionadores sabem como combinar a troca." };
  } catch (error) {
    console.error("Erro ao salvar perfil", error);
    return { ok: false, message: "Não foi possível atualizar o perfil agora." };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type ExchangeIntentActionState = {
  ok: boolean;
};

export async function registerExchangeIntentAction({
  toUserId,
  matchScore,
  whatsappMessage
}: {
  toUserId: string;
  matchScore: number;
  whatsappMessage: string;
}): Promise<ExchangeIntentActionState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) return { ok: false };

  const { error } = await supabase.from("exchange_intents").insert({
    from_user_id: userId,
    to_user_id: toUserId,
    match_score: matchScore,
    whatsapp_message: whatsappMessage
  } as never);

  if (error) {
    console.error("Erro ao registrar intenção de troca", error);
    return { ok: false };
  }
  return { ok: true };
}

export type RemoveStickerActionState = {
  ok: boolean;
  message: string;
};

export async function removeUserStickerAction(userStickerId: string): Promise<RemoveStickerActionState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) return { ok: false, message: "Usuário não autenticado." };

  try {
    await removeUserSticker(supabase, userStickerId);
    revalidatePath("/");
    revalidatePath("/adicionar");
    revalidatePath("/trocas");
    revalidatePath("/perfil");
    return { ok: true, message: "Figurinha removida." };
  } catch (error) {
    console.error("Erro ao remover figurinha", error);
    return { ok: false, message: "Não foi possível remover a figurinha." };
  }
}