/**
 * Gera os corpos dos manequins (public/models/mannequin-female.bin e mannequin-male.bin).
 *
 * Cada corpo é uma "escultura" matemática: elipsoides e cones arredondados fundidos com uma união suave
 * (campo de distância com sinal), transformada em malha com surface nets. Além da posição, cada vértice
 * guarda: a parte do corpo (cabeça, tronco, braço...), usada pelo site para montar as roupas; a oclusão
 * ambiente (sombra nas dobras: axilas, entre as pernas, pescoço...); e um rubor (bochechas, nariz, orelhas,
 * cotovelos, joelhos, nós dos dedos) que dá cor à pele.
 *
 * Uso: node scripts/build-mannequin.mjs
 *
 * Formato do .bin (little-endian), cada vetor por vértice alinhado a 4 bytes:
 *   uint32 vértices, uint32 triângulos,
 *   int16[vértices*3] posições em 0,25 mm, uint8[vértices] parte, uint8[vértices] oclusão, uint8[vértices] rubor,
 *   uint16 (ou uint32 se há mais de 65535 vértices)[triângulos*3] índices
 */
import { mkdirSync, writeFileSync } from "node:fs";

const STEP = 0.0085;
const BOUNDS = { x: [-0.5, 0.5], y: [-0.03, 1.95], z: [-0.2, 0.3] };

/** Partes do corpo. */
export const PART = { head: 0, neck: 1, torso: 2, upperArm: 3, foreArm: 4, hand: 5, thigh: 6, calf: 7, foot: 8 };

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Cone arredondado (cápsula com raios diferentes), de Inigo Quilez. Devolve a função e a caixa envolvente. */
function roundCone(a, b, r1, r2) {
  const ba = sub(b, a);
  const l2 = dot(ba, ba);
  const rr = r1 - r2;
  const a2 = l2 - rr * rr;
  const il2 = 1 / l2;
  const r = Math.max(r1, r2);
  const min = [Math.min(a[0], b[0]) - r, Math.min(a[1], b[1]) - r, Math.min(a[2], b[2]) - r];
  const max = [Math.max(a[0], b[0]) + r, Math.max(a[1], b[1]) + r, Math.max(a[2], b[2]) + r];
  const fn = (p) => {
    const pa = sub(p, a);
    const y = dot(pa, ba);
    const z = y - l2;
    const q = [pa[0] * l2 - ba[0] * y, pa[1] * l2 - ba[1] * y, pa[2] * l2 - ba[2] * y];
    const x2 = dot(q, q);
    const y2 = y * y * l2;
    const z2 = z * z * l2;
    const k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
  };
  return { fn, min, max };
}

/** Elipsoide (distância aproximada). */
function ellipsoid(c, r) {
  const fn = (p) => {
    const q = [(p[0] - c[0]) / r[0], (p[1] - c[1]) / r[1], (p[2] - c[2]) / r[2]];
    const q2 = [q[0] / r[0], q[1] / r[1], q[2] / r[2]];
    const k0 = Math.hypot(q[0], q[1], q[2]);
    const k1 = Math.hypot(q2[0], q2[1], q2[2]);
    return k1 === 0 ? -Math.min(...r) : (k0 * (k0 - 1)) / k1;
  };
  return { fn, min: [c[0] - r[0], c[1] - r[1], c[2] - r[2]], max: [c[0] + r[0], c[1] + r[1], c[2] + r[2]] };
}

/** União suave polinomial. */
function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

/** Cabeça de cada corpo (centro e raios), igual à usada pelo site para o rosto e o cabelo. */
const HEAD = {
  female: { c: [0, 1.6, 0.01], r: [0.074, 0.101, 0.085] },
  male: { c: [0, 1.595, 0.01], r: [0.08, 0.107, 0.091] },
};

/** Posições (sem a escala do homem) usadas por braços, mãos e pernas. */
function limbPoints(type, s) {
  const female = type === "female";
  const sh = female ? [s * 0.172, 1.4, 0] : [s * 0.215, 1.42, 0];
  const el = female ? [s * 0.235, 1.13, 0.012] : [s * 0.275, 1.14, 0.012];
  const wr = female ? [s * 0.285, 0.88, 0.058] : [s * 0.33, 0.89, 0.06];
  const hp = [s * (female ? 0.088 : 0.092), 0.92, 0];
  const kn = [s * 0.097, 0.5, 0.012];
  const an = [s * 0.093, 0.075, -0.005];
  return { sh, el, wr, hp, kn, an };
}

