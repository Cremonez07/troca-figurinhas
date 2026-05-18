import type { TradeMatch } from "@/lib/stickers";

function whatsappUrl(phone: string, name: string | null) {
  const digits = phone.replace(/\D/g, "");
  const message = encodeURIComponent(`Oi${name ? `, ${name}` : ""}! Vi seu match no TrocaCopa. Vamos combinar uma troca de figurinhas?`);
  return `https://wa.me/${digits}?text=${message}`;
}

function formatCodes(codes: string[], visibleCount = 2) {
  if (codes.length === 0) return "A combinar";

  const visibleCodes = codes.slice(0, visibleCount).join(", ");
  const remaining = codes.length - visibleCount;

  return remaining > 0 ? `${visibleCodes} +${remaining}` : visibleCodes;
}

export function MatchCard({ match }: { match: TradeMatch }) {
  const title = match.collector.full_name || "Colecionador";
  const whatsappDigits = match.collector.whatsapp?.replace(/\D/g, "") ?? "";
  const hasWhatsapp = whatsappDigits.length >= 10;

  return (
    <article className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-black text-deep">{title}</p>
          <p className="text-sm font-semibold text-ink/60">
            {[match.collector.neighborhood, match.collector.city].filter(Boolean).join(" · ") || "Local a combinar"}
          </p>
        </div>
        <span className={`rounded-full px-3 py-2 text-xs font-black ${match.kind === "perfect" ? "bg-field text-white" : "bg-gold text-deep"}`}>
          {match.kind === "perfect" ? "Match perfeito" : "Match simples"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-field/10 p-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-field">Você ganha</p>
          <p className="mt-2 text-lg font-black text-deep" title={match.youGain.join(", ")}>{formatCodes(match.youGain)}</p>
        </div>
        <div className="rounded-3xl bg-gold/25 p-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-deep/60">Você manda</p>
          <p className="mt-2 text-lg font-black text-deep" title={match.youSend.join(", ")}>{formatCodes(match.youSend)}</p>
        </div>
      </div>

      {match.collector.exchange_point ? (
        <p className="rounded-2xl bg-ice px-4 py-3 text-sm font-bold text-ink/70">Ponto sugerido: {match.collector.exchange_point}</p>
      ) : null}

      {hasWhatsapp ? (
        <a
          href={whatsappUrl(whatsappDigits, title)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-14 items-center justify-center rounded-3xl bg-deep px-5 text-base font-black text-white shadow-soft"
        >
          Chamar no WhatsApp
        </a>
      ) : (
        <button type="button" disabled className="min-h-14 w-full rounded-3xl bg-ink/10 px-5 text-base font-black text-ink/50" aria-disabled="true">
          WhatsApp não informado
        </button>
      )}
    </article>
  );
}
