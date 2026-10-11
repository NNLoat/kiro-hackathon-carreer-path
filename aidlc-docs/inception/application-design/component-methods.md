# Component Methods & Interfaces — Career-Path Planner (Frontend)

Method signatures and prop contracts (high-level). Detailed business rules are defined later in
Functional Design (per unit).

## Naming & Conflict-Avoidance Convention (IMPORTANT)
To prevent name mismatches with the backend team, **`backend/API-CONTRACT.md` is the single source of
truth for wire field names**. We mirror those names exactly and isolate the only transformation in one place:

- **Wire types** (`lib/wire.ts`): mirror the contract JSON **exactly**, including `snake_case` field
  names (e.g. `completed_course_ids`, `skill_contributions`, `terms_offered`, `fully_schedulable`).
  These are the bytes on the wire — they MUST match the backend verbatim.
- **UI/domain types** (`lib/types.ts`): idiomatic `camelCase` used by React components and `domain/`.
- **Mapping boundary** (`lib/mappers.ts`): the ONLY place that converts wire <-> UI. If the backend
  changes a field name, exactly one file changes. UI code never sees `snake_case`; the wire never sees `camelCase`.
- We do NOT invent alternative names for shared concepts — we align to the contract. Internal-only
  React component names are freely chosen but live under the frontend `src/` tree (no shared-path clash).

---

## Wire Types (`lib/wire.ts`) — mirror backend/API-CONTRACT.md EXACTLY (snake_case)
```ts
type SkillId = string; type CourseId = string; type CareerId = string;
type ProfileId = string; type PlanId = string;
type CourseSource = "university" | "online";
type Term = string; // valid values owned by backend contract

interface WireSkill { id: SkillId; name: string; category: string; }
interface WireSkillContribution { skill_id: SkillId; weight: number; }
interface WireCourse {
  id: CourseId; code: string; title: string; source: CourseSource;
  provider: string; credits: number | null; prerequisites: CourseId[];
  terms_offered: Term[]; skill_contributions: WireSkillContribution[];
}
interface WireRequiredSkill { skill_id: SkillId; level: number; }
interface WireCareer { id: CareerId; title: string; description: string; required_skills: WireRequiredSkill[]; }
interface WireCompetency { skill_id: SkillId; level: number; }
interface WireProfile {
  id: ProfileId; username: string;
  completed_course_ids: CourseId[]; interest_skill_ids: SkillId[]; selected_career_ids: CareerId[];
}
interface WireRadarAxis { skill_id: SkillId; skill_name: string; required: number; current: number; }
interface WireRadarData { career_id: CareerId; axes: WireRadarAxis[]; }
interface WirePathwayStepCourse {
  course_id: CourseId; code: string; title: string; source: CourseSource;
  prerequisites: CourseId[]; advances_skills: { skill_id: SkillId; gap_closed: number }[];
}
interface WirePathwayStep { order: number; term: Term; courses: WirePathwayStepCourse[]; }
interface WirePathwayConflict { type: "term_clash" | "missing_prerequisite" | "unschedulable"; course_ids: CourseId[]; message: string; }
interface WirePathwayResult { career_id: CareerId; steps: WirePathwayStep[]; conflicts: WirePathwayConflict[]; fully_schedulable: boolean; }
interface WirePlan { id: PlanId; profile_id: ProfileId; name: string; career_id: CareerId; pathway: WirePathwayResult; }
interface WireApiError { error: { code: string; message: string; details?: unknown } }
```

## UI / Domain Types (`lib/types.ts`) — idiomatic camelCase for components
```ts
interface Skill { id: SkillId; name: string; category: string; }
interface SkillContribution { skillId: SkillId; weight: number; }
interface Course {
  id: CourseId; code: string; title: string; source: CourseSource;
  provider: string; credits: number | null; prerequisites: CourseId[];
  termsOffered: Term[]; skillContributions: SkillContribution[];
}
interface RequiredSkill { skillId: SkillId; level: number; }
interface Career { id: CareerId; title: string; description: string; requiredSkills: RequiredSkill[]; }
interface Competency { skillId: SkillId; level: number; }
interface Profile {
  id: ProfileId; username: string;
  completedCourseIds: CourseId[]; interestSkillIds: SkillId[]; selectedCareerIds: CareerId[];
}
interface RadarAxis { skillId: SkillId; skillName: string; required: number; current: number; }
interface RadarData { careerId: CareerId; axes: RadarAxis[]; }
interface PathwayStepCourse {
  courseId: CourseId; code: string; title: string; source: CourseSource;
  prerequisites: CourseId[]; advancesSkills: { skillId: SkillId; gapClosed: number }[];
}
interface PathwayStep { order: number; term: Term; courses: PathwayStepCourse[]; }
interface PathwayConflict { type: "term_clash" | "missing_prerequisite" | "unschedulable"; courseIds: CourseId[]; message: string; }
interface PathwayResult { careerId: CareerId; steps: PathwayStep[]; conflicts: PathwayConflict[]; fullySchedulable: boolean; }
interface Plan { id: PlanId; profileId: ProfileId; name: string; careerId: CareerId; pathway: PathwayResult; }
interface ApiError { code: string; message: string; details?: unknown; }
```

