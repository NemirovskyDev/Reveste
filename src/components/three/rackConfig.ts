/**
 * Parâmetros ajustáveis da arara. Unidades de cena (1 unidade ~ 1 metro).
 */

/** Meio-comprimento e meia-largura da pista oval do trilho. */
export const TRACK = { radiusX: 1.3, radiusZ: 0.62 } as const;

/** Altura do trilho e raio do tubo. */
export const RAIL = { y: 2.3, radius: 0.022 } as const;

/** Quantas voltas completas a arara dá quando progress vai de 0 a 1. */
export const TURNS = 1.25;

/** Rigidez do amortecimento da rotação (maior = acompanha a rolagem mais de perto). */
export const ROTATION_DAMPING = 5;

/** Quanto o balanço dura depois que a arara para (segundos, constante de tempo). */
export const SWAY_DECAY_SECONDS = 0.9;

/** Intensidade geral do balanço (1 = padrão). Multiplica ondulação do tecido e pêndulo. */
export const SWAY_STRENGTH = 1;

/** Escala máxima do tecido: unidades de cena por unidade do viewBox (200x240). */
export const MAX_GARMENT_SCALE = 1 / 150;

/** Pivô da peça abaixo do trilho (gancho + pescoço do cabide). */
export const GARMENT_DROP = 0.2;

/** Enquadramento: o que precisa caber na tela, em unidades de cena. */
export const FRAMING = { width: 3.3, height: 3.45, centerY: 1.15, elevationDeg: 14, fov: 30 } as const;