/** Lista de primitivas do corpo. `k` é a suavidade da fusão dela com o que já existe. */
function primitives(type) {
  const female = type === "female";
  const head = HEAD[type];
  const prims = [];
  const add = (part, k, shape) => prims.push({ part, k, ...shape });

  // Cabeça, orelhas e pescoço
  add(PART.head, 0.03, ellipsoid(head.c, head.r));
  for (const s of [-1, 1]) add(PART.head, 0.012, ellipsoid([s * (head.r[0] * 0.99), head.c[1] - 0.006, head.c[2] - 0.006], [0.0115, 0.031, 0.02]));
  add(PART.neck, 0.04, roundCone([0, 1.5, 0], [0, 1.575, 0.008], 0.047, 0.04));

  // Tronco
  if (female) {
    add(PART.torso, 0.07, roundCone([-0.15, 1.43, 0], [0.15, 1.43, 0], 0.044, 0.044));
    add(PART.torso, 0.09, ellipsoid([0, 1.3, 0], [0.136, 0.19, 0.09]));
    for (const s of [-1, 1]) add(PART.torso, 0.05, ellipsoid([s * 0.072, 1.3, 0.076], [0.058, 0.058, 0.055]));
    add(PART.torso, 0.09, ellipsoid([0, 1.13, 0], [0.1, 0.125, 0.072]));
    add(PART.torso, 0.09, ellipsoid([0, 0.97, 0], [0.146, 0.125, 0.09]));
    for (const s of [-1, 1]) add(PART.torso, 0.06, ellipsoid([s * 0.064, 0.92, -0.048], [0.064, 0.085, 0.062]));
  } else {
    add(PART.torso, 0.07, roundCone([-0.185, 1.44, 0], [0.185, 1.44, 0], 0.054, 0.054));
    add(PART.torso, 0.09, ellipsoid([0, 1.31, 0], [0.185, 0.2, 0.105]));
    // Peitoral e abdômen mais marcados
    for (const s of [-1, 1]) add(PART.torso, 0.04, ellipsoid([s * 0.075, 1.35, 0.06], [0.075, 0.06, 0.05]));
    add(PART.torso, 0.09, ellipsoid([0, 1.13, 0], [0.14, 0.125, 0.09]));
    add(PART.torso, 0.09, ellipsoid([0, 0.97, 0], [0.165, 0.125, 0.1]));
    for (const s of [-1, 1]) add(PART.torso, 0.06, ellipsoid([s * 0.07, 0.92, -0.05], [0.07, 0.08, 0.065]));
  }

  for (const s of [-1, 1]) {
    const { sh, el, wr, hp, kn, an } = limbPoints(type, s);
    add(PART.upperArm, 0.045, roundCone(sh, el, female ? 0.038 : 0.047, female ? 0.031 : 0.038));
    add(PART.foreArm, 0.04, roundCone(el, wr, female ? 0.029 : 0.035, female ? 0.022 : 0.026));

    // Mão com a palma voltada para a coxa: dedos em fila ao longo de Z, polegar à frente
    const k = female ? 1 : 1.08;
    const pc = [wr[0] + s * 0.012, wr[1] - 0.045 * k, wr[2] + 0.016];
    add(PART.hand, 0.02, ellipsoid(pc, [0.012 * k, 0.044 * k, 0.025 * k]));
    const fingers = [
      { dz: 0.016, len: 0.06 },
      { dz: 0.005, len: 0.066 },
      { dz: -0.006, len: 0.06 },
      { dz: -0.017, len: 0.048 },
    ];
    for (const f of fingers) {
      const top = [pc[0], pc[1] - 0.034 * k, pc[2] + f.dz * k];
      const tip = [pc[0] - s * 0.006, pc[1] - 0.034 * k - f.len * k, pc[2] + f.dz * k + 0.006];
      add(PART.hand, 0.01, roundCone(top, tip, 0.0092 * k, 0.0068 * k));
    }
    add(PART.hand, 0.012, roundCone([pc[0] - s * 0.004, pc[1] + 0.012 * k, pc[2] + 0.02 * k], [pc[0] - s * 0.008, pc[1] - 0.042 * k, pc[2] + 0.044 * k], 0.0108 * k, 0.0078 * k));

    // Perna
    add(PART.thigh, 0.06, roundCone(hp, kn, female ? 0.072 : 0.088, female ? 0.048 : 0.056));
    add(PART.calf, 0.04, roundCone(kn, an, female ? 0.05 : 0.053, 0.03));
    add(PART.calf, 0.05, ellipsoid([s * 0.098, 0.38, -0.02], [0.043, 0.1, 0.043]));
    add(PART.foot, 0.03, roundCone([s * 0.093, 0.058, 0], [s * 0.102, 0.04, 0.14], 0.034, 0.026));
    add(PART.foot, 0.03, ellipsoid([s * 0.093, 0.052, -0.025], [0.034, 0.04, 0.04]));
  }
  return prims;
}

