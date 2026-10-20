"use client";

import { useEffect, useMemo, type Ref } from "react";
import { CapsuleGeometry, DoubleSide, Group, LatheGeometry, MeshPhysicalMaterial, SphereGeometry, Vector2 } from "three";
import { lighten } from "@/lib/color";

export type BodyType = "female" | "male";

export type Outfit = {
  /** Blusa, camisa ou casaco: veste o tronco e as mangas. */
  top?: string;
  /** Calça: cobre quadril e pernas. */
  bottom?: string;
  /** Vestido: substitui blusa e saia. */
  dress?: string;
  /** Saia: cobre do cós até o joelho (só quando não há calça). */
  skirt?: string;
};

/**
 * Perfis de revolução (raio, altura) em metros, de baixo para cima. O tronco é um único torneado:
 * a cintura e o busto da silhueta feminina vêm dos raios, e os ombros largos do masculino também.
 */
const PROFILE: Record<BodyType, [number, number][]> = {
  female: [
    [0.13, 0.84],
    [0.17, 0.94],
    [0.16, 1.02],
    [0.115, 1.14],
    [0.135, 1.25],
    [0.15, 1.31],
    [0.14, 1.38],
    [0.11, 1.44],
    [0.06, 1.48],
  ],
  male: [
    [0.14, 0.84],
    [0.165, 0.94],
    [0.155, 1.04],
    [0.14, 1.14],
    [0.165, 1.27],
    [0.205, 1.38],
    [0.2, 1.44],
    [0.13, 1.48],
    [0.07, 1.5],
  ],
};

const LIMB_RADIUS = { female: 0.056, male: 0.058 } as const;
const SHOULDER_X = { female: 0.19, male: 0.23 } as const;
const HEAD = { radius: 0.11, y: 1.64 } as const;
/** Onde a perna gira (quadril) e onde fica o centro dela: a ponta de baixo encosta no piso. */
const LEG_PIVOT_Y = 0.81;
const LEG_CENTER_Y = 0.42;
/** Folga da roupa sobre o corpo, em metros. Maior que zero para não disputar profundidade com a pele. */
const EASE = 0.03;

/**
 * Pose de vitrine inspirada nos mockups de manequim: braços levemente afastados e um pouco à frente,
 * e o peso apoiado em uma perna (a outra abre mais). Índice 0 = lado esquerdo da cena, 1 = direito.
 */
const ARM_SPLAY = [0.2, 0.13] as const;
const ARM_FORWARD = 0.07;
const LEG_SPLAY = [0.07, 0.02] as const;

type Props = {
  type: BodyType;
  outfit?: Outfit;
  /** Desenha o corpo. Só uma instância por manequim deve desenhar, senão a pele fica em z-fighting. */
  skin?: boolean;
  /** Ref do grupo das roupas, para a cena animar o vestir e o despir a cada frame. */
  garmentRef?: Ref<Group>;
  position?: [number, number, number];
  rotationY?: number;
};

function fabric(color: string): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color,
    roughness: 0.82,
    metalness: 0,
    sheen: 0.45,
    sheenRoughness: 0.5,
    sheenColor: lighten(color, 0.35),
    side: DoubleSide,
  });
}

function profilePoints(points: [number, number][], grow: number): Vector2[] {
  return points.map(([r, y]) => new Vector2(r + grow, y));
}

const SIDES = [-1, 1] as const;

