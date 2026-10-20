"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState, type Ref } from "react";
import {
  BoxGeometry,
  CapsuleGeometry,
  DoubleSide,
  Euler,
  Group,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
} from "three";
import { assetUrl } from "@/lib/assets";
import { lighten } from "@/lib/color";
import { bodyRegion, flareGeometry, flareProfile, frontFaces, loadBody, PART, projectPhoto, type BodyType, type Fold } from "./bodies";

export type { BodyType } from "./bodies";

/** Uma peça de roupa: a cor lisa que cobre o corpo e, se houver, a foto da peça aplicada na frente. */
export type Garment = { color: string; photo?: string };

export type Outfit = {
  /** Blusa, camisa ou casaco: veste o tronco e as mangas. */
  top?: Garment & { sleeve: "short" | "long" };
  /** Calça: cobre quadril e pernas. */
  bottom?: Garment;
  /** Vestido: bodice no corpo e saia que abre até a barra (`hemY` e `hemRadius` em metros), com pregas opcionais. */
  dress?: Garment & { hemY: number; hemRadius: number; fold?: Fold };
  /** Saia: do cós até a barra, com pregas opcionais. */
  skirt?: Garment & { hemY: number; hemRadius: number; fold?: Fold };
};

/** Estilos: crop (rente), cap (curto com topete), bob (até o queixo), long (liso até os ombros), bun (coque) e puff (black power). */
export type Hair = { style: "cap" | "crop" | "bob" | "long" | "bun" | "puff"; color: string };

/** Escala do corpo do homem no script que esculpe os corpos. */
const BODY_SCALE = { female: 1, male: 1.045 } as const;

/** Cabeça de cada corpo (centro e raios), igual à do script, já com a escala do homem. */
const HEAD = {
  female: { center: [0, 1.6, 0.01], radii: [0.074, 0.101, 0.085] },
  male: { center: [0, 1.595 * 1.045, 0.01 * 1.045], radii: [0.08 * 1.045, 0.107 * 1.045, 0.091 * 1.045] },
} as const;

/** Pontos do braço (ombro, cotovelo e punho) para o lado direito, sem a escala do homem. */
const ARM = {
  female: { shoulder: [0.172, 1.4, 0], elbow: [0.235, 1.13, 0.012], wrist: [0.285, 0.88, 0.058], upperR: 0.036, wristR: 0.024 },
  male: { shoulder: [0.215, 1.42, 0], elbow: [0.275, 1.14, 0.012], wrist: [0.33, 0.89, 0.06], upperR: 0.043, wristR: 0.028 },
} as const;

/** Distância do centro até a ponta da manga, onde a foto da blusa termina dos lados. */
const SLEEVE_HALF_SPAN = { female: 0.3, male: 0.345 } as const;

const PHOTO_LIFT = 0.0035;

/** Um pedaço de uma peça: malha, material e, se for um acessório, onde ele fica. */
type Part = {
  geometry: BufferGeometry;
  color: string;
  /** Usa a cor por vértice do corpo (sombras de oclusão); torneados e acessórios não têm. */
  shaded: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  metal?: boolean;
};

type Item = {
  key: string;
  parts: Part[];
  photoId?: string;
  photos: BufferGeometry[];
};

