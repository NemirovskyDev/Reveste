"use client";

import { setUserMotionOff, useOsReducedMotion, useUserMotionOff } from "@/lib/motion";

/**
 * Interruptor das animações do site. Existe porque movimento que começa sozinho e dura mais de 5 segundos precisa
 * de um jeito de pausar, e porque quem está com "reduzir movimento" no sistema recebe um site parado sem saber o motivo.
 *
 * - `bar`: botão pequeno na faixa de avisos do topo (só aparece quando dá para pausar).
 * - `footer`: linha no rodapé; mostra o estado e, se o sistema pede menos movimento, explica por que está parado.
 */
export function MotionToggle({ variant }: { variant: "bar" | "footer" }) {
  const osReduced = useOsReducedMotion();
  const userOff = useUserMotionOff();

  if (variant === "bar") {
    // Com o sistema já pedindo menos movimento não há nada em movimento para pausar.
    if (osReduced) return null;
    return (
      <div className="absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-peach from-70% to-transparent pl-8 pr-2 sm:pr-4">
        <button
          type="button"
          onClick={() => setUserMotionOff(!userOff)}
          className="inline-flex min-h-6 items-center gap-1.5 rounded-full border border-ink/40 bg-canvas/80 px-2.5 text-xs font-bold hover:bg-canvas"
        >
          <span aria-hidden="true">{userOff ? "▶" : "❚❚"}</span>
          {userOff ? "Retomar animações" : "Pausar animações"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm text-sm">
      <p className="font-bold">Animações</p>
      {osReduced ? (
        <p className="mt-1 text-ink-soft">
          Seu sistema pede menos movimento, então o site está parado. Para ver as animações, ative &quot;Mostrar animações no
          Windows&quot; (ou o equivalente no seu sistema) e recarregue a página.
        </p>
      ) : (
        <>
          <p className="mt-1 text-ink-soft">
            {userOff ? "Desligadas neste navegador." : "Ligadas: faixas, vídeos e cenas 3D se movem sozinhos."}
          </p>
          <button
            type="button"
            onClick={() => setUserMotionOff(!userOff)}
            className="mt-2 inline-flex min-h-11 items-center rounded-full border-2 border-ink px-5 font-bold hover:bg-canvas"
          >
            {userOff ? "Ligar animações" : "Desligar animações"}
          </button>
        </>
      )}
    </div>
  );
}
