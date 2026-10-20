"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { addDaysIso, isoDateInSaoPaulo } from "@/lib/dates";
import { formatDateLong, formatDateShort, formatMoney } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/orderStatus";
import { ServiceError, services } from "@/services";
import type { Order } from "@/services/types";
import { useSession } from "@/store/session";

function ReturnForm({ order, onScheduled }: { order: Order; onScheduled: (order: Order) => void }) {
  const user = useSession((session) => session.user);
  const [date, setDate] = useState(order.returnOn ?? "");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const today = isoDateInSaoPaulo(new Date());

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError("");
    setDone(false);
    try {
      onScheduled(await services.orders.scheduleReturn(user.id, order.id, date));
      setDone(true);
    } catch (failure) {
      setError(failure instanceof ServiceError ? failure.message : "Não foi possível agendar agora. Tente de novo.");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-3 sm:grid-cols-[1fr_auto]">
      <div>
        <TextField
          label={`Data da devolução do pedido ${order.number}`}
          type="date"
          value={date}
          min={today}
          max={addDaysIso(today, 90)}
          onChange={(event) => setDate(event.target.value)}
          error={error}
        />
        {/* Região viva própria: a confirmação do agendamento é anunciada. */}
        <p role="status" aria-live="polite" className="mt-1 text-sm font-medium empty:hidden">
          {done ? `Devolução agendada para ${formatDateLong(date)}.` : ""}
        </p>
      </div>
      <Button type="submit" variant="secondary" className="sm:mt-8">
        {order.returnOn ? "Mudar data" : "Agendar devolução"}
      </Button>
    </form>
  );
}

export function AccountView() {
  const router = useRouter();
  const user = useSession((session) => session.user);
  const status = useSession((session) => session.status);
  const signOut = useSession((session) => session.signOut);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // Ao sair da conta o usuário some e o efeito abaixo mandaria para /entrar; este flag evita a disputa com a ida para a home.
  const leaving = useRef(false);

  useEffect(() => {
    if (status === "ready" && !user && !leaving.current) router.replace("/entrar?next=/conta");
  }, [status, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    services.orders
      .list(user.id)
      .then((list) => {
        if (cancelled) return;
        setLoadFailed(false);
        setOrders(list);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, attempt]);

  if (loadFailed) {
    return (
      <div role="alert" className="grid justify-items-start gap-4 rounded-card border-2 border-danger bg-danger-soft p-8">
        <h2 className="text-2xl font-bold text-danger">Não conseguimos carregar sua conta</h2>
        <p className="text-danger">Tente de novo em instantes.</p>
        <Button onClick={() => setAttempt((value) => value + 1)}>Tentar de novo</Button>
      </div>
    );
  }

  if (!user || orders === null) return <p className="py-10 text-ink-soft">Carregando sua conta…</p>;

  const activePlan = orders.find((order) => order.renewsOn && order.status !== "devolvido");

  function replaceOrder(updated: Order) {
    setOrders((current) => (current ?? []).map((order) => (order.id === updated.id ? updated : order)));
  }

  return (
    <div className="grid gap-12">
      <section aria-labelledby="dados-titulo" className="flex flex-wrap items-center justify-between gap-4 rounded-card border-2 border-ink bg-cream p-6">
        <div>
          <h2 id="dados-titulo" className="text-2xl font-bold">
            {user.name}
          </h2>
          <p className="text-ink-soft">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            leaving.current = true;
            await signOut();
            router.replace("/");
          }}
        >
          Sair da conta
        </Button>
      </section>

      {activePlan?.renewsOn && (
        <section aria-labelledby="plano-titulo" className="rounded-card border-2 border-ink bg-lavender p-6 md:p-8">
          <h2 id="plano-titulo" className="text-2xl font-bold">
            Seu plano
          </h2>
          <p className="mt-2 text-lg">
            Renova em <strong>{formatDateLong(activePlan.renewsOn)}</strong>. Até lá, você usa as 4 peças. Depois,
            devolve e escolhe outras.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/assinatura" variant="primary">
              Escolher as próximas peças
            </ButtonLink>
          </div>
        </section>
      )}

      <section aria-labelledby="pedidos-titulo">
        <h2 id="pedidos-titulo" className="mb-5 text-3xl font-bold">
          Pedidos
        </h2>
        {orders.length === 0 ? (
          <div className="grid justify-items-start gap-4 rounded-card border-2 border-ink bg-cream p-8">
            <p className="text-lg">Você ainda não fez nenhum pedido.</p>
            <ButtonLink href="/assinatura">Montar meu plano</ButtonLink>
          </div>
        ) : (
          <ul className="grid gap-5">
            {orders.map((order) => (
              <li key={order.id} className="grid gap-5 rounded-card border-2 border-ink bg-cream p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-extrabold">
                      <Link href={`/pedido?id=${order.id}`} className="underline-offset-4 hover:underline">
                        Pedido {order.number}
                      </Link>
                    </h3>
                    <p className="text-sm text-ink-soft">
                      {formatDateShort(order.createdAt)} · {order.lines.length} {order.lines.length === 1 ? "peça" : "peças"} ·{" "}
                      {formatMoney(order.totalCents)}
                    </p>
                  </div>
                  <span className="rounded-full border-2 border-ink bg-mint px-3 py-1 text-sm font-bold">
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                </div>
                <ul className="grid gap-1 text-sm">
                  {order.lines.map((line) => (
                    <li key={`${line.kind}:${line.pieceId}`}>
                      {line.title}, tamanho {line.size}
                    </li>
                  ))}
                </ul>
                {order.status !== "devolvido" && <ReturnForm order={order} onScheduled={replaceOrder} />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
