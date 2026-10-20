/** Radianos de giro por pixel arrastado. */
export const DRAG_RADIANS_PER_PIXEL = 0.012;

type Handlers = {
  /** Começou um arraste. */
  onStart: () => void;
  /** Deslocamento horizontal, em pixels, desde o último evento. */
  onMove: (dx: number) => void;
  /** Terminou (soltou, cancelou ou o navegador assumiu a rolagem da página). */
  onEnd: () => void;
};

/**
 * Liga o giro por arraste (mouse, caneta e toque) a um elemento. Só o movimento horizontal conta: o elemento fica com
 * `touch-action: pan-y`, então um gesto vertical continua rolando a página (o navegador cancela o ponteiro e o
 * arraste termina). Devolve a função que desfaz tudo.
 */
export function attachDragRotate(element: HTMLElement, { onStart, onMove, onEnd }: Handlers): () => void {
  let pointerId: number | null = null;
  let lastX = 0;

  const previous = { touchAction: element.style.touchAction, cursor: element.style.cursor };
  element.style.touchAction = "pan-y";
  element.style.cursor = "grab";

  const finish = () => {
    if (pointerId === null) return;
    pointerId = null;
    element.style.cursor = "grab";
    onEnd();
  };
  const down = (event: PointerEvent) => {
    if (pointerId !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
    pointerId = event.pointerId;
    lastX = event.clientX;
    element.style.cursor = "grabbing";
    onStart();
  };
  const move = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    onMove(event.clientX - lastX);
    lastX = event.clientX;
  };
  const up = (event: PointerEvent) => {
    if (event.pointerId === pointerId) finish();
  };

  element.addEventListener("pointerdown", down);
  // No `window` para continuar o arraste mesmo quando o ponteiro sai do elemento.
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
  return () => {
    element.removeEventListener("pointerdown", down);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
    element.style.touchAction = previous.touchAction;
    element.style.cursor = previous.cursor;
    if (pointerId !== null) onEnd();
  };
}
