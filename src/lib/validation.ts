// Lightweight validators shared by the registration form and the API.
import { JERSEY_SIZES, PAYMENT_VALUES, type RegistrationInput } from "./registrationFields";

// Accepts Israeli & international formats: digits, spaces, dashes, leading +.
const PHONE_RE = /^\+?[\d\s-]{7,18}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidPhone = (v: string) => PHONE_RE.test(v.trim());
export const isValidEmail = (v: string) => EMAIL_RE.test(v.trim());

export type { RegistrationInput };

const str = (v: unknown) => (v == null ? "" : String(v).trim());
const optStr = (v: unknown) => {
  const s = str(v);
  return s ? s : undefined;
};

/**
 * Validate a registration submission against the official form. Player name, ID,
 * birth date, a valid email, at least one contact phone, and the guardian name
 * are required; everything else is optional. The drawn signature is validated
 * separately in the API route.
 */
export function validateRegistration(
  body: unknown,
): { ok: true; value: RegistrationInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;

  const playerName = str(b.playerName);
  const idNumber = str(b.idNumber);
  const birthDate = str(b.birthDate);
  const email = str(b.email);
  const guardianName = str(b.guardianName);

  const phonePlayer = optStr(b.phonePlayer);
  const phoneFather = optStr(b.phoneFather);
  const phoneMother = optStr(b.phoneMother);
  const jerseySize = optStr(b.jerseySize);
  const paymentMethod = optStr(b.paymentMethod);

  if (!playerName) return { ok: false, error: "playerName is required" };
  if (!idNumber) return { ok: false, error: "idNumber is required" };
  if (!birthDate) return { ok: false, error: "birthDate is required" };
  if (!isValidEmail(email)) return { ok: false, error: "valid email is required" };
  if (!guardianName) return { ok: false, error: "guardianName is required" };

  const phones = [phonePlayer, phoneFather, phoneMother].filter(Boolean) as string[];
  if (phones.length === 0) return { ok: false, error: "at least one phone is required" };
  if (phones.some((p) => !isValidPhone(p))) return { ok: false, error: "invalid phone number" };

  if (jerseySize && !(JERSEY_SIZES as readonly string[]).includes(jerseySize))
    return { ok: false, error: "invalid jersey size" };
  if (paymentMethod && !(PAYMENT_VALUES as readonly string[]).includes(paymentMethod))
    return { ok: false, error: "invalid payment method" };

  return {
    ok: true,
    value: {
      playerName,
      idNumber,
      birthDate,
      phonePlayer,
      fatherName: optStr(b.fatherName),
      motherName: optStr(b.motherName),
      phoneFather,
      phoneMother,
      email,
      address: optStr(b.address),
      school: optStr(b.school),
      classGrade: optStr(b.classGrade),
      jerseySize,
      paymentMethod,
      guardianName,
      dateSigned: optStr(b.dateSigned),
    },
  };
}