/** Pontos onde a pele fica mais rosada: bochechas, nariz, orelhas, cotovelos, joelhos, nós dos dedos e dedos dos pés. */
function blushPoints(type) {
  const head = HEAD[type];
  const points = [];
  const add = (p, sigma, w) => points.push({ p, sigma, w });
  for (const s of [-1, 1]) {
    add([s * head.r[0] * 0.55, head.c[1] - 0.015, head.c[2] + head.r[2] * 0.78], 0.03, 0.9);
    add([s * head.r[0] * 1.0, head.c[1] - 0.006, head.c[2] - 0.006], 0.022, 0.8);
    const { el, wr, kn, an } = limbPoints(type, s);
    add(el, 0.035, 0.55);
    add(kn, 0.04, 0.55);
    add([wr[0] + s * 0.012, wr[1] - 0.1, wr[2] + 0.02], 0.04, 0.5);
    add([an[0] + s * 0.007, 0.045, 0.14], 0.035, 0.5);
  }
  add([0, head.c[1] - 0.02, head.c[2] + head.r[2]], 0.016, 0.6);
  return points;
}

function buildField(type) {
  const prims = primitives(type);
  const blush = blushPoints(type);
  const scale = type === "male" ? 1.045 : 1;
  const margin = 0.07;
  const field = (p) => {
    const x = p[0] / scale, y = p[1] / scale, z = p[2] / scale;
    const q = [x, y, z];
    let d = null;
    for (const prim of prims) {
      if (x < prim.min[0] - margin || x > prim.max[0] + margin || y < prim.min[1] - margin || y > prim.max[1] + margin || z < prim.min[2] - margin || z > prim.max[2] + margin) continue;
      const v = prim.fn(q);
      d = d === null ? v : smin(d, v, prim.k);
    }
    return (d === null ? margin : d) * scale;
  };
  const partAt = (p) => {
    const q = [p[0] / scale, p[1] / scale, p[2] / scale];
    let best = Infinity;
    let part = 0;
    for (const prim of prims) {
      const d = prim.fn(q);
      if (d < best) { best = d; part = prim.part; }
    }
    return part;
  };
  const tintAt = (p) => {
    const q = [p[0] / scale, p[1] / scale, p[2] / scale];
    let t = 0;
    for (const b of blush) {
      const d2 = (q[0] - b.p[0]) ** 2 + (q[1] - b.p[1]) ** 2 + (q[2] - b.p[2]) ** 2;
      t = Math.max(t, b.w * Math.exp(-d2 / (b.sigma * b.sigma)));
    }
    return t;
  };
  return { field, partAt, tintAt };
}

/** Surface nets: uma malha lisa a partir do campo de distância com sinal. */
function surfaceNets(field) {
  const nx = Math.ceil((BOUNDS.x[1] - BOUNDS.x[0]) / STEP) + 1;
  const ny = Math.ceil((BOUNDS.y[1] - BOUNDS.y[0]) / STEP) + 1;
  const nz = Math.ceil((BOUNDS.z[1] - BOUNDS.z[0]) / STEP) + 1;
  const at = (i, j, k) => (k * ny + j) * nx + i;
  const pos = (i, j, k) => [BOUNDS.x[0] + i * STEP, BOUNDS.y[0] + j * STEP, BOUNDS.z[0] + k * STEP];
  const values = new Float32Array(nx * ny * nz);
  for (let k = 0; k < nz; k += 1) for (let j = 0; j < ny; j += 1) for (let i = 0; i < nx; i += 1) values[at(i, j, k)] = field(pos(i, j, k));

  const cellVertex = new Int32Array(nx * ny * nz).fill(-1);
  const vertices = [];
  const corners = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  for (let k = 0; k < nz - 1; k += 1) for (let j = 0; j < ny - 1; j += 1) for (let i = 0; i < nx - 1; i += 1) {
    const v = corners.map(([a, b, c]) => values[at(i + a, j + b, k + c)]);
    let neg = 0;
    for (const x of v) if (x < 0) neg += 1;
    if (neg === 0 || neg === 8) continue;
    const sum = [0, 0, 0];
    let count = 0;
    for (const [a, b] of edges) {
      if (v[a] < 0 === v[b] < 0) continue;
      const t = v[a] / (v[a] - v[b]);
      for (let m = 0; m < 3; m += 1) sum[m] += corners[a][m] + t * (corners[b][m] - corners[a][m]);
      count += 1;
    }
    cellVertex[at(i, j, k)] = vertices.length;
    vertices.push([BOUNDS.x[0] + (i + sum[0] / count) * STEP, BOUNDS.y[0] + (j + sum[1] / count) * STEP, BOUNDS.z[0] + (k + sum[2] / count) * STEP]);
  }

  const grad = (p) => {
    const h = STEP * 0.5;
    return [
      field([p[0] + h, p[1], p[2]]) - field([p[0] - h, p[1], p[2]]),
      field([p[0], p[1] + h, p[2]]) - field([p[0], p[1] - h, p[2]]),
      field([p[0], p[1], p[2] + h]) - field([p[0], p[1], p[2] - h]),
    ];
  };
  const triangles = [];
  const emit = (a, b, c) => {
    const pa = vertices[a], pb = vertices[b], pc = vertices[c];
    const n = [
      (pb[1] - pa[1]) * (pc[2] - pa[2]) - (pb[2] - pa[2]) * (pc[1] - pa[1]),
      (pb[2] - pa[2]) * (pc[0] - pa[0]) - (pb[0] - pa[0]) * (pc[2] - pa[2]),
      (pb[0] - pa[0]) * (pc[1] - pa[1]) - (pb[1] - pa[1]) * (pc[0] - pa[0]),
    ];
    const g = grad([(pa[0] + pb[0] + pc[0]) / 3, (pa[1] + pb[1] + pc[1]) / 3, (pa[2] + pb[2] + pc[2]) / 3]);
    if (dot(n, g) >= 0) triangles.push(a, b, c);
    else triangles.push(a, c, b);
  };
  // Para cada aresta da grade com troca de sinal, liga os 4 vértices das células ao redor.
  const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let k = 1; k < nz - 1; k += 1) for (let j = 1; j < ny - 1; j += 1) for (let i = 1; i < nx - 1; i += 1) {
    const here = values[at(i, j, k)] < 0;
    for (let d = 0; d < 3; d += 1) {
      const e = axes[d];
      if (here === values[at(i + e[0], j + e[1], k + e[2])] < 0) continue;
      const u = axes[(d + 1) % 3];
      const w = axes[(d + 2) % 3];
      const cell = (du, dw) => cellVertex[at(i - du * u[0] - dw * w[0], j - du * u[1] - dw * w[1], k - du * u[2] - dw * w[2])];
      const q = [cell(0, 0), cell(1, 0), cell(1, 1), cell(0, 1)];
      if (q.some((x) => x < 0)) continue;
      emit(q[0], q[1], q[2]);
      emit(q[0], q[2], q[3]);
    }
  }
  return { vertices, triangles };
}

