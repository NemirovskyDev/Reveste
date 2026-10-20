"use client";

import { useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { assetUrl } from "@/lib/assets";
import { useLightDevice } from "@/lib/useLightDevice";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/** Trecho do arquivo que vale como laço: o close da arara (o começo do arquivo repete a entrada da loja). */
const LOOP_START = 10.8;
const LOOP_END = 19.8;

/**
 * Faixa com o close da arara em laço, de fundo para uma frase e um botão. O vídeo só começa a baixar quando a
 * faixa se aproxima da tela, só toca enquanto ela está visível e, para quem pediu menos movimento ou usa aparelho
 * fraco, fica parado no primeiro quadro do trecho.
 */
export function RackBand() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const near = useInView(section, { margin: "600px 0px 600px 0px", once: true });
  const visible = useInView(section);
  const reduced = usePrefersReducedMotion();
  const light = useLightDevice();
  const still = reduced || light;

  useEffect(() => {
    const el = video.current;
    if (!el || !near) return;
    if (visible && !still) void el.play().catch(() => {});
    else el.pause();
  }, [near, visible, still]);

  return (
    <section ref={section} aria-labelledby="arara-titulo" className="relative isolate overflow-hidden border-y-2 border-ink bg-ink">
      <video
        ref={video}
        // #t= faz o navegador mostrar já o primeiro quadro do trecho, mesmo sem tocar.
        src={near ? `${assetUrl("/videos/arara-cabides.mp4")}#t=${LOOP_START}` : undefined}
        muted
        playsInline
        preload={still ? "metadata" : "auto"}
        aria-hidden="true"
        tabIndex={-1}
        onLoadedMetadata={(event) => {
          event.currentTarget.currentTime = LOOP_START;
        }}
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= LOOP_END) event.currentTarget.currentTime = LOOP_START;
        }}
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-canvas/80 via-canvas/30 to-transparent" />
      <Container className="relative flex min-h-[26rem] items-center py-16 md:min-h-[32rem] md:py-24">
        <div className="max-w-xl rounded-card border-2 border-ink bg-canvas/90 p-6 backdrop-blur-sm md:p-9">
          <h2 id="arara-titulo" className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Peças que já existiam, prontas para a sua semana.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Do estoque que não foi vendido direto para o seu guarda-roupa, higienizadas e com frete grátis no plano.
          </p>
          <div className="mt-6">
            <ButtonLink href="/catalogo" iconAfter="arrow-right">
              Ver o catálogo
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
