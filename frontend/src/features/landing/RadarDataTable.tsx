import { AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";
import type { RadarData } from "../../lib/types";

type Status = "met" | "developing" | "priority";

function statusOf(current: number, required: number): Status {
  if (current >= required) return "met";
  const ratio = required > 0 ? current / required : 1;
  return ratio >= 0.5 ? "developing" : "priority";
}

const statusMeta: Record<Status, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  met: { label: "On track", className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  developing: { label: "Developing", className: "bg-amber-50 text-amber-700", icon: CircleDashed },
  priority: { label: "Priority", className: "bg-rose-50 text-rose-700", icon: AlertTriangle },
};

// Accessible, interpretable equivalent of the radar (FR-6.4): one progress-to-target row per skill,
// sorted by largest gap first so the user sees what to work on. The bar fills with CURRENT competency
// and a marker shows the REQUIRED target — so a fuller bar reading = closer to the goal.
export function RadarDataTable({ data, columns = 1 }: { data: RadarData; columns?: 1 | 2 }) {
  const rows = [...data.axes]
    .map((a) => ({ ...a, gap: Math.max(0, a.required - a.current) }))
    .sort((x, y) => y.gap - x.gap);

  return (
    <ul
      className={
        columns === 2
          ? "grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2"
          : "flex flex-col gap-3"
      }
      data-testid="radar-data-table"
      aria-label="Skills vs target"
    >
      {rows.map((a) => {
        const status = statusOf(a.current, a.required);
        const meta = statusMeta[status];
        const Icon = meta.icon;
        const currentPct = Math.round(a.current * 100);
        const requiredPct = Math.round(a.required * 100);
        const gapPct = Math.round(a.gap * 100);
        return (
          <li key={a.skillId} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-700">{a.skillName}</span>
              <span className={"chip text-xs " + meta.className}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {status === "met" ? "On track" : `${gapPct}% to go`}
              </span>
            </div>

            <div
              className="relative h-2.5 w-full rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={currentPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${a.skillName}: you ${currentPct}% of a required ${requiredPct}%`}
            >
              {/* current competency fill */}
              <div
                className={
                  "absolute inset-y-0 left-0 rounded-full " +
                  (status === "met" ? "bg-emerald-500" : "bg-brand-500")
                }
                style={{ width: `${currentPct}%` }}
              />
              {/* required target marker */}
              <div
                className="absolute inset-y-[-3px] w-0.5 rounded bg-slate-700"
                style={{ left: `calc(${requiredPct}% - 1px)` }}
                aria-hidden="true"
              />
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>You: {currentPct}%</span>
              <span>Target: {requiredPct}%</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