## Mapping boundary (`lib/mappers.ts`) — ONLY place wire <-> UI happens
```ts
toCourse(w: WireCourse): Course                 // and the inverse where needed
toCareer(w: WireCareer): Career
toProfile(w: WireProfile): Profile
toRadarData(w: WireRadarData): RadarData
toPathwayResult(w: WirePathwayResult): PathwayResult
toPlan(w: WirePlan): Plan
toApiError(w: WireApiError): ApiError
// request-direction mappers:
profilePatchToWire(patch): { completed_course_ids; interest_skill_ids; selected_career_ids }
pathwayInputToWire(input): { career_id; completed_course_ids; interest_skill_ids?; start_term? }
planToWire(plan): { name; career_id; pathway: WirePathwayResult }
```
These mappers are pure functions and are themselves round-trip PBT targets (PBT-02): `toX(wire)` then
back SHOULD reproduce the original wire object.

## ApiClient interface (`lib/apiClient.ts`) — UI types in/out; wire names hidden behind it
```ts
interface ApiClient {
  // Profiles — POST /api/profiles, GET/PUT /api/profiles/{id}
  createOrLoadProfile(username: string): Promise<Profile>;
  getProfile(id: ProfileId): Promise<Profile>;
  updateProfile(id: ProfileId, patch: {
    completedCourseIds: CourseId[]; interestSkillIds: SkillId[]; selectedCareerIds: CareerId[];
  }): Promise<Profile>;
  // Catalog — GET /api/catalog/{skills|courses|careers}
  searchSkills(query: string, limit?: number): Promise<Skill[]>;
  searchCourses(query: string, source?: CourseSource, limit?: number): Promise<Course[]>;
  searchCareers(query: string, limit?: number): Promise<Career[]>;
  // Skills / radar — POST /api/skills/competency, POST /api/radar
  deriveCompetency(completedCourseIds: CourseId[]): Promise<Competency[]>;
  getRadar(careerId: CareerId, completedCourseIds: CourseId[]): Promise<RadarData>;
  // Pathway — POST /api/pathway
  getPathway(input: { careerId: CareerId; completedCourseIds: CourseId[]; interestSkillIds?: SkillId[]; startTerm?: Term; }): Promise<PathwayResult>;
  // Plans — POST/GET /api/profiles/{id}/plans, GET /api/profiles/{id}/plans/{planId}
  savePlan(profileId: ProfileId, plan: { name: string; careerId: CareerId; pathway: PathwayResult }): Promise<Plan>;
  listPlans(profileId: ProfileId): Promise<Plan[]>;
  getPlan(profileId: ProfileId, planId: PlanId): Promise<Plan>;
}
function createApiClient(): ApiClient; // Stub or Http based on import.meta.env.VITE_USE_STUB
```
`HttpApiClient` performs fetch to `/api/...`, parses wire types, and calls mappers before returning UI types.
`StubApiClient` returns fixtures already in UI-type form (built from the same contract shapes).

## Query hooks (`lib/queryHooks.ts`) — TanStack Query
```ts
useCreateOrLoadProfile(): mutation(username) -> Profile
useProfile(id): query -> Profile
useUpdateProfile(id): mutation(patch) -> Profile
useSearchSkills(query): query -> Skill[]
useSearchCourses(query, source?): query -> Course[]
useSearchCareers(query): query -> Career[]
useRadar(careerId, completedCourseIds): query -> RadarData
usePathway(input): query -> PathwayResult
useSavePlan(profileId): mutation -> Plan
usePlans(profileId): query -> Plan[]
```

## Session (`lib/SessionContext.tsx`)
```ts
interface SessionValue { profileId: ProfileId | null; username: string | null;
  signIn(p: Profile): void; signOut(): void; }
useSession(): SessionValue
```

## Pure domain functions (`domain/`) — PBT targets
```ts
deriveCompetency(completedCourses: Course[]): Competency[]            // normalized 0..1, deterministic, monotonic
computeSkillGaps(required: RequiredSkill[], current: Competency[]): { skillId: SkillId; gap: number }[]
buildRadarAxes(career: Career, current: Competency[], skillNames: Map<SkillId,string>): RadarAxis[]
```
These mirror the contract's rules so the stub produces identical results and logic is property-testable.

## Key UI prop contracts (high level)
```ts
Combobox<T>({ items, selected, onAdd, onRemove, getLabel, onQueryChange, loading, error }): JSX
RadarChart({ data: RadarData, currentSeriesLabel: string }): JSX           // Chart.js (canvas) radar
RadarDataTable({ data: RadarData }): JSX                                   // accessible equivalent (FR-6.4)
CareerToggle({ careers: Career[], activeId: CareerId, onChange }): JSX
StudyPathway({ result: PathwayResult }): JSX
PathwayConflicts({ conflicts: PathwayConflict[] }): JSX
RequireProfile({ children }): JSX
```
