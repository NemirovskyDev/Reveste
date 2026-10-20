"use client";

import { Component, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useCanRender3D } from "./capabilities";
import { FRAMING } from "./rackConfig";
import { RackFallback } from "./RackFallback";
import { RackScene } from "./RackScene";
import type { ProgressSource, RackItem } from "./types";

export type RackCanvasProps = {
  progress: ProgressSource;
  items: readonly RackItem[];
  className?: string;
};

/** Se algo na cena lançar erro (shader, textura, contexto), cai para a versão estática. */
class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Decide sozinho entre a cena 3D e o SVG estático. O primeiro render (servidor e hidratação)
 * é sempre a versão estática; a cena entra depois que a checagem de capacidades roda no cliente.
 */
export function RackCanvas({ progress, items, className }: RackCanvasProps) {
  const canRender3D = useCanRender3D();
  // Em telas de toque, resolução menor: poupa GPU e bateria com pouca diferença visível.
  const coarse = useMediaQuery("(pointer: coarse)");
  const [contextLost, setContextLost] = useState(false);
  const fallback = <RackFallback items={items} className="h-full w-full" />;
  const wrapperClass = `relative ${className ?? ""}`.trim();

  if (!canRender3D || contextLost) {
    return (
      <div className={wrapperClass} aria-hidden="true">
        {fallback}
      </div>
    );
  }

  return (
    // A cena aceita arraste horizontal para girar (touch-action: pan-y deixa o gesto vertical rolar a página).
    <div className={wrapperClass} aria-hidden="true">
      <SceneBoundary fallback={fallback}>
        <Canvas
          frameloop="demand"
          dpr={coarse ? [1, 1.25] : [1, 1.75]}
          camera={{ fov: FRAMING.fov, near: 0.1, far: 60, position: [0, 2.2, 8] }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          tabIndex={-1}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.9;
            gl.outputColorSpace = SRGBColorSpace;
            // Contexto perdido (GPU reiniciada, muitas abas): volta para a versão estática.
            gl.domElement.addEventListener("webglcontextlost", () => setContextLost(true), { once: true });
          }}
        >
          <RackScene progress={progress} items={items} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
