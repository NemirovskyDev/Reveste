import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { FOOTER_NAV } from "@/lib/site";
import { MotionToggle } from "./MotionToggle";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-ink bg-lavender">
      <div className="mx-auto grid w-full max-w-[82rem] grid-cols-[minmax(0,1fr)] gap-12 px-5 py-14 md:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
        <div className="grid content-start gap-4">
          <Logo />
          <p className="max-w-sm text-ink-soft">
            Roupa de marca que sobrou vira o seu guarda-roupa do mês. Alugue, use e devolva.
          </p>
          <div className="mt-2 max-w-sm">
            <h2 className="mb-3 font-display text-xl font-bold">Receba as novidades</h2>
            <NewsletterForm />
          </div>
          <div className="mt-4">
            <MotionToggle variant="footer" />
          </div>
        </div>

        <nav aria-label="Rodapé" className="grid gap-10 sm:grid-cols-3">
          {FOOTER_NAV.map((group) => (
            <div key={group.title}>
              <h2 className="mb-3 font-display text-lg font-bold">{group.title}</h2>
              <ul className="grid gap-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-[82rem] px-5 py-5 text-sm text-ink-soft md:px-8">
          © 2026 Reveste. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
