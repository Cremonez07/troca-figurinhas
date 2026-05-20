import { removeUserStickerAction } from "@/app/actions";
import type { StickerStatus } from "@/lib/supabase/types";

type RecentItem = {
  id: string;
  status: StickerStatus;
  created_at: string;
  stickers: { code: string; country: string | null; player_name: string | null } | null;
};

export function RecentList({ items }: { items: RecentItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm font-semibold text-ink/60">
        Nenhuma figurinha adicionada ainda.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={`${item.id}-${item.stickers?.code ?? "sticker"}-${item.created_at}-${index}`}
          className="flex min-h-16 items-center justify-between gap-3 rounded-3xl bg-ice px-4 py-3"
        >
          <div>
            <p className="text-xl font-black text-deep">
              {item.stickers?.code ?? "Sem código"}
            </p>

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">
              {item.status === "missing" ? "faltando" : "repetida"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-full px-3 py-2 text-xs font-black ${
                item.status === "missing"
                  ? "bg-gold text-deep"
                  : "bg-field text-white"
              }`}
            >
              {item.status === "missing" ? "Quero" : "Tenho"}
            </span>

            <form
  action={async () => {
    "use server";
    await removeUserStickerAction(item.id);
  }}
>
              <button
                type="submit"
                className="min-h-10 rounded-2xl bg-white px-3 text-xs font-black text-deep/70 shadow-sm"
              >
                Remover
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}