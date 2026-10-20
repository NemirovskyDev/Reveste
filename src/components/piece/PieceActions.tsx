"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import type { Piece, Size } from "@/data/catalog";
import { formatMoney } from "@/lib/format";
import { RENTAL_DAYS, buyoutCents, netPlanRentalCents, rentalCents, type RentalDays } from "@/lib/pricing";
import { useCart } from "@/store/cart";
import { usePlan } from "@/store/plan";

type Notice = { kind: "bag" | "plan" | "full"; text: string } | null;

export function PieceActions({ piece }: { piece: Piece }) {
  const defaultSize = piece.sizes[Math.floor((piece.sizes.length - 1) / 2)] as Size;
  const [size, setSize] = useState<Size>(defaultSize);
  const [days, setDays] = useState<RentalDays>(7);
  const [notice, setNotice] = useState<Notice>(null);

  const addToCart = useCart((state) => state.add);
  const inCart = useCart((state) => state.lines.some((line) => line.pieceId === piece.id));
  const togglePlan = usePlan((state) => state.toggle);
  const inPlan = usePlan((state) => state.slots.some((slot) => slot.pieceId === piece.id));
  const planCount = usePlan((state) => state.slots.length);

  const perDay = (d: RentalDays) => formatMoney(Math.round(rentalCents(piece, d) / d));

  function onAddToCart() {
    addToCart({ pieceId: piece.id, size, days });
    setNotice({ kind: "bag", text: `Adicionado à sacola: tamanho ${size}, ${days} dias.` });
  }

  function onTogglePlan() {
    const ok = togglePlan(piece.id, size);
    if (!ok) {
      setNotice({ kind: "full", text: "Seu plano já tem 4 peças. Tire uma no montador para trocar." });
      return;
    }
    setNotice({
      kind: "plan",
      text: inPlan ? "Peça retirada do plano." : `Adicionada ao plano (${planCount + 1} de 4 peças).`,
    });
  }

  return (
    <div className="grid gap-7">
      <ChoiceGroup
        legend="Tamanho"
        options={piece.sizes.map((value) => ({ value, label: value }))}
        value={size}
        onChange={setSize}
      />

      <ChoiceGroup
        legend="Quanto tempo você quer ficar com a peça?"
        layout="stack"
        options={RENTAL_DAYS.map((value) => ({
          value,
          label: `${value} dias`,
          detail: (
            <>
              <span className="font-bold text-ink">{formatMoney(rentalCents(piece, value))}</span>
              <span className="ml-2 text-sm">{perDay(value)} por dia</span>
            </>
          ),
        }))}
        value={days}
        onChange={setDays}
      />

      <div className="grid gap-3">
        <Button size="lg" block icon="bag" onClick={onAddToCart}>
          {inCart ? "Atualizar na sacola" : "Adicionar à sacola"}
        </Button>
        <Button size="lg" block variant="secondary" icon={inPlan ? "check" : "plus"} onClick={onTogglePlan}>
          {inPlan ? "No plano. Tirar" : `Incluir no plano · ${formatMoney(netPlanRentalCents(piece))}/mês`}
        </Button>
        <p role="status" aria-live="polite" className="min-h-6 text-sm font-medium">
          {notice?.text}{" "}
          {notice?.kind === "bag" && (
            <Link href="/sacola" className="font-bold underline underline-offset-4">
              Ver sacola
            </Link>
          )}
          {(notice?.kind === "plan" || notice?.kind === "full") && (
            <Link href="/assinatura" className="font-bold underline underline-offset-4">
              Ver plano
            </Link>
          )}
        </p>
      </div>

      <section aria-labelledby="comprar-titulo" className="rounded-card border-2 border-ink bg-mint p-5">
        <h2 id="comprar-titulo" className="mb-1 text-xl font-bold">
          Gostou? Fique com ela.
        </h2>
        <p className="text-ink">
          Compra por <strong>{formatMoney(buyoutCents(piece, 0))}</strong>. Depois de 1 mês de aluguel no plano, falta
          pagar <strong>{formatMoney(buyoutCents(piece, 1))}</strong>.
        </p>
      </section>

      <ButtonLink href="/ajuda#regras" variant="ghost" size="sm" className="justify-self-start">
        Regras de atraso, dano e compra
      </ButtonLink>
    </div>
  );
}
