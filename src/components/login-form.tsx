"use client";

import { useActionState, useEffect, useState } from "react";
import { signInWithEmail, signInWithGoogle, type ActionState } from "@/app/actions";

const initialState: ActionState = { ok: false, message: "" };
const COOLDOWN_SECONDS = 60;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInWithEmail, initialState);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (state.ok) setCooldown(COOLDOWN_SECONDS);
  }, [state.ok]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const isDisabled = pending || cooldown > 0;

  return (
    <div className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="min-h-16 w-full rounded-3xl bg-deep px-5 text-lg font-black text-white shadow-soft"
        >
          Entrar com Google
        </button>
      </form>

      <p className="rounded-2xl bg-ice px-4 py-3 text-center text-sm font-semibold text-ink/70">
        Recomendado para entrar rápido e manter seu álbum salvo.
      </p>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-deep/10" />
        <span className="text-xs font-black uppercase tracking-[0.18em] text-ink/50">
          alternativa
        </span>
        <div className="h-px flex-1 bg-deep/10" />
      </div>

      <form action={formAction} className="space-y-4">
        <label className="block">
          <span className="text-sm font-black uppercase tracking-[0.18em] text-deep/70">
            Receber link por e-mail
          </span>

          <input
            name="email"
            type="email"
            placeholder="voce@email.com"
            autoComplete="email"
            required
            className="mt-2 min-h-16 w-full rounded-3xl border-2 border-deep/10 bg-ice px-5 text-lg font-bold text-deep outline-none focus:border-field"
          />
        </label>

        <button
          type="submit"
          disabled={isDisabled}
          className="min-h-14 w-full rounded-3xl bg-gold/80 px-5 text-base font-black text-deep shadow-soft disabled:opacity-60"
        >
          {pending
            ? "Enviando..."
            : cooldown > 0
            ? `Reenviar em ${cooldown}s`
            : "Enviar link por e-mail"}
        </button>

        <p className="text-center text-xs font-semibold text-ink/50">
          O e-mail pode demorar ou ter limite de envio. Prefira o Google.
        </p>

        {state.message ? (
          <p
            aria-live="polite"
            className={`rounded-2xl px-4 py-3 text-sm font-bold ${
              state.ok
                ? "bg-field/10 text-field"
                : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}