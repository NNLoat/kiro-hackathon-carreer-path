// Pure: build radar axes (one per required skill) with required vs current levels.
import type { Career, Competency, RadarAxis, SkillId } from "../lib/types";

export function buildRadarAxes(
  career: Career,
  current: Competency[],
  skillNames: Map<SkillId, string>,
): RadarAxis[] {
  const currentById = new Map(current.map((c) => [c.skillId, c.level]));
  return career.requiredSkills.map((r) => ({
    skillId: r.skillId,
    skillName: skillNames.get(r.skillId) ?? r.skillId,
    required: r.level,
    current: currentById.get(r.skillId) ?? 0,
  }));
}
