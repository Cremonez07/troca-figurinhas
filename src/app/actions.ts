"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addUserSticker, getCurrentUserId, normalizeStickerCode, upsertProfile } from "@/lib/stickers";
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
  const code = normalizeStickerCode(requireString(formData, "code"));
  const status = requireString(formData, "status") as StickerStatus;

  if (!code) return { ok: false, message: "Digite o código da figurinha." };
  if (status !== "missing" && status !== "duplicate") return { ok: false, message: "Escolha se ela está faltando ou repetida." };

  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) redirect("/login");

  try {
    await addUserSticker(supabase, userId, code, status);
    revalidatePath("/");
    revalidatePath("/adicionar");
    revalidatePath("/trocas");
    revalidatePath("/perfil");

    return { ok: true, message: `${code} salva como ${status === "missing" ? "faltando" : "repetida"}.` };
  } catch (error) {
    console.error("Erro ao salvar figurinha", error);
    return { ok: false, message: "Não foi possível salvar essa figurinha. Confira o código e tente novamente." };
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