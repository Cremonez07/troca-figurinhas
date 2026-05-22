import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { OnboardingModal } from "@/components/onboarding-modal";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrocaCopa",
  description: "Trocas reais de figurinhas da Copa entre colecionadores."
};

export const viewport: Viewport = {
  themeColor: "#12355B",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-ice/80 shadow-soft">
          <header className="sticky top-0 z-20 border-b border-white/70 bg-ice/90 px-5 py-4 backdrop-blur">
            <Link
              href="/"
              className="flex touch-manipulation items-center justify-between rounded-3xl transition active:scale-[0.99]"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-field">
                  TrocaCopa
                </p>

                <h1 className="text-2xl font-black tracking-tight text-deep">
                  Troque figurinhas
                </h1>
              </div>

              <div
                className="grid h-12 w-12 place-items-center rounded-2xl bg-gold text-2xl shadow-soft"
                aria-hidden
              >
                ⚽
              </div>
            </Link>
          </header>

          <main className="flex-1 px-5 pb-28 pt-5">{children}</main>

          <BottomNav />
          <OnboardingModal />
        </div>
      </body>
    </html>
  );
}