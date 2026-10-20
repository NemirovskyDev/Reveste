import type { ReactNode } from "react";

// Um template é remontado a cada navegação; a classe faz a página entrar suavemente.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
