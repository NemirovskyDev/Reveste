import { darken, hexToRgb, lighten, mix } from "@/lib/color";

/**
 * Cores derivadas da cor principal da peça. Tudo é calculado a partir de um
 * único hex, então o mesmo desenho funciona em qualquer tom do catálogo.
 */
export type Palette = {
  base: string;
  /** Realce suave (dobras claras, bordas de colarinho). */
  hi: string;
  /** Sombra (dobras escuras, sombra sob colarinho/mangas). */
  shade: string;
  /** Traço de costura: precisa contrastar com a peça, clara ou escura. */
  seam: string;
  /** Contorno externo da peça. */
  edge: string;
  /** Parte de dentro da gola (nuca), visível atrás do decote. */
  back: string;
  /** Forro/camisa que aparece por baixo de lapelas e golas. */
  lining: string;
  button: string;
  isDark: boolean;
};

/** Luminância percebida (0 a 1), suficiente para separar tons claros de escuros. */
function luma(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function makePalette(color: string): Palette {
  const l = luma(color);
  const isDark = l < 0.4;
  const isPale = l > 0.78;
  return {
    base: color,
    hi: lighten(color, isDark ? 0.3 : 0.5),
    shade: darken(color, isDark ? 0.55 : 0.4),
    // Em tons escuros a costura clareia (senão some); nos claros escurece mais.
    seam: isDark ? lighten(color, 0.38) : darken(color, isPale ? 0.32 : 0.26),
    edge: darken(color, isDark ? 0.5 : 0.3),
    back: darken(color, isDark ? 0.3 : 0.18),
    lining: isDark ? mix(color, "#f4efe8", 0.82) : mix(color, "#ffffff", 0.72),
    button: isDark ? lighten(color, 0.55) : isPale ? darken(color, 0.34) : lighten(color, 0.62),
    isDark,
  };
}
