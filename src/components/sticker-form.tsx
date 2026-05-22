"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveSticker, type ActionState } from "@/app/actions";
import type { StickerStatus } from "@/lib/supabase/types";

const initialState: ActionState = { ok: false, message: "" };

export function StickerForm() {
  const [state, formAction, pending] = useActionState(saveSticker, initialState);
  const [status, setStatus] = useState<StickerStatus>("missing");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
    inputRef.current?.focus();
  }, [state]);

  const selectedLabel = status === "missing" ? "faltando" : "repetida";

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
      <div>
        <label htmlFor="code" className="text-sm font-black uppercase tracking-[0.18em] text-deep/70">
          Códigos das figurinhas
        </label>

        <textarea
          ref={inputRef}
          id="code"
          name="code"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          required
          rows={2}
          placeholder="BRA10, ARG07, ESP18"
          className="mt-2 w-full rounded-3xl border-2 border-deep/10 bg-ice p-5 text-2xl font-black uppercase tracking-wide text-deep outline-none transition focus:border-field resize-none min-h-[5rem]"
        />

        {/* 🔥 AVISO ATUALIZADO: Deixa claro o limite de 20 para o usuário não se frustrar */}
        <p className="mt-2 text-sm font-semibold text-ink/60">
          Cole até 20 códigos por vez, separados por vírgula, espaço ou quebra de linha.
        </p>
      </div>

      <input type="hidden" name="status" value={status} />

      <div className="grid grid-cols-2 gap-3 rounded-3xl bg-ice p-2">
        {([
          ["missing", "Faltando", "Quero essa"],
          ["duplicate", "Repetida", "Tenho para trocar"]
        ] as const).map(([value, label, helper]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setStatus(value);
              inputRef.current?.focus();
            }}
            className={`min-h-16 rounded-2xl px-3 text-left transition ${
              status === value ? "bg-deep text-white shadow-soft" : "bg-white text-deep"
            }`}
          >
            <span className="block text-base font-black">{label}</span>
            <span className="mt-1 block text-xs font-bold opacity-70">{helper}</span>
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="min-h-16 w-full rounded-3xl bg-gold px-5 text-lg font-black text-deep shadow-soft disabled:opacity-60"
      >
        {pending ? "Salvando..." : `Salvar como ${selectedLabel}`}
      </button>

      {state.message ? (
        <p
          aria-live="polite"
          className={`rounded-2xl px-4 py-3 text-sm font-bold ${
            state.ok ? "bg-field/10 text-field" : "bg-red-50 text-red-700"
          }`}
        >
          {state.ok ? `Boa! ${state.message}` : state.message}
        </p>
      ) : null}

      <p className="text-center text-xs font-semibold text-ink/50">
        Depois de salvar, o campo limpa sozinho para você continuar cadastrando.
      </p>
    </form>
  );
}