const darken = (hex: string, amount: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.round(v * (1 - amount)));
  return `#${[f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

/** Rotação (Euler) que leva o eixo Z de um torus (o anel) para a direção `direction`. */
function ringRotation(direction: Vector3): [number, number, number] {
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), direction.clone().normalize());
  const e = new Euler().setFromQuaternion(q);
  return [e.x, e.y, e.z];
}

/** Gola ao redor do pescoço. */
function collarPart(type: BodyType, color: string): Part {
  const s = BODY_SCALE[type];
  return {
    geometry: new TorusGeometry(0.058 * s, 0.0115, 10, 36),
    color,
    shaded: false,
    position: [0, 1.512 * s, 0.002],
    rotation: [Math.PI / 2 - 0.14, 0, 0],
    scale: [1, 0.86, 1],
  };
}

/** Punhos (mangas longas) ou barras de manga (mangas curtas). */
function sleeveEndParts(type: BodyType, sleeve: "short" | "long", color: string): Part[] {
  const s = BODY_SCALE[type];
  const a = ARM[type];
  const parts: Part[] = [];
  for (const side of [-1, 1] as const) {
    const sh = new Vector3(side * a.shoulder[0], a.shoulder[1], a.shoulder[2]).multiplyScalar(s);
    const el = new Vector3(side * a.elbow[0], a.elbow[1], a.elbow[2]).multiplyScalar(s);
    const wr = new Vector3(side * a.wrist[0], a.wrist[1], a.wrist[2]).multiplyScalar(s);
    if (sleeve === "long") {
      const dir = wr.clone().sub(el);
      const center = wr.clone().addScaledVector(dir.clone().normalize(), -0.03);
      parts.push({
        geometry: new TorusGeometry((a.wristR + 0.017) * s, 0.0085, 8, 24),
        color: darken(color, 0.08),
        shaded: false,
        position: center.toArray() as [number, number, number],
        rotation: ringRotation(dir),
      });
    } else {
      const t = (sh.y - 1.22 * s) / (sh.y - el.y);
      const center = sh.clone().lerp(el, t);
      parts.push({
        geometry: new TorusGeometry((a.upperR - 0.004 * t + 0.0175) * s, 0.0065, 8, 24),
        color: darken(color, 0.08),
        shaded: false,
        position: center.toArray() as [number, number, number],
        rotation: ringRotation(el.clone().sub(sh)),
      });
    }
  }
  return parts;
}

/** Cinto com fivela na cintura. */
function beltParts(type: BodyType, y: number, radius: number): Part[] {
  const s = BODY_SCALE[type];
  const rx = radius * (type === "male" ? 1.07 : 1);
  const rz = rx * 0.76;
  return [
    {
      geometry: new TorusGeometry(rx, 0.0075, 8, 40),
      color: "#2e231d",
      shaded: false,
      position: [0, y * s, 0],
      rotation: [Math.PI / 2, 0, 0],
      scale: [1, rz / rx, 1],
    },
    { geometry: new BoxGeometry(0.034, 0.024, 0.009), color: "#cdb882", shaded: false, metal: true, position: [0, y * s, rz + 0.004] },
  ];
}

/** Monta a roupa a partir do corpo: cada peça é um pedaço da própria malha um pouco maior (e, no vestido e na saia, um torneado). */
function buildOutfit(body: BufferGeometry, type: BodyType, outfit: Outfit): Item[] {
  const items: Item[] = [];

  if (outfit.bottom) {
    const include = (part: number, _x: number, y: number) =>
      (part === PART.torso && y >= 0.78 && y <= 1.13) || part === PART.thigh || (part === PART.calf && y >= 0.07);
    const { color, photo } = outfit.bottom;
    items.push({
      key: "bottom",
      parts: [{ geometry: bodyRegion(body, include, 0.01), color, shaded: true }, ...beltParts(type, 1.075, 0.132)],
      photoId: photo,
      photos: photo ? [projectPhoto(frontFaces(bodyRegion(body, include, 0.01 + PHOTO_LIFT)), 0.25, 0.06, 1.065)] : [],
    });
  }

  if (outfit.top) {
    const { color, photo, sleeve } = outfit.top;
    const hem = 0.9;
    const include = (part: number, _x: number, y: number) => {
      if (part === PART.torso) return y >= hem && y <= 1.62;
      // O topo da coxa também fica sob a barra: sem ele sobra um vão onde o glúteo muda de parte do corpo.
      if (part === PART.thigh) return y >= hem;
      if (part === PART.upperArm) return sleeve === "long" || y >= 1.22;
      if (part === PART.foreArm) return sleeve === "long" && y >= 0.95;
      return false;
    };
    items.push({
      key: "top",
      parts: [{ geometry: bodyRegion(body, include, 0.017), color, shaded: true }, collarPart(type, darken(color, 0.04)), ...sleeveEndParts(type, sleeve, color)],
      photoId: photo,
      photos: photo ? [projectPhoto(frontFaces(bodyRegion(body, include, 0.017 + PHOTO_LIFT)), SLEEVE_HALF_SPAN[type], hem, 1.53)] : [],
    });
  }

  if (outfit.dress) {
    const { color, photo, hemY, hemRadius, fold } = outfit.dress;
    // Cortado por posição (uma reta no ombro), não pela fronteira de partes, que sai serrilhada.
    const bodice = (part: number, x: number, y: number) => part === PART.torso && y >= 1.06 && Math.abs(x) <= (type === "female" ? 0.165 : 0.2);
    const waistY = 1.1;
    items.push({
      key: "dress",
      parts: [
        { geometry: bodyRegion(body, bodice, 0.013), color, shaded: true },
        { geometry: flareGeometry(flareProfile(hemY, hemRadius, waistY, 0.013), Math.PI * 2, fold), color, shaded: true },
      ],
      photoId: photo,
      photos: photo
        ? [
            projectPhoto(frontFaces(bodyRegion(body, bodice, 0.013 + PHOTO_LIFT)), hemRadius, hemY, 1.49),
            projectPhoto(flareGeometry(flareProfile(hemY, hemRadius, waistY, 0.013 + PHOTO_LIFT), Math.PI * 0.98, fold), hemRadius, hemY, 1.49),
          ]
        : [],
    });
  }

  if (outfit.skirt) {
    const { color, photo, hemY, hemRadius, fold } = outfit.skirt;
    const waistY = 1.04;
    items.push({
      key: "skirt",
      parts: [{ geometry: flareGeometry(flareProfile(hemY, hemRadius, waistY, 0.012), Math.PI * 2, fold), color, shaded: true }, ...beltParts(type, waistY + 0.01, 0.138)],
      photoId: photo,
      photos: photo
        ? [projectPhoto(flareGeometry(flareProfile(hemY, hemRadius, waistY, 0.012 + PHOTO_LIFT), Math.PI * 0.98, fold), hemRadius, hemY, waistY)]
        : [],
    });
  }
  return items;
}

function fabric(color: string, shaded: boolean, metal = false): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color,
    roughness: metal ? 0.3 : 0.82,
    metalness: metal ? 0.8 : 0,
    sheen: metal ? 0 : 0.15,
    sheenRoughness: 0.5,
    sheenColor: lighten(color, 0.12),
    side: DoubleSide,
    vertexColors: shaded,
  });
}

/**
 * Foto recortada da peça por cima da roupa lisa. As geometrias já trazem as coordenadas de textura (projeção
 * frontal), então aqui só se carrega a imagem. Se ela não carregar, nada é desenhado e a roupa lisa continua.
 */
function GarmentPhoto({ photoId, geometries }: { photoId: string; geometries: BufferGeometry[] }) {
  const invalidate = useThree((state) => state.invalidate);
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    let alive = true;
    let loaded: Texture | null = null;
    new TextureLoader().load(
      assetUrl(`/images/mannequin/${photoId}.webp`),
      (tex) => {
        tex.colorSpace = SRGBColorSpace;
        tex.anisotropy = 4;
        if (!alive) return void tex.dispose();
        loaded = tex;
        setTexture(tex);
        invalidate();
      },
      undefined,
      () => {},
    );
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [photoId, invalidate]);

  const material = useMemo(
    () =>
      texture
        ? new MeshStandardMaterial({
            map: texture,
            roughness: 0.85,
            alphaTest: 0.45,
            alphaToCoverage: true,
            side: DoubleSide,
            // A cor por vértice (oclusão) escurece a foto nas dobras do corpo e dá volume.
            vertexColors: true,
          })
        : null,
    [texture],
  );
  useEffect(() => () => material?.dispose(), [material]);

  if (!material) return null;
  return (
    <>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} material={material} />
      ))}
    </>
  );
}

/** Cabelo feito de formas simples: estilos curtos, médio, longo e black power. */
function HairPiece({ type, hair }: { type: BodyType; hair: Hair }) {
  const { center, radii } = HEAD[type];
  const material = useMemo(() => new MeshStandardMaterial({ color: hair.color, roughness: 0.55, metalness: 0.05 }), [hair.color]);
  const parts = useMemo(() => {
    const [rx, ry, rz] = radii;
    const cap = (grow: number, cut: number) => {
      const geometry = new SphereGeometry(1, 32, 20, 0, Math.PI * 2, 0, Math.PI * cut);
      return { geometry, scale: [rx * grow, ry * grow, rz * grow] as [number, number, number], position: [center[0], center[1], center[2]] as [number, number, number] };
    };
    const back = (grow: number) => ({
      geometry: new SphereGeometry(1, 28, 18),
      scale: [rx * grow * 1.08, ry * grow * 0.95, rz * grow * 0.88] as [number, number, number],
      position: [center[0], center[1] - 0.03, center[2] - 0.03] as [number, number, number],
    });
    /** Mecha que cai de lado (para os cabelos longos), de `drop` metros abaixo do centro da cabeça. */
    const lock = (side: -1 | 1, drop: number) => ({
      geometry: new CapsuleGeometry(0.03, drop, 6, 12),
      scale: [1, 1, 1.4] as [number, number, number],
      position: [center[0] + side * (rx + 0.012), center[1] - drop / 2 - 0.02, center[2] - 0.01] as [number, number, number],
    });
    const ball = (radius: number, offset: [number, number, number]) => ({
      geometry: new SphereGeometry(radius, 20, 14),
      scale: [1, 1, 1] as [number, number, number],
      position: [center[0] + offset[0], center[1] + offset[1], center[2] + offset[2]] as [number, number, number],
    });
    switch (hair.style) {
      case "crop":
        return [cap(1.03, 0.4)];
      case "cap":
        return [cap(1.08, 0.4), ball(0.052, [0, ry * 0.78, rz * 0.5])];
      case "bob":
        return [cap(1.08, 0.38), back(1.1), lock(-1, 0.1), lock(1, 0.1)];
      case "long":
        return [
          cap(1.08, 0.38),
          back(1.12),
          {
            geometry: new CapsuleGeometry(0.085, 0.24, 6, 14),
            scale: [1, 1, 0.55] as [number, number, number],
            position: [center[0], center[1] - 0.2, center[2] - 0.07] as [number, number, number],
          },
          lock(-1, 0.26),
          lock(1, 0.26),
        ];
      case "bun":
        return [cap(1.07, 0.38), back(1.05), ball(0.06, [0, ry * 1.05, -rz * 0.55])];
      case "puff":
        return [
          {
            geometry: new SphereGeometry(1, 32, 22),
            scale: [0.128, 0.122, 0.128] as [number, number, number],
            position: [center[0], center[1] + 0.045, center[2] - 0.03] as [number, number, number],
          },
        ];
    }
  }, [hair.style, center, radii]);
  useEffect(() => () => parts.forEach((part) => part.geometry.dispose()), [parts]);
  useEffect(() => () => material.dispose(), [material]);

  return (
    <group>
      {parts.map((part, index) => (
        <mesh key={index} geometry={part.geometry} material={material} position={part.position} scale={part.scale} />
      ))}
    </group>
  );
}

/**
 * Rosto simples: olhos, sobrancelhas, nariz e boca feitos de formas pequenas sobre a cabeça. As posições vêm
 * dos raios da cabeça (a superfície do elipsoide em cada ponto), então servem para os dois corpos.
 */
function Face({ type, skinColor, lipColor, browColor }: { type: BodyType; skinColor: string; lipColor: string; browColor: string }) {
  const { center, radii } = HEAD[type];
  const [cx, cy, cz] = center;
  const [rx, ry, rz] = radii;
  /** Z da superfície da cabeça em (x, y) relativos ao centro. */
  const surface = (x: number, y: number) => cz + rz * Math.sqrt(Math.max(1 - (x / rx) ** 2 - (y / ry) ** 2, 0.05));
  const eyeY = cy + ry * 0.12;
  const eyeX = rx * 0.4;
  const noseY = cy - ry * 0.16;
  const mouthY = cy - ry * 0.5;
  const browY = cy + ry * 0.34;

  const parts = useMemo(
    () => ({
      round: new SphereGeometry(1, 16, 12),
      lip: new CapsuleGeometry(1, 1, 4, 10),
    }),
    [],
  );
  const materials = useMemo(
    () => ({
      white: new MeshStandardMaterial({ color: "#f7f4f0", roughness: 0.4 }),
      iris: new MeshStandardMaterial({ color: "#3a2a1f", roughness: 0.25 }),
      pupil: new MeshStandardMaterial({ color: "#0c0807", roughness: 0.2 }),
      skin: new MeshStandardMaterial({ color: skinColor, roughness: 0.65 }),
      lip: new MeshStandardMaterial({ color: lipColor, roughness: 0.45 }),
      brow: new MeshStandardMaterial({ color: browColor, roughness: 0.8 }),
    }),
    [skinColor, lipColor, browColor],
  );
  useEffect(() => () => Object.values(parts).forEach((g) => g.dispose()), [parts]);
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  return (
    <group>
      {([-1, 1] as const).map((side) => {
        const x = side * eyeX;
        const z = surface(x, eyeY - cy);
        return (
          <group key={side}>
            <mesh geometry={parts.round} material={materials.white} position={[cx + x, eyeY, z - 0.003]} scale={[0.0145, 0.01, 0.009]} />
            <mesh geometry={parts.round} material={materials.iris} position={[cx + x, eyeY, z + 0.0018]} scale={[0.0078, 0.0078, 0.005]} />
            <mesh geometry={parts.round} material={materials.pupil} position={[cx + x, eyeY, z + 0.0042]} scale={[0.0036, 0.0036, 0.002]} />
            <mesh
              geometry={parts.lip}
              material={materials.brow}
              position={[cx + x, browY, surface(x, browY - cy) + 0.0005]}
              rotation={[0, 0, Math.PI / 2 + side * 0.12]}
              scale={[0.0036, 0.008, 0.0036]}
            />
          </group>
        );
      })}
      <mesh geometry={parts.round} material={materials.skin} position={[cx, noseY, surface(0, noseY - cy) + 0.004]} scale={[0.011, 0.02, 0.016]} />
      <mesh
        geometry={parts.lip}
        material={materials.lip}
        position={[cx, mouthY, surface(0, mouthY - cy) + 0.0008]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.0048, 0.014, 0.0048]}
      />
    </group>
  );
}

type Props = {
  type: BodyType;
  skinColor: string;
  /** Cor dos lábios, mais escura nos tons de pele escuros. */
  lipColor: string;
  hair: Hair;
  /** Cor dos sapatos, que cobrem os pés. */
  shoes: string;
  outfit?: Outfit;
  /** Desenha corpo, rosto, cabelo e sapatos. Só uma instância por manequim deve desenhar, senão a pele fica em z-fighting. */
  skin?: boolean;
  /** Ref do grupo das roupas, para a cena animar o vestir e o despir a cada frame. */
  garmentRef?: Ref<Group>;
};

const NO_OUTFIT: Outfit = {};

/** Manequim com corpo esculpido (carregado de public/models), pele e cabelo próprios e roupas que vestem o corpo. */
export function Mannequin({ type, skinColor, lipColor, hair, shoes, outfit = NO_OUTFIT, skin = true, garmentRef }: Props) {
  const invalidate = useThree((state) => state.invalidate);
  const [body, setBody] = useState<BufferGeometry | null>(null);

  useEffect(() => {
    let alive = true;
    loadBody(type)
      .then((geometry) => {
        if (!alive) return;
        setBody(geometry);
        invalidate();
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [type, invalidate]);

  const skinMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: skinColor,
        roughness: 0.6,
        metalness: 0,
        clearcoat: 0.1,
        clearcoatRoughness: 0.45,
        sheen: 0.4,
        sheenRoughness: 0.45,
        sheenColor: lighten(skinColor, 0.3),
        vertexColors: true,
      }),
    [skinColor],
  );

  const items = useMemo(() => (body ? buildOutfit(body, type, outfit) : []), [body, type, outfit]);
  const materials = useMemo(() => items.map((item) => item.parts.map((part) => fabric(part.color, part.shaded, part.metal))), [items]);

  // Os sapatos são uma região do corpo (pé e tornozelo) um pouco maior, de cor própria.
  const shoeGeometry = useMemo(
    () => (body ? bodyRegion(body, (part, _x, y) => part === PART.foot || (part === PART.calf && y <= 0.075), 0.0055) : null),
    [body],
  );
  const shoeMaterial = useMemo(() => fabric(shoes, true), [shoes]);

  useEffect(() => () => skinMaterial.dispose(), [skinMaterial]);
  useEffect(() => () => shoeGeometry?.dispose(), [shoeGeometry]);
  useEffect(() => () => shoeMaterial.dispose(), [shoeMaterial]);
  useEffect(
    () => () => {
      items.forEach((item) => {
        item.parts.forEach((part) => part.geometry.dispose());
        item.photos.forEach((geometry) => geometry.dispose());
      });
      materials.forEach((list) => list.forEach((material) => material.dispose()));
    },
    [items, materials],
  );

  return (
    <group>
      {skin && body && (
        <>
          <mesh geometry={body} material={skinMaterial} />
          {shoeGeometry && <mesh geometry={shoeGeometry} material={shoeMaterial} />}
          <HairPiece type={type} hair={hair} />
          <Face type={type} skinColor={skinColor} lipColor={lipColor} browColor={hair.color} />
        </>
      )}
      <group ref={garmentRef}>
        {items.map((item, index) => (
          <group key={item.key}>
            {item.parts.map((part, i) => (
              <mesh
                key={i}
                geometry={part.geometry}
                material={materials[index][i]}
                position={part.position}
                rotation={part.rotation}
                scale={part.scale}
              />
            ))}
            {item.photoId && <GarmentPhoto photoId={item.photoId} geometries={item.photos} />}
          </group>
        ))}
      </group>
    </group>
  );
}
