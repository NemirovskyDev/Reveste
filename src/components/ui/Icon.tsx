import type { SVGProps } from "react";

/** Ícones desenhados no mesmo traço (24x24, 1.75, pontas redondas), sem biblioteca externa. */
const PATHS = {
  bag: "M6 8h12l-1 12H7L6 8Z M9 8V6a3 3 0 0 1 6 0v2",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 21c0-4 3.6-6 8-6s8 2 8 6",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  close: "M6 6l12 12 M18 6L6 18",
  "arrow-right": "M5 12h14 M13 6l6 6-6 6",
  "arrow-left": "M19 12H5 M11 6l-6 6 6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  truck: "M3 7h11v9H3Z M14 10h4l3 3v3h-7Z M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  refresh: "M20 11a8 8 0 0 0-14-4 M4 4v4h4 M4 13a8 8 0 0 0 14 4 M20 20v-4h-4",
  leaf: "M5 19c0-8 5-14 15-14 0 10-6 15-14 15 M5 19c2-5 5-8 9-10",
  hanger: "M12 8a2.5 2.5 0 1 0-2.5-2.5 M12 8v2.5L3 17.5a1.5 1.5 0 0 0 .9 2.7h16.2a1.5 1.5 0 0 0 .9-2.7L12 10.5",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M20 20l-4-4",
  "chevron-down": "M6 9l6 6 6-6",
  copy: "M9 9h10v11H9Z M5 15V4h10",
  shield: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z M9 12l2 2 4-4",
  tag: "M3 12V4h8l10 10-8 8L3 12Z M7.5 8.5h.01",
} as const;

export type IconName = keyof typeof PATHS;

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number;
  /** Se informado, o ícone vira imagem acessível; sem rótulo ele é decorativo. */
  label?: string;
};

export function Icon({ name, size = 24, label, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
