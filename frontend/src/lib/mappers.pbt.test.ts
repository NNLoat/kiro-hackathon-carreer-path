import { describe, expect, test } from "vitest";
import fc from "fast-check";
import { profileToWire, toProfile } from "./mappers";
import type { WireProfile } from "./wire";

// PBT-02: round-trip. wire -> UI -> wire reproduces the original wire profile.
// PBT-07: domain-appropriate generator for WireProfile.
// PBT-08: fast-check shrinks + logs seed on failure by default.

const idArb = fc.string({ minLength: 1, maxLength: 12 });

const wireProfileArb: fc.Arbitrary<WireProfile> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 12 }),
  username: fc.string({ minLength: 1, maxLength: 20 }),
  completed_course_ids: fc.array(idArb, { maxLength: 8 }),
  interest_skill_ids: fc.array(idArb, { maxLength: 8 }),
  selected_career_ids: fc.array(idArb, { maxLength: 8 }),
});

describe("mappers round-trip (PBT-02)", () => {
  test("profile: wire -> UI -> wire is identity", () => {
    fc.assert(
      fc.property(wireProfileArb, (w) => {
        const back = profileToWire(toProfile(w));
        expect(back).toEqual(w);
      }),
    );
  });
});
