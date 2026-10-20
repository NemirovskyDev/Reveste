"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { formatCep, formatDateLong, formatMoney } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/orderStatus";
import { services } from "@/services";
import type { Order } from "@/services/types";
import { useSession } from "@/store/session";

type State = { kind: "loading" } | { kind: "missing" } | { kind: "error" } | { kind: "ready"; order: Order };

export function OrderView() {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const user = useSession((session) => session.user);
  const status = useSession((session) => session.status);
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (status === "ready" && !user) router.replace(`/entrar?next=${encodeURIComponent(`/pedido?id=${id}`)}`);
  }, [status, user, id, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    services.orders
      .get(user.id, id)
      .then((order) => {
        if (!cancelled) setState(order ? { kind: "ready", order } : { kind: "missing" });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [user, id, attempt]);

  if (state.kind === "loading") return <p className="py-10 text-ink-soft">Carregando seu pedido…</p>;

  if (state.kind === "error") {
    return (
      <div role="alert" className="grid justify-items-start gap-4 rounded-card border-2 border-danger bg-danger-soft p-8">
        <h2 className="text-2xl font-bold text-danger">Não conseguimos carregar o pedido</h2>
        <p className="text-danger">Tente de novo em instantes.</p>
        <Button
          onClick={() => {
            setState({ kind: "loading" });
            setAttempt((value) => value + 1);
          }}
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (state.kind === "missing") {
    return (
      <div className="grid justify-items-start gap-4 rounded-card border-2 border-ink bg-cream p-8">
        <h2 className="text-2xl font-bold">Não encontramos esse pedido</h2>
        <p className="text-ink-soft">Ele pode ser de outra conta. Veja seus pedidos na sua conta.</p>
        <ButtonLink href="/conta">Ir para minha conta</ButtonLink>
      </div>
    );
  }

  const { order } = state;
  const planLines = order.lines.filter((line) => line.kind === "plan");

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="grid gap-8">
        <section className="rounded-card border-2 border-ink bg-mint p-6 md:p-8" aria-labelledby="confirmado">
          <h2 id="confirmado" className="text-3xl font-extrabold tracking-[-0.02em]">
            {ORDER_STATUS_LABEL[order.status]}
          </h2>
          <p className="mt-2 text-lg">
            Pedido <span className="rounded-full border-2 border-ink bg-white px-3 py-0.5 font-display font-extrabold">{order.number}</span>{" "}
            feito em {formatDateLong(order.createdAt)}.
          </p>
          {order.deliveryDays && (
            <p className="mt-3">
              As peças chegam em até <strong>{order.deliveryDays} dias úteis</strong>, no endereço de entrega abaixo.
            </p>
          )}
          {order.renewsOn && planLines.length > 0 && (
            <p className="mt-3">
              Seu plano renova em <strong>{formatDateLong(order.renewsOn)}</strong>. Nessa data você devolve as 4 peças e
              escolhe outras 4, pelo mesmo valor.
            </p>
          )}
        </section>

        <section aria-labelledby="pecas-titulo">
          <h2 id="pecas-titulo" className="mb-3 text-2xl font-bold">
            Peças
          </h2>
          <ul className="grid gap-2">
            {order.lines.map((line) => (
              <li key={`${line.kind}:${line.pieceId}`} className="flex items-center justify-between gap-4 rounded-control border-2 border-ink bg-cream px-4 py-3">
                <span>
                  <span className="block font-bold">{line.title}</span>
                  <span className="text-sm text-ink-soft">
                    Tamanho {line.size} ·{" "}
                    {line.kind === "plan" ? "Plano mensal" : line.kind === "purchase" ? "Compra" : `Aluguel de ${line.days} dias`}
                  </span>
                </span>
                <span className="font-bold">{formatMoney(line.priceCents)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="entrega-titulo">
          <h2 id="entrega-titulo" className="mb-3 text-2xl font-bold">
            Entrega
          </h2>
          <address className="not-italic">
            {order.address.street}, {order.address.number}
            {order.address.complement ? `, ${order.address.complement}` : ""}
            <br />
            {order.address.district}, {order.address.city} - {order.address.state}
            <br />
            CEP {formatCep(order.address.cep)}
          </address>
        </section>
      </div>

      <aside aria-labelledby="valores-titulo" className="rounded-card border-2 border-ink bg-cream p-6 lg:sticky lg:top-32">
        <h2 id="valores-titulo" className="mb-4 text-2xl font-bold">
          Valores
        </h2>
        <dl className="grid gap-2">
          <div className="flex justify-between gap-3">
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Frete</dt>
            <dd>{order.shippingCents === 0 ? "Grátis" : formatMoney(order.shippingCents)}</dd>
          </div>
          <div className="mt-1 flex justify-between gap-3 border-t-2 border-ink pt-3 font-display text-2xl font-extrabold">
            <dt>Total</dt>
            <dd>{formatMoney(order.totalCents)}</dd>
          </div>
          <div className="flex justify-between gap-3 text-sm text-ink-soft">
            <dt>Pagamento</dt>
            <dd>{order.payment.method === "pix" ? "Pix" : `Cartão final ${order.payment.last4}`}</dd>
          </div>
        </dl>
        <div className="mt-6 grid gap-2">
          <ButtonLink href="/conta" block>
            Ver meus pedidos
          </ButtonLink>
          <ButtonLink href="/catalogo" variant="ghost" block>
            Continuar explorando
          </ButtonLink>
        </div>
      </aside>
    </div>
  );
}
