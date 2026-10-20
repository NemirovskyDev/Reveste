"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { MotionToggle } from "./MotionToggle";
import { cn } from "@/lib/cn";
import { MAIN_NAV } from "@/lib/site";
import { useCart } from "@/store/cart";
import { usePlan } from "@/store/plan";
import { useSession } from "@/store/session";

const TOP_NOTICES = [
  "Frete grátis na assinatura de 4 peças",
  "Escolha 4 peças por mês, use e devolva",
  "Alugue, assine ou compre: escolha o seu jeito de vestir",
  "Doe 3 roupas e ganhe de 15% a 50% de desconto",
  "Gostou? Compre descontando o que já pagou de aluguel",
] as const;

export function Header() {
  const pathname = usePathname();
  // O menu guarda em qual página foi aberto: ao navegar, `open` volta a falso sem precisar de efeito.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  const bagCount = useCart((state) => state.lines.length) + usePlan((state) => state.slots.length);
  const user = useSession((state) => state.user);
  const status = useSession((state) => state.status);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenOn(null);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const accountLabel = user ? `Olá, ${user.name.split(" ")[0]}` : "Entrar";

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className={cn("sticky top-0 z-40 bg-canvas transition-shadow duration-300", scrolled && "shadow-[0_1px_0_var(--color-line)]")}
    >
      {/* Faixa de avisos que corre; com movimento reduzido vira texto parado (ver .marquee no CSS). */}
      <div className="relative overflow-hidden bg-peach py-2 text-sm font-medium">
        <div className="marquee" style={{ animationDuration: "40s" }}>
          {[false, true].map((copy) => (
            <ul key={String(copy)} aria-hidden={copy || undefined} className={`marquee-track ${copy ? "marquee-copy" : ""}`}>
              {TOP_NOTICES.map((notice) => (
                <li key={notice} className="flex items-center gap-x-10">
                  {notice}
                  <span aria-hidden="true">✦</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
        <MotionToggle variant="bar" />
      </div>
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[82rem] items-center justify-between gap-4 px-5 md:px-8">
        <Logo />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center font-medium underline-offset-8 hover:underline"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href={user ? "/conta" : "/entrar"}
            className="hidden min-h-11 min-w-[8.5rem] items-center justify-end gap-2 rounded-full px-3 font-medium hover:bg-lavender/50 sm:inline-flex"
          >
            <Icon name="user" size={22} />
            {/* Antes de saber se há sessão o texto fica fora da vista (sr-only), mas continua dando nome ao link. */}
            <span className={cn(status === "idle" && "sr-only")}>{accountLabel}</span>
          </Link>
          <Link
            href="/sacola"
            className="relative inline-flex size-11 items-center justify-center rounded-full hover:bg-lavender/50"
            aria-label={bagCount > 0 ? `Sacola, ${bagCount} ${bagCount === 1 ? "peça" : "peças"}` : "Sacola vazia"}
          >
            <Icon name="bag" size={24} />
            {bagCount > 0 && (
              <span
                key={bagCount}
                aria-hidden="true"
                className="badge-pop absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full border-2 border-ink bg-blush px-1 text-[0.6875rem] font-bold leading-4"
              >
                {bagCount}
              </span>
            )}
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full hover:bg-lavender/50 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpenOn(open ? null : pathname)}
          >
            <Icon name={open ? "close" : "menu"} size={24} />
          </button>
        </div>
      </div>

      <nav
        id="menu-mobile"
        aria-label="Menu"
        hidden={!open}
        className="max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain border-t border-line bg-canvas px-5 pb-8 pt-4 lg:hidden"
      >
        <ul className="grid gap-1">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpenOn(null)}
                className="block rounded-control py-3 font-display text-2xl font-bold"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={user ? "/conta" : "/entrar"}
              onClick={() => setOpenOn(null)}
              className="block rounded-control py-3 font-display text-2xl font-bold"
            >
              {user ? "Minha conta" : "Entrar"}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
