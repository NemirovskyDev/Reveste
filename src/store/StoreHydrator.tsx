"use client";

import { useEffect } from "react";
import { useCart } from "./cart";
import { usePlan } from "./plan";
import { useStoresReady } from "./ready";
import { useSession } from "./session";

/** Lê o armazenamento local depois da hidratação do React, para o HTML do servidor e o do cliente baterem. */
export function StoreHydrator() {
  useEffect(() => {
    // `rehydrate` devolve undefined quando não há armazenamento; allSettled cobre os dois casos.
    void Promise.allSettled([useCart.persist.rehydrate(), usePlan.persist.rehydrate()]).then(() =>
      useStoresReady.getState().markReady(),
    );
    void useSession.getState().hydrate();
  }, []);

  return null;
}
