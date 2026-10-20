import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

type Shared = { label: string; hint?: string; error?: string; className?: string; required?: boolean };

const CONTROL =
  "w-full min-h-12 rounded-control border-2 border-ink bg-white px-4 py-2.5 text-ink " +
  "placeholder:text-ink-soft aria-[invalid=true]:border-danger aria-[invalid=true]:bg-[#fff7f7] " +
  "disabled:opacity-60";

function Wrapper({
  id,
  label,
  hint,
  error,
  className,
  children,
}: Shared & { id: string; children: ReactNode }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {/* O erro é lido pelo `aria-describedby` do campo; ao enviar, o formulário leva o foco ao primeiro erro. */}
      <p id={`${id}-error`} className="text-sm font-medium text-danger empty:sr-only">
        {error}
      </p>
    </div>
  );
}

type TextFieldProps = Shared & Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & { ref?: Ref<HTMLInputElement> };

export function TextField({ label, hint, error, className, ref, ...input }: TextFieldProps) {
  const id = useId();
  const describedBy = [hint && !error ? `${id}-hint` : null, `${id}-error`].filter(Boolean).join(" ");
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} className={className}>
      <input
        ref={ref}
        id={id}
        className={CONTROL}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...input}
      />
    </Wrapper>
  );
}

type TextAreaFieldProps = Shared &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & { ref?: Ref<HTMLTextAreaElement> };

export function TextAreaField({ label, hint, error, className, ref, ...textarea }: TextAreaFieldProps) {
  const id = useId();
  const describedBy = [hint && !error ? `${id}-hint` : null, `${id}-error`].filter(Boolean).join(" ");
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} className={className}>
      <textarea
        ref={ref}
        id={id}
        rows={5}
        className={cn(CONTROL, "min-h-32 resize-y")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...textarea}
      />
    </Wrapper>
  );
}

type SelectFieldProps =Shared & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & { ref?: Ref<HTMLSelectElement> };

export function SelectField({ label, hint, error, className, ref, children, ...select }: SelectFieldProps) {
  const id = useId();
  const describedBy = [hint && !error ? `${id}-hint` : null, `${id}-error`].filter(Boolean).join(" ");
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} className={className}>
      <select
        ref={ref}
        id={id}
        className={cn(CONTROL, "appearance-auto")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...select}
      >
        {children}
      </select>
    </Wrapper>
  );
}
