"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveSticker, type ActionState } from "@/app/actions";
import type { StickerStatus } from "@/lib/supabase/types";

const initialState: ActionState = { ok: false, message: "" };

export function StickerForm() {
  const [state, formAction, pending] = useActionState(saveSticker, initialState);
  const [status, setStatus] = useState<StickerStatus>("missing");
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
    inputRef.current?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
      <div>
        <label htmlFor="code" className="text-sm font-black uppercase tracking-[0.18em] text-deep/70">Código da figurinha</label>
        <input
          ref={inputRef}
          id="code"
          name="code"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          required
          placeholder="BRA10"
          className="mt-2 h-16 w-full rounded-3xl border-2 border-deep/10 bg-ice px-5 text-3xl font-black uppercase tracking-wide text-deep outline-none transition focus:border-field"
        />
      </div>

      <input type="hidden" name="status" value={status} />
      <div className="grid grid-cols-2 gap-3 rounded-3xl bg-ice p-2">
        {([
          ["missing", "Faltando"],
          ["duplicate", "Repetida"]
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={`min-h-14 rounded-2xl text-base font-black transition ${status === value ? "bg-deep text-white shadow-soft" : "bg-white text-deep"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <button type="submit" disabled={pending} className="min-h-16 w-full rounded-3xl bg-gold px-5 text-lg font-black text-deep shadow-soft disabled:opacity-60">
        {pending ? "Salvando..." : "Salvar figurinha"}
      </button>

      {state.message ? (
        <p aria-live="polite" className={`rounded-2xl px-4 py-3 text-sm font-bold ${state.ok ? "bg-field/10 text-field" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
