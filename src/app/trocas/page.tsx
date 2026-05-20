import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { MatchCard } from "@/components/match-card";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUserId, getTradeMatches } from "@/lib/stickers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TradesPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return (
      <div className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-black text-deep">
          Entre para ver matches
        </h2>

        <p className="font-semibold text-ink/60">
          Faça login para encontrar colecionadores que têm as figurinhas que faltam no seu álbum.
        </p>

        <Link
          href="/login"
          className="flex min-h-14 items-center justify-center rounded-3xl bg-gold px-5 font-black text-deep"
        >
          Entrar
        </Link>
      </div>
    );
  }

  const matches = await getTradeMatches(supabase, userId);
  const perfectMatches = matches.filter((match) => match.kind === "perfect");
  const opportunityMatches = matches.filter((match) => match.kind !== "perfect");

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-deep p-5 text-white shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-gold">
          Trocas
        </p>

        <h2 className="mt-2 text-3xl font-black">
          Encontre sua próxima troca.
        </h2>

        <p className="mt-3 font-semibold text-white/75">
          Veja quem tem as figurinhas que faltam no seu álbum e combine tudo pelo WhatsApp.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-3xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-black text-gold">{matches.length}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/60">
              Matches
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-black text-gold">
              {perfectMatches.length}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/60">
              Duplas
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-black text-gold">
              {opportunityMatches.length}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/60">
              Oportunidades
            </p>
          </div>
        </div>
      </section>

      {matches.length ? (
        <>
          <section className="space-y-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-field">
                🏆 Match perfeito
              </p>

              <h3 className="mt-1 text-2xl font-black text-deep">
                Vocês conseguem se ajudar.
              </h3>

              <p className="mt-1 text-sm font-semibold text-ink/60">
                Você recebe uma figurinha que procura e entrega uma repetida que o outro colecionador precisa.
              </p>
            </div>

            {perfectMatches.length ? (
              <div className="space-y-4">
                {perfectMatches.map((match) => (
                  <MatchCard key={match.collector.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] bg-white p-5 shadow-soft">
                <p className="text-lg font-black text-deep">
                  Nenhuma troca dupla ainda.
                </p>

                <p className="mt-2 text-sm font-semibold text-ink/60">
                  Continue cadastrando faltantes e repetidas para aumentar suas chances de match perfeito.
                </p>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-field">
                🤝 Trocas possíveis
              </p>

              <h3 className="mt-1 text-2xl font-black text-deep">
                Pessoas que podem te ajudar.
              </h3>

              <p className="mt-1 text-sm font-semibold text-ink/60">
                Colecionadores com figurinhas que faltam no seu álbum.
              </p>
            </div>

            {opportunityMatches.length ? (
              <div className="space-y-4">
                {opportunityMatches.map((match) => (
                  <MatchCard key={match.collector.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] bg-white p-5 shadow-soft">
                <p className="text-lg font-black text-deep">
                  Sem oportunidades simples por enquanto.
                </p>

                <p className="mt-2 text-sm font-semibold text-ink/60">
                  Quanto mais figurinhas você cadastrar, melhor fica o cruzamento de trocas.
                </p>
              </div>
            )}
          </section>
        </>
      ) : (
        <EmptyState
          title="Nenhum match ainda"
          description="Cadastre faltantes e repetidas para cruzar com outros colecionadores."
        />
      )}

      <section className="rounded-[2rem] bg-white p-5 shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-field">
          📍 Trocas perto de você
        </p>

        <h3 className="mt-1 text-2xl font-black text-deep">
          Combine em pontos fáceis.
        </h3>

        <p className="mt-2 text-sm font-semibold text-ink/60">
          Dê preferência para locais conhecidos, movimentados e combinados pelo WhatsApp.
        </p>

        <div className="mt-4 grid gap-3">
          <div className="rounded-3xl bg-ice px-4 py-3">
            <p className="font-black text-deep">Ponto sugerido</p>
            <p className="mt-1 text-sm font-semibold text-ink/60">
              Use o ponto de troca informado no perfil do colecionador.
            </p>
          </div>

          <div className="rounded-3xl bg-ice px-4 py-3">
            <p className="font-black text-deep">Segurança primeiro</p>
            <p className="mt-1 text-sm font-semibold text-ink/60">
              Prefira locais públicos, bancas, escolas, clubes ou pontos já conhecidos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}