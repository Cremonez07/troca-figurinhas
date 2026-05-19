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
          className="min-h-16 w-full rounded-3xl bg-white px-5 text-lg font-black text-deep shadow-soft ring-2 ring-deep/10"
        >
          Entrar com Google
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-deep/10" />
        <span className="text-xs font-black uppercase tracking-[0.18em] text-ink/50">
          ou
        </span>
        <div className="h-px flex-1 bg-deep/10" />
      </div>

      <form action={formAction} className="space-y-4">
        <label className="block">
          <span className="text-sm font-black uppercase tracking-[0.18em] text-deep/70">
            E-mail
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
          className="min-h-16 w-full rounded-3xl bg-gold px-5 text-lg font-black text-deep shadow-soft disabled:opacity-60"
        >
          {pending
            ? "Enviando..."
            : cooldown > 0
            ? `Reenviar em ${cooldown}s`
            : "Receber link mágico"}
        </button>

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