import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { MatchCard } from "@/components/match-card";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUserId, getTradeMatches } from "@/lib/stickers";
import { createClient } from "@/lib/supabase/server";

export default async function TradesPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return (
      <div className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-black text-deep">Entre para ver matches</h2>
        <Link href="/login" className="flex min-h-14 items-center justify-center rounded-3xl bg-gold px-5 font-black text-deep">Entrar</Link>
      </div>
    );
  }

  const matches = await getTradeMatches(supabase, userId);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-field">Trocas</p>
        <h2 className="text-3xl font-black text-deep">Matches para chamar no WhatsApp.</h2>
      </div>
      {matches.length ? (
        <div className="space-y-4">
          {matches.map((match) => <MatchCard key={match.collector.id} match={match} />)}
        </div>
      ) : (
        <EmptyState title="Nenhum match ainda" description="Cadastre faltantes e repetidas para cruzar com outros colecionadores." />
      )}
    </div>
  );
}
