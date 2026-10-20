/** Fotos recortadas (public/images/mannequin/<id>.webp) usadas como roupa dos manequins, com largura ÷ altura de cada uma. */
export const GARMENT_PHOTO_ASPECT: Record<string, number> = {
  "renner-vestido": 0.375,
  "zara-blazer": 0.669,
  "farm-saia": 0.641,
  "ca-camisa": 0.935,
  "riachuelo-calca": 0.356,
  "ca-jaqueta": 0.9,
  "mango-calca": 0.525,
  "farm-vestido": 0.426,
  "renner-blazer": 0.728,
  "ca-saia": 0.607,
  "riachuelo-camisa": 0.815,
  "renner-calca": 0.381,
  "zara-camisa": 0.73,
};

/** Cor média de cada foto, usada na roupa lisa que fica por baixo para combinar com a foto. */
export const GARMENT_PHOTO_COLOR: Record<string, string> = {
  "renner-vestido": "#e19965",
  "zara-blazer": "#e1d7c5",
  "farm-saia": "#cc816a",
  "ca-camisa": "#abb19d",
  "riachuelo-calca": "#3f3f3f",
  "ca-jaqueta": "#6d849a",
  "mango-calca": "#413d41",
  "farm-vestido": "#b79bb1",
  "renner-blazer": "#c0a7c5",
  "ca-saia": "#d8a19d",
  "riachuelo-camisa": "#afc9e6",
  "renner-calca": "#e7dfce",
  "zara-camisa": "#9fc0e3",
};
