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

  return (
    <div className="space-y-5">
      <Hero progress={summary.progress} duplicateTotal={summary.duplicateTotal} matchTotal={summary.matchTotal} />
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
