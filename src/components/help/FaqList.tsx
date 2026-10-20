import { Icon } from "@/components/ui/Icon";
import type { FaqItem } from "@/content/faq";

/** Perguntas em <details> nativo: abre e fecha por teclado e leitor de tela sem JavaScript. */
export function FaqList({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="border-t-2 border-ink">
      {items.map((item) => (
        <details key={item.id} className="group border-b-2 border-ink">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
            {item.question}
            <Icon name="chevron-down" className="shrink-0 transition-transform duration-300 ease-out-expo group-open:rotate-180" />
          </summary>
          <p className="max-w-3xl pb-5 text-ink-soft">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
