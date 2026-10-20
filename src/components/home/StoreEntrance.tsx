"use client";

import { motion, useInView, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { assetUrl } from "@/lib/assets";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/** Duração do vídeo (s) enquanto ele não informa a própria; o arquivo entrada-loja.mp4 tem 10 s. */
const FALLBACK_DURATION = 10;
/** Margem no início e no fim da rolagem em que o vídeo fica parado no primeiro e no último quadro. */
const HOLD = 0.04;

const POSTER_START = assetUrl("/images/loja/fachada.webp");
const POSTER_END = assetUrl("/images/loja/interior.webp");

/** Legendas: cada uma entra e sai em uma faixa da rolagem (faixas em ordem crescente e dentro de 0 a 1). */
function useCaption(progress: MotionValue<number>, points: number[], opacities: number[]) {
  const opacity = useTransform(progress, points, opacities);
  const y = useTransform(progress, points, opacities.map((o) => (1 - o) * 28));
  return { opacity, y };
}

const CAPTION_CLASS =
  "absolute bottom-6 left-0 max-w-lg rounded-card border-2 border-ink bg-canvas/90 p-5 backdrop-blur-sm md:bottom-10 md:p-7";

/** Versão sem movimento: a foto da loja e as mesmas mensagens em lista, tudo visível de uma vez. */
function StaticEntrance() {
  return (
    <section aria-labelledby="entrada-titulo" className="py-16 md:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-card border-2 border-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSTER_END} alt="" width={1600} height={893} loading="lazy" decoding="async" className="block aspect-[16/9] w-full object-cover" />
          <div className="absolute bottom-4 left-4 right-4 max-w-lg rounded-card border-2 border-ink bg-canvas/90 p-5 md:bottom-8 md:left-8 md:p-7">
            <h2 id="entrada-titulo" className="font-display text-2xl font-extrabold leading-tight md:text-3xl">
              Entre na Reveste.
            </h2>
            <p className="mt-2 text-ink-soft">Peças de C&amp;A, Renner, Riachuelo, Zara, Mango e Farm. Escolha 4 por mês e experimente em casa.</p>
            <div className="mt-4">
              <ButtonLink href="/catalogo" iconAfter="arrow-right">
                Ver o catálogo
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * "Entrar na loja": um vídeo preso à rolagem. Conforme a página desce, o vídeo avança (a câmera atravessa a
 * porta e anda até os provadores) e as legendas aparecem no caminho. O vídeo só começa a baixar quando a seção
 * se aproxima da tela e nunca toca sozinho: a rolagem escolhe o quadro.
 */
function ScrubEntrance() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const target = useRef(0);
  const frame = useRef(0);
  const near = useInView(section, { margin: "700px 0px 700px 0px", once: true });
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  // O laço que leva o vídeo ao quadro pedido fica numa ref para poder chamar a si mesmo no próximo quadro de tela.
  const stepRef = useRef<() => void>(() => {});
  useEffect(() => {
    stepRef.current = () => {
      frame.current = 0;
      const el = video.current;
      if (!el || !Number.isFinite(el.duration)) return;
      const wanted = target.current;
      if (!el.seeking && Math.abs(el.currentTime - wanted) > 0.02) el.currentTime = wanted;
      // Enquanto o vídeo não chega no quadro pedido, tenta de novo no próximo quadro de tela.
      if (Math.abs(el.currentTime - wanted) > 0.02) frame.current = requestAnimationFrame(() => stepRef.current());
    };
  });

  const schedule = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(() => stepRef.current());
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const duration = video.current?.duration;
    const length = Number.isFinite(duration) && duration ? duration : FALLBACK_DURATION;
    const progress = Math.min(1, Math.max(0, (value - HOLD) / (1 - 2 * HOLD)));
    target.current = progress * length;
    schedule();
  });

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const first = useCaption(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const second = useCaption(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const third = useCaption(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1]);
  const cue = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const [lastActive, setLastActive] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (value) => setLastActive(value > 0.72));

  return (
    <section ref={section} aria-labelledby="entrada-titulo" className="relative h-[320dvh]">
      <div className="sticky top-[6.75rem] h-[calc(100dvh-6.75rem)] overflow-hidden bg-ink">
        {/* Capa: aparece enquanto o vídeo não carrega e some quando o primeiro quadro está pronto. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSTER_START} alt="" width={1600} height={893} decoding="async" className="absolute inset-0 size-full object-cover" />
        <video
          ref={video}
          // Só põe o arquivo no <video> quando a seção está perto, para não pesar a carga inicial da página.
          src={near ? assetUrl("/videos/entrada-loja.mp4") : undefined}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onLoadedData={() => setReady(true)}
          onSeeked={schedule}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
        />

        <Container className="relative z-10 size-full">
          <div className="relative size-full">
            {/* Todo o texto fica na árvore de acessibilidade; só o link da última legenda recebe foco quando ela está em cena. */}
            <motion.div style={{ opacity: first.opacity, y: first.y }} className={CAPTION_CLASS}>
              <h2 id="entrada-titulo" className="font-display text-3xl font-extrabold leading-tight md:text-5xl">
                Entre na Reveste.
              </h2>
              <p className="mt-2 text-ink-soft">Role para atravessar a porta.</p>
            </motion.div>
            <motion.p style={{ opacity: second.opacity, y: second.y }} className={`${CAPTION_CLASS} font-display text-2xl font-extrabold leading-tight md:text-4xl`}>
              Peças de C&amp;A, Renner, Riachuelo, Zara, Mango e Farm, penduradas e prontas para você.
            </motion.p>
            <motion.div style={{ opacity: third.opacity, y: third.y }} className={CAPTION_CLASS}>
              <p className="font-display text-2xl font-extrabold leading-tight md:text-4xl">Escolha 4 por mês. Experimente em casa.</p>
              <div inert={!lastActive} className="mt-4">
                <ButtonLink href="/assinatura" iconAfter="arrow-right">
                  Montar meu plano
                </ButtonLink>
              </div>
            </motion.div>
          </div>
        </Container>

        <motion.div aria-hidden="true" style={{ opacity: cue }} className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 rounded-full bg-canvas/85 px-4 py-1 text-sm font-medium md:block">
          Role para entrar
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Seção "Entre na loja". Quem pediu menos movimento recebe a versão estática; o contêiner externo é o mesmo nos
 * dois casos para a troca depois da hidratação não mexer nos vizinhos da página.
 */
/** Aparelho fraco ou economia de dados: sem baixar 4,7 MB de vídeo nem ficar pulando quadros. */
function isLightDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (
    (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2) ||
    (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) ||
    nav.connection?.saveData === true
  );
}
const subscribeNothing = () => () => {};

export function StoreEntrance() {
  const reduced = usePrefersReducedMotion();
  const light = useSyncExternalStore(subscribeNothing, isLightDevice, () => false);
  return <div>{reduced || light ? <StaticEntrance /> : <ScrubEntrance />}</div>;
}
