import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BookOpen, Sparkles, Target, Radar as RadarIcon, Route, Bookmark } from "lucide-react";
import { useSession } from "../../lib/SessionContext";
import {
  useCatalog,
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

function Section({
  step,
  icon,
  title,
  subtitle,
  children,
}: {
  step: number;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="step-badge mt-0.5">{step}</span>
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            {icon}
            {title}
          </h2>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function LandingPage() {
  const { profileId, username } = useSession();
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
  const catalog = useCatalog();

  // Prefill all three selections from the saved profile once the full catalog is loaded.
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    const p = profileQuery.data;
    const allCourses = catalog.courses.data;
    const allSkills = catalog.skills.data;
    const allCareers = catalog.careers.data;
    if (prefilled || !p || !allCourses || !allSkills || !allCareers) return;

    const resolvedCourses = p.completedCourseIds
      .map((id) => allCourses.find((c) => c.id === id))
      .filter((c): c is Course => c != null);
    const resolvedSkills = p.interestSkillIds
      .map((id) => allSkills.find((s) => s.id === id))
      .filter((s): s is Skill => s != null);
    const resolvedCareers = p.selectedCareerIds
      .map((id) => allCareers.find((c) => c.id === id))
      .filter((c): c is Career => c != null);

    setCourses(resolvedCourses);
    setSkills(resolvedSkills);
    setCareers(resolvedCareers);
    if (resolvedCareers.length > 0) setActiveCareerId(resolvedCareers[0].id);
    setPrefilled(true);
  }, [profileQuery.data, catalog.courses.data, catalog.skills.data, catalog.careers.data, prefilled]);

  const completedCourseIds = useMemo(() => courses.map((c) => c.id), [courses]);
  const activeCareer = activeCareerId ?? careers[0]?.id ?? null;

  const radar = useRadar(activeCareer, completedCourseIds);
  const pathway = usePathway(activeCareer ? { careerId: activeCareer, completedCourseIds } : null);
  const savePlan = useSavePlan(profileId);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const activeCareerObj = careers.find((c) => c.id === activeCareer);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
      <header className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-lg shadow-brand-600/20">
        <p className="section-eyebrow text-brand-100">
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Your plan
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Hi {username}, let's chart your path
        </h1>
        <p className="mt-1 max-w-xl text-brand-100">
          Tell us what you've studied and where you want to go. We'll show your skill gaps and the
          exact courses to take, in order.
        </p>
      </header>

      <Section
        step={1}
        icon={<BookOpen className="h-5 w-5 text-brand-600" aria-hidden="true" />}
        title="Your background"
        subtitle="Add the courses you've completed and the skills you're interested in."
      >
        <div className="grid gap-6 sm:grid-cols-2">
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
        </div>
      </Section>

      <Section
        step={2}
        icon={<Target className="h-5 w-5 text-brand-600" aria-hidden="true" />}
        title="Target career"
        subtitle="Pick one or more careers you're aiming for."
      >
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
      </Section>

      {careers.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center" data-testid="landing-no-career">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Target className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="font-medium text-slate-700">Pick a target career to see your results</p>
          <p className="text-sm text-slate-500">
            Your skills radar and a step-by-step study pathway will appear here.
          </p>
        </div>
      ) : (
        <>
          <Section
            step={3}
            icon={<RadarIcon className="h-5 w-5 text-brand-600" aria-hidden="true" />}
            title="Skills: required vs you"
            subtitle="How your current competency compares to what the career needs."
          >
            {careers.length > 1 ? (
              <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Career">
                {careers.map((c) => (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={activeCareer === c.id}
                    data-testid={`career-toggle-${c.id}`}
                    onClick={() => setActiveCareerId(c.id)}
                    className={
                      "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                      (activeCareer === c.id
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                    }
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            ) : null}

            {radar.isLoading ? <Spinner label="Computing radar" /> : null}
            {radar.data ? (
              <div className="flex flex-col gap-6">
                {/* Radar: centered, as large as it reads well */}
                <div className="flex flex-col items-center gap-3">
                  <RadarChart
                    data={radar.data}
                    careerLabel={activeCareerObj ? `${activeCareerObj.title} (required)` : "Required"}
                  />
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-4 rounded-full bg-brand-500" aria-hidden="true" />
                      Your level
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-0.5 bg-slate-700" aria-hidden="true" />
                      Target
                    </span>
                  </div>
                </div>

                {/* Skills breakdown below the chart, in two columns on wider screens */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="mb-4 text-sm font-semibold text-slate-700">
                    Skill-by-skill breakdown
                  </h3>
                  <RadarDataTable data={radar.data} columns={2} />
                </div>
              </div>
            ) : null}
          </Section>

          <Section
            step={4}
            icon={<Route className="h-5 w-5 text-brand-600" aria-hidden="true" />}
            title="Your study pathway"
            subtitle="Recommended courses in order — what to take first, and when."
          >
            {pathway.isLoading ? <Spinner label="Building pathway" /> : null}
            {pathway.data ? <StudyPathway result={pathway.data} /> : null}

            {pathway.data && pathway.data.steps.length > 0 ? (
              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
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
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  Save this plan
                </Button>
                {savedMsg ? (
                  <span role="status" className="text-sm font-medium text-accent-600">
                    {savedMsg}
                  </span>
                ) : null}
              </div>
            ) : null}
          </Section>
        </>
      )}
    </div>
  );
}
