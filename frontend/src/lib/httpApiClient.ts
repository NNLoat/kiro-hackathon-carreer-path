// Real API client: fetch to /api (Vite proxy), parse wire types, map to UI types, normalize errors.
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
  Skill,
  CareerId,
  CourseId,
  PlanId,
  ProfileId,
} from "./types";
import type {
  WireCareer,
  WireCompetency,
  WireCourse,
  WirePathwayResult,
  WirePlan,
  WireProfile,
  WireRadarData,
  WireSkill,
} from "./wire";
import {
  pathwayResultToWire,
  profilePatchToWire,
  toApiError,
  toCareer,
  toCompetency,
  toCourse,
  toPathwayResult,
  toPlan,
  toProfile,
  toRadarData,
} from "./mappers";

const BASE = "/api";

class HttpError extends Error {
  constructor(public apiError: { code: string; message: string; details?: unknown }) {
    super(apiError.message);
    this.name = "HttpError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new HttpError({ code: "network_error", message: "Network request failed" });
  }
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    if (body && body.error) throw new HttpError(toApiError(body));
    throw new HttpError({ code: "internal_error", message: `Request failed (${res.status})` });
  }
  return body as T;
}

export class HttpApiClient implements ApiClient {
  async createOrLoadProfile(username: string): Promise<Profile> {
    const w = await request<WireProfile>("/profiles", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
    return toProfile(w);
  }

  async getProfile(id: ProfileId): Promise<Profile> {
    return toProfile(await request<WireProfile>(`/profiles/${encodeURIComponent(id)}`));
  }

  async updateProfile(id: ProfileId, patch: ProfilePatch): Promise<Profile> {
    const w = await request<WireProfile>(`/profiles/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(profilePatchToWire(patch)),
    });
    return toProfile(w);
  }

  async searchSkills(query: string, limit?: number): Promise<Skill[]> {
    const q = new URLSearchParams({ query, ...(limit ? { limit: String(limit) } : {}) });
    const r = await request<{ items: WireSkill[] }>(`/catalog/skills?${q}`);
    return r.items.map((s) => ({ id: s.id, name: s.name, category: s.category }));
  }

  async searchCourses(query: string, source?: CourseSource, limit?: number): Promise<Course[]> {
    const q = new URLSearchParams({
      query,
      ...(source ? { source } : {}),
      ...(limit ? { limit: String(limit) } : {}),
    });
    const r = await request<{ items: WireCourse[] }>(`/catalog/courses?${q}`);
    return r.items.map(toCourse);
  }

  async searchCareers(query: string, limit?: number): Promise<Career[]> {
    const q = new URLSearchParams({ query, ...(limit ? { limit: String(limit) } : {}) });
    const r = await request<{ items: WireCareer[] }>(`/catalog/careers?${q}`);
    return r.items.map(toCareer);
  }

  async deriveCompetency(completedCourseIds: CourseId[]): Promise<Competency[]> {
    const r = await request<{ competency: WireCompetency[] }>("/skills/competency", {
      method: "POST",
      body: JSON.stringify({ completed_course_ids: completedCourseIds }),
    });
    return r.competency.map(toCompetency);
  }

  async getRadar(careerId: CareerId, completedCourseIds: CourseId[]): Promise<RadarData> {
    const w = await request<WireRadarData>("/radar", {
      method: "POST",
      body: JSON.stringify({ career_id: careerId, completed_course_ids: completedCourseIds }),
    });
    return toRadarData(w);
  }

  async getPathway(input: PathwayInput): Promise<PathwayResult> {
    const w = await request<WirePathwayResult>("/pathway", {
      method: "POST",
      body: JSON.stringify({
        career_id: input.careerId,
        completed_course_ids: input.completedCourseIds,
        interest_skill_ids: input.interestSkillIds,
        start_term: input.startTerm,
      }),
    });
    return toPathwayResult(w);
  }

  async savePlan(
    profileId: ProfileId,
    plan: { name: string; careerId: CareerId; pathway: PathwayResult },
  ): Promise<Plan> {
    const w = await request<WirePlan>(`/profiles/${encodeURIComponent(profileId)}/plans`, {
      method: "POST",
      body: JSON.stringify({
        name: plan.name,
        career_id: plan.careerId,
        pathway: pathwayResultToWire(plan.pathway),
      }),
    });
    return toPlan(w);
  }

  async listPlans(profileId: ProfileId): Promise<Plan[]> {
    const r = await request<{ items: WirePlan[] }>(
      `/profiles/${encodeURIComponent(profileId)}/plans`,
    );
    return r.items.map(toPlan);
  }

  async getPlan(profileId: ProfileId, planId: PlanId): Promise<Plan> {
    return toPlan(
      await request<WirePlan>(
        `/profiles/${encodeURIComponent(profileId)}/plans/${encodeURIComponent(planId)}`,
      ),
    );
  }
}

export { HttpError };
