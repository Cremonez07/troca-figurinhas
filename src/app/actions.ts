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

function requireString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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
        ? "Muitas tentativas em pouco tempo. Aguarde alguns minutos e use o link recebido."
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

// 🔥 CÓDIGO DA GEM ARCHITECT: Separação via Regex atômica
export async function saveSticker(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const rawCode = requireString(formData, "code");
  const status = requireString(formData, "status") as StickerStatus;

  if (!rawCode) return { ok: false, message: "Digite o código da figurinha." };
  if (status !== "missing" && status !== "duplicate") {
    return { ok: false, message: "Escolha se ela está faltando ou repetida." };
  }

  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) redirect("/login");

  // Expressão regular: Captura 3 letras seguidas de 2 ou 3 números (ex: BRA10, ARG102)
  const stickerRegex = /[A-Z]{3}\d{2,3}/g;
  
  // Normaliza limpando hifens/espaços e colocando em caixa alta
  const sanitizedInput = rawCode.toUpperCase().replace(/[\s-]+/g, "");
  
  // Encontra todas as ocorrências isoladas dentro da string literal
  const parsedCodes = sanitizedInput.match(stickerRegex);

  // Se o usuário digitou lixo ou nada legível pelo padrão da copa
  if (!parsedCodes || parsedCodes.length === 0) {
    return { ok: false, message: "Nenhum código válido encontrado. Use o formato: BRA10, ESP08." };
  }

  try {
    // Processa cada código encontrado de forma individual e sequencial
    for (const individualCode of parsedCodes) {
      await addUserSticker(supabase, userId, individualCode, status);
    }

    // Força a atualização do cache do Next.js nas páginas afetadas
    revalidatePath("/");
    revalidatePath("/adicionar");
    revalidatePath("/trocas");
    revalidatePath("/perfil");

    const badgeCount = parsedCodes.length;
    const feedbackMessage = badgeCount > 1 
      ? `${badgeCount} figurinhas adicionadas (${parsedCodes.join(", ")}).`
      : `${parsedCodes[0]} salva com sucesso.`;

    return { ok: true, message: feedbackMessage };
  } catch (error) {
    console.error("Erro ao salvar lote de figurinhas", error);
    return { ok: false, message: "Erro ao processar o lote de figurinhas." };
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
    return { ok: false, message: "Não foi possível atualizar o perfil agora. Revise os dados e tente novamente." };
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

  if (!userId) {
    return { ok: false };
  }

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

  if (!userId) {
    return { ok: false, message: "Usuário não autenticado." };
  }

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