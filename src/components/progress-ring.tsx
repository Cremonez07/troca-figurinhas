export function ProgressRing({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="relative grid h-32 w-32 place-items-center rounded-full bg-white shadow-soft">
      <div
        className="absolute inset-2 rounded-full"
        style={{ background: `conic-gradient(#19A974 ${clamped * 3.6}deg, #E2E8F0 0deg)` }}
      />
      <div className="relative grid h-24 w-24 place-items-center rounded-full bg-ice text-center">
        <span className="text-3xl font-black text-deep">{clamped}%</span>
      </div>
    </div>
  );
}
