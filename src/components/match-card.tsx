"use client";

import { registerExchangeIntentAction } from "@/app/actions";
import type { TradeMatch } from "@/lib/stickers";

function whatsappMessage(name: string | null, match: TradeMatch) {
  const gain = match.youGain.length ? match.youGain.join(", ") : "algumas figurinhas";
  const send = match.youSend.length ? match.youSend.join(", ") : "algumas repetidas";

  return `Oi${name ? `, ${name}` : ""}! Vi nosso match no TrocaCopa. Eu preciso de ${gain} e posso trocar ${send}. Vamos combinar?`;
}

function whatsappUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function CodeList({ codes, emptyLabel }: { codes: string[]; emptyLabel: string }) {
  if (codes.length === 0) {
    return <p className="text-sm font-bold text-ink/50">{emptyLabel}</p>;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {codes.slice(0, 6).map((code) => (
        <span
          key={code}
          className="rounded-full bg-white px-3 py-2 text-sm font-black text-deep shadow-sm"
        >
          {code}
        </span>
      ))}

      {codes.length > 6 ? (
        <span className="rounded-full bg-white px-3 py-2 text-sm font-black text-deep shadow-sm">
          +{codes.length - 6}
        </span>
      ) : null}
    </div>
  );
}

export function MatchCard({ match }: { match: TradeMatch }) {
  const title = match.collector.full_name || "Colecionador";
  const whatsappDigits = match.collector.whatsapp?.replace(/\D/g, "") ?? "";
  const hasWhatsapp = whatsappDigits.length >= 10;
  const isPerfect = match.kind === "perfect";
  const message = whatsappMessage(title, match);
  const url = whatsappUrl(whatsappDigits, message);
  const matchScore = match.youGain.length + match.youSend.length;

  function handleWhatsappClick() {
    void registerExchangeIntentAction({
      toUserId: match.collector.id,
      matchScore,
      whatsappMessage: message
    });
  }

  return (
    <article className="space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-black text-deep">{title}</p>

          <p className="text-sm font-semibold text-ink/60">
            {[match.collector.neighborhood, match.collector.city]
              .filter(Boolean)
              .join(" · ") || "Local a combinar"}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${
            isPerfect ? "bg-field text-white" : "bg-gold text-deep"
          }`}
        >
          {isPerfect ? "Troca dupla" : "Oportunidade"}
        </span>
      </div>

      <div className="space-y-3">
        <div className="rounded-3xl bg-field/10 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-field">
            Você recebe
          </p>

          <CodeList
            codes={match.youGain}
            emptyLabel="Essa pessoa ainda não tem repetida que você precisa."
          />
        </div>

        <div className="rounded-3xl bg-gold/25 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-deep/60">
            Você entrega
          </p>

          <CodeList
            codes={match.youSend}
            emptyLabel="Você ainda não tem repetida que essa pessoa precisa."
          />
        </div>
      </div>

      {match.collector.exchange_point ? (
        <p className="rounded-2xl bg-ice px-4 py-3 text-sm font-bold text-ink/70">
          Ponto sugerido: {match.collector.exchange_point}
        </p>
      ) : null}

      {hasWhatsapp ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsappClick}
          className="flex min-h-14 items-center justify-center rounded-3xl bg-deep px-5 text-base font-black text-white shadow-soft"
        >
          Chamar no WhatsApp
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="min-h-14 w-full rounded-3xl bg-ink/10 px-5 text-base font-black text-ink/50"
          aria-disabled="true"
        >
          WhatsApp não informado
        </button>
      )}
    </article>
  );
}