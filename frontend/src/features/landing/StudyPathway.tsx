import { AlertTriangle, GraduationCap, Globe } from "lucide-react";
import type { PathwayResult } from "../../lib/types";

function Conflicts({ result }: { result: PathwayResult }) {
  if (result.fullySchedulable || result.conflicts.length === 0) return null;
  return (
    <div
      role="alert"
      className="mb-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800"
      data-testid="pathway-conflicts"
    >
      <AlertTriangle className="h-5 w-5 flex-none" aria-hidden="true" />
      <div>
        <p className="font-medium">Some courses couldn't be scheduled conflict-free:</p>
        <ul className="list-disc pl-5 text-sm">
          {result.conflicts.map((c, i) => (
            <li key={i}>{c.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function StudyPathway({ result }: { result: PathwayResult }) {
  return (
    <div data-testid="study-pathway">
      <Conflicts result={result} />
      {result.steps.length === 0 ? (
        <p className="text-slate-500" data-testid="pathway-empty">
          Select a career (and your completed courses) to see a recommended study pathway.
        </p>
      ) : (
        <ol className="relative flex flex-col gap-4 border-l-2 border-slate-100 pl-6">
          {result.steps.map((step) => (
            <li key={step.order} className="relative" data-testid={`pathway-step-${step.order}`}>
              <span className="step-badge absolute -left-[2.35rem] top-0.5">{step.order}</span>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {step.term}
              </p>
              {step.courses.map((course) => (
                <div
                  key={course.courseId}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">
                      {course.code} — {course.title}
                    </p>
                    <span
                      className={
                        "chip flex-none text-xs " +
                        (course.source === "university"
                          ? "bg-brand-50 text-brand-700"
                          : "bg-emerald-50 text-emerald-700")
                      }
                    >
                      {course.source === "university" ? (
                        <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {course.source}
                    </span>
                  </div>
                  {course.prerequisites.length > 0 ? (
                    <p className="mt-1 text-sm text-slate-500">
                      Prerequisites: {course.prerequisites.join(", ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
