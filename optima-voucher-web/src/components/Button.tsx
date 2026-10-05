import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const baseStyles = "w-full rounded-full py-3 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-orange-500 text-slate-900 hover:bg-orange-400",
    secondary: "border border-slate-600 text-white hover:bg-slate-800",
    outline: "border border-orange-500 text-orange-500 hover:bg-orange-50",
  }[variant];

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}