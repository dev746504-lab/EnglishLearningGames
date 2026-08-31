import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-transform duration-150 active:translate-y-px active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-brass text-bg hover:bg-[var(--accent-brass-dim)] shadow-[var(--shadow-brass)]",
  ghost:
    "bg-transparent text-text-100 border border-[var(--border-hairline-strong)] hover:border-brass hover:text-brass",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
