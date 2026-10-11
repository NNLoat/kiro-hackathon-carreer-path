import { Label } from "@radix-ui/react-label";
import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string | null;
}

// Accessible labeled input: label is associated with the input; error linked via aria-describedby.
export function Field({ id, label, error, className = "", ...inputProps }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={
          "rounded-md border px-3 py-2 text-slate-900 focus:outline-none " +
          "focus-visible:ring-2 focus-visible:ring-indigo-400 " +
          (error ? "border-red-500" : "border-slate-300") +
          " " +
          className
        }
        {...inputProps}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
