import { useEffect, useMemo, useState } from "react";
import { useSession } from "../../lib/SessionContext";
import {
  useProfile,
  useRadar,
  usePathway,
  useSavePlan,
  useSearchCareers,
  useSearchCourses,
  useSearchSkills,
} from "../../lib/queryHooks";
import { Combobox } from "../../components/Combobox";
import { Button } from "../../components/Button";
import { Spinner } from "../../components/Spinner";
import { RadarChart } from "./RadarChart";
import { RadarDataTable } from "./RadarDataTable";
import { StudyPathway } from "./StudyPathway";
import type { Career, Course, Skill } from "../../lib/types";

export function LandingPage() {
  const { profileId } = useSession();
  const profileQuery = useProfile(profileId);

  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [activeCareerId, setActiveCareerId] = useState<string | null>(null);
  const [courseQ, setCourseQ] = useState("");
  const [skillQ, setSkillQ] = useState("");
  const [careerQ, setCareerQ] = useState("");

  const courseResults = useSearchCourses(courseQ);
  const skillResults = useSearchSkills(skillQ);
  const careerResults = useSearchCareers(careerQ);

  // Prefill from the saved profile once catalogs are available.
  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    if (p.completedCourseIds.length && courses.length === 0) {
      const all = courseResults.data ?? [];
      const resolved = p.completedCourseIds
        .map((id) => all.find((c) => c.id === id))
        .filter((c): c is Course => c != null);
      if (resolved.length) setCourses(resolved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQuery.data, courseResults.data]);

  const completedCourseIds = useMemo(() => courses.map((c) => c.id), [courses]);
  const activeCareer = activeCareerId ?? careers[0]?.id ?? null;

  const radar = useRadar(activeCareer, completedCourseIds);
  const pathway = usePathway(
    activeCareer ? { careerId: activeCareer, completedCourseIds } : null,
  );
  const savePlan = useSavePlan(profileId);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const activeCareerObj = careers.find((c) => c.id === activeCareer);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 p-6" data-testid="landing-page">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Plan your path</h1>
        <p className="text-slate-500">
          Pick what you've done and where you want to go — we'll chart the gaps and the route.
        </p>
      </header>

      <section className="grid gap-6 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
        <Combobox<Course>
          label="Completed courses"
          testId="course-selector"
          items={courseResults.data ?? []}
          selected={courses}
          getId={(c) => c.id}
          getLabel={(c) => `${c.code} — ${c.title}`}
          onAdd={(c) => setCourses((p) => [...p, c])}
          onRemove={(c) => setCourses((p) => p.filter((x) => x.id !== c.id))}
          onQueryChange={setCourseQ}
          loading={courseResults.isLoading}
          placeholder="Search courses…"
        />
        <Combobox<Skill>
          label="Interests / skills"
          testId="skill-selector"
          items={skillResults.data ?? []}
          selected={skills}
          getId={(s) => s.id}
          getLabel={(s) => s.name}
          onAdd={(s) => setSkills((p) => [...p, s])}
          onRemove={(s) => setSkills((p) => p.filter((x) => x.id !== s.id))}
          onQueryChange={setSkillQ}
          loading={skillResults.isLoading}
          placeholder="Search skills…"
        />
        <div className="sm:col-span-2">
          <Combobox<Career>
            label="Careers of interest"
            testId="career-selector"
            items={careerResults.data ?? []}
            selected={careers}
            getId={(c) => c.id}
            getLabel={(c) => c.title}
            onAdd={(c) => {
              setCareers((p) => [...p, c]);
              setActiveCareerId((cur) => cur ?? c.id);
            }}
            onRemove={(c) => {
              setCareers((p) => p.filter((x) => x.id !== c.id));
              setActiveCareerId((cur) => (cur === c.id ? null : cur));
            }}
            onQueryChange={setCareerQ}
            loading={careerResults.isLoading}
            placeholder="Search careers…"
          />
        </div>
      </section>

      {careers.length === 0 ? (
        <p className="text-slate-500" data-testid="landing-no-career">
          Select at least one career to see your skills radar and study pathway.
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-4 rounded-lg border border-slate-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Skills: required vs you</h2>
              {careers.length > 1 ? (
                <div className="flex gap-2" role="tablist" aria-label="Career">
                  {careers.map((c) => (
                    <button
                      key={c.id}
                      role="tab"
                      aria-selected={activeCareer === c.id}
                      data-testid={`career-toggle-${c.id}`}
                      onClick={() => setActiveCareerId(c.id)}
                      className={
                        "rounded-full px-3 py-1 text-sm " +
                        (activeCareer === c.id
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                      }
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {radar.isLoading ? <Spinner label="Computing radar" /> : null}
            {radar.data ? (
              <div className="grid gap-6 md:grid-cols-2">
                <RadarChart
                  data={radar.data}
                  careerLabel={activeCareerObj ? `${activeCareerObj.title} (required)` : "Required"}
                />
                <RadarDataTable data={radar.data} />
              </div>
            ) : null}
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your study pathway</h2>
              {pathway.data && pathway.data.steps.length > 0 ? (
                <div className="flex items-center gap-2">
                  <Button
                    data-testid="save-plan-button"
                    loading={savePlan.isPending}
                    onClick={() => {
                      if (!activeCareerObj || !pathway.data) return;
                      savePlan.mutate(
                        {
                          name: `${activeCareerObj.title} plan`,
                          careerId: activeCareerObj.id,
                          pathway: pathway.data,
                        },
                        { onSuccess: () => setSavedMsg("Plan saved to your profile") },
                      );
                    }}
                  >
                    Save plan
                  </Button>
                  {savedMsg ? (
                    <span role="status" className="text-sm text-green-600">
                      {savedMsg}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            {pathway.isLoading ? <Spinner label="Building pathway" /> : null}
            {pathway.data ? <StudyPathway result={pathway.data} /> : null}
          </section>
        </>
      )}
    </main>
  );
}
