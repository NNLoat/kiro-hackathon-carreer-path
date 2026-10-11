// In-memory stub mirroring the contract so the app runs without a backend (US-0.3).
// Profiles + plans functional; catalog/radar/pathway backed by fixtures + pure domain logic.
import type { ApiClient, PathwayInput } from "./apiClient";
import type {
  Career,
  Competency,
  Course,
  CourseSource,
  Plan,
  Profile,
  ProfilePatch,
  RadarData,
  PathwayResult,
  PathwayStep,
  Skill,
  CareerId,
  CourseId,
  PlanId,
  ProfileId,
} from "./types";
import { careers, courses, skillNameById, skills } from "./fixtures";
import { deriveCompetency } from "../domain/competency";
import { computeSkillGaps } from "../domain/skillGap";
import { buildRadarAxes } from "../domain/radar";

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function coursesByIds(ids: CourseId[]): Course[] {
  return ids
    .map((id) => courses.find((c) => c.id === id))
    .filter((c): c is Course => c != null);
}

const TERM_ORDER = ["fall", "spring", "summer"];

export class StubApiClient implements ApiClient {
  private profilesByUsername = new Map<string, Profile>();
  private profilesById = new Map<ProfileId, Profile>();
  private plansByProfile = new Map<ProfileId, Plan[]>();

  async createOrLoadProfile(username: string): Promise<Profile> {
    const existing = this.profilesByUsername.get(username);
    if (existing) return structuredClone(existing);
    const profile: Profile = {
      id: makeId("prof"),
      username,
      completedCourseIds: [],
      interestSkillIds: [],
      selectedCareerIds: [],
    };
    this.profilesByUsername.set(username, profile);
    this.profilesById.set(profile.id, profile);
    return structuredClone(profile);
  }

  async getProfile(id: ProfileId): Promise<Profile> {
    const p = this.profilesById.get(id);
    if (!p) throw { code: "not_found", message: "Profile not found" };
    return structuredClone(p);
  }

  async updateProfile(id: ProfileId, patch: ProfilePatch): Promise<Profile> {
    const p = this.profilesById.get(id);
    if (!p) throw { code: "not_found", message: "Profile not found" };
    const updated: Profile = { ...p, ...patch };
    this.profilesById.set(id, updated);
    this.profilesByUsername.set(updated.username, updated);
    return structuredClone(updated);
  }

  async searchSkills(query: string, limit = 20): Promise<Skill[]> {
    const q = query.trim().toLowerCase();
    return skills
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
      .slice(0, limit);
  }

  async searchCourses(query: string, source?: CourseSource, limit = 20): Promise<Course[]> {
    const q = query.trim().toLowerCase();
    return courses
      .filter((c) => (!source || c.source === source))
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      .slice(0, limit);
  }

  async searchCareers(query: string, limit = 20): Promise<Career[]> {
    const q = query.trim().toLowerCase();
    return careers
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      .slice(0, limit);
  }

  async deriveCompetency(completedCourseIds: CourseId[]): Promise<Competency[]> {
    return deriveCompetency(coursesByIds(completedCourseIds));
  }

  async getRadar(careerId: CareerId, completedCourseIds: CourseId[]): Promise<RadarData> {
    const career = careers.find((c) => c.id === careerId);
    if (!career) throw { code: "not_found", message: "Career not found" };
    const current = deriveCompetency(coursesByIds(completedCourseIds));
    return { careerId, axes: buildRadarAxes(career, current, skillNameById) };
  }

