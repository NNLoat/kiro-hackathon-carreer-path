import { Label } from "@radix-ui/react-label";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
  icon?: ReactNode;
}

// Accessible labeled input: label associated with input; error linked via aria-describedby.
export function Field({ id, label, error, hint, icon, className, ...inputProps }: FieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400",
            "transition focus:outline-none focus:ring-2 focus:ring-brand-400",
            icon && "pl-9",
            error ? "border-red-400" : "border-slate-300",
            className,
          )}
          {...inputProps}
        />
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
