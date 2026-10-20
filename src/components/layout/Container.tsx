import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({
  as: Tag = "div",
  className,
  children,
  ...props
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
  "aria-labelledby"?: string;
}) {
  return (
    <Tag className={cn("mx-auto w-full max-w-[82rem] px-5 md:px-8", className)} {...props}>
      {children}
    </Tag>
  );
}

/** Título de página: h1 grande à esquerda, com parágrafo de apoio opcional. */
export function PageIntro({ title, lead, id = "titulo-pagina" }: { title: string; lead?: string; id?: string }) {
  return (
    <header className="pb-8 pt-10 md:pb-12 md:pt-16">
      <h1 id={id} className="max-w-4xl text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
        {title}
      </h1>
      {lead && <p className="mt-5 max-w-2xl text-lg text-ink-soft md:text-xl">{lead}</p>}
    </header>
  );
}