  async getPathway(input: PathwayInput): Promise<PathwayResult> {
    const career = careers.find((c) => c.id === input.careerId);
    if (!career) throw { code: "not_found", message: "Career not found" };

    const completed = new Set(input.completedCourseIds);
    const current = deriveCompetency(coursesByIds(input.completedCourseIds));
    const gaps = computeSkillGaps(career.requiredSkills, current);
    const gapBySkill = new Map(gaps.map((g) => [g.skillId, g.gap]));

    // Candidate courses: not completed, that advance a skill the career needs.
    const neededSkills = new Set(career.requiredSkills.map((r) => r.skillId));
    const candidates = courses.filter(
      (c) =>
        !completed.has(c.id) &&
        c.skillContributions.some((sc) => neededSkills.has(sc.skillId)),
    );

    // Score by total gap closed (bigger gaps first).
    const scoreOf = (c: Course): number =>
      c.skillContributions.reduce(
        (acc, sc) => acc + (gapBySkill.get(sc.skillId) ?? 0) * sc.weight,
        0,
      );

    // Prerequisite-respecting topological ordering, scheduled into terms.
    const taken = new Set(completed);
    const remaining = [...candidates];
    const conflicts: PathwayResult["conflicts"] = [];
    const steps: PathwayStep[] = [];
    let order = 1;
    let termIdx = TERM_ORDER.indexOf(input.startTerm ?? "fall");
    if (termIdx < 0) termIdx = 0;

    let guard = 0;
    while (remaining.length > 0 && guard < 50) {
      guard++;
      // Courses whose prerequisites are all satisfied by what's taken.
      const ready = remaining
        .filter((c) => c.prerequisites.every((p) => taken.has(p) || !courses.some((x) => x.id === p)))
        .sort((a, b) => scoreOf(b) - scoreOf(a));

      if (ready.length === 0) {
        // Can't schedule the rest -> report conflict (FR-7.6), don't fail silently.
        conflicts.push({
          type: "missing_prerequisite",
          courseIds: remaining.map((c) => c.id),
          message: "Some recommended courses have unmet prerequisites and could not be scheduled.",
        });
        break;
      }

      const term = TERM_ORDER[termIdx % TERM_ORDER.length];
      // One course per step for a clear "what first" sequence; co-schedule none to avoid clashes.
      const next = ready.filter((c) => c.termsOffered.includes(term)).slice(0, 1);
      const chosen = next.length > 0 ? next : ready.slice(0, 1);
      const chosenTerm = next.length > 0 ? term : (chosen[0].termsOffered[0] ?? term);

      steps.push({
        order,
        term: chosenTerm,
        courses: chosen.map((c) => ({
          courseId: c.id,
          code: c.code,
          title: c.title,
          source: c.source,
          prerequisites: [...c.prerequisites],
          advancesSkills: c.skillContributions
            .filter((sc) => neededSkills.has(sc.skillId))
            .map((sc) => ({ skillId: sc.skillId, gapClosed: (gapBySkill.get(sc.skillId) ?? 0) * sc.weight })),
        })),
      });
      for (const c of chosen) {
        taken.add(c.id);
        const i = remaining.findIndex((r) => r.id === c.id);
        if (i >= 0) remaining.splice(i, 1);
      }
      order++;
      termIdx++;
    }

    return {
      careerId: input.careerId,
      steps,
      conflicts,
      fullySchedulable: conflicts.length === 0,
    };
  }

  async savePlan(
    profileId: ProfileId,
    plan: { name: string; careerId: CareerId; pathway: PathwayResult },
  ): Promise<Plan> {
    const saved: Plan = { id: makeId("plan"), profileId, ...plan };
    const list = this.plansByProfile.get(profileId) ?? [];
    list.push(saved);
    this.plansByProfile.set(profileId, list);
    return structuredClone(saved);
  }

  async listPlans(profileId: ProfileId): Promise<Plan[]> {
    return structuredClone(this.plansByProfile.get(profileId) ?? []);
  }

  async getPlan(profileId: ProfileId, planId: PlanId): Promise<Plan> {
    const found = (this.plansByProfile.get(profileId) ?? []).find((p) => p.id === planId);
    if (!found) throw { code: "not_found", message: "Plan not found" };
    return structuredClone(found);
  }
}
