"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { TextField } from "@/components/ui/Field";
import { QrCode } from "@/components/ui/QrCode";
import { formatCardNumber, formatCep, formatExpiry, formatMoney, plural } from "@/lib/format";
import { buildOrderLines, summarizeBag } from "@/lib/orderLines";
import { PLAN_SIZE } from "@/lib/pricing";
import {
  addressSchema,
  cardSchema,
  onlyDigits,
  type Address,
  type AddressInput,
  type CardInput,
} from "@/lib/validation";
import { ServiceError, services } from "@/services";
import type { PaymentSummary, ShippingQuote } from "@/services/types";
import { useCart } from "@/store/cart";
import { usePlan } from "@/store/plan";
import { useSession } from "@/store/session";
import { useBagHydrated } from "@/store/useHydrated";

type Method = "pix" | "cartao";
/** O Pix guarda o valor para o qual foi gerado: se o total mudar depois, ele deixa de valer. */
type PixState = { code: string; reference: string; amountCents: number };

const GENERIC_PAY_ERROR = "Não foi possível concluir o pagamento. Tente de novo em instantes.";

function StepHeading({ id, step, children }: { id: string; step: number; children: string }) {
  return (
    <h2 id={id} className="flex items-center gap-3 text-2xl font-bold">
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-full border-2 border-ink bg-mint font-display text-lg font-extrabold"
      >
        {step}
      </span>
      {children}
    </h2>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useBagHydrated();
  const user = useSession((state) => state.user);
  const status = useSession((state) => state.status);
  const lines = useCart((state) => state.lines);
  const clearCart = useCart((state) => state.clear);
  const slots = usePlan((state) => state.slots);
  const clearPlan = usePlan((state) => state.clear);

  const [method, setMethod] = useState<Method>("pix");
  const [quoted, setQuoted] = useState<{ key: string; quote: ShippingQuote } | null>(null);
  const [shippingFailed, setShippingFailed] = useState(false);
  const [cepNotice, setCepNotice] = useState("");
  const [pix, setPix] = useState<PixState | null>(null);
  const [payError, setPayError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const busy = useRef(false);
  const pixHeading = useRef<HTMLHeadingElement>(null);
  // Pagamento já autorizado cujo pedido ainda não foi gravado: se gravar falhar, a nova tentativa só repete a
  // gravação e não cobra de novo.
  const authorized = useRef<PaymentSummary | null>(null);

  const address = useForm<AddressInput, unknown, Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: { cep: "", street: "", number: "", complement: "", district: "", city: "", state: "" },
  });
  const card = useForm<CardInput>({
    resolver: zodResolver(cardSchema),
    defaultValues: { holder: "", number: "", expiry: "", cvv: "" },
  });

  const summary = summarizeBag(slots, lines);
  const rentalCount = lines.length;
  const shippingKind = summary.hasPlan && rentalCount === 0 ? "plan" : "rental";

  // O frete depende do CEP completo e do tipo de sacola. A cotação guarda a chave de quando foi feita,
  // então uma cotação velha nunca aparece para um CEP novo (e não precisa de setState dentro do efeito).
  const cepDigits = onlyDigits(useWatch({ control: address.control, name: "cep" }) ?? "");
  const quoteKey = cepDigits.length === 8 ? `${cepDigits}:${shippingKind}:${rentalCount}` : null;
  const shipping = quoteKey && quoted?.key === quoteKey ? quoted.quote : null;
  const total = summary.subtotalCents + (shipping?.cents ?? 0);
  const activePix = pix && pix.amountCents === total ? pix : null;
  const pixStale = Boolean(pix && !activePix);

  // Quem não está logada entra primeiro e volta para o pagamento.
  useEffect(() => {
    if (status === "ready" && !user) router.replace("/entrar?next=/checkout");
  }, [status, user, router]);

  // O botão "Gerar Pix" some quando o código aparece; o foco vai para o título do Pix em vez de cair no topo.
  const pixReference = activePix?.reference;
  useEffect(() => {
    if (pixReference) pixHeading.current?.focus();
  }, [pixReference]);

  useEffect(() => {
    if (!quoteKey) return;
    let cancelled = false;
    services.shipping
      .quote(cepDigits, shippingKind, rentalCount)
      .then((quote) => {
        if (cancelled) return;
        setShippingFailed(false);
        setQuoted({ key: quoteKey, quote });
      })
      .catch(() => {
        if (!cancelled) setShippingFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [quoteKey, cepDigits, shippingKind, rentalCount]);

  async function lookupCep() {
    const digits = onlyDigits(address.getValues("cep") ?? "");
    if (digits.length !== 8) return;
    setCepNotice("Buscando o endereço…");
    try {
      const found = await services.shipping.lookupCep(digits);
      // Uma resposta que chega depois de a pessoa mudar o CEP não vale mais.
      if (onlyDigits(address.getValues("cep") ?? "") !== digits) return;
      if (!found) {
        setCepNotice("Não encontramos esse CEP. Confira os números ou preencha o endereço.");
        return;
      }
      // Só completa o que está vazio: não apaga o que a pessoa já digitou.
      const fill = (field: "street" | "district" | "city" | "state", value: string) => {
        if (!address.getValues(field)) address.setValue(field, value, { shouldValidate: true });
      };
      fill("street", found.street);
      fill("district", found.district);
      fill("city", found.city);
      fill("state", found.state);
      setCepNotice("Endereço encontrado. Confira e informe o número.");
    } catch (error) {
      setCepNotice(error instanceof ServiceError ? error.message : "Preencha o endereço manualmente.");
    }
  }

  async function finalize(payment: PaymentSummary) {
    if (!user || !shipping) return;
    const parsed = addressSchema.safeParse(address.getValues());
    if (!parsed.success) {
      setPayError("Confira o endereço de entrega.");
      return;
    }
    const order = await services.orders.create({
      userId: user.id,
      lines: buildOrderLines(slots, lines),
      address: parsed.data,
      shipping,
      payment,
    });
    authorized.current = null;
    // Primeiro sinaliza e navega; só depois a sacola esvazia, para a tela não piscar "nada para pagar".
    setCompleting(true);
    card.reset();
    router.push(`/pedido?id=${order.id}`);
    clearCart();
    if (summary.hasPlan) clearPlan();
  }

  async function onPay() {
    if (busy.current) return; // impede pedido duplicado por duplo clique
    setPayError("");

    // `shouldFocus` leva o foco ao primeiro campo com erro, para teclado e leitor de tela saberem onde corrigir.
    const addressOk = await address.trigger(undefined, { shouldFocus: true });
    const cardOk = addressOk && method === "cartao" && !authorized.current ? await card.trigger(undefined, { shouldFocus: true }) : true;
    if (!addressOk || !cardOk) return;
    if (!shipping) {
      setPayError(
        shippingFailed
          ? "Não foi possível calcular o frete agora. Confira o CEP e tente de novo."
          : "Informe um CEP válido para calcular o frete.",
      );
      return;
    }

    busy.current = true;
    setSubmitting(true);
    try {
      if (authorized.current) {
        await finalize(authorized.current);
        return;
      }
      const result = await services.payments.authorize(
        method === "pix"
          ? { method: "pix", amountCents: total }
          : { method: "card", amountCents: total, card: card.getValues() },
      );
      if (!result.ok) {
        setPayError(result.reason);
        return;
      }
      if (result.method === "pix") {
        setPix({ code: result.pixCode, reference: result.reference, amountCents: total });
        return;
      }
      authorized.current = { method: "card", reference: result.reference, last4: result.last4 };
      await finalize(authorized.current);
    } catch {
      setPayError(
        authorized.current
          ? "O pagamento foi aprovado, mas não conseguimos registrar o pedido. Toque em pagar de novo: você não será cobrada outra vez."
          : GENERIC_PAY_ERROR,
      );
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  async function onPixPaid() {
    if (!activePix || busy.current) return;
    busy.current = true;
    setSubmitting(true);
    try {
      await finalize({ method: "pix", reference: activePix.reference });
    } catch {
      setPayError("Não foi possível registrar o pedido. Tente de novo em instantes.");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  async function copyPix() {
    if (!activePix) return;
    try {
      await navigator.clipboard.writeText(activePix.code);
      setCopied(true);
    } catch {
      setCopied(false);
      setPayError("Não foi possível copiar. Selecione o código e copie manualmente.");
    }
  }

  if (completing) return <p role="status" className="py-10 text-ink-soft">Pedido registrado. Abrindo os detalhes…</p>;

  if (!hydrated || status === "idle" || !user) {
    return <p className="py-10 text-ink-soft">Carregando…</p>;
  }

  if (!summary.canCheckout) {
    const missing = PLAN_SIZE - summary.pendingPlanSlots;
    const inProgress = summary.pendingPlanSlots > 0;
    return (
      <div className="grid justify-items-start gap-4 rounded-card border-2 border-ink bg-cream p-8">
        <h2 className="text-2xl font-bold">
          {inProgress ? `Seu plano ainda tem ${summary.pendingPlanSlots} de ${PLAN_SIZE} peças` : "Não há nada para pagar"}
        </h2>
        <p className="max-w-lg text-ink-soft">
          {inProgress
            ? `Escolha mais ${missing} ${plural(missing, "peça", "peças")} para fechar o plano, ou adicione um aluguel avulso à sacola.`
            : "Monte seu plano de 4 peças ou adicione um aluguel avulso à sacola."}
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/assinatura">{inProgress ? "Escolher mais peças" : "Montar meu plano"}</ButtonLink>
          <ButtonLink href="/catalogo" variant="secondary">
            Ver o catálogo
          </ButtonLink>
        </div>
      </div>
    );
  }

  const { errors: ae } = address.formState;
  const { errors: ce } = card.formState;
  const orderLines = buildOrderLines(slots, lines);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <div className="grid gap-12">
        <section aria-labelledby="entrega-titulo" className="grid gap-5">
          <StepHeading id="entrega-titulo" step={1}>
            Entrega
          </StepHeading>
          <TextField
            label="CEP"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={9}
            className="max-w-48"
            required
            error={ae.cep?.message}
            {...address.register("cep", {
              onChange: (event) => {
                event.target.value = formatCep(event.target.value);
              },
              onBlur: lookupCep,
            })}
          />
          {/* Região viva própria: o aviso da busca de CEP é anunciado e não some quando o campo está em erro. */}
          <p role="status" aria-live="polite" className="-mt-3 text-sm text-ink-soft empty:hidden">
            {cepNotice}
          </p>
          <TextField label="Rua ou avenida" required autoComplete="address-line1" error={ae.street?.message} {...address.register("street")} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Número" required autoComplete="off" error={ae.number?.message} {...address.register("number")} />
            <TextField label="Complemento (opcional)" autoComplete="address-line2" error={ae.complement?.message} {...address.register("complement")} />
          </div>
          <TextField label="Bairro" required autoComplete="address-level3" error={ae.district?.message} {...address.register("district")} />
          <div className="grid gap-5 sm:grid-cols-[1fr_6rem]">
            <TextField label="Cidade" required autoComplete="address-level2" error={ae.city?.message} {...address.register("city")} />
            <TextField label="UF" required maxLength={2} autoComplete="address-level1" error={ae.state?.message} {...address.register("state")} />
          </div>
          {shipping && (
            <p role="status" className="rounded-control border-2 border-ink bg-mint p-3 font-medium">
              {shipping.cents === 0 ? shipping.label : `${formatMoney(shipping.cents)}. ${shipping.label}`}
            </p>
          )}
          {shippingFailed && !shipping && (
            <p role="alert" className="rounded-control border-2 border-danger bg-danger-soft p-3 font-medium text-danger">
              Não foi possível calcular o frete agora. Confira o CEP e tente de novo.
            </p>
          )}
        </section>

        <section aria-labelledby="pagamento-titulo" className="grid gap-5">
          <StepHeading id="pagamento-titulo" step={2}>
            Pagamento
          </StepHeading>
          <ChoiceGroup
            legend="Forma de pagamento"
            value={method}
            onChange={(value) => {
              setMethod(value);
              setPix(null);
              setPayError("");
            }}
            options={[
              { value: "pix", label: "Pix" },
              { value: "cartao", label: "Cartão" },
            ]}
          />

          {method === "cartao" ? (
            <div className="grid gap-5" aria-label="Dados do cartão" role="group">
              <TextField
                label="Nome no cartão"
                required
                autoComplete="cc-name"
                error={ce.holder?.message}
                {...card.register("holder")}
              />
              <TextField
                label="Número do cartão"
                required
                inputMode="numeric"
                autoComplete="cc-number"
                maxLength={23}
                placeholder="0000 0000 0000 0000"
                error={ce.number?.message}
                {...card.register("number", {
                  onChange: (event) => {
                    event.target.value = formatCardNumber(event.target.value);
                  },
                })}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Validade (MM/AA)"
                  required
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  maxLength={5}
                  placeholder="MM/AA"
                  error={ce.expiry?.message}
                  {...card.register("expiry", {
                    onChange: (event) => {
                      event.target.value = formatExpiry(event.target.value);
                    },
                  })}
                />
                <TextField
                  label="CVV"
                  required
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  error={ce.cvv?.message}
                  {...card.register("cvv", {
                    onChange: (event) => {
                      event.target.value = event.target.value.replace(/\D/g, "");
                    },
                  })}
                />
              </div>
              <p className="text-sm text-ink-soft">Os dados do cartão não ficam guardados no site.</p>
            </div>
          ) : activePix ? (
            <div className="grid gap-4 rounded-card border-2 border-ink bg-cream p-5 sm:grid-cols-[11rem_1fr]">
              <QrCode value={activePix.code} label="QR code do Pix" className="size-44 rounded-control border-2 border-ink" />
              <div className="grid content-start gap-3">
                <h3 ref={pixHeading} tabIndex={-1} className="text-lg font-bold">
                  Pague {formatMoney(activePix.amountCents)} com o Pix
                </h3>
                <p className="text-ink-soft">Escaneie o QR code no app do seu banco ou copie o código abaixo.</p>
                <label className="grid gap-1.5">
                  <span className="font-bold">Pix copia e cola</span>
                  <input
                    readOnly
                    value={activePix.code}
                    onFocus={(event) => event.currentTarget.select()}
                    className="min-h-12 w-full rounded-control border-2 border-ink bg-white px-4 font-mono text-sm"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" icon="copy" onClick={copyPix}>
                    {copied ? "Código copiado" : "Copiar código"}
                  </Button>
                  <Button size="sm" icon="check" onClick={onPixPaid} disabled={submitting}>
                    {submitting ? "Registrando…" : "Já paguei, ver meu pedido"}
                  </Button>
                </div>
                <p role="status" aria-live="polite" className="min-h-5 text-sm text-ink-soft">
                  {copied ? "Código copiado para a área de transferência." : ""}
                </p>
              </div>
            </div>
          ) : (
            <p className="max-w-lg text-ink-soft">
              {pixStale
                ? "O valor do pedido mudou. Gere o Pix de novo para pagar o valor certo."
                : "Ao continuar, geramos o QR code e o código Pix para você pagar no app do seu banco."}
            </p>
          )}
        </section>
      </div>

      <aside aria-labelledby="resumo-titulo" className="rounded-card border-2 border-ink bg-cream p-6 lg:sticky lg:top-32">
        <h2 id="resumo-titulo" className="mb-4 text-2xl font-bold">
          Resumo do pedido
        </h2>
        <ul className="mb-4 grid gap-2 text-sm">
          {orderLines.map((line) => (
            <li key={`${line.kind}:${line.pieceId}`} className="flex justify-between gap-3">
              <span>
                {line.title} · {line.size}
                {line.kind === "rental" ? ` · ${line.days} dias` : ""}
              </span>
              <span className="shrink-0 font-bold">{formatMoney(line.priceCents)}</span>
            </li>
          ))}
        </ul>
        <dl className="mb-5 grid gap-2 border-t-2 border-ink pt-4">
          {summary.hasPlan && summary.planDiscountCents > 0 && (
            <div className="flex justify-between gap-3 text-sm text-ink-soft">
              <dt>Você economiza com o plano</dt>
              <dd>{formatMoney(summary.planDiscountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt>Subtotal</dt>
            <dd>{formatMoney(summary.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Frete</dt>
            <dd>
              {shipping
                ? shipping.cents === 0
                  ? "Grátis"
                  : formatMoney(shipping.cents)
                : shippingKind === "plan"
                  ? "Grátis"
                  : "Informe o CEP"}
            </dd>
          </div>
          <div className="mt-1 flex justify-between gap-3 border-t-2 border-ink pt-3 font-display text-2xl font-extrabold">
            <dt>Total</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
        </dl>
        {summary.hasPlan && (
          <p className="mb-4 text-sm text-ink-soft">
            Todo mês você devolve as 4 peças e escolhe outras 4, pelo mesmo valor. Dá para cancelar antes da renovação.
          </p>
        )}
        {summary.pendingPlanSlots > 0 && (
          <p className="mb-4 rounded-control border-2 border-ink bg-peach p-3 text-sm">
            {summary.pendingPlanSlots} {plural(summary.pendingPlanSlots, "peça", "peças")} de um plano incompleto ficam de
            fora deste pedido.{" "}
            <Link href="/assinatura" className="font-bold underline underline-offset-4">
              Completar o plano
            </Link>
          </p>
        )}

        <p role="alert" className="mb-3 min-h-0 font-medium text-danger">
          {payError}
        </p>

        {!activePix && (
          <Button size="lg" block onClick={onPay} disabled={submitting}>
            {submitting
              ? "Processando…"
              : method === "pix"
                ? `Gerar Pix de ${formatMoney(total)}`
                : `Pagar ${formatMoney(total)} no cartão`}
          </Button>
        )}
      </aside>
    </div>
  );
}
