import {
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GARMENT_SHAPES, GARMENT_VIEWBOX, type GarmentType } from "@/data/garments";
import { RAIL, TRACK } from "./rackConfig";
import { pointOnStadium, stadiumPerimeter } from "./rackLayout";

const UP = new Vector3(0, 1, 0);

/** Une geometrias simples (mesmos atributos) num único draw call. */
function merge(parts: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error("Não foi possível unir as geometrias da arara.");
  return merged;
}

/** Cilindro fino entre dois pontos (barras da estrutura). */
function barBetween(a: Vector3, b: Vector3, radius: number): BufferGeometry {
  const dir = new Vector3().subVectors(b, a);
  const geo = new CylinderGeometry(radius, radius, dir.length(), 14, 1);
  geo.applyQuaternion(new Quaternion().setFromUnitVectors(UP, dir.normalize()));
  const mid = new Vector3().addVectors(a, b).multiplyScalar(0.5);
  geo.translate(mid.x, mid.y, mid.z);
  return geo;
}

/** Trilho em formato de pista: tubo fechado que segue exatamente os pontos de `pointOnStadium`. */
export function createRailGeometry(): TubeGeometry {
  const { radiusX, radiusZ } = TRACK;
  const perimeter = stadiumPerimeter(radiusX, radiusZ);
  const samples = 96;
  const points = Array.from({ length: samples }, (_, i) => {
    const p = pointOnStadium((i * perimeter) / samples, radiusX, radiusZ);
    return new Vector3(p.x, RAIL.y, p.z);
  });
  return new TubeGeometry(new CatmullRomCurve3(points, true, "centripetal"), 320, RAIL.radius, 14, true);
}

/**
 * Montantes, travessas do topo e pés da base. Os montantes ficam nos pontos onde a reta vira
 * curva (x = ±L), então não atravessam as peças que penduram no trilho.
 */
export function createFrameGeometry(): BufferGeometry {
  const { radiusX, radiusZ } = TRACK;
  const L = Math.max(radiusX - radiusZ, 0);
  const bar = 0.026;
  const footY = 0.1;
  const footHalf = radiusZ + 0.22;
  const parts: BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    const x = side * L;
    // Montante.
    parts.push(barBetween(new Vector3(x, footY, 0), new Vector3(x, RAIL.y - RAIL.radius, 0), bar));
    // Travessa do topo ligando as duas retas do trilho.
    parts.push(barBetween(new Vector3(x, RAIL.y - RAIL.radius, -radiusZ), new Vector3(x, RAIL.y - RAIL.radius, radiusZ), bar * 0.8));
    // Pé da base, em z.
    parts.push(barBetween(new Vector3(x, footY, -footHalf), new Vector3(x, footY, footHalf), bar * 1.1));
    // Mão-francesa dando rigidez ao montante.
    parts.push(barBetween(new Vector3(x, footY, 0), new Vector3(x, 0.62, 0), bar * 1.5));
  }
  // Barra longitudinal ligando os dois pés.
  parts.push(barBetween(new Vector3(-L, footY, 0), new Vector3(L, footY, 0), bar * 1.1));
  return merge(parts);
}

/** Rodízios: haste curta + roda achatada, um em cada ponta dos pés. */
export function createCasterGeometry(): BufferGeometry {
  const { radiusX, radiusZ } = TRACK;
  const L = Math.max(radiusX - radiusZ, 0);
  const footHalf = radiusZ + 0.22;
  const parts: BufferGeometry[] = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const x = sx * L;
      const z = sz * footHalf;
      const wheel = new CylinderGeometry(0.05, 0.05, 0.035, 20);
      wheel.rotateX(Math.PI / 2); // eixo da roda ao longo de z (rola em x)
      wheel.translate(x, 0.05, z);
      parts.push(wheel);
      const fork = new BoxGeometry(0.04, 0.05, 0.06);
      fork.translate(x, 0.098, z);
      parts.push(fork);
      const knuckle = new SphereGeometry(0.03, 12, 8);
      knuckle.translate(x, 0.125, z);
      parts.push(knuckle);
    }
  }
  return merge(parts);
}

/**
 * Cabide de madeira clara. A origem fica no centro do trilho (o gancho abraça o tubo);
 * o pescoço desce até `neckY` e os ombros abrem para os lados.
 */
export function createHangerGeometry(halfWidth: number): BufferGeometry {
  const neckY = -0.15;
  const shoulderY = -0.27;
  const parts: BufferGeometry[] = [];

  // Gancho: anel em volta do trilho (o eixo do anel é o do trilho, local x).
  const ring = new TorusGeometry(RAIL.radius * 1.55, 0.007, 10, 24);
  ring.rotateY(Math.PI / 2);
  parts.push(ring);

  const neck = new CylinderGeometry(0.008, 0.008, -neckY - 0.03, 8);
  neck.translate(0, (neckY - 0.03) / 2, 0);
  parts.push(neck);

  const rise = shoulderY - neckY;
  const armLength = Math.hypot(halfWidth, rise);
  const tilt = Math.atan2(rise, halfWidth);
  for (const side of [-1, 1]) {
    const arm = new BoxGeometry(armLength, 0.016, 0.02);
    arm.rotateZ(side * tilt);
    arm.translate((side * halfWidth) / 2, (neckY + shoulderY) / 2, 0);
    parts.push(arm);
  }
  const bar = new BoxGeometry(halfWidth * 2, 0.012, 0.016);
  bar.translate(0, shoulderY, 0);
  parts.push(bar);
  return merge(parts);
}

export type GarmentGeometry = {
  geometry: PlaneGeometry;
  /** Largura total e altura abaixo do pivô, em unidades de cena. */
  width: number;
  height: number;
};

/**
 * Plano subdividido (24x28) com leve curvatura: o centro avança em z e a barra abre um pouco,
 * como tecido que cai sobre um cabide. O pivô (origem) fica no ponto onde o gancho toca a peça.
 */
export function createGarmentGeometry(type: GarmentType, scale: number): GarmentGeometry {
  const { width: vw, height: vh } = GARMENT_VIEWBOX;
  const { hangerY } = GARMENT_SHAPES[type];
  const width = vw * scale;
  const fullHeight = vh * scale;
  const geometry = new PlaneGeometry(width, fullHeight, 24, 28);
  // O plano nasce centrado em (100, 120) do viewBox; trazemos o pivô (100, hangerY) para a origem.
  const pivotY = (vh / 2 - hangerY) * scale;
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i) - pivotY;
    const across = 1 - Math.pow((2 * x) / width, 2); // 1 no centro, 0 nas laterais
    const hang = Math.min(1, Math.max(0, -y / ((vh - hangerY) * scale)));
    position.setXYZ(i, x, y, 0.07 * across * (0.35 + 0.65 * hang));
  }
  geometry.computeVertexNormals();
  return { geometry, width, height: (vh - hangerY) * scale };
}
