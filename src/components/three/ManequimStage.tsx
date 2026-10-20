"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import { MathUtils, type Group, type Material, type PerspectiveCamera } from "three";
import { getPiece } from "@/data/catalog";
import { GARMENT_PHOTO_COLOR } from "./garmentPhotos";
import { Mannequin, type BodyType, type Garment, type Hair, type Outfit } from "./Mannequin";
import type { ProgressSource } from "./types";

/** Peça do catálogo como roupa do manequim: cor média da foto (para a roupa lisa combinar) e a própria foto. */
const wear = (id: string): Garment => ({ color: GARMENT_PHOTO_COLOR[id] ?? getPiece(id).color, photo: id });

type Person = {
  id: string;
  type: BodyType;
  skin: string;
  lip: string;
  hair: Hair;
  /** Cor dos sapatos. */
  shoes: string;
  /** Proporção desta pessoa: largura e altura em relação ao corpo-base. */
  build: { w: number; h: number };
  /** Primeiro look (sai) e segundo look (entra). */
  looks: [Outfit, Outfit];
};

/**
 * Elenco: duas mulheres e dois homens, brancos e negros. Cada par vizinho (0 e 1, 2 e 3) troca de lugar
 * enquanto as roupas mudam.
 */
const CAST: readonly Person[] = [
  {
    id: "mulher-branca",
    type: "female",
    skin: "#f0c9ae",
    lip: "#c4756c",
    shoes: "#f3f1ec",
    build: { w: 0.97, h: 1 },
    hair: { style: "long", color: "#e2c17a" },
    looks: [
      { dress: { ...wear("renner-vestido"), hemY: 0.5, hemRadius: 0.27, fold: { count: 16, amp: 0.03 } } },
      { top: { ...wear("zara-blazer"), sleeve: "long" }, skirt: { ...wear("farm-saia"), hemY: 0.5, hemRadius: 0.3, fold: { count: 12, amp: 0.04 } } },
    ],
  },
  {
    id: "homem-negro",
    type: "male",
    skin: "#6a4330",
    lip: "#4a2a22",
    shoes: "#efece6",
    build: { w: 1.02, h: 1.05 },
    hair: { style: "crop", color: "#17110e" },
    looks: [
      { top: { ...wear("ca-camisa"), sleeve: "short" }, bottom: wear("riachuelo-calca") },
      { top: { ...wear("ca-jaqueta"), sleeve: "long" }, bottom: wear("mango-calca") },
    ],
  },
  {
    id: "mulher-negra",
    type: "female",
    skin: "#5d3b2a",
    lip: "#45241d",
    shoes: "#b98763",
    build: { w: 1.05, h: 1.03 },
    hair: { style: "puff", color: "#17110e" },
    looks: [
      { dress: { ...wear("farm-vestido"), hemY: 0.1, hemRadius: 0.34, fold: { count: 18, amp: 0.035 } } },
      { top: { ...wear("renner-blazer"), sleeve: "long" }, skirt: { ...wear("ca-saia"), hemY: 0.55, hemRadius: 0.28, fold: { count: 44, amp: 0.022 } } },
    ],
  },
  {
    id: "homem-branco",
    type: "male",
    skin: "#efc7a8",
    lip: "#b9685f",
    shoes: "#5a3d2b",
    build: { w: 0.98, h: 1 },
    hair: { style: "cap", color: "#8a4b2a" },
    looks: [
      { top: { ...wear("riachuelo-camisa"), sleeve: "long" }, bottom: wear("renner-calca") },
      { top: { ...wear("zara-camisa"), sleeve: "long" }, bottom: wear("mango-calca") },
    ],
  },
];

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

function Scene({ progress, spinning }: { progress: ProgressSource; spinning: boolean }) {
  const spin = useRef(0);
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

  useFrame((state, delta) => {
    // O giro só avança enquanto a cena está na tela (spinning); fora dela o ângulo fica parado.
    if (spinning) spin.current = (spin.current + Math.min(delta, 0.1) * SPIN_SPEED) % (Math.PI * 2);
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
        a.rotation.set(0, 0.25 + swing * 0.35 + spin.current, sway);
      }
      if (b) {
        b.position.set(center + half * Math.cos(angle), -bob, -depth);
        b.rotation.set(0, -0.25 - swing * 0.35 - spin.current, -sway);
      }
    });

    // O look antigo sai, há uma pausa com o corpo à mostra, e o novo entra.
    const out = 1 - MathUtils.smoothstep(p, 0.25, 0.42);
    const enter = MathUtils.smoothstep(p, 0.52, 0.7);
    garments.current.forEach((refs) => {
      setGarment(refs.a, out, 1);
      setGarment(refs.b, enter, -1);
    });
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
            lipColor={person.lip}
            shoes={person.shoes}
            hair={person.hair}
            outfit={person.looks[0]}
            garmentRef={(node) => void (garments.current[index].a = node)}
          />
          <Mannequin
            type={person.type}
            skinColor={person.skin}
            lipColor={person.lip}
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
  return (
    <Canvas
      frameloop={spinning ? "always" : "demand"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.0, 5.4], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene progress={progress} spinning={spinning} />
    </Canvas>
  );
}
