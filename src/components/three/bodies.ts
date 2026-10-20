import { BufferAttribute, BufferGeometry, LatheGeometry, Vector2 } from "three";
import { assetUrl } from "@/lib/assets";

export type BodyType = "female" | "male";

/** Partes do corpo gravadas em cada vértice pelo script scripts/build-mannequin.mjs. */
export const PART = { head: 0, neck: 1, torso: 2, upperArm: 3, foreArm: 4, hand: 5, thigh: 6, calf: 7, foot: 8 } as const;

const cache = new Map<BodyType, Promise<BufferGeometry>>();

/** Carrega (uma vez por tipo) a malha do corpo: posições em 0,25 mm, parte do corpo por vértice e índices. */
export function loadBody(type: BodyType): Promise<BufferGeometry> {
  let promise = cache.get(type);
  if (!promise) {
    promise = fetch(assetUrl(`/models/mannequin-${type}.bin`))
      .then((response) => {
        if (!response.ok) throw new Error(`Corpo ${type}: HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then((buffer) => {
        const view = new DataView(buffer);
        const vertexCount = view.getUint32(0, true);
        const triangleCount = view.getUint32(4, true);
        const positions = new Float32Array(vertexCount * 3);
        for (let i = 0; i < positions.length; i += 1) positions[i] = view.getInt16(8 + i * 2, true) / 4000;
        const partOffset = 8 + vertexCount * 6;
        const padded = Math.ceil(vertexCount / 4) * 4;
        const parts = new Uint8Array(buffer, partOffset, vertexCount).slice();
        const ao = new Uint8Array(buffer, partOffset + padded, vertexCount);
        const tint = new Uint8Array(buffer, partOffset + padded * 2, vertexCount);
        // Cor por vértice: sombra nas dobras (oclusão) e um rubor quente nos pontos rosados da pele.
        const colors = new Float32Array(vertexCount * 3);
        for (let i = 0; i < vertexCount; i += 1) {
          const shade = 0.5 + 0.5 * (ao[i] / 255);
          const blush = tint[i] / 255;
          colors[i * 3] = shade;
          colors[i * 3 + 1] = shade * (1 - 0.11 * blush);
          colors[i * 3 + 2] = shade * (1 - 0.16 * blush);
        }
        const indexOffset = partOffset + padded * 3;
        const indices =
          vertexCount > 65535
            ? new Uint32Array(buffer.slice(indexOffset, indexOffset + triangleCount * 12))
            : new Uint16Array(buffer.slice(indexOffset, indexOffset + triangleCount * 6));
        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(positions, 3));
        geometry.setAttribute("part", new BufferAttribute(parts, 1));
        geometry.setAttribute("color", new BufferAttribute(colors, 3));
        geometry.setIndex(new BufferAttribute(indices, 1));
        geometry.computeVertexNormals();
        return geometry;
      });
    // Se falhar, a próxima tentativa (por exemplo, ao remontar) baixa de novo.
    promise.catch(() => cache.delete(type));
    cache.set(type, promise);
  }
  return promise;
}

type Include = (part: number, x: number, y: number) => boolean;

/**
 * Recorta uma região do corpo (os triângulos cujos 3 vértices passam em `include`) e a afasta `offset` metros
 * ao longo da normal. É assim que a roupa "veste" o corpo: ela é a própria pele um pouco maior.
 */
export function bodyRegion(body: BufferGeometry, include: Include, offset: number): BufferGeometry {
  const position = body.attributes.position;
  const normal = body.attributes.normal;
  const color = body.attributes.color;
  const part = body.attributes.part;
  const index = body.index!;
  const keep = new Uint8Array(position.count);
  for (let v = 0; v < position.count; v += 1) keep[v] = include(part.getX(v), position.getX(v), position.getY(v)) ? 1 : 0;

  const remap = new Int32Array(position.count).fill(-1);
  const outPosition: number[] = [];
  const outNormal: number[] = [];
  const outColor: number[] = [];
  const outIndex: number[] = [];
  const take = (v: number) => {
    if (remap[v] === -1) {
      remap[v] = outPosition.length / 3;
      const nx = normal.getX(v), ny = normal.getY(v), nz = normal.getZ(v);
      outPosition.push(position.getX(v) + nx * offset, position.getY(v) + ny * offset, position.getZ(v) + nz * offset);
      outNormal.push(nx, ny, nz);
      outColor.push(color.getX(v), color.getY(v), color.getZ(v));
    }
    return remap[v];
  };
  for (let t = 0; t < index.count; t += 3) {
    const a = index.getX(t), b = index.getX(t + 1), c = index.getX(t + 2);
    if (keep[a] && keep[b] && keep[c]) outIndex.push(take(a), take(b), take(c));
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(outPosition), 3));
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(outNormal), 3));
  geometry.setAttribute("color", new BufferAttribute(new Float32Array(outColor), 3));
  geometry.setIndex(outIndex);
  return geometry;
}

/** Só os triângulos virados para a frente (+Z): é onde a foto da peça é aplicada. */
export function frontFaces(source: BufferGeometry, minNormalZ = 0.35): BufferGeometry {
  const position = source.attributes.position;
  const normal = source.attributes.normal;
  const color = source.attributes.color;
  const index = source.index!;
  const remap = new Int32Array(position.count).fill(-1);
  const outPosition: number[] = [];
  const outNormal: number[] = [];
  const outColor: number[] = [];
  const outIndex: number[] = [];
  const take = (v: number) => {
    if (remap[v] === -1) {
      remap[v] = outPosition.length / 3;
      outPosition.push(position.getX(v), position.getY(v), position.getZ(v));
      outNormal.push(normal.getX(v), normal.getY(v), normal.getZ(v));
      outColor.push(color.getX(v), color.getY(v), color.getZ(v));
    }
    return remap[v];
  };
  for (let t = 0; t < index.count; t += 3) {
    const a = index.getX(t), b = index.getX(t + 1), c = index.getX(t + 2);
    if ((normal.getZ(a) + normal.getZ(b) + normal.getZ(c)) / 3 > minNormalZ) outIndex.push(take(a), take(b), take(c));
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(outPosition), 3));
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(outNormal), 3));
  geometry.setAttribute("color", new BufferAttribute(new Float32Array(outColor), 3));
  geometry.setIndex(outIndex);
  return geometry;
}

/**
 * Projeção frontal da foto: U segue a posição X (a foto ocupa de -halfSpan a +halfSpan) e V segue a altura
 * (0 em `y0`, 1 em `y1`).
 */
export function projectPhoto(geometry: BufferGeometry, halfSpan: number, y0: number, y1: number): BufferGeometry {
  const position = geometry.attributes.position;
  const uv = new Float32Array(position.count * 2);
  for (let v = 0; v < position.count; v += 1) {
    uv[v * 2] = position.getX(v) / (2 * halfSpan) + 0.5;
    uv[v * 2 + 1] = (position.getY(v) - y0) / (y1 - y0);
  }
  geometry.setAttribute("uv", new BufferAttribute(uv, 2));
  return geometry;
}

/** Quadril e cintura usados pelos perfis de vestido e saia (metros). */
const HIP_Y = 0.97;
const HIP_R = 0.2;
const WAIST_R = 0.13;
/** O corpo é mais largo que fundo: os torneados circulares são achatados nesta razão (com folga para o glúteo). */
export const BODY_DEPTH_RATIO = 0.82;

/** Perfil (raio, altura) de saia ou vestido: cintura, quadril e barra que abre até `hemRadius`. De baixo para cima. */
export function flareProfile(hemY: number, hemRadius: number, waistY: number, offset: number): Vector2[] {
  const points: Vector2[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i += 1) {
    const y = hemY + ((waistY - hemY) * i) / steps;
    const r =
      y <= HIP_Y
        ? HIP_R + (hemRadius - HIP_R) * Math.pow((HIP_Y - y) / Math.max(HIP_Y - hemY, 0.01), 0.85)
        : HIP_R + (WAIST_R - HIP_R) * ((y - HIP_Y) / Math.max(waistY - HIP_Y, 0.01));
    points.push(new Vector2(r + offset, y));
  }
  return points;
}

/** Pregas: `count` dobras ao redor, com amplitude `amp` (fração do raio) que cresce da cintura até a barra. */
export type Fold = { count: number; amp: number };

/** Torneado achatado (mais largo que fundo); `arc` < 2π desenha só a frente; `fold` acrescenta pregas. */
export function flareGeometry(points: Vector2[], arc = Math.PI * 2, fold?: Fold): LatheGeometry {
  const lathe = arc >= Math.PI * 2 ? new LatheGeometry(points, 96) : new LatheGeometry(points, 64, -arc / 2, arc);
  if (fold) {
    const yBottom = points[0].y;
    const yTop = points[points.length - 1].y;
    const position = lathe.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const weight = Math.min(1, Math.max(0, (yTop - position.getY(i)) / (yTop - yBottom)));
      const factor = 1 + fold.amp * weight * Math.sin(fold.count * Math.atan2(x, z));
      position.setX(i, x * factor);
      position.setZ(i, z * factor);
    }
  }
  lathe.scale(1, 1, BODY_DEPTH_RATIO);
  lathe.computeVertexNormals();
  return withWhiteColor(lathe);
}

/** Os torneados não têm sombra de oclusão: recebem cor branca para usar o mesmo material das peças do corpo. */
export function withWhiteColor<T extends BufferGeometry>(geometry: T): T {
  const count = geometry.attributes.position.count;
  geometry.setAttribute("color", new BufferAttribute(new Float32Array(count * 3).fill(1), 3));
  return geometry;
}
