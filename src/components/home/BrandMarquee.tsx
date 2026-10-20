import { BRANDS } from "@/data/catalog";

/**
 * Faixa de marcas que corre sem parar. A lista é repetida para o laço fechar sem salto; a cópia fica
 * escondida de leitores de tela. Com movimento reduzido, a cópia some e a faixa vira uma lista parada.
 */
export function BrandMarquee() {
  return (
    <section aria-label="Marcas do catálogo" className="overflow-hidden border-y-2 border-ink bg-lavender py-6">
      <div className="marquee">
        {[false, true].map((copy) => (
          <ul
            key={String(copy)}
            aria-hidden={copy || undefined}
            className={`marquee-track font-display text-2xl font-extrabold tracking-[-0.02em] ${copy ? "marquee-copy" : ""}`}
          >
            {BRANDS.map((brand) => (
              <li key={brand.id} className="flex items-center gap-x-10">
                {brand.name}
                <span aria-hidden="true" className="text-xl">
                  ✦
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
