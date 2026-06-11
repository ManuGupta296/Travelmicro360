// Shared email/phone validation for all user-facing forms. One source of truth — no copy-pasted regex.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/; // Indian mobile: exactly 10 digits, no letters/symbols/spaces

export const EMAIL_ERROR = 'Enter a valid email (e.g. name@example.com)';
export const PHONE_ERROR = 'Enter a valid 10-digit mobile number';

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value ?? '').trim());
}

export function isValidPhone(value) {
  return PHONE_RE.test(String(value ?? '').trim());
}
