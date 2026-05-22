import { removeUserStickerAction } from "@/app/actions";
import type { StickerStatus } from "@/lib/supabase/types";

type RecentItem = {
  id: string;
  status: StickerStatus;
  created_at: string;
  stickers: {
    code: string;
    country: string | null;
    player_name: string | null;
  } | null;
};

const STICKERS_PER_SELECTION = 20;

const SELECTION_NAMES: Record<string, string> = {
  MEX: "🇲🇽 México",
  RSA: "🇿🇦 África do Sul",
  KOR: "🇰🇷 Coreia do Sul",
  CZE: "🇨🇿 República Tcheca",
  CAN: "🇨🇦 Canadá",
  BIH: "🇧🇦 Bósnia e Herzegovina",
  QAT: "🇶🇦 Catar",
  SUI: "🇨🇭 Suíça",
  BRA: "🇧🇷 Brasil",
  MAR: "🇲🇦 Marrocos",
  HAI: "🇭🇹 Haiti",
  SCO: "🏴 Escócia",
  USA: "🇺🇸 Estados Unidos",
  PAR: "🇵🇾 Paraguai",
  AUS: "🇦🇺 Austrália",
  TUR: "🇹🇷 Turquia",
  GER: "🇩🇪 Alemanha",
  CUW: "🇨🇼 Curaçao",
  CIV: "🇨🇮 Costa do Marfim",
  ECU: "🇪🇨 Equador",
  NED: "🇳🇱 Holanda",
  JPN: "🇯🇵 Japão",
  SWE: "🇸🇪 Suécia",
  TUN: "🇹🇳 Tunísia",
  BEL: "🇧🇪 Bélgica",
  EGY: "🇪🇬 Egito",
  IRN: "🇮🇷 Irã",
  NZL: "🇳🇿 Nova Zelândia",
  ESP: "🇪🇸 Espanha",
  CPV: "🇨🇻 Cabo Verde",
  KSA: "🇸🇦 Arábia Saudita",
  URU: "🇺🇾 Uruguai",
  FRA: "🇫🇷 França",
  SEN: "🇸🇳 Senegal",
  IRQ: "🇮🇶 Iraque",
  NOR: "🇳🇴 Noruega",
  ARG: "🇦🇷 Argentina",
  ALG: "🇩🇿 Argélia",
  AUT: "🇦🇹 Áustria",
  JOR: "🇯🇴 Jordânia",
  POR: "🇵🇹 Portugal",
  COD: "🇨🇩 RD Congo",
  UZB: "🇺🇿 Uzbequistão",
  COL: "🇨🇴 Colômbia",
  ENG: "🏴 Inglaterra",
  CRO: "🇭🇷 Croácia",
  PAN: "🇵🇦 Panamá",
  GHA: "🇬🇭 Gana"
};

function getSelectionPrefix(code: string) {
  const match = code.match(/^[A-Z]+/i);
  return match ? match[0].toUpperCase() : "OUTRAS";
}

function groupItems(items: RecentItem[]) {
  return items.reduce<Record<string, RecentItem[]>>((acc, item) => {
    const code = item.stickers?.code ?? "OUTRAS";
    const prefix = getSelectionPrefix(code);

    if (!acc[prefix]) {
      acc[prefix] = [];
    }

    acc[prefix].push(item);

    return acc;
  }, {});
}

function SelectionProgress({
  total,
  status
}: {
  total: number;
  status: StickerStatus;
}) {
  if (status === "duplicate") {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="rounded-full bg-ice px-3 py-2 text-xs font-black text-deep">
          {total} para troca
        </span>

        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-ink/50">
          disponíveis
        </span>
      </div>
    );
  }

  const missingCount = total;
  const completed = Math.max(0, STICKERS_PER_SELECTION - missingCount);
  const percentage = Math.min(
    Math.round((completed / STICKERS_PER_SELECTION) * 100),
    100
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <span className="rounded-full bg-ice px-3 py-2 text-xs font-black text-deep">
        {completed} de {STICKERS_PER_SELECTION}
      </span>

      <div className="h-2 w-28 overflow-hidden rounded-full bg-ice">
        <div
          className="h-full rounded-full bg-field transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="text-[10px] font-black text-field">
        Faltam {missingCount} · {percentage}%
      </span>
    </div>
  );
}

function Section({
  title,
  items,
  status
}: {
  title: string;
  items: RecentItem[];
  status: StickerStatus;
}) {
  if (!items.length) return null;

  const grouped = groupItems(items);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-deep">{title}</h3>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-deep shadow-sm">
          {items.length}
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([prefix, selectionItems]) => {
          const selectionName = SELECTION_NAMES[prefix] ?? prefix;
          const total = selectionItems.length;

          return (
            <div
              key={prefix}
              className="rounded-[2rem] bg-white p-4 shadow-soft"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-black text-deep">
                    {selectionName}
                  </p>

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">
                    {prefix}
                  </p>
                </div>

                <SelectionProgress total={total} status={status} />
              </div>

              <ul className="space-y-3">
                {selectionItems.map((item, index) => {
                  const actionLabel =
                    item.status === "missing" ? "Consegui" : "Troquei";

                  return (
                    <li
                      key={`${item.id}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-3xl bg-ice px-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-lg font-black text-deep">
                          {item.stickers?.code ?? "Sem código"}
                        </p>

                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">
                          {status === "missing" ? "faltando" : "repetida"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`flex min-h-11 items-center rounded-2xl px-4 text-xs font-black ${
                            status === "missing"
                              ? "bg-gold text-deep"
                              : "bg-field text-white"
                          }`}
                        >
                          {status === "missing" ? "Quero" : "Tenho"}
                        </span>

                        <form
                          action={async () => {
                            "use server";
                            await removeUserStickerAction(item.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="min-h-11 touch-manipulation rounded-2xl bg-white px-4 text-sm font-black text-deep/80 shadow-sm transition active:scale-[0.98] active:bg-white/80"
                          >
                            {actionLabel}
                          </button>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function RecentList({ items }: { items: RecentItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm font-semibold text-ink/60">
        Nenhuma figurinha adicionada ainda.
      </p>
    );
  }

  const missingItems = items.filter((item) => item.status === "missing");
  const duplicateItems = items.filter((item) => item.status === "duplicate");

  return (
    <div className="space-y-6">
      <Section title="🎯 Procurando" items={missingItems} status="missing" />

      <Section
        title="🤝 Disponíveis para troca"
        items={duplicateItems}
        status="duplicate"
      />
    </div>
  );
}