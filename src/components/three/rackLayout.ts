/**
 * Geometria pura da pista (trilho em formato de "stadium": duas retas ligadas por dois
 * semicírculos). Fica fora do React/Three para ser testável e reutilizável.
 *
 * Convenção de eixos (a mesma da cena): x para a direita, z para o espectador, y para cima.
 * O percurso começa no centro da reta da frente (0, +rz) e segue no sentido +x.
 */

export type HangerSlot = {
  x: number;
  z: number;
  /** Rotação em Y que aponta o +z local da peça para fora da pista (peça tangente ao trilho). */
  angle: number;
  /** Comprimento de arco percorrido desde o ponto inicial. */
  arc: number;
};

export type TrackPoint = { x: number; z: number; nx: number; nz: number };

type Stadium = { straight: number; radius: number; perimeter: number };

/** `radiusX` é o meio-comprimento total; `radiusZ` é o raio das pontas (meia-largura). */
function stadium(radiusX: number, radiusZ: number): Stadium {
  if (!Number.isFinite(radiusX) || !Number.isFinite(radiusZ) || radiusZ <= 0 || radiusX <= 0) {
    throw new RangeError("radiusX e radiusZ precisam ser números positivos.");
  }
  // Se a pista pedida for mais "gorda" que comprida, ela degenera num círculo de raio radiusX.
  const radius = Math.min(radiusZ, radiusX);
  const straight = radiusX - radius;
  return { straight, radius, perimeter: 4 * straight + 2 * Math.PI * radius };
}

export function stadiumPerimeter(radiusX: number, radiusZ: number): number {
  return stadium(radiusX, radiusZ).perimeter;
}

/** Ponto e normal externa (unitária) a `arc` de distância do início, com volta circular. */
export function pointOnStadium(arc: number, radiusX: number, radiusZ: number): TrackPoint {
  const { straight: L, radius: r, perimeter } = stadium(radiusX, radiusZ);
  let d = ((arc % perimeter) + perimeter) % perimeter;

  // Reta da frente, metade direita.
  if (d < L) return { x: d, z: r, nx: 0, nz: 1 };
  d -= L;
  // Ponta direita.
  if (d < Math.PI * r) {
    const t = d / r;
    return { x: L + r * Math.sin(t), z: r * Math.cos(t), nx: Math.sin(t), nz: Math.cos(t) };
  }
  d -= Math.PI * r;
  // Reta de trás.
  if (d < 2 * L) return { x: L - d, z: -r, nx: 0, nz: -1 };
  d -= 2 * L;
  // Ponta esquerda.
  if (d < Math.PI * r) {
    const t = d / r;
    return { x: -L - r * Math.sin(t), z: -r * Math.cos(t), nx: -Math.sin(t), nz: -Math.cos(t) };
  }
  d -= Math.PI * r;
  // Reta da frente, metade esquerda.
  return { x: -L + d, z: r, nx: 0, nz: 1 };
}

/** Posições igualmente espaçadas em comprimento de arco (não em ângulo) ao longo da pista. */
export function computeHangerSlots(count: number, radiusX: number, radiusZ: number): HangerSlot[] {
  const n = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (n === 0) return [];
  const { perimeter } = stadium(radiusX, radiusZ);
  return Array.from({ length: n }, (_, i) => {
    const arc = (i * perimeter) / n;
    const p = pointOnStadium(arc, radiusX, radiusZ);
    return { x: p.x, z: p.z, angle: Math.atan2(p.nx, p.nz), arc };
  });
}
