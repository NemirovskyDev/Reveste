"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { BRAND_FORM_FIELDS } from "@/content/brands";
import { brandContactSchema, type BrandContactInput } from "@/lib/validation";
import { ServiceError, services } from "@/services";

export function BrandContactForm() {
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
    formState: { errors, isSubmitting },
  } = useForm<BrandContactInput>({
    resolver: zodResolver(brandContactSchema) as never,
    defaultValues: { brandName: "", contactName: "", email: "", phone: "", stockSize: "", message: "" },
  });

  async function onSubmit(values: BrandContactInput) {
    setFormError("");
    try {
      await services.leads.sendBrandContact(values);
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
          Recebemos o seu contato
        </h3>
        <p className="max-w-md">Vamos ler com atenção e responder por e-mail.</p>
        <Button variant="ghost" onClick={() => setSent(false)}>
          Enviar outro contato
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5" aria-label="Contato para marcas">
      {formError && (
        <p role="alert" className="rounded-control border-2 border-danger bg-danger-soft p-4 font-medium text-danger">
          {formError}
        </p>
      )}
      {BRAND_FORM_FIELDS.map((field) => {
        const error = errors[field.name]?.message;
        if (field.type === "textarea") {
          return (
            <TextAreaField
              key={field.name}
              label={field.label}
              placeholder={field.placeholder}
              required={field.required}
              error={error}
              {...register(field.name)}
            />
          );
        }
        if (field.type === "select") {
          return (
            <SelectField key={field.name} label={field.label} error={error} {...register(field.name)}>
              <option value="">Prefiro não informar</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          );
        }
        return (
          <TextField
            key={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            required={field.required}
            autoComplete={field.name === "email" ? "email" : field.name === "phone" ? "tel" : field.name === "contactName" ? "name" : "organization"}
            inputMode={field.type === "tel" ? "tel" : field.type === "email" ? "email" : undefined}
            error={error}
            {...register(field.name)}
          />
        );
      })}
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Enviando…" : "Enviar contato"}
      </Button>
    </form>
  );
}
