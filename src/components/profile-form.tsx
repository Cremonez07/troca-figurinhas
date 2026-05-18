"use client";

import { useActionState } from "react";
import { saveProfile, type ActionState } from "@/app/actions";
import type { Profile } from "@/lib/supabase/types";

const initialState: ActionState = { ok: false, message: "" };

const fields = [
  { name: "full_name", label: "Nome", placeholder: "Seu nome", autoComplete: "name", inputMode: "text", required: true },
  { name: "whatsapp", label: "WhatsApp", placeholder: "55 11 99999-9999", autoComplete: "tel", inputMode: "tel", required: true },
  { name: "city", label: "Cidade", placeholder: "São Paulo", autoComplete: "address-level2", inputMode: "text", required: true },
  { name: "neighborhood", label: "Bairro", placeholder: "Vila Mariana", autoComplete: "address-line2", inputMode: "text", required: true },
  { name: "exchange_point", label: "Ponto de troca opcional", placeholder: "Shopping, metrô, praça...", autoComplete: "off", inputMode: "text", required: false }
] as const;

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
      {fields.map((field) => (
        <label key={field.name} className="block">
          <span className="text-sm font-black uppercase tracking-[0.16em] text-deep/70">{field.label}</span>
          <input
            name={field.name}
            defaultValue={(profile?.[field.name] as string | null) ?? ""}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            inputMode={field.inputMode}
            required={field.required}
            className="mt-2 min-h-14 w-full rounded-2xl border-2 border-deep/10 bg-ice px-4 text-base font-bold text-deep outline-none focus:border-field"
          />
        </label>
      ))}
      <button type="submit" disabled={pending} className="min-h-16 w-full rounded-3xl bg-deep px-5 text-lg font-black text-white shadow-soft disabled:opacity-60">
        {pending ? "Salvando..." : "Salvar perfil"}
      </button>
      {state.message ? <p aria-live="polite" className={`rounded-2xl px-4 py-3 text-sm font-bold ${state.ok ? "bg-field/10 text-field" : "bg-red-50 text-red-700"}`}>{state.message}</p> : null}
    </form>
  );
}
