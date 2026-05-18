import type { StickerStatus } from "@/lib/supabase/types";

type RecentItem = {
  status: StickerStatus;
  created_at: string;
  stickers: { code: string; country: string | null; player_name: string | null } | null;
};

export function RecentList({ items }: { items: RecentItem[] }) {
  if (items.length === 0) return <p className="text-sm font-semibold text-ink/60">Nenhuma figurinha adicionada ainda.</p>;

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={`${item.stickers?.code ?? "sticker"}-${item.created_at}-${index}`} className="flex min-h-16 items-center justify-between rounded-3xl bg-ice px-4 py-3">
          <div>
            <p className="text-xl font-black text-deep">{item.stickers?.code ?? "Sem código"}</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">{item.status === "missing" ? "faltando" : "repetida"}</p>
          </div>
          <span className={`rounded-full px-3 py-2 text-xs font-black ${item.status === "missing" ? "bg-gold text-deep" : "bg-field text-white"}`}>
            {item.status === "missing" ? "Quero" : "Tenho"}
          </span>
        </li>
      ))}
    </ul>
  );
}
