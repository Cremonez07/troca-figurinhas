import Link from "next/link";

const items = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/adicionar", label: "Adicionar", icon: "➕" },
  { href: "/trocas", label: "Trocas", icon: "🤝" },
  { href: "/perfil", label: "Perfil", icon: "👤" }
];

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-white/80 bg-deep/95 px-3 pt-2 text-white shadow-soft backdrop-blur">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex min-h-16 flex-col items-center justify-center rounded-2xl px-2 text-xs font-bold active:bg-white/10">
            <span className="text-xl" aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
