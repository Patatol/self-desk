import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClass: Record<Variant, string> = {
  primary: "bg-[var(--accent-strong)] text-white hover:opacity-90",
  secondary: "bg-[var(--panel-2)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--panel)]",
  ghost: "text-[var(--foreground)] hover:bg-[var(--panel-2)]",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`focus-ring rounded-xl px-3 py-2 text-sm font-medium transition ${variantClass[variant]} ${className}`}
    />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`focus-ring rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm ${className}`}
    />
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card ${className}`}>{children}</section>;
}
