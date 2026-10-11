import { useEffect, useState } from "react";
import { CheckCircle2, FolderOpen, Save, User } from "lucide-react";
import { useSession } from "../../lib/SessionContext";
import {
  useProfile,
  useUpdateProfile,
  useProfilePlans,
  useSearchCourses,
  useSearchSkills,
  useSearchCareers,
} from "../../lib/queryHooks";
import { Spinner } from "../../components/Spinner";
import { ErrorState } from "../../components/ErrorState";
import { Button } from "../../components/Button";
import { Combobox } from "../../components/Combobox";
import type { Career, Course, ProfilePatch, Skill } from "../../lib/types";

export function ProfilePage() {
  const { profileId } = useSession();
  const profileQuery = useProfile(profileId);
  const update = useUpdateProfile(profileId);
  const plansQuery = useProfilePlans(profileId);

  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [courseQ, setCourseQ] = useState("");
  const [skillQ, setSkillQ] = useState("");
  const [careerQ, setCareerQ] = useState("");
  const [saved, setSaved] = useState(false);

  const courseResults = useSearchCourses(courseQ);
  const skillResults = useSearchSkills(skillQ);
  const careerResults = useSearchCareers(careerQ);

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    const all = courseResults.data ?? [];
    setCourses(
      p.completedCourseIds.map(
        (id) => all.find((c) => c.id === id) ?? ({ id, code: id, title: id } as Course),
      ),
    );
    const allSkills = skillResults.data ?? [];
    setSkills(
      p.interestSkillIds.map(
        (id) => allSkills.find((s) => s.id === id) ?? ({ id, name: id, category: "" } as Skill),
      ),
    );
    const allCareers = careerResults.data ?? [];
    setCareers(
      p.selectedCareerIds.map(
        (id) =>
          allCareers.find((c) => c.id === id) ??
          ({ id, title: id, description: "", requiredSkills: [] } as Career),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQuery.data]);

  if (profileQuery.isLoading) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <Spinner label="Loading profile" />
      </main>
    );
  }
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <ErrorState message="Could not load your profile." onRetry={() => profileQuery.refetch()} />
      </main>
    );
  }

  const profile = profileQuery.data;

  function handleSave() {
    const patch: ProfilePatch = {
      completedCourseIds: courses.map((c) => c.id),
      interestSkillIds: skills.map((s) => s.id),
      selectedCareerIds: careers.map((c) => c.id),
    };
    setSaved(false);
    update.mutate(patch, { onSuccess: () => setSaved(true) });
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8" data-testid="profile-page">
      <header className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">
          <User className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{profile.username}</h1>
          <p className="text-sm text-slate-500">Your saved background and plans</p>
        </div>
      </header>

      <section className="card flex flex-col gap-6 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Edit your background</h2>

        <Combobox<Course>
          label="Completed courses"
          testId="profile-courses"
          items={courseResults.data ?? []}
          selected={courses}
          getId={(c) => c.id}
          getLabel={(c) => `${c.code} — ${c.title}`}
          onAdd={(c) => setCourses((prev) => [...prev, c])}
          onRemove={(c) => setCourses((prev) => prev.filter((x) => x.id !== c.id))}
          onQueryChange={setCourseQ}
          loading={courseResults.isLoading}
          placeholder="Search courses…"
        />
        <Combobox<Skill>
          label="Interests / skills"
          testId="profile-skills"
          items={skillResults.data ?? []}
          selected={skills}
          getId={(s) => s.id}
          getLabel={(s) => s.name}
          onAdd={(s) => setSkills((prev) => [...prev, s])}
          onRemove={(s) => setSkills((prev) => prev.filter((x) => x.id !== s.id))}
          onQueryChange={setSkillQ}
          loading={skillResults.isLoading}
          placeholder="Search skills…"
        />
        <Combobox<Career>
          label="Careers of interest"
          testId="profile-careers"
          items={careerResults.data ?? []}
          selected={careers}
          getId={(c) => c.id}
          getLabel={(c) => c.title}
          onAdd={(c) => setCareers((prev) => [...prev, c])}
          onRemove={(c) => setCareers((prev) => prev.filter((x) => x.id !== c.id))}
          onQueryChange={setCareerQ}
          loading={careerResults.isLoading}
          placeholder="Search careers…"
        />

        <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
          <Button onClick={handleSave} loading={update.isPending} data-testid="profile-save-button">
            <Save className="h-4 w-4" aria-hidden="true" />
            Save changes
          </Button>
          {saved ? (
            <span role="status" className="flex items-center gap-1 text-sm font-medium text-accent-600">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Saved
            </span>
          ) : null}
          {update.isError ? (
            <span role="alert" className="text-sm text-red-600">
              {update.error?.message ?? "Save failed"}
            </span>
          ) : null}
        </div>
      </section>

      <section className="card flex flex-col gap-3 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FolderOpen className="h-5 w-5 text-brand-600" aria-hidden="true" />
          Saved plans
        </h2>
        {plansQuery.isLoading ? <Spinner label="Loading plans" /> : null}
        {plansQuery.isError ? (
          <ErrorState message="Could not load saved plans." onRetry={() => plansQuery.refetch()} />
        ) : null}
        {plansQuery.data && plansQuery.data.length === 0 ? (
          <p className="text-slate-500" data-testid="plans-empty">
            No saved plans yet. Build one on the Home page and save it.
          </p>
        ) : null}
        {plansQuery.data && plansQuery.data.length > 0 ? (
          <ul className="flex flex-col gap-2" data-testid="plans-list">
            {plansQuery.data.map((plan) => (
              <li
                key={plan.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                data-testid={`plan-item-${plan.id}`}
              >
                <span className="font-medium text-slate-800">{plan.name}</span>
                <span className="chip bg-slate-100 text-slate-600">
                  {plan.pathway.steps.length} steps
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
