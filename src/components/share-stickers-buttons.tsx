import {
  buildStickerShareMessage,
  buildWhatsAppShareUrl
} from "@/lib/stickers/share";
import type { StickerStatus } from "@/lib/supabase/types";

type ShareStickerItem = {
  status: StickerStatus;
  stickers: {
    code: string;
    country: string | null;
    player_name: string | null;
  } | null;
};

type ShareOption = {
  label: string;
  description: string;
  mode: "missing" | "duplicate" | "all";
};

const SHARE_OPTIONS: ShareOption[] = [
  {
    label: "Compartilhar faltantes",
    description: "Envie a lista das figurinhas que você ainda procura.",
    mode: "missing"
  },
  {
    label: "Compartilhar repetidas",
    description: "Envie a lista das figurinhas que você tem para troca.",
    mode: "duplicate"
  },
  {
    label: "Compartilhar tudo",
    description: "Envie faltantes e repetidas em uma mensagem organizada.",
    mode: "all"
  }
];

type ShareStickersButtonsProps = {
  items: ShareStickerItem[];
};

export function ShareStickersButtons({ items }: ShareStickersButtonsProps) {
  const missingTotal = items.filter((item) => item.status === "missing").length;
  const duplicateTotal = items.filter((item) => item.status === "duplicate").length;

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold text-ink/70">
          Gere uma mensagem pronta para enviar em grupos ou conversas de WhatsApp.
        </p>

        <p className="mt-2 text-sm font-black uppercase tracking-[0.16em] text-ink/50">
          {missingTotal} faltantes · {duplicateTotal} repetidas
        </p>
      </div>

      <div className="space-y-3">
        {SHARE_OPTIONS.map((option) => {
          const message = buildStickerShareMessage(items, option.mode);
          const href = buildWhatsAppShareUrl(message);

          return (
            <a
              key={option.mode}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="block rounded-3xl border border-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              <span className="block text-base font-black text-deep">
                {option.label}
              </span>

              <span className="mt-1 block text-sm font-semibold text-ink/60">
                {option.description}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
