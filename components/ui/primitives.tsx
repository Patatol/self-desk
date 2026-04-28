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
      className={`focus-ring rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${variantClass[variant]} ${className}`}
    />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`focus-ring rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm transition-colors duration-200 ${className}`}
    />
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card transition-all duration-200 ease-out hover:shadow-[var(--shadow-md)] ${className}`}>{children}</section>;
}
