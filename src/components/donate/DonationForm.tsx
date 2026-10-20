"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { DONATION_CATEGORIES, DONATION_GROUP_SIZE, EMPTY_DONATION, MAX_PER_CATEGORY, donationReward } from "@/lib/donation";
import { plural } from "@/lib/format";
import { donationSchema, type DonationInput } from "@/lib/validation";
import { ServiceError, services } from "@/services";

const DEFAULTS: DonationInput = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  counts: EMPTY_DONATION,
  delivery: "envio",
  message: "",
  conditionOk: false as never,
  consent: false as never,
};

function Check({
  label,
  error,
  ...input
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input type="checkbox" className="mt-1 size-5 shrink-0 accent-ink" aria-invalid={error ? true : undefined} {...input} />
        <span>{label}</span>
      </label>
      {error && (
        <p role="alert" className="mt-1 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Mostra, enquanto a pessoa preenche, quantos descontos as peças informadas rendem. */
function RewardPreview({ counts }: { counts: Partial<Record<(typeof DONATION_CATEGORIES)[number]["id"], number>> }) {
  const reward = donationReward(counts);
  return (
    <div role="status" aria-live="polite" className="rounded-control border-2 border-ink bg-lavender/50 p-4">
      {reward.total === 0 ? (
        <p>Informe quantas peças você vai doar para ver o seu desconto.</p>
      ) : (
        <>
          <p className="font-bold">
            {reward.total} {plural(reward.total, "peça", "peças")}:{" "}
            {reward.discounts.length === 0
              ? "ainda sem desconto"
              : `${reward.discounts.length} ${plural(reward.discounts.length, "desconto", "descontos")} (${reward.discounts
                  .map((value) => `${value}%`)
                  .join(", ")})`}
            .
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {reward.remainder === 0
              ? `Com mais ${DONATION_GROUP_SIZE} peças você ganha outro desconto.`
              : `Faltam ${reward.toNext} ${plural(reward.toNext, "peça", "peças")} para o próximo desconto.`}{" "}
            O valor final é confirmado depois que a equipe confere as peças.
          </p>
        </>
      )}
    </div>
  );
}

export function DonationForm() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");
  const sentHeading = useRef<HTMLHeadingElement>(null);

  // O formulário é trocado pela confirmação; o foco vai para ela, senão cairia no topo da página.
  useEffect(() => {
    if (sent) sentHeading.current?.focus();
  }, [sent]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DonationInput>({ resolver: zodResolver(donationSchema) as never, defaultValues: DEFAULTS });
  const counts = useWatch({ control, name: "counts" });

  async function onSubmit(values: DonationInput) {
    setFormError("");
    try {
      await services.leads.sendDonation(values);
      reset();
      setSent(true);
    } catch (error) {
      setFormError(error instanceof ServiceError ? error.message : "Não foi possível enviar agora. Tente de novo.");
    }
  }

  if (sent) {
    return (
      <div role="status" className="grid justify-items-start gap-4 rounded-card border-2 border-ink bg-mint p-8">
        <h3 ref={sentHeading} tabIndex={-1} className="text-2xl font-bold">
          Obrigada por doar!
        </h3>
        <p className="max-w-md">
          Recebemos o seu cadastro. Vamos responder por e-mail com as instruções de envio ou de coleta e, depois de
          conferir as peças, com o seu desconto.
        </p>
        <Button variant="ghost" onClick={() => setSent(false)}>
          Fazer outra doação
        </Button>
      </div>
    );
  }

  const countsError = (errors.counts as { message?: string } | undefined)?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6" aria-label="Doação de peças">
      {formError && (
        <p role="alert" className="rounded-control border-2 border-danger bg-danger-soft p-4 font-medium text-danger">
          {formError}
        </p>
      )}

      <fieldset className="grid gap-4">
        <legend className="mb-1 text-xl font-bold">O que você vai doar</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {DONATION_CATEGORIES.map((category) => (
            <div key={category.id} className="rounded-control border-2 border-ink bg-cream p-4">
              <TextField
                label={`${category.label} (${category.discount}%)`}
                hint={category.examples}
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_PER_CATEGORY}
                error={errors.counts?.[category.id]?.message}
                {...register(`counts.${category.id}`, { valueAsNumber: true })}
              />
            </div>
          ))}
        </div>
        {countsError && (
          <p role="alert" className="text-sm font-medium text-danger">
            {countsError}
          </p>
        )}
        <RewardPreview counts={counts ?? EMPTY_DONATION} />
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-1 text-xl font-bold">Seus dados</legend>
        <TextField label="Nome" autoComplete="name" required error={errors.name?.message} {...register("name")} />
        <TextField
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Telefone (opcional)"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(11) 90000-0000"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
          <TextField label="Cidade" autoComplete="address-level2" required error={errors.city?.message} {...register("city")} />
          <TextField
            label="Estado"
            autoComplete="address-level1"
            maxLength={2}
            placeholder="RJ"
            required
            error={errors.state?.message}
            {...register("state")}
          />
        </div>
        <SelectField label="Como prefere entregar" error={errors.delivery?.message} {...register("delivery")}>
          <option value="envio">Eu envio pelos Correios</option>
          <option value="coleta">Quero que busquem (onde houver coleta)</option>
        </SelectField>
        <TextAreaField
          label="Observações (opcional)"
          placeholder="Marcas, tamanhos ou qualquer detalhe que ajude."
          error={errors.message?.message}
          {...register("message")}
        />
      </fieldset>

      <div className="grid gap-1">
        <Check
          label="As peças estão limpas, sem manchas, furos nem zíperes quebrados."
          error={errors.conditionOk?.message}
          {...register("conditionOk")}
        />
        <Check
          label="Aceito que a Reveste use meus dados só para responder sobre esta doação."
          error={errors.consent?.message}
          {...register("consent")}
        />
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Enviando…" : "Quero doar"}
      </Button>
    </form>
  );
}
