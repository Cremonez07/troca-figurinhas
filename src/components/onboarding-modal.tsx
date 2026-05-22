"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ONBOARDING_STORAGE_KEY = "trocacopa_onboarding_v1";

const steps = [
  {
    title: "Cadastre as que faltam",
    description: "Marque como faltando as figurinhas que você ainda procura."
  },
  {
    title: "Cadastre suas repetidas",
    description: "Marque como repetidas as figurinhas que você tem para trocar."
  },
  {
    title: "Veja seus matches",
    description: "Na tela Trocas, encontre pessoas que têm o que você procura."
  },
  {
    title: "Combine pelo WhatsApp",
    description: "Chame a pessoa e combine a troca em um local seguro."
  }
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = window.localStorage.getItem(
      ONBOARDING_STORAGE_KEY
    );

    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  function closeOnboarding() {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep/70 px-4 pb-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-soft">
        <div className="rounded-[1.5rem] bg-ice p-4">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-field">
            Como funciona
          </p>

          <h2 className="mt-2 text-3xl font-black leading-tight text-deep">
            Bem-vindo ao TrocaCopa.
          </h2>

          <p className="mt-2 text-sm font-semibold text-ink/70">
            Organize seu álbum, encontre pessoas para trocar e combine tudo pelo WhatsApp.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex gap-3 rounded-3xl bg-white p-3 shadow-sm"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gold text-sm font-black text-deep">
                {index + 1}
              </div>

              <div>
                <h3 className="text-sm font-black text-deep">
                  {step.title}
                </h3>

                <p className="mt-1 text-sm font-semibold text-ink/60">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3">
          <Link
            href="/adicionar"
            onClick={closeOnboarding}
            className="flex min-h-14 touch-manipulation items-center justify-center rounded-3xl bg-gold px-5 text-base font-black text-deep shadow-soft transition active:scale-[0.98]"
          >
            Começar cadastrando
          </Link>

          <button
            type="button"
            onClick={closeOnboarding}
            className="min-h-12 touch-manipulation rounded-3xl bg-ice px-5 text-sm font-black text-deep transition active:scale-[0.98]"
          >
            Entendi
          </button>
        </div>
      </section>
    </div>
  );
}