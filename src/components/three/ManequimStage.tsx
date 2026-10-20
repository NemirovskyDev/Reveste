"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import { MathUtils, type Group, type Material, type PerspectiveCamera } from "three";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { CAST } from "./cast";
import { Mannequin } from "./Mannequin";
import { attachDragRotate, DRAG_RADIANS_PER_PIXEL } from "./drag";
import type { ProgressSource } from "./types";



/** Posição de cada pessoa em X (m) e quais duas trocam de lugar entre si. */
const SLOT_X = [-1.35, -0.45, 0.45, 1.35] as const;
const PAIRS = [
  [0, 1],
  [2, 3],
] as const;
/** Profundidade do arco da troca, em metros. */
const ARC_DEPTH = 0.4;
/** Largura da cena que sempre deve caber (quatro pessoas e os arcos) e distância mínima da câmera. */
const FIT_WIDTH = 4.1;
const MIN_DISTANCE = 5.4;
/** Giro contínuo de vitrine, em radianos por segundo. */
const SPIN_SPEED = 0.5;
/** Quanto a roupa sobe (ao sair) ou vem de baixo (ao entrar) enquanto some ou aparece, em metros. */
const DRIFT = 0.07;

type GarmentRefs = { a: Group | null; b: Group | null };

/**
 * Mostra uma roupa com opacidade `amount` (0 a 1): ela esmaece e desliza um pouco em vez de encolher.
 * `direction` define para onde ela se afasta (1 = sobe ao sair, -1 = vem de baixo ao entrar).
 */
function setGarment(group: Group | null, amount: number, direction: 1 | -1) {
  if (!group) return;
  const opacity = MathUtils.clamp(amount, 0, 1);
  group.visible = opacity > 0.01;
  group.position.y = (1 - opacity) * DRIFT * direction;
  group.traverse((object) => {
    const material = (object as { material?: Material | Material[] }).material;
    if (!material || Array.isArray(material)) return;
    material.transparent = opacity < 0.999;
    material.opacity = opacity;
    // Só escreve profundidade quando totalmente opaca, para o fade não "recortar" o corpo atrás.
    material.depthWrite = opacity >= 0.999;
  });
}

