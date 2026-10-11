import { describe, expect, test } from "vitest";
import fc from "fast-check";
import {
  USERNAME_MAX,
  USERNAME_MIN,
  USERNAME_PATTERN,
  validateUsername,
} from "./validateUsername";

// PBT-03: invariants. PBT-07: username-shaped generators. PBT-08: shrinking + seed.

const allowedChar = fc.constantFrom(
  ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-".split(""),
);
const allowedString = (min: number, max: number) =>
  fc.array(allowedChar, { minLength: min, maxLength: max }).map((cs) => cs.join(""));

describe("validateUsername invariants (PBT-03)", () => {
  test("deterministic", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(validateUsername(s)).toEqual(validateUsername(s));
      }),
    );
  });

  test("valid outputs are trimmed, in-range, and charset-clean", () => {
    fc.assert(
      fc.property(allowedString(USERNAME_MIN, USERNAME_MAX), (s) => {
        const r = validateUsername(s);
        expect(r.valid).toBe(true);
        expect(r.value).toBe(r.value.trim());
        expect(r.value.length).toBeGreaterThanOrEqual(USERNAME_MIN);
        expect(r.value.length).toBeLessThanOrEqual(USERNAME_MAX);
        expect(USERNAME_PATTERN.test(r.value)).toBe(true);
      }),
    );
  });

  test("strings with whitespace in the middle are rejected", () => {
    fc.assert(
      fc.property(
        allowedString(1, 10),
        allowedString(1, 10),
        (a, b) => {
          const r = validateUsername(`${a} ${b}`);
          expect(r.valid).toBe(false);
        },
      ),
    );
  });
});
