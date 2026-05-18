export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-deep/15 bg-ice p-6 text-center">
      <p className="text-lg font-black text-deep">{title}</p>
      <p className="mt-2 text-sm font-semibold text-ink/70">{description}</p>
    </div>
  );
}
