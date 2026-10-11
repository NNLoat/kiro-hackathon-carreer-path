// UI/domain types (idiomatic camelCase) used by React components and domain logic.
// These are mapped to/from wire types (snake_case) in mappers.ts — the single boundary.

export type SkillId = string;
export type CourseId = string;
export type CareerId = string;
export type ProfileId = string;
export type PlanId = string;
export type CourseSource = "university" | "online";
export type Term = string;

export interface Skill {
  id: SkillId;
  name: string;
  category: string;
}

export interface SkillContribution {
  skillId: SkillId;
  weight: number;
}

export interface Course {
  id: CourseId;
  code: string;
  title: string;
  source: CourseSource;
  provider: string;
  credits: number | null;
  prerequisites: CourseId[];
  termsOffered: Term[];
  skillContributions: SkillContribution[];
}

export interface RequiredSkill {
  skillId: SkillId;
  level: number;
}

export interface Career {
  id: CareerId;
  title: string;
  description: string;
  requiredSkills: RequiredSkill[];
}

export interface Competency {
  skillId: SkillId;
  level: number;
}

export interface Profile {
  id: ProfileId;
  username: string;
  completedCourseIds: CourseId[];
  interestSkillIds: SkillId[];
  selectedCareerIds: CareerId[];
}

export interface ProfilePatch {
  completedCourseIds: CourseId[];
  interestSkillIds: SkillId[];
  selectedCareerIds: CareerId[];
}

export interface RadarAxis {
  skillId: SkillId;
  skillName: string;
  required: number;
  current: number;
}

export interface RadarData {
  careerId: CareerId;
  axes: RadarAxis[];
}

export interface PathwayStepCourse {
  courseId: CourseId;
  code: string;
  title: string;
  source: CourseSource;
  prerequisites: CourseId[];
  advancesSkills: { skillId: SkillId; gapClosed: number }[];
}

export interface PathwayStep {
  order: number;
  term: Term;
  courses: PathwayStepCourse[];
}

export interface PathwayConflict {
  type: "term_clash" | "missing_prerequisite" | "unschedulable";
  courseIds: CourseId[];
  message: string;
}

export interface PathwayResult {
  careerId: CareerId;
  steps: PathwayStep[];
  conflicts: PathwayConflict[];
  fullySchedulable: boolean;
}

export interface Plan {
  id: PlanId;
  profileId: ProfileId;
  name: string;
  careerId: CareerId;
  pathway: PathwayResult;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
