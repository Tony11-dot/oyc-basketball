// Lightweight validators shared by the registration form and the API.

// Accepts Israeli & international formats: digits, spaces, dashes, leading +.
const PHONE_RE = /^\+?[\d\s-]{7,18}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidPhone = (v: string) => PHONE_RE.test(v.trim());
export const isValidEmail = (v: string) => EMAIL_RE.test(v.trim());

export interface RegistrationInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes?: string;
}

/** Validate a registration submission (name, phone and a valid email — email is
 * required because the DocuSign PowerForm is sent to it). */
export function validateRegistration(
  body: unknown,
): { ok: true; value: RegistrationInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;
  const firstName = String(b.firstName ?? "").trim();
  const lastName = String(b.lastName ?? "").trim();
  const phone = String(b.phone ?? "").trim();
  const email = String(b.email ?? "").trim();
  const notes = b.notes ? String(b.notes).trim() : undefined;

  if (!firstName) return { ok: false, error: "firstName is required" };
  if (!lastName) return { ok: false, error: "lastName is required" };
  if (!isValidPhone(phone)) return { ok: false, error: "valid phone is required" };
  if (!isValidEmail(email)) return { ok: false, error: "valid email is required" };

  return { ok: true, value: { firstName, lastName, phone, email, notes } };
}