/** Corpo e roupa do manequim. Cinza-grafite fosco, sem rosto, em pose neutra de vitrine. */
export function Mannequin({ type, outfit = {}, skin = true, garmentRef, position = [0, 0, 0], rotationY = 0 }: Props) {
  const skinMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: "#615e6c",
        roughness: 0.55,
        metalness: 0.05,
        clearcoat: 0.3,
        clearcoatRoughness: 0.45,
        sheen: 0.3,
        sheenRoughness: 0.6,
        sheenColor: "#9b97ad",
      }),
    [],
  );

  const geometries = useMemo(() => {
    const radius = LIMB_RADIUS[type];
    const profile = PROFILE[type];
    return {
      torso: new LatheGeometry(profilePoints(profile, 0), 40),
      neck: new CapsuleGeometry(0.042, 0.12, 6, 12),
      head: new CapsuleGeometry(HEAD.radius * 0.85, 0.07, 8, 16),
      arm: new CapsuleGeometry(radius * 0.82, 0.46, 6, 12),
      hand: new SphereGeometry(radius * 0.9, 12, 10),
      leg: new CapsuleGeometry(radius * 1.2, 0.62, 6, 14),
      foot: new CapsuleGeometry(radius * 0.7, 0.14, 4, 10),
      // A blusa tem uma folga a mais que a calça para cobrir o cós, em vez de disputar a mesma superfície.
      topShell: new LatheGeometry(profilePoints(profile.slice(0, -1), EASE + 0.012), 40),
      hipShell: new LatheGeometry(profilePoints(profile.slice(0, 3), EASE), 40),
      sleeve: new CapsuleGeometry(radius * 0.82 + EASE, 0.4, 6, 12),
      legShell: new CapsuleGeometry(radius * 1.2 + EASE, 0.6, 6, 14),
      dress: new LatheGeometry(
        [
          new Vector2(0.3, 0.3),
          new Vector2(0.24, 0.5),
          new Vector2(0.19, 0.7),
          new Vector2(0.175, 0.86),
          new Vector2(0.17, 0.98),
          new Vector2(0.14, 1.14),
          new Vector2(0.155, 1.26),
          new Vector2(0.165, 1.33),
          new Vector2(0.15, 1.4),
          new Vector2(0.13, 1.47),
          new Vector2(0.09, 1.5),
        ].map((v) => new Vector2(v.x + EASE, v.y)),
        40,
      ),
      skirt: new LatheGeometry(
        [
          new Vector2(0.17, 0.92),
          new Vector2(0.2, 0.98),
          new Vector2(0.26, 0.7),
          new Vector2(0.34, 0.45),
        ].map((v) => new Vector2(v.x + EASE, v.y)),
        40,
      ),
    };
  }, [type]);

  const outfitMaterials = useMemo(
    () => ({
      top: outfit.top ? fabric(outfit.top) : null,
      bottom: outfit.bottom ? fabric(outfit.bottom) : null,
      dress: outfit.dress ? fabric(outfit.dress) : null,
      skirt: outfit.skirt ? fabric(outfit.skirt) : null,
    }),
    [outfit.top, outfit.bottom, outfit.dress, outfit.skirt],
  );

  useEffect(() => {
    return () => {
      skinMaterial.dispose();
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(outfitMaterials).forEach((m) => m?.dispose());
    };
  }, [geometries, outfitMaterials, skinMaterial]);

  const shoulderX = SHOULDER_X[type];
  const legX = type === "female" ? 0.085 : 0.095;
  const hasTop = Boolean(outfit.top) && !outfit.dress;
  const hasBottom = Boolean(outfit.bottom) && !outfit.dress;
  const hasSkirt = Boolean(outfit.skirt) && !outfit.dress && !outfit.bottom;

  /** Braço de um lado: afasta do corpo (para fora) e leva um pouco à frente. */
  const armProps = (side: -1 | 1) => ({
    position: [side * shoulderX, 1.4, 0] as [number, number, number],
    rotation: [ARM_FORWARD, 0, side * ARM_SPLAY[side === -1 ? 0 : 1]] as [number, number, number],
  });
  /** Perna de um lado: gira no quadril; a que carrega menos peso abre mais. */
  const legProps = (side: -1 | 1) => ({
    position: [side * legX, LEG_PIVOT_Y, 0] as [number, number, number],
    rotation: [0, 0, side * LEG_SPLAY[side === -1 ? 0 : 1]] as [number, number, number],
  });
  const legMeshY = LEG_CENTER_Y - LEG_PIVOT_Y;

  return (
    <group position={position} rotation-y={rotationY}>
      {skin && (
        <group>
          <mesh geometry={geometries.torso} material={skinMaterial} />
          <mesh geometry={geometries.neck} material={skinMaterial} position={[0, 1.53, 0]} />
          <mesh geometry={geometries.head} material={skinMaterial} position={[0, HEAD.y, 0]} scale={[0.92, 1.1, 0.95]} />
          {SIDES.map((side) => (
            <group key={`arm-${side}`} {...armProps(side)}>
              <mesh geometry={geometries.arm} material={skinMaterial} position={[0, -0.25, 0]} />
              <mesh geometry={geometries.hand} material={skinMaterial} position={[0, -0.55, 0]} scale={[0.85, 1.2, 0.7]} />
            </group>
          ))}
          {SIDES.map((side) => (
            <group key={`leg-${side}`} {...legProps(side)}>
              <mesh geometry={geometries.leg} material={skinMaterial} position={[0, legMeshY, 0]} />
              <mesh
                geometry={geometries.foot}
                material={skinMaterial}
                position={[0, -LEG_PIVOT_Y + 0.035, 0.05]}
                rotation-x={Math.PI / 2}
                rotation-z={side * 0.15}
              />
            </group>
          ))}
        </group>
      )}
      <group ref={garmentRef}>
        {hasTop && <mesh geometry={geometries.topShell} material={outfitMaterials.top!} />}
        {hasTop &&
          SIDES.map((side) => (
            <group key={`sleeve-${side}`} {...armProps(side)}>
              <mesh geometry={geometries.sleeve} material={outfitMaterials.top!} position={[0, -0.25, 0]} />
            </group>
          ))}
        {hasBottom && <mesh geometry={geometries.hipShell} material={outfitMaterials.bottom!} />}
        {hasBottom &&
          SIDES.map((side) => (
            <group key={`legshell-${side}`} {...legProps(side)}>
              <mesh geometry={geometries.legShell} material={outfitMaterials.bottom!} position={[0, legMeshY, 0]} />
            </group>
          ))}
        {outfit.dress && <mesh geometry={geometries.dress} material={outfitMaterials.dress!} />}
        {hasSkirt && <mesh geometry={geometries.skirt} material={outfitMaterials.skirt!} />}
      </group>
    </group>
  );
}
