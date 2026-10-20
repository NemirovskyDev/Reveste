"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import {
  BackSide,
  CanvasTexture,
  MathUtils,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Group,
  type PerspectiveCamera,
  Vector2,
} from "three";
import { createGarmentMaterial, type GarmentUniforms } from "./garmentMaterial";
import { createGarmentTextures, type GarmentTextures } from "./garmentTexture";
import {
  createCasterGeometry,
  createFrameGeometry,
  createGarmentGeometry,
  createHangerGeometry,
  createRailGeometry,
  type GarmentGeometry,
} from "./rackGeometry";
import {
  FRAMING,
  GARMENT_DROP,
  MAX_GARMENT_SCALE,
  RAIL,
  ROTATION_DAMPING,
  SWAY_DECAY_SECONDS,
  SWAY_STRENGTH,
  TRACK,
  TURNS,
} from "./rackConfig";
import { computeHangerSlots, stadiumPerimeter } from "./rackLayout";
import type { ProgressSource, RackItem } from "./types";

type RackSceneProps = { progress: ProgressSource; items: readonly RackItem[] };

type Built = {
  garments: { geometry: GarmentGeometry; material: MeshPhysicalMaterial }[];
  textures: GarmentTextures[];
  hangerGeometry: ReturnType<typeof createHangerGeometry>;
};

/** Ângulo áureo: espalha as fases de balanço sem que duas peças vizinhas fiquem sincronizadas. */
const GOLDEN_ANGLE = 2.399963;
const MAX_FRAME_DT = 1 / 20;
/** Giro de vitrine em repouso, em radianos por segundo (uma volta a cada ~40 s). */
const IDLE_SPEED = 0.16;

const SHADOW_RADIUS = 1.35;

/** Gradiente radial lavanda-escuro que some nas bordas (a "sombra" sob a arara). */
function createShadowTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível para a sombra.");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(75,63,99,0.34)");
  gradient.addColorStop(0.45, "rgba(75,63,99,0.2)");
  gradient.addColorStop(1, "rgba(75,63,99,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

/** Escreve nos uniforms compartilhados (objetos mutáveis por design do Three, lidos pelo shader). */
function writeUniforms(uniforms: GarmentUniforms, time: number, energy: number) {
  uniforms.uTime.value = time;
  uniforms.uEnergy.value = energy;
}

/** Posiciona a câmera para caber a arara em qualquer proporção de tela (320 a 1920 px). */
function CameraRig() {
  const get = useThree((s) => s.get);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);

  useLayoutEffect(() => {
    const { camera, invalidate } = get();
    const cam = camera as PerspectiveCamera;
    const aspect = width / Math.max(height, 1);
    const halfV = Math.tan(MathUtils.degToRad(FRAMING.fov) / 2);
    const halfH = halfV * aspect;
    // Distância necessária para caber a altura e a largura; vale a maior delas.
    const distance = Math.max(FRAMING.height / 2 / halfV, FRAMING.width / 2 / halfH) * 1.03;
    const elevation = MathUtils.degToRad(FRAMING.elevationDeg);
    cam.position.set(0, FRAMING.centerY + Math.sin(elevation) * distance, Math.cos(elevation) * distance);
    cam.lookAt(0, FRAMING.centerY, 0);
    cam.updateProjectionMatrix();
    invalidate();
  }, [get, width, height]);

  return null;
}

/** Iluminação de estúdio: caixas de luz refletidas no metal, sem nenhum HDR externo. */
function StudioLighting() {
  return (
    <>
      <Environment resolution={256} frames={1} environmentIntensity={0.7}>
        {/* Fundo lavanda suave: o que o metal reflete quando não olha para uma caixa de luz. */}
        <mesh scale={40}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshBasicMaterial color="#d8d0ea" side={BackSide} toneMapped={false} />
        </mesh>
        <Lightformer form="rect" intensity={4} color="#ffffff" position={[0, 6, 2]} scale={[9, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.4} color="#fff3ea" position={[-6, 2.5, 4]} scale={[3, 6, 1]} target={[0, 1.4, 0]} />
        <Lightformer form="rect" intensity={1.8} color="#e6dcff" position={[6, 2, 3]} scale={[2.5, 6, 1]} target={[0, 1.4, 0]} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[0, 2, -6]} scale={[8, 3, 1]} target={[0, 1.4, 0]} />
      </Environment>
      <hemisphereLight args={["#ffffff", "#d9cfee", 0.3]} />
      <directionalLight position={[2.5, 5, 4]} intensity={1.1} color="#fffaf4" />
    </>
  );
}

