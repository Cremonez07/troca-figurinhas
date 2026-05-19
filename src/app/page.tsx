import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { ProgressRing } from "@/components/progress-ring";
import { RecentList } from "@/components/recent-list";
import { SectionCard } from "@/components/section-card";
import { SetupNotice } from "@/components/setup-notice";
import { StatCard } from "@/components/stat-card";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUserId, getDashboardSummary } from "@/lib/stickers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-5">
        <Hero progress={34} duplicateTotal={18} matchTotal={6} />
        <SetupNotice />
      </div>
    );
  }

  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return (
      <div className="space-y-5">
        <Hero progress={0} duplicateTotal={0} matchTotal={0} />
        <Link href="/login" className="flex min-h-16 items-center justify-center rounded-3xl bg-gold px-5 text-lg font-black text-deep shadow-soft">
          Entrar para começar
        </Link>
      </div>
    );
  }

  const summary = await getDashboardSummary(supabase, userId);

  const isFirstTime =
    summary.progress === 0 &&
    summary.duplicateTotal === 0 &&
    summary.matchTotal === 0;

  return (
    <div className="space-y-5">
      <Hero progress={summary.progress} duplicateTotal={summary.duplicateTotal} matchTotal={summary.matchTotal} />

      {isFirstTime ? (
        <section className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-field">
              Comece agora
            </p>
            <h3 className="mt-2 text-2xl font-black text-deep">
              Seu álbum ainda está vazio.
            </h3>
            <p className="mt-2 font-semibold text-ink/70">
              Adicione suas primeiras figurinhas faltando ou repetidas para encontrar trocas reais.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl bg-ice p-4">
            {[
              "Adicione uma figurinha faltando",
              "Adicione uma repetida",
              "Encontre pessoas para trocar"
            ].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-black text-deep">
                  {index + 1}
                </div>
                <p className="font-bold text-deep">{step}</p>
              </div>
            ))}
          </div>

          <Link href="/adicionar" className="flex min-h-16 items-center justify-center rounded-3xl bg-gold px-5 text-lg font-black text-deep shadow-soft">
            Adicionar primeira figurinha
          </Link>
        </section>
      ) : null}

      <Link href="/adicionar" className="flex min-h-16 items-center justify-center rounded-3xl bg-gold px-5 text-lg font-black text-deep shadow-soft">
        Adicionar figurinha
      </Link>

      <SectionCard title="Rolando agora" action={<Link href="/trocas" className="text-sm font-black text-field">Ver trocas</Link>}>
        {summary.recent.length ? (
          <RecentList items={summary.recent} />
        ) : (
          <EmptyState title="Seu álbum começa aqui" description="Adicione faltantes e repetidas para encontrar trocas reais." />
        )}
      </SectionCard>
    </div>
  );
}

function Hero({ progress, duplicateTotal, matchTotal }: { progress: number; duplicateTotal: number; matchTotal: number }) {
  return (
    <section className="space-y-4 rounded-[2.25rem] bg-deep p-5 text-white shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-gold">Progresso do álbum</p>
          <h2 className="mt-2 text-3xl font-black leading-tight">Trocas simples, direto no WhatsApp.</h2>
        </div>
        <ProgressRing value={progress} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Repetidas" value={duplicateTotal} tone="gold" />
        <StatCard label="Matches" value={matchTotal} tone="green" />
      </div>
    </section>
  );
}