// Pure username validation (BR-1). Property-tested (PBT-03): deterministic; valid output has no
// leading/trailing whitespace, length in [3,30], and only allowed characters.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;
export const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/;

export interface UsernameValidation {
  valid: boolean;
  value: string; // trimmed
  error: string | null;
}

export function validateUsername(input: string): UsernameValidation {
  const value = input.trim();
  if (value.length === 0) {
    return { valid: false, value, error: "Username is required" };
  }
  if (value.length < USERNAME_MIN || value.length > USERNAME_MAX) {
    return {
      valid: false,
      value,
      error: `Username must be ${USERNAME_MIN}-${USERNAME_MAX} characters`,
    };
  }
  if (!USERNAME_PATTERN.test(value)) {
    return {
      valid: false,
      value,
      error: "Use only letters, numbers, underscore, or hyphen",
    };
  }
  return { valid: true, value, error: null };
}