export function RackScene({ progress, items }: RackSceneProps) {
  const get = useThree((s) => s.get);
  const invalidate = useThree((s) => s.invalidate);

  // `items` costuma ser recriado a cada render do pai; a chave por conteúdo evita regerar texturas.
  const key = items.map((item) => `${item.type}:${item.color}`).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a chave `key` representa o conteúdo de `items`
  const stableItems = useMemo(() => items, [key]);

  const uniforms = useMemo<GarmentUniforms>(() => ({ uTime: { value: 0 }, uEnergy: { value: 0.6 } }), []);

  const slots = useMemo(() => computeHangerSlots(stableItems.length, TRACK.radiusX, TRACK.radiusZ), [stableItems]);

  // Proporção do tecido: encolhe quando há muitas peças para não sobrepor demais os vizinhos.
  const scale = useMemo(() => {
    if (stableItems.length === 0) return MAX_GARMENT_SCALE;
    const spacing = stadiumPerimeter(TRACK.radiusX, TRACK.radiusZ) / stableItems.length;
    return Math.min(MAX_GARMENT_SCALE, (spacing * 1.08) / 190);
  }, [stableItems]);

  const built = useMemo<Built>(() => {
    const maxAnisotropy = Math.min(8, get().gl.capabilities.getMaxAnisotropy());
    const cache = new Map<string, GarmentTextures>();
    const textures: GarmentTextures[] = [];
    const garments = stableItems.map((item, index) => {
      const cacheKey = `${item.type}:${item.color}`;
      let tex = cache.get(cacheKey);
      if (!tex) {
        tex = createGarmentTextures(item.type, item.color, maxAnisotropy);
        cache.set(cacheKey, tex);
        textures.push(tex);
      }
      const geometry = createGarmentGeometry(item.type, scale);
      const material = createGarmentMaterial(
        tex,
        item.color,
        index * GOLDEN_ANGLE,
        new Vector2(geometry.width, geometry.height),
        uniforms,
      );
      return { geometry, material };
    });
    // Ombros do cabide acompanham a largura do tecido (cerca de 88 unidades do viewBox).
    return { garments, textures, hangerGeometry: createHangerGeometry(Math.min(0.42, 88 * scale)) };
  }, [get, stableItems, scale, uniforms]);

  const staticParts = useMemo(
    () => ({
      rail: createRailGeometry(),
      frame: createFrameGeometry(),
      casters: createCasterGeometry(),
      metal: new MeshStandardMaterial({ color: "#cfc8e6", metalness: 0.7, roughness: 0.28 }),
      wood: new MeshStandardMaterial({ color: "#e9d6b6", metalness: 0, roughness: 0.55 }),
      rubber: new MeshStandardMaterial({ color: "#2f2c38", metalness: 0, roughness: 0.65 }),
    }),
    [],
  );

  const shadowTexture = useMemo(() => createShadowTexture(), []);
  useEffect(() => () => shadowTexture.dispose(), [shadowTexture]);

  // Libera tudo o que foi criado fora do JSX (o R3F só descarta o que ele mesmo instanciou).
  useEffect(() => {
    return () => {
      for (const g of built.garments) {
        g.geometry.geometry.dispose();
        g.material.dispose();
      }
      for (const t of built.textures) {
        t.map.dispose();
        t.alphaMap.dispose();
      }
      built.hangerGeometry.dispose();
    };
  }, [built]);
  useEffect(() => {
    return () => {
      staticParts.rail.dispose();
      staticParts.frame.dispose();
      staticParts.casters.dispose();
      staticParts.metal.dispose();
      staticParts.wood.dispose();
      staticParts.rubber.dispose();
    };
  }, [staticParts]);

  // --- Movimento ---------------------------------------------------------------------------
  const rackRef = useRef<Group>(null);
  const pendulums = useRef<(Group | null)[]>([]);
  const active = useRef(true);
  // Estado mutável do loop: fora do React de propósito, para não re-renderizar a cada frame.
  const motion = useRef({
    rotation: 0,
    /** Ângulo acumulado do giro de vitrine. */
    idle: 0,
    omega: 0,
    energy: 0.6,
    time: 0,
    primed: false,
    leanZ: new Float32Array(0),
    leanX: new Float32Array(0),
    /** Distância do slot ao eixo ao longo da normal: converte omega em velocidade tangencial. */
    reach: new Float32Array(0),
  });

  useEffect(() => {
    const m = motion.current;
    m.leanZ = new Float32Array(slots.length);
    m.leanX = new Float32Array(slots.length);
    m.reach = Float32Array.from(slots, (s) => s.x * Math.sin(s.angle) + s.z * Math.cos(s.angle));
    invalidate();
  }, [slots, invalidate]);

  // Pausa quando o canvas sai da tela ou a aba fica oculta.
  useEffect(() => {
    const canvas = get().gl.domElement;
    let onScreen = true;
    const update = () => {
      const next = onScreen && document.visibilityState === "visible";
      if (next && !active.current) invalidate();
      active.current = next;
    };
    const observer = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      if (last) {
        onScreen = last.isIntersecting;
        update();
      }
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [get, invalidate]);

  // Cada mudança de progresso pede um frame (o modo `demand` não renderiza sozinho).
  useEffect(() => {
    return progress.on("change", () => {
      if (active.current) invalidate();
    });
  }, [progress, invalidate]);

  useFrame((_, rawDelta) => {
    if (!active.current) return;
    const rack = rackRef.current;
    if (!rack) return;
    const m = motion.current;
    // Limita o delta: ao voltar de uma aba oculta ele seria enorme e a arara "pularia".
    const dt = Math.min(Math.max(rawDelta, 1e-4), MAX_FRAME_DT);

    // Giro suave e constante de vitrine, somado ao que vem da rolagem.
    m.idle += dt * IDLE_SPEED;
    const target = MathUtils.clamp(progress.get(), 0, 1) * TURNS * Math.PI * 2 + m.idle;
    if (!m.primed) {
      m.rotation = target; // primeira renderização já no ângulo certo, sem giro de entrada
      m.primed = true;
    }
    const previous = m.rotation;
    m.rotation = MathUtils.damp(m.rotation, target, ROTATION_DAMPING, dt);
    const instantOmega = (m.rotation - previous) / dt;
    m.omega = MathUtils.damp(m.omega, instantOmega, 10, dt);

    // O balanço sobe rápido com a velocidade e some devagar (inércia do tecido).
    const drive = Math.min(1, Math.abs(m.omega) / 2.2) * SWAY_STRENGTH;
    m.energy = Math.max(m.energy * Math.exp(-dt / SWAY_DECAY_SECONDS), Math.min(1.4, drive));
    m.time += dt;

    rack.rotation.y = m.rotation;
    writeUniforms(uniforms, m.time, m.energy);

    const omega2 = m.omega * Math.abs(m.omega);
    for (let i = 0; i < slots.length; i += 1) {
      const pendulum = pendulums.current[i];
      if (!pendulum) continue;
      const phase = i * GOLDEN_ANGLE;
      // A peça fica para trás do movimento (inclina contra a velocidade) e abre para fora
      // com a força centrífuga; as duas respostas são amortecidas para parecerem pesadas.
      const targetZ = -MathUtils.clamp(m.omega * m.reach[i] * 0.08, -0.32, 0.32) * SWAY_STRENGTH;
      const targetX = -MathUtils.clamp(Math.abs(omega2) * m.reach[i] * 0.025, 0, 0.3) * SWAY_STRENGTH;
      m.leanZ[i] = MathUtils.damp(m.leanZ[i], targetZ, 6, dt);
      m.leanX[i] = MathUtils.damp(m.leanX[i], targetX, 6, dt);
      pendulum.rotation.z = m.leanZ[i] + m.energy * 0.07 * Math.sin(m.time * 2.3 + phase);
      pendulum.rotation.x = m.leanX[i] + m.energy * 0.05 * Math.sin(m.time * 1.7 + phase * 1.3 + 1);
    }

    // O giro de vitrine nunca para, então pede sempre o próximo frame; fora da tela o loop já pausa (`active`).
    invalidate();
  });

  return (
    <>
      <CameraRig />
      <StudioLighting />
      <group ref={rackRef}>
        <mesh geometry={staticParts.rail} material={staticParts.metal} />
        <mesh geometry={staticParts.frame} material={staticParts.metal} />
        <mesh geometry={staticParts.casters} material={staticParts.rubber} />
        {slots.map((slot, i) => (
          <group key={i} position={[slot.x, RAIL.y, slot.z]} rotation-y={slot.angle}>
            <group
              ref={(node) => {
                pendulums.current[i] = node;
              }}
            >
              <mesh geometry={built.hangerGeometry} material={staticParts.wood} />
              <mesh
                geometry={built.garments[i].geometry.geometry}
                material={built.garments[i].material}
                position={[0, -GARMENT_DROP, 0]}
              />
            </group>
          </group>
        ))}
      </group>
      {/* Sombra de contato: disco com gradiente. Fica igual em qualquer ângulo, então não precisa
          de um passe de render extra a cada frame (o ContactShadows do drei faria isso). */}
      <mesh position={[0, 0.003, 0]} rotation-x={-Math.PI / 2} renderOrder={-1}>
        <circleGeometry args={[SHADOW_RADIUS, 48]} />
        <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}
