"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import { MathUtils, type Group, type Material, type PerspectiveCamera } from "three";
import { getPiece } from "@/data/catalog";
import { Mannequin, type Outfit } from "./Mannequin";
import type { ProgressSource } from "./types";

const color = (id: string) => getPiece(id).color;

/** Primeiro look (sai) e segundo look (entra), com as cores das peças do catálogo. */
const LOOK_A: { female: Outfit; male: Outfit } = {
  female: { dress: color("renner-vestido") },
  male: { top: color("ca-camisa"), bottom: color("riachuelo-calca") },
};
const LOOK_B: { female: Outfit; male: Outfit } = {
  female: { top: color("zara-blazer"), skirt: color("farm-saia") },
  male: { top: color("ca-jaqueta"), bottom: color("mango-trench") },
};

/** Meia distância entre os manequins e profundidade do arco da troca, em metros. */
const SPREAD = 0.75;
const ARC_DEPTH = 0.4;
/** Largura da cena que sempre deve caber (dois manequins mais o arco da troca) e distância mínima da câmera. */
const FIT_WIDTH = 2.7;
const MIN_DISTANCE = 5.4;
/** Giro contínuo de vitrine, em radianos por segundo. */
const SPIN_SPEED = 0.5;
/** Quanto a roupa sobe (ao sair) ou sobe de baixo (ao entrar) enquanto some ou aparece, em metros. */
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

  const female = useRef<Group>(null);
  const male = useRef<Group>(null);
  const femaleGarments = useRef<GarmentRefs>({ a: null, b: null });
  const maleGarments = useRef<GarmentRefs>({ a: null, b: null });

  const aspect = useThree((state) => state.size.width / Math.max(state.size.height, 1));

  // Em telas estreitas a câmera recua até caberem os dois manequins lado a lado, em vez de cortá-los.
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
    // Os manequins trocam de lado num arco: um passa pela frente e o outro por trás.
    const t = MathUtils.smoothstep(p, 0.12, 0.88);
    const angle = Math.PI * t;
    const swing = Math.sin(angle);

    // Balanço de peso quase imperceptível: tira a rigidez de estátua sem distrair.
    const sway = Math.sin(time * 0.9) * 0.012;
    const bob = Math.sin(time * 1.6) * 0.004;

    if (female.current) {
      female.current.position.set(-SPREAD * Math.cos(angle), bob, ARC_DEPTH * swing);
      female.current.rotation.set(0, 0.25 + swing * 0.35 + spin.current, sway);
    }
    if (male.current) {
      male.current.position.set(SPREAD * Math.cos(angle), -bob, -ARC_DEPTH * swing);
      male.current.rotation.set(0, -0.25 - swing * 0.35 - spin.current, -sway);
    }

    // O look antigo sai, há uma pausa com o corpo à mostra, e o novo entra.
    const out = 1 - MathUtils.smoothstep(p, 0.25, 0.42);
    const enter = MathUtils.smoothstep(p, 0.52, 0.7);
    setGarment(femaleGarments.current.a, out, 1);
    setGarment(femaleGarments.current.b, enter, -1);
    setGarment(maleGarments.current.a, out, 1);
    setGarment(maleGarments.current.b, enter, -1);
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
      <mesh position={[0, -0.005, 0]} rotation-x={-Math.PI / 2} scale={[1.7, 1, 1]}>
        <circleGeometry args={[0.95, 48]} />
        <meshBasicMaterial color="#d9ccf0" transparent opacity={0.45} />
      </mesh>
      {/* Sombra suave de contato embaixo dos pés: ancora os manequins no chão. */}
      <ContactShadows position={[0, 0.002, 0]} opacity={0.5} scale={5} blur={2.6} far={1.4} resolution={512} color="#4b3f63" />
      <group ref={female}>
        <Mannequin type="female" outfit={LOOK_A.female} garmentRef={(node) => void (femaleGarments.current.a = node)} />
        <Mannequin type="female" skin={false} outfit={LOOK_B.female} garmentRef={(node) => void (femaleGarments.current.b = node)} />
      </group>
      <group ref={male}>
        <Mannequin type="male" outfit={LOOK_A.male} garmentRef={(node) => void (maleGarments.current.a = node)} />
        <Mannequin type="male" skin={false} outfit={LOOK_B.male} garmentRef={(node) => void (maleGarments.current.b = node)} />
      </group>
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
