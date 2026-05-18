import Link from "next/link";

export function SetupNotice() {
  const canShowTechnicalSetup = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SHOW_SETUP_NOTICE === "true";

  if (!canShowTechnicalSetup) return null;

  return (
    <div className="space-y-4 rounded-[2rem] bg-deep p-5 text-white shadow-soft">
      <p className="text-xl font-black">Conecte o Supabase</p>
      <p className="text-sm font-semibold text-white/75">
        Configure as variáveis públicas do Supabase no ambiente local para ativar login, CRUD e matches reais.
      </p>
      <Link href="/login" className="flex min-h-14 items-center justify-center rounded-3xl bg-gold px-5 font-black text-deep">
        Ver login
      </Link>
    </div>
  );
}
