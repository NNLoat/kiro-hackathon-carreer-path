// Single typed surface for all contract operations. UI never calls fetch directly.
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
  CareerId,
  CourseId,
  PlanId,
  ProfileId,
  SkillId,
  Term,
} from "./types";

export interface PathwayInput {
  careerId: CareerId;
  completedCourseIds: CourseId[];
  interestSkillIds?: SkillId[];
  startTerm?: Term;
}

export interface ApiClient {
  // Profiles
  createOrLoadProfile(username: string): Promise<Profile>;
  getProfile(id: ProfileId): Promise<Profile>;
  updateProfile(id: ProfileId, patch: ProfilePatch): Promise<Profile>;
  // Catalog
  searchSkills(query: string, limit?: number): Promise<import("./types").Skill[]>;
  searchCourses(query: string, source?: CourseSource, limit?: number): Promise<Course[]>;
  searchCareers(query: string, limit?: number): Promise<Career[]>;
  // Skills / radar
  deriveCompetency(completedCourseIds: CourseId[]): Promise<Competency[]>;
  getRadar(careerId: CareerId, completedCourseIds: CourseId[]): Promise<RadarData>;
  // Pathway
  getPathway(input: PathwayInput): Promise<PathwayResult>;
  // Plans
  savePlan(
    profileId: ProfileId,
    plan: { name: string; careerId: CareerId; pathway: PathwayResult },
  ): Promise<Plan>;
  listPlans(profileId: ProfileId): Promise<Plan[]>;
  getPlan(profileId: ProfileId, planId: PlanId): Promise<Plan>;
}
