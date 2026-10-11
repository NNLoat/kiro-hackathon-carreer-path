import type { PathwayResult } from "../../lib/types";

function Conflicts({ result }: { result: PathwayResult }) {
  if (result.fullySchedulable || result.conflicts.length === 0) return null;
  return (
    <div role="alert" className="rounded-md bg-amber-50 p-3 text-amber-800" data-testid="pathway-conflicts">
      <p className="font-medium">Some courses could not be scheduled conflict-free:</p>
      <ul className="list-disc pl-5">
        {result.conflicts.map((c, i) => (
          <li key={i}>{c.message}</li>
        ))}
      </ul>
    </div>
  );
}

export function StudyPathway({ result }: { result: PathwayResult }) {
  return (
    <div className="flex flex-col gap-4" data-testid="study-pathway">
      <Conflicts result={result} />
      {result.steps.length === 0 ? (
        <p className="text-slate-500" data-testid="pathway-empty">
          Select a career (and your completed courses) to see a recommended study pathway.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {result.steps.map((step) => (
            <li
              key={step.order}
              className="rounded-lg border border-slate-200 p-4"
              data-testid={`pathway-step-${step.order}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {step.order}
                </span>
                <span className="text-sm font-medium uppercase tracking-wide text-slate-500">
                  {step.term}
                </span>
              </div>
              {step.courses.map((course) => (
                <div key={course.courseId} className="pl-9">
                  <p className="font-semibold">
                    {course.code} — {course.title}{" "}
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {course.source}
                    </span>
                  </p>
                  {course.prerequisites.length > 0 ? (
                    <p className="text-sm text-slate-500">
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
