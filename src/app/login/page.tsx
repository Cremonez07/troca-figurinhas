import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUserId } from "@/lib/stickers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const userId = await getCurrentUserId(supabase);

    if (userId) {
      redirect("/");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-deep p-5 text-white shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-gold">
          Entrar no TrocaCopa
        </p>

        <h2 className="mt-2 text-3xl font-black">
          Acesse seu álbum em segundos.
        </h2>

        <p className="mt-3 font-semibold text-white/75">
          Use sua conta Google para salvar figurinhas, completar seu perfil e encontrar trocas reais.
        </p>
      </section>

      <LoginForm />
    </div>
  );
}