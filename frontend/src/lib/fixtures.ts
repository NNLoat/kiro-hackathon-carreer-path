// Deterministic seed catalog used by the stub client so the whole app is demoable without a backend.
// Shapes mirror the UI types (already mapped). Kept small but realistic.
import type { Career, Course, Skill } from "./types";

export const skills: Skill[] = [
  { id: "skill_python", name: "Python Programming", category: "Programming" },
  { id: "skill_js", name: "JavaScript / TypeScript", category: "Programming" },
  { id: "skill_stats", name: "Statistics", category: "Math" },
  { id: "skill_ml", name: "Machine Learning", category: "Data" },
  { id: "skill_data_viz", name: "Data Visualization", category: "Data" },
  { id: "skill_sql", name: "Databases / SQL", category: "Data" },
  { id: "skill_algorithms", name: "Algorithms", category: "CS" },
  { id: "skill_web", name: "Web Development", category: "Programming" },
  { id: "skill_ux", name: "UX Design", category: "Design" },
  { id: "skill_research", name: "User Research", category: "Design" },
];

export const courses: Course[] = [
  {
    id: "cs100", code: "CS100", title: "Intro to Computing", source: "university",
    provider: "State University", credits: 3, prerequisites: [], termsOffered: ["fall", "spring"],
    skillContributions: [{ skillId: "skill_algorithms", weight: 0.3 }],
  },
  {
    id: "cs101", code: "CS101", title: "Programming I (Python)", source: "university",
    provider: "State University", credits: 3, prerequisites: ["cs100"], termsOffered: ["fall", "spring"],
    skillContributions: [{ skillId: "skill_python", weight: 0.6 }, { skillId: "skill_algorithms", weight: 0.2 }],
  },
  {
    id: "cs201", code: "CS201", title: "Data Structures & Algorithms", source: "university",
    provider: "State University", credits: 4, prerequisites: ["cs101"], termsOffered: ["fall"],
    skillContributions: [{ skillId: "skill_algorithms", weight: 0.6 }, { skillId: "skill_python", weight: 0.2 }],
  },
  {
    id: "cs210", code: "CS210", title: "Databases", source: "university",
    provider: "State University", credits: 3, prerequisites: ["cs101"], termsOffered: ["spring"],
    skillContributions: [{ skillId: "skill_sql", weight: 0.7 }],
  },
  {
    id: "stat200", code: "STAT200", title: "Statistics", source: "university",
    provider: "State University", credits: 3, prerequisites: [], termsOffered: ["fall", "spring"],
    skillContributions: [{ skillId: "skill_stats", weight: 0.7 }],
  },
  {
    id: "ds300", code: "DS300", title: "Machine Learning", source: "university",
    provider: "State University", credits: 4, prerequisites: ["cs201", "stat200"], termsOffered: ["fall"],
    skillContributions: [{ skillId: "skill_ml", weight: 0.7 }, { skillId: "skill_stats", weight: 0.2 }],
  },
  {
    id: "web101", code: "WEB101", title: "Modern Web Development", source: "online",
    provider: "Coursera", credits: null, prerequisites: ["cs101"], termsOffered: ["fall", "spring"],
    skillContributions: [{ skillId: "skill_web", weight: 0.6 }, { skillId: "skill_js", weight: 0.5 }],
  },
  {
    id: "js201", code: "JS201", title: "TypeScript in Depth", source: "online",
    provider: "Frontend Masters", credits: null, prerequisites: ["web101"], termsOffered: ["fall", "spring"],
    skillContributions: [{ skillId: "skill_js", weight: 0.6 }],
  },
  {
    id: "viz150", code: "VIZ150", title: "Data Visualization", source: "online",
    provider: "Coursera", credits: null, prerequisites: ["stat200"], termsOffered: ["fall", "spring"],
    skillContributions: [{ skillId: "skill_data_viz", weight: 0.7 }, { skillId: "skill_stats", weight: 0.2 }],
  },
  {
    id: "ux100", code: "UX100", title: "Intro to UX Design", source: "online",
    provider: "Interaction Design Foundation", credits: null, prerequisites: [], termsOffered: ["fall", "spring"],
    skillContributions: [{ skillId: "skill_ux", weight: 0.6 }, { skillId: "skill_research", weight: 0.3 }],
  },
  {
    id: "ux210", code: "UX210", title: "User Research Methods", source: "online",
    provider: "Interaction Design Foundation", credits: null, prerequisites: ["ux100"], termsOffered: ["spring"],
    skillContributions: [{ skillId: "skill_research", weight: 0.7 }],
  },
];

export const careers: Career[] = [
  {
    id: "career_data_scientist", title: "Data Scientist",
    description: "Builds models and extracts insight from data.",
    requiredSkills: [
      { skillId: "skill_python", level: 0.8 },
      { skillId: "skill_stats", level: 0.9 },
      { skillId: "skill_ml", level: 0.8 },
      { skillId: "skill_data_viz", level: 0.6 },
      { skillId: "skill_sql", level: 0.6 },
    ],
  },
  {
    id: "career_software_engineer", title: "Software Engineer",
    description: "Designs and builds software systems.",
    requiredSkills: [
      { skillId: "skill_python", level: 0.6 },
      { skillId: "skill_js", level: 0.7 },
      { skillId: "skill_algorithms", level: 0.8 },
      { skillId: "skill_web", level: 0.6 },
      { skillId: "skill_sql", level: 0.5 },
    ],
  },
  {
    id: "career_ux_designer", title: "UX Designer",
    description: "Designs user-centered digital experiences.",
    requiredSkills: [
      { skillId: "skill_ux", level: 0.9 },
      { skillId: "skill_research", level: 0.8 },
      { skillId: "skill_data_viz", level: 0.5 },
      { skillId: "skill_web", level: 0.4 },
    ],
  },
];

export const skillNameById = new Map<string, string>(skills.map((s) => [s.id, s.name]));
