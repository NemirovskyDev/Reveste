import { CanvasTexture, SRGBColorSpace } from "three";
import { GARMENT_SHAPES, GARMENT_VIEWBOX, type GarmentType } from "@/data/garments";
import { darken, lighten } from "@/lib/color";

/** Pixels por unidade do viewBox. 3 dá ~600x720 px: nítido em tela cheia sem pesar na GPU. */
const PIXELS_PER_UNIT = 3;

export type GarmentTextures = { map: CanvasTexture; alphaMap: CanvasTexture };

function makeCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível para gerar a textura da peça.");
  return { canvas, ctx };
}

/** Trama simples de tecido (xadrez de fios claros e escuros) para repetir em pequena escala. */
function weavePattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const { canvas, ctx: p } = makeCanvas(6, 6);
  p.fillStyle = "rgba(0,0,0,0.55)";
  p.fillRect(0, 0, 3, 3);
  p.fillRect(3, 3, 3, 3);
  p.fillStyle = "rgba(255,255,255,0.55)";
  p.fillRect(3, 0, 3, 3);
  p.fillRect(0, 3, 3, 3);
  return ctx.createPattern(canvas, "repeat");
}

const FOLD_STOPS: ReadonlyArray<readonly [number, string]> = [
  [0, "rgba(0,0,0,0)"],
  [0.16, "rgba(0,0,0,0.08)"],
  [0.3, "rgba(255,255,255,0.05)"],
  [0.5, "rgba(0,0,0,0)"],
  [0.66, "rgba(255,255,255,0.07)"],
  [0.84, "rgba(0,0,0,0.09)"],
  [1, "rgba(0,0,0,0)"],
];

/**
 * Gera duas texturas por peça: cor (`map`) e máscara (`alphaMap`).
 * A máscara é separada porque canvas guarda pixels transparentes como preto: com o alpha no
 * próprio mapa, o filtro/mipmap puxaria um halo escuro para a borda. Aqui o `map` é opaco
 * (fundo já na cor da peça) e só a `alphaMap` recorta o contorno.
 */
export function createGarmentTextures(type: GarmentType, color: string, maxAnisotropy: number): GarmentTextures {
  const shape = GARMENT_SHAPES[type];
  const { width: vw, height: vh } = GARMENT_VIEWBOX;
  const w = vw * PIXELS_PER_UNIT;
  const h = vh * PIXELS_PER_UNIT;
  const s = PIXELS_PER_UNIT;
  const outline = new Path2D(shape.outline);

  // --- Cor ---
  const { canvas, ctx } = makeCanvas(w, h);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.scale(s, s);
  ctx.clip(outline);
  // O clip fica guardado em coordenadas de tela: soltamos a escala para pintar em pixels.
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, lighten(color, 0.14));
  base.addColorStop(0.5, color);
  base.addColorStop(1, darken(color, 0.16));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // Dobras suaves na vertical, para o tecido não parecer chapado.
  const folds = ctx.createLinearGradient(0, 0, w, 0);
  for (const [at, c] of FOLD_STOPS) folds.addColorStop(at, c);
  ctx.fillStyle = folds;
  ctx.fillRect(0, 0, w, h);

  const weave = weavePattern(ctx);
  if (weave) {
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = weave;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  // Sombra interna: três traços largos e fracos imitam um blur (ctx.filter não existe no Safari).
  ctx.scale(s, s);
  ctx.strokeStyle = darken(color, 0.55);
  ctx.lineJoin = "round";
  for (const width of [16, 10, 5]) {
    ctx.globalAlpha = 0.07;
    ctx.lineWidth = width;
    ctx.stroke(outline);
  }
  ctx.restore();

  // Costuras e bainha.
  ctx.save();
  ctx.scale(s, s);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const seam of shape.seams) {
    const path = new Path2D(seam);
    ctx.setLineDash([]);
    // Realce deslocado: dá relevo de costura sem precisar de normal map.
    ctx.save();
    ctx.translate(0.8, 0.9);
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = lighten(color, 0.4);
    ctx.lineWidth = 1.5;
    ctx.stroke(path);
    ctx.restore();

    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = darken(color, 0.3);
    ctx.lineWidth = 1.4;
    ctx.stroke(path);

    // Pesponto tracejado por cima.
    ctx.setLineDash([2.6, 2.2]);
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = lighten(color, 0.5);
    ctx.lineWidth = 0.5;
    ctx.stroke(path);
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = darken(color, 0.3);
  ctx.lineWidth = 1.2;
  ctx.stroke(outline);
  ctx.restore();

  // --- Máscara ---
  const mask = makeCanvas(w, h);
  mask.ctx.fillStyle = "#000";
  mask.ctx.fillRect(0, 0, w, h);
  mask.ctx.scale(s, s);
  mask.ctx.fillStyle = "#fff";
  mask.ctx.fill(outline);

  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = maxAnisotropy;
  const alphaMap = new CanvasTexture(mask.canvas);
  alphaMap.anisotropy = maxAnisotropy;
  return { map, alphaMap };
}
