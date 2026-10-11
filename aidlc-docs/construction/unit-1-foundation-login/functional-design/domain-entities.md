# Domain Entities — Unit 1: Foundation + Login

Unit 1 touches a slice of the domain. Full type definitions live in Application Design
(`component-methods.md`); here we note the entities relevant to Unit 1 and the wire/UI/mapper boundary.

## Profile (used in Unit 1)
| Field (UI, camelCase) | Wire (snake_case) | Type | Notes |
|---|---|---|---|
| id | id | ProfileId (string) | server-assigned |
| username | username | string | trimmed, validated client-side (BR-1) |
| completedCourseIds | completed_course_ids | string[] | empty at creation |
| interestSkillIds | interest_skill_ids | string[] | empty at creation |
| selectedCareerIds | selected_career_ids | string[] | empty at creation |

- Mapping handled solely by `lib/mappers.ts` (`toProfile`, `profilePatchToWire`).

## SessionState (client-only, not persisted on server)
| Field | Type | Notes |
|---|---|---|
| profileId | ProfileId \| null | active profile key |
| username | string \| null | display + convenience |
| (persisted) | localStorage `cpp.session` | `{ profileId, username }` (BR-3) |

## ApiError (normalized)
| Field | Type |
|---|---|
| code | string (snake_case machine code) |
| message | string |
| details | unknown (optional) |

- Parsed from wire envelope `{ error: { code, message, details? } }`.

## Relationships
- SessionState references a Profile by `profileId`.
- No persistence entities on the frontend beyond localStorage session (prototype).
