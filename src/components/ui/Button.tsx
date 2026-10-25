import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type Style = { variant?: Variant; size?: Size; block?: boolean; className?: string };

const VARIANT: Record<Variant, string> = {
  primary: "bg-ink text-canvas hover:shadow-lift",
  secondary: "bg-lavender text-ink hover:shadow-lift",
  ghost: "bg-transparent text-ink hover:bg-lavender/50",
};

const SIZE: Record<Size, string> = {
  sm: "min-h-11 px-4 text-[0.9375rem]",
  md: "min-h-12 px-6",
  lg: "min-h-14 px-8 text-lg",
};

/** Ícones do botão se mexem junto com ele: o da frente cresce e a seta anda um pouco para a frente. */
const ICON_MOTION = "transition-transform duration-300 ease-out-expo fx-group:scale-110";
const ARROW_MOTION = "transition-transform duration-300 ease-out-expo fx-group:translate-x-1";

/** Classes do botão, para usar em <button> e em <Link> sem duplicar estilo. */
export function buttonClasses({ variant = "primary", size = "md", block, className }: Style = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink font-bold",
    "transition duration-300 ease-out-expo select-none",
    "group enabled:fx:scale-[1.04] enabled:active:scale-[0.97] enabled:active:shadow-none",
    "disabled:cursor-not-allowed disabled:opacity-55",
    VARIANT[variant],
    SIZE[size],
    block && "w-full",
    className,
  );
}

type Decor = { icon?: IconName; iconAfter?: IconName; children: ReactNode };

export function Button({
  variant,
  size,
  block,
  className,
  icon,
  iconAfter,
  children,
  type = "button",
  ...props
}: Style & Decor & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses({ variant, size, block, className })} {...props}>
      {icon && <Icon name={icon} size={20} className={ICON_MOTION} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={20} className={ARROW_MOTION} />}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  className,
  icon,
  iconAfter,
  children,
  ...props
}: Style & Decor & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link className={buttonClasses({ variant, size, block, className })} {...props}>
      {icon && <Icon name={icon} size={20} className={ICON_MOTION} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={20} className={ARROW_MOTION} />}
    </Link>
  );
}
