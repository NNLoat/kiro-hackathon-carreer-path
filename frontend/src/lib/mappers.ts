// The ONLY place wire (snake_case) <-> UI (camelCase) conversion happens.
// Pure functions; round-trip property-tested (PBT-02).
import type {
  ApiError,
  Career,
  Competency,
  Course,
  PathwayResult,
  Plan,
  Profile,
  ProfilePatch,
  RadarData,
} from "./types";
import type {
  WireCareer,
  WireCompetency,
  WireCourse,
  WireErrorEnvelope,
  WirePathwayResult,
  WirePlan,
  WireProfile,
  WireProfilePatch,
  WireRadarData,
} from "./wire";

export function toProfile(w: WireProfile): Profile {
  return {
    id: w.id,
    username: w.username,
    completedCourseIds: [...w.completed_course_ids],
    interestSkillIds: [...w.interest_skill_ids],
    selectedCareerIds: [...w.selected_career_ids],
  };
}

export function profileToWire(p: Profile): WireProfile {
  return {
    id: p.id,
    username: p.username,
    completed_course_ids: [...p.completedCourseIds],
    interest_skill_ids: [...p.interestSkillIds],
    selected_career_ids: [...p.selectedCareerIds],
  };
}

export function profilePatchToWire(patch: ProfilePatch): WireProfilePatch {
  return {
    completed_course_ids: [...patch.completedCourseIds],
    interest_skill_ids: [...patch.interestSkillIds],
    selected_career_ids: [...patch.selectedCareerIds],
  };
}

export function toCourse(w: WireCourse): Course {
  return {
    id: w.id,
    code: w.code,
    title: w.title,
    source: w.source,
    provider: w.provider,
    credits: w.credits,
    prerequisites: [...w.prerequisites],
    termsOffered: [...w.terms_offered],
    skillContributions: w.skill_contributions.map((c) => ({
      skillId: c.skill_id,
      weight: c.weight,
    })),
  };
}

export function toCareer(w: WireCareer): Career {
  return {
    id: w.id,
    title: w.title,
    description: w.description,
    requiredSkills: w.required_skills.map((r) => ({ skillId: r.skill_id, level: r.level })),
  };
}

export function toCompetency(w: WireCompetency): Competency {
  return { skillId: w.skill_id, level: w.level };
}

export function toRadarData(w: WireRadarData): RadarData {
  return {
    careerId: w.career_id,
    axes: w.axes.map((a) => ({
      skillId: a.skill_id,
      skillName: a.skill_name,
      required: a.required,
      current: a.current,
    })),
  };
}

export function toPathwayResult(w: WirePathwayResult): PathwayResult {
  return {
    careerId: w.career_id,
    steps: w.steps.map((s) => ({
      order: s.order,
      term: s.term,
      courses: s.courses.map((c) => ({
        courseId: c.course_id,
        code: c.code,
        title: c.title,
        source: c.source,
        prerequisites: [...c.prerequisites],
        advancesSkills: c.advances_skills.map((a) => ({
          skillId: a.skill_id,
          gapClosed: a.gap_closed,
        })),
      })),
    })),
    conflicts: w.conflicts.map((c) => ({
      type: c.type,
      courseIds: [...c.course_ids],
      message: c.message,
    })),
    fullySchedulable: w.fully_schedulable,
  };
}

// Inverse of toPathwayResult: UI (camelCase) -> wire (snake_case). Used when saving a plan
// so the stored JSON matches the contract and reads back correctly.
export function pathwayResultToWire(p: PathwayResult): WirePathwayResult {
  return {
    career_id: p.careerId,
    steps: p.steps.map((s) => ({
      order: s.order,
      term: s.term,
      courses: s.courses.map((c) => ({
        course_id: c.courseId,
        code: c.code,
        title: c.title,
        source: c.source,
        prerequisites: [...c.prerequisites],
        advances_skills: c.advancesSkills.map((a) => ({
          skill_id: a.skillId,
          gap_closed: a.gapClosed,
        })),
      })),
    })),
    conflicts: p.conflicts.map((c) => ({
      type: c.type,
      course_ids: [...c.courseIds],
      message: c.message,
    })),
    fully_schedulable: p.fullySchedulable,
  };
}

export function toPlan(w: WirePlan): Plan {
  return {
    id: w.id,
    profileId: w.profile_id,
    name: w.name,
    careerId: w.career_id,
    pathway: toPathwayResult(w.pathway),
  };
}

export function toApiError(w: WireErrorEnvelope): ApiError {
  return { code: w.error.code, message: w.error.message, details: w.error.details };
}
