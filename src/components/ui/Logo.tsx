import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M16 9a3 3 0 1 0-3-3" />
      <path d="M16 9v3.5L3.5 22.5a2 2 0 0 0 1.2 3.5h22.6a2 2 0 0 0 1.2-3.5L16 12.5" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Reveste, página inicial"
      className={cn("inline-flex items-center gap-2 font-display text-[1.65rem] font-extrabold tracking-[-0.04em]", className)}
    >
      <LogoMark className="size-7" />
      Reveste
    </Link>
  );
}