/** Oclusão ambiente (Inigo Quilez): quanto o campo ao redor do vértice está "mais fechado" que o espaço livre. */
function ambientOcclusion(field, p) {
  const h = 0.003;
  const n = [
    field([p[0] + h, p[1], p[2]]) - field([p[0] - h, p[1], p[2]]),
    field([p[0], p[1] + h, p[2]]) - field([p[0], p[1] - h, p[2]]),
    field([p[0], p[1], p[2] + h]) - field([p[0], p[1], p[2] - h]),
  ];
  const len = Math.hypot(...n) || 1;
  const nn = n.map((x) => x / len);
  let occ = 0;
  let weight = 1;
  for (const d of [0.012, 0.025, 0.045, 0.075, 0.11]) {
    occ += (d - field([p[0] + nn[0] * d, p[1] + nn[1] * d, p[2] + nn[2] * d])) * weight;
    weight *= 0.72;
  }
  return Math.min(1, Math.max(0, 1 - 2.4 * occ));
}

function writeBin(type) {
  const { field, partAt, tintAt } = buildField(type);
  const { vertices, triangles } = surfaceNets(field);
  const nV = vertices.length;
  const nT = triangles.length / 3;
  const parts = vertices.map(partAt);
  const aos = vertices.map((p) => ambientOcclusion(field, p));
  const tints = vertices.map(tintAt);
  const wide = nV > 65535;
  const posBytes = nV * 6;
  const padded = Math.ceil(nV / 4) * 4;
  const idxBytes = triangles.length * (wide ? 4 : 2);
  const buffer = Buffer.alloc(8 + posBytes + padded * 3 + idxBytes);
  buffer.writeUInt32LE(nV, 0);
  buffer.writeUInt32LE(nT, 4);
  let o = 8;
  for (const v of vertices) for (let m = 0; m < 3; m += 1) { buffer.writeInt16LE(Math.round(v[m] * 4000), o); o += 2; }
  for (let i = 0; i < nV; i += 1) buffer.writeUInt8(parts[i], o + i);
  o += padded;
  for (let i = 0; i < nV; i += 1) buffer.writeUInt8(Math.round(aos[i] * 255), o + i);
  o += padded;
  for (let i = 0; i < nV; i += 1) buffer.writeUInt8(Math.round(Math.min(1, tints[i]) * 255), o + i);
  o += padded;
  for (const t of triangles) { if (wide) buffer.writeUInt32LE(t, o), (o += 4); else buffer.writeUInt16LE(t, o), (o += 2); }
  mkdirSync("public/models", { recursive: true });
  writeFileSync(`public/models/mannequin-${type}.bin`, buffer);
  console.log(type, { vertices: nV, triangles: nT, bytes: buffer.length, wideIndices: wide });
}

writeBin("female");
writeBin("male");
