// Pure: gap per required skill = max(0, required - current). gap in [0, required].
import type { Competency, RequiredSkill, SkillId } from "../lib/types";

export function computeSkillGaps(
  required: RequiredSkill[],
  current: Competency[],
): { skillId: SkillId; gap: number }[] {
  const currentById = new Map(current.map((c) => [c.skillId, c.level]));
  return required.map((r) => ({
    skillId: r.skillId,
    gap: Math.max(0, r.level - (currentById.get(r.skillId) ?? 0)),
  }));
}