function Scene({ progress, spinning, throttle }: { progress: ProgressSource; spinning: boolean; throttle: boolean }) {
  const spin = useRef(0);
  /** Giro dado por quem arrasta o dedo ou o mouse; volta devagar a zero depois de soltar. */
  const drag = useRef({ offset: 0, active: false });
  const timer = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const aspect = useThree((state) => state.size.width / Math.max(state.size.height, 1));

  const figures = useRef<(Group | null)[]>([]);
  const garments = useRef<GarmentRefs[]>(CAST.map(() => ({ a: null, b: null })));

  // Em telas estreitas a câmera recua até caberem todos lado a lado, em vez de cortá-los.
  useLayoutEffect(() => {
    const halfFov = MathUtils.degToRad(camera.fov / 2);
    const distanceToFitWidth = FIT_WIDTH / (2 * Math.tan(halfFov) * aspect);
    camera.position.set(0, 1.0, Math.max(MIN_DISTANCE, distanceToFitWidth));
    camera.lookAt(0, 0.85, 0);
    invalidate();
  }, [camera, aspect, invalidate]);

  // O modo `demand` não renderiza sozinho: cada mudança de progresso pede um frame.
  useEffect(() => progress.on("change", invalidate), [progress, invalidate]);

  // Giro por arraste: o gesto horizontal gira todos; o vertical continua rolando a página (touch-action: pan-y).
  const domElement = useThree((state) => state.gl.domElement);
  useEffect(() => {
    const state = drag.current;
    const detach = attachDragRotate(domElement, {
      onStart: () => {
        state.active = true;
        invalidate();
      },
      onMove: (dx) => {
        state.offset += dx * DRAG_RADIANS_PER_PIXEL;
        invalidate();
      },
      onEnd: () => {
        state.active = false;
        invalidate();
      },
    });
    return () => {
      detach();
      window.clearTimeout(timer.current);
    };
  }, [domElement, invalidate]);

  useFrame((state, delta) => {
    // O giro só avança enquanto a cena está na tela (spinning) e ninguém arrasta; fora dela o ângulo fica parado.
    if (spinning && !drag.current.active) spin.current = (spin.current + Math.min(delta, 0.1) * SPIN_SPEED) % (Math.PI * 2);
    if (!drag.current.active) drag.current.offset = MathUtils.damp(drag.current.offset, 0, 0.6, Math.min(delta, 0.1));
    const yaw = spin.current + drag.current.offset;
    const time = spinning ? state.clock.elapsedTime : 0;
    const p = MathUtils.clamp(progress.get(), 0, 1);
    // Cada par troca de lugar num arco: um passa pela frente e o outro por trás.
    const t = MathUtils.smoothstep(p, 0.12, 0.88);
    const angle = Math.PI * t;
    const swing = Math.sin(angle);

    PAIRS.forEach(([left, right], pairIndex) => {
      const center = (SLOT_X[left] + SLOT_X[right]) / 2;
      const half = (SLOT_X[right] - SLOT_X[left]) / 2;
      const depth = (pairIndex % 2 === 0 ? 1 : -1) * ARC_DEPTH * swing;
      // Balanço de peso quase imperceptível: tira a rigidez de estátua sem distrair.
      const sway = Math.sin(time * 0.9 + pairIndex) * 0.012;
      const bob = Math.sin(time * 1.6 + pairIndex) * 0.004;
      const a = figures.current[left];
      const b = figures.current[right];
      if (a) {
        a.position.set(center - half * Math.cos(angle), bob, depth);
        a.rotation.set(0, 0.25 + swing * 0.35 + yaw, sway);
      }
      if (b) {
        b.position.set(center + half * Math.cos(angle), -bob, -depth);
        b.rotation.set(0, -0.25 - swing * 0.35 - yaw, -sway);
      }
    });

    // O look antigo sai, há uma pausa com o corpo à mostra, e o novo entra.
    const out = 1 - MathUtils.smoothstep(p, 0.25, 0.42);
    const enter = MathUtils.smoothstep(p, 0.52, 0.7);
    garments.current.forEach((refs) => {
      setGarment(refs.a, out, 1);
      setGarment(refs.b, enter, -1);
    });

    // Em telas de toque o giro contínuo pede no máximo ~30 quadros por segundo; o arraste devolvendo também precisa de quadros.
    if (throttle && (spinning || Math.abs(drag.current.offset) > 0.001) && !timer.current) {
      timer.current = window.setTimeout(() => {
        timer.current = 0;
        invalidate();
      }, 33);
    }
  });

  return (
    <>
      {/* Ambiente de estúdio montado com painéis de luz: nada é baixado da internet e é calculado uma única vez. */}
      <Environment resolution={256} frames={1} environmentIntensity={0.85}>
        <Lightformer form="rect" intensity={2.4} color="#fffaf4" position={[0, 5, 3]} scale={[9, 4, 1]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={1} color="#e6dcff" position={[-5, 2, -1]} scale={[3, 6, 1]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={1.2} color="#ffe9d6" position={[5, 1.5, 2]} scale={[2.5, 5, 1]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[0, 1, -5]} scale={[8, 3, 1]} target={[0, 1, 0]} />
      </Environment>
      <hemisphereLight args={["#ffffff", "#d9cfee", 0.35]} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.1} color="#fffaf4" />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#e6dcff" />
      <mesh position={[0, -0.005, 0]} rotation-x={-Math.PI / 2} scale={[3, 1, 1]}>
        <circleGeometry args={[0.95, 48]} />
        <meshBasicMaterial color="#d9ccf0" transparent opacity={0.45} />
      </mesh>
      {/* Sombra suave de contato embaixo dos pés: ancora os manequins no chão. */}
      <ContactShadows position={[0, 0.002, 0]} opacity={0.5} scale={7} blur={2.6} far={1.4} resolution={512} color="#4b3f63" />
      {CAST.map((person, index) => (
        <group key={person.id} ref={(node) => void (figures.current[index] = node)} position={[SLOT_X[index], 0, 0]} scale={[person.build.w, person.build.h, person.build.w]}>
          <Mannequin
            type={person.type}
            skinColor={person.skin}
            shoes={person.shoes}
            hair={person.hair}
            outfit={person.looks[0]}
            garmentRef={(node) => void (garments.current[index].a = node)}
          />
          <Mannequin
            type={person.type}
            skinColor={person.skin}
            shoes={person.shoes}
            hair={person.hair}
            skin={false}
            outfit={person.looks[1]}
            garmentRef={(node) => void (garments.current[index].b = node)}
          />
        </group>
      ))}
    </>
  );
}

export function ManequimStage({ progress, spinning = false }: { progress: ProgressSource; spinning?: boolean }) {
  // Em telas de toque: resolução menor e giro limitado a ~30 quadros por segundo.
  const coarse = useMediaQuery("(pointer: coarse)");
  return (
    <Canvas
      frameloop={spinning && !coarse ? "always" : "demand"}
      dpr={coarse ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 1.0, 5.4], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene progress={progress} spinning={spinning} throttle={coarse} />
    </Canvas>
  );
}
