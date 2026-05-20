import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { RecentList } from "@/components/recent-list";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { getAllUserStickers, getCurrentUserId } from "@/lib/stickers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AlbumPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return (
      <section className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-black text-deep">
          Entre para ver seu álbum
        </h2>

        <p className="font-semibold text-ink/70">
          Faça login para acessar todas as suas figurinhas cadastradas.
        </p>

        <Link
          href="/login"
          className="flex min-h-14 items-center justify-center rounded-3xl bg-gold px-5 font-black text-deep"
        >
          Entrar
        </Link>
      </section>
    );
  }

  const all = await getAllUserStickers(supabase, userId);

  const missingTotal = all.filter((item) => item.status === "missing").length;
  const duplicateTotal = all.filter((item) => item.status === "duplicate").length;
  const total = all.length;

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-deep p-5 text-white shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-gold">
          Meu Álbum
        </p>

        <h2 className="mt-2 text-3xl font-black">
          Todas as suas figurinhas.
        </h2>

        <p className="mt-2 text-sm font-semibold text-white/80">
          Veja faltantes, repetidas e acompanhe sua coleção completa.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <article className="rounded-3xl bg-white p-4 text-center shadow-soft">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/60">
            Faltando
          </p>
          <p className="mt-1 text-2xl font-black text-deep">{missingTotal}</p>
        </article>

        <article className="rounded-3xl bg-white p-4 text-center shadow-soft">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/60">
            Repetidas
          </p>
          <p className="mt-1 text-2xl font-black text-deep">{duplicateTotal}</p>
        </article>

        <article className="rounded-3xl bg-white p-4 text-center shadow-soft">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/60">
            Total
          </p>
          <p className="mt-1 text-2xl font-black text-deep">{total}</p>
        </article>
      </section>

      <section className="space-y-3">
        {all.length ? (
          <RecentList items={all} />
        ) : (
          <EmptyState
            title="Seu álbum ainda está vazio"
            description="Adicione faltantes e repetidas para começar sua coleção."
          />
        )}
      </section>

      <Link
        href="/adicionar"
        className="flex min-h-14 items-center justify-center rounded-3xl bg-gold px-5 text-base font-black text-deep shadow-soft"
      >
        Adicionar mais figurinhas
      </Link>
    </div>
  );
}