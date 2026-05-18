import { ReactNode } from "react";

export function SectionCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-deep">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
