import Link from "next/link";

const items = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/adicionar", label: "Adicionar", icon: "➕" },
  { href: "/album", label: "Álbum", icon: "📘" },
  { href: "/trocas", label: "Trocas", icon: "🤝" },
  { href: "/perfil", label: "Perfil", icon: "👤" }
] as const;

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-white/80 bg-deep/95 px-2 pt-2 text-white shadow-soft backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-16 flex-col items-center justify-center rounded-2xl px-1 text-[11px] font-bold active:bg-white/10"
          >
            <span className="text-xl" aria-hidden>
              {item.icon}
            </span>

            <span className="mt-1">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}