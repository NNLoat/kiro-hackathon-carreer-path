import { describe, expect, test } from "vitest";
import { validateUsername } from "./validateUsername";

describe("validateUsername (example-based)", () => {
  test("accepts a valid username", () => {
    const r = validateUsername("nam_01");
    expect(r.valid).toBe(true);
    expect(r.value).toBe("nam_01");
    expect(r.error).toBeNull();
  });

  test("trims surrounding whitespace", () => {
    const r = validateUsername("  nam  ");
    expect(r.valid).toBe(true);
    expect(r.value).toBe("nam");
  });

  test("rejects empty", () => {
    expect(validateUsername("   ").valid).toBe(false);
  });

  test("rejects too short / too long", () => {
    expect(validateUsername("ab").valid).toBe(false);
    expect(validateUsername("a".repeat(31)).valid).toBe(false);
  });

  test("rejects illegal characters", () => {
    expect(validateUsername("nam space").valid).toBe(false);
    expect(validateUsername("nam@!").valid).toBe(false);
  });
});
