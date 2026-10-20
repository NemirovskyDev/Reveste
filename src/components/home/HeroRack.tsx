"use client";

import dynamic from "next/dynamic";
import { useCanRender3D } from "@/components/three/capabilities";
import { RackFallback } from "@/components/three/RackFallback";
import type { ProgressSource, RackItem } from "@/components/three/types";

type Props = { progress: ProgressSource; items: readonly RackItem[]; className?: string };

// A cena 3D (three.js + react-three-fiber) é pesada: só é baixada no cliente e fora do caminho crítico.
// Enquanto carrega, aparece a arara estática, então não há salto de layout.
const RackCanvas = dynamic(() => import("@/components/three/RackCanvas").then((module) => module.RackCanvas), {
  ssr: false,
  loading: () => null,
});

export function HeroRack({ progress, items, className }: Props) {
  // Quem pediu menos movimento, usa aparelho fraco ou não tem WebGL2 fica só com a arara estática
  // e nem baixa o three.js.
  const canRender3D = useCanRender3D();
  return (
    <div className={className}>
      <div className="relative size-full">
        <div className="absolute inset-0" aria-hidden="true">
          <RackFallback items={items} className="h-full w-full" />
        </div>
        {/* O RackCanvas já é `relative`; quem o posiciona é este contêiner, para as classes não brigarem. */}
        {canRender3D && (
          <div className="absolute inset-0">
            <RackCanvas progress={progress} items={items} className="size-full" />
          </div>
        )}
      </div>
    </div>
  );
}
