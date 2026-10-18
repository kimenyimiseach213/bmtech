export function newPasswordError(password: string, confirmation: string): string | null {
  if (password !== confirmation) return "The new passwords do not match.";
  if (password.length < 12 || new TextEncoder().encode(password).length > 72
    || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9\s]/.test(password)) {
    return "Use at least 12 characters with uppercase, lowercase, a number and a symbol (maximum 72 UTF-8 bytes).";
  }
  return null;
}

export function validAccountEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const accountNotices: Record<string, string> = {
  "password-changed": "Your password has been updated successfully. Please log in again.",
  "email-changed": "Your email address has been updated successfully. Please log in again.",
};
