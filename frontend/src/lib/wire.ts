// Wire types: mirror backend/API-CONTRACT.md EXACTLY (snake_case). These are the bytes on the wire.
// They MUST match the backend verbatim. Conversion to UI types happens only in mappers.ts.

export interface WireSkill {
  id: string;
  name: string;
  category: string;
}

export interface WireSkillContribution {
  skill_id: string;
  weight: number;
}

export interface WireCourse {
  id: string;
  code: string;
  title: string;
  source: "university" | "online";
  provider: string;
  credits: number | null;
  prerequisites: string[];
  terms_offered: string[];
  skill_contributions: WireSkillContribution[];
}

export interface WireRequiredSkill {
  skill_id: string;
  level: number;
}

export interface WireCareer {
  id: string;
  title: string;
  description: string;
  required_skills: WireRequiredSkill[];
}

export interface WireCompetency {
  skill_id: string;
  level: number;
}

export interface WireProfile {
  id: string;
  username: string;
  completed_course_ids: string[];
  interest_skill_ids: string[];
  selected_career_ids: string[];
}

export interface WireProfilePatch {
  completed_course_ids: string[];
  interest_skill_ids: string[];
  selected_career_ids: string[];
}

export interface WireRadarAxis {
  skill_id: string;
  skill_name: string;
  required: number;
  current: number;
}

export interface WireRadarData {
  career_id: string;
  axes: WireRadarAxis[];
}

export interface WirePathwayStepCourse {
  course_id: string;
  code: string;
  title: string;
  source: "university" | "online";
  prerequisites: string[];
  advances_skills: { skill_id: string; gap_closed: number }[];
}

export interface WirePathwayStep {
  order: number;
  term: string;
  courses: WirePathwayStepCourse[];
}

export interface WirePathwayConflict {
  type: "term_clash" | "missing_prerequisite" | "unschedulable";
  course_ids: string[];
  message: string;
}

export interface WirePathwayResult {
  career_id: string;
  steps: WirePathwayStep[];
  conflicts: WirePathwayConflict[];
  fully_schedulable: boolean;
}

export interface WirePlan {
  id: string;
  profile_id: string;
  name: string;
  career_id: string;
  pathway: WirePathwayResult;
}

export interface WireErrorEnvelope {
  error: { code: string; message: string; details?: unknown };
}
