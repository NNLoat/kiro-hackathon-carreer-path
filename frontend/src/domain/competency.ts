// Pure: derive normalized (0..1) competency per skill from completed courses.
// Deterministic and monotonic: adding a contributing course never lowers a skill's level.
import type { Competency, Course, SkillId } from "../lib/types";

export function deriveCompetency(completedCourses: Course[]): Competency[] {
  const totals = new Map<SkillId, number>();
  for (const course of completedCourses) {
    for (const c of course.skillContributions) {
      totals.set(c.skillId, (totals.get(c.skillId) ?? 0) + c.weight);
    }
  }
  return [...totals.entries()]
    .map(([skillId, sum]) => ({ skillId, level: Math.min(1, sum) }))
    .sort((a, b) => a.skillId.localeCompare(b.skillId));
}
