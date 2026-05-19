import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { ProfileForm } from "@/components/profile-form";
import { ProgressRing } from "@/components/progress-ring";
import { RecentList } from "@/components/recent-list";
import { SectionCard } from "@/components/section-card";
import { SetupNotice } from "@/components/setup-notice";
import { StatCard } from "@/components/stat-card";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUserId, getDashboardSummary, getProfile } from "@/lib/stickers";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function ProfilePage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return (
      <div className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-black text-deep">Entre para completar seu perfil</h2>
        <p className="font-semibold text-ink/70">Seu WhatsApp e ponto de troca ajudam outros colecionadores a combinar trocas reais.</p>
        <Link href="/login" className="flex min-h-14 items-center justify-center rounded-3xl bg-gold px-5 font-black text-deep">Entrar</Link>
      </div>
    );
  }

  const [profile, summary] = await Promise.all([getProfile(supabase, userId), getDashboardSummary(supabase, userId)]);

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-deep p-5 text-white shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-gold">Perfil</p>
            <h2 className="mt-2 text-3xl font-black">{profile?.full_name || "Colecionador"}</h2>
            <p className="mt-2 font-semibold text-white/70">{[profile?.neighborhood, profile?.city].filter(Boolean).join(" · ") || "Complete sua localização de troca"}</p>
          </div>
          <ProgressRing value={summary.progress} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Progresso" value={`${summary.progress}%`} />
        <StatCard label="Matches" value={summary.matchTotal} tone="green" />
      </div>

      <SectionCard title="Painel do colecionador">
        <ProfileForm profile={profile} />
      </SectionCard>

      <SectionCard title="Atividade recente">
        {summary.recent.length ? <RecentList items={summary.recent} /> : <EmptyState title="Sem atividade" description="Quando você adicionar códigos, eles aparecem aqui." />}
      </SectionCard>

      <section className="rounded-[2rem] bg-gold p-5 text-deep shadow-soft">
        <p className="text-2xl font-black">Seus amigos podem ter sua próxima figurinha</p>
        <p className="mt-2 font-semibold">Compartilhe seu WhatsApp e combine trocas reais, sem pontos, ranking ou recompensa artificial.</p>
      </section>
    </div>
  );
}
