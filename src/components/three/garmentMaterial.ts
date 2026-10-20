import { DoubleSide, MeshPhysicalMaterial, type Vector2 } from "three";
import { lighten } from "@/lib/color";
import type { GarmentTextures } from "./garmentTexture";

/** Uniforms compartilhados por todas as peças: o loop atualiza uma vez por frame. */
export type GarmentUniforms = {
  uTime: { value: number };
  /** 0 = tecido parado, 1 = balanço máximo (cresce com a velocidade de rotação). */
  uEnergy: { value: number };
};

/**
 * Tecido com ondulação no vertex shader. Usa MeshPhysicalMaterial (o sheen dá o brilho macio de
 * tecido nas bordas) e injeta o balanço via onBeforeCompile para manter toda a iluminação PBR.
 * `size` = largura e altura abaixo do pivô, em unidades de cena (normaliza gola -> barra).
 */
export function createGarmentMaterial(
  textures: GarmentTextures,
  color: string,
  phase: number,
  size: Vector2,
  shared: GarmentUniforms,
): MeshPhysicalMaterial {
  const material = new MeshPhysicalMaterial({
    map: textures.map,
    alphaMap: textures.alphaMap,
    // Mistura alpha (e não só alphaTest) para a borda ficar suave sem depender de MSAA;
    // alphaTest baixo descarta o que é totalmente transparente, preservando o depth.
    transparent: true,
    alphaTest: 0.02,
    side: DoubleSide,
    roughness: 0.88,
    metalness: 0,
    sheen: 0.3,
    sheenRoughness: 0.55,
    sheenColor: lighten(color, 0.35),
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = shared.uTime;
    shader.uniforms.uEnergy = shared.uEnergy;
    shader.uniforms.uPhase = { value: phase };
    shader.uniforms.uSize = { value: size };

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uTime;
        uniform float uEnergy;
        uniform float uPhase;
        uniform vec2 uSize;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        // 0 na gola (presa ao cabide), 1 na barra. O quadrado deixa o topo firme e a barra solta.
        float hang = clamp(-position.y / uSize.y, 0.0, 1.0);
        float free = hang * hang;
        float wave = sin(position.x * 6.0 + uTime * 2.4 + uPhase) * 0.6
                   + sin(position.x * 11.0 - uTime * 3.1 + uPhase * 1.7 + position.y * 3.0) * 0.4;
        transformed.z += wave * free * 0.05 * uEnergy;
        transformed.x += sin(uTime * 2.0 + position.y * 4.0 + uPhase) * free * 0.012 * uEnergy;`,
      );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `#include <map_fragment>
      // Verso da peça: mesma textura espelhada pela geometria, só mais escura (forro).
      if (!gl_FrontFacing) diffuseColor.rgb *= 0.78;`,
    );
  };
  // Todas as peças compartilham o mesmo programa; só os uniforms mudam.
  material.customProgramCacheKey = () => "reveste-garment-v1";
  return material;
}
