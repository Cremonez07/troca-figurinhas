import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-deep p-5 text-white shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-gold">Login simples</p>
        <h2 className="mt-2 text-3xl font-black">Entre com link mágico.</h2>
        <p className="mt-3 font-semibold text-white/75">Use Supabase Auth para guardar seu álbum e encontrar colecionadores.</p>
      </section>
      <LoginForm />
    </div>
  );
}
