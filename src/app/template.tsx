import { ViewTransition, type ReactNode } from "react";

// Um template é remontado a cada navegação: a página antiga sai com fade e a nova sobe suavemente
// (as regras `page-out` e `page-in` estão em globals.css). Sem suporte do navegador, a troca é imediata.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
