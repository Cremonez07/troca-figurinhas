import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { RecentList } from "@/components/recent-list";
import { SectionCard } from "@/components/section-card";
import { SetupNotice } from "@/components/setup-notice";
import { StickerForm } from "@/components/sticker-form";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUserId, getRecentUserStickers } from "@/lib/stickers";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function AddPage() {
  if (!isSupabaseConfigured) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return <LoginPrompt />;
  }

  const recent = await getRecentUserStickers(supabase, userId, 8);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-field">Adicionar</p>
        <h2 className="text-3xl font-black text-deep">Digite o código e siga cadastrando.</h2>
      </div>
      <StickerForm />
      <SectionCard title="Últimas adicionadas">
        {recent.length ? <RecentList items={recent} /> : <EmptyState title="Nada por aqui" description="As figurinhas salvas aparecem aqui na hora." />}
      </SectionCard>
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
      <h2 className="text-2xl font-black text-deep">Entre para salvar suas figurinhas</h2>
      <p className="font-semibold text-ink/70">O cadastro fica ligado ao seu perfil e aos seus matches.</p>
      <Link href="/login" className="flex min-h-14 items-center justify-center rounded-3xl bg-gold px-5 font-black text-deep">Entrar</Link>
    </div>
  );
}
