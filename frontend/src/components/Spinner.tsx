import { Loader2 } from "lucide-react";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2 text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin text-brand-500" aria-hidden="true" />
      <span className="text-sm">{label}…</span>
    </span>
  );
}
