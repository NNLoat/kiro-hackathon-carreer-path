import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
}

export function Button({ children, loading, disabled, className = "", ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={
        "inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 " +
        "font-medium text-white transition hover:bg-indigo-500 focus:outline-none " +
        "focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 " +
        "disabled:cursor-not-allowed disabled:opacity-60 " +
        className
      }
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
