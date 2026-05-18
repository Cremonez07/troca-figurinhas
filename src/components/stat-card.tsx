import { ReactNode } from "react";

export function StatCard({ label, value, hint, tone = "light" }: { label: string; value: ReactNode; hint?: string; tone?: "light" | "gold" | "green" }) {
  const tones = {
    light: "bg-white text-deep",
    gold: "bg-gold text-deep",
    green: "bg-field text-white"
  };

  return (
    <article className={`${tones[tone]} rounded-[1.75rem] p-4 shadow-soft`}>
      <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">{label}</p>
      <div className="mt-2 text-3xl font-black tracking-tight">{value}</div>
      {hint ? <p className="mt-1 text-sm font-semibold opacity-75">{hint}</p> : null}
    </article>
  );
}
