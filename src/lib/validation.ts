// Lightweight validators shared by the registration form and the API.
import { JERSEY_SIZES, PAYMENT_VALUES, type RegistrationInput } from "./registrationFields";

// Accepts Israeli & international formats: digits, spaces, dashes, leading +.
const PHONE_RE = /^\+?[\d\s-]{7,18}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidPhone = (v: string) => PHONE_RE.test(v.trim());
export const isValidEmail = (v: string) => EMAIL_RE.test(v.trim());

export type { RegistrationInput };

const str = (v: unknown) => (v == null ? "" : String(v).trim());

/**
 * Validate a registration submission against the official form. Every field is
 * required (the club asked for complete records): player name, ID, birth date,
 * all three phones, both parents, a valid email, address, school, grade, jersey
 * size, payment method and the guardian name. The drawn signature is validated
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
  const phonePlayer = str(b.phonePlayer);
  const fatherName = str(b.fatherName);
  const motherName = str(b.motherName);
  const phoneFather = str(b.phoneFather);
  const phoneMother = str(b.phoneMother);
  const email = str(b.email);
  const address = str(b.address);
  const school = str(b.school);
  const classGrade = str(b.classGrade);
  const jerseySize = str(b.jerseySize);
  const paymentMethod = str(b.paymentMethod);
  const guardianName = str(b.guardianName);
  const dateSigned = str(b.dateSigned);

  // Required text fields (label → value).
  const required: [string, string][] = [
    ["playerName", playerName], ["idNumber", idNumber], ["birthDate", birthDate],
    ["phonePlayer", phonePlayer], ["fatherName", fatherName], ["motherName", motherName],
    ["phoneFather", phoneFather], ["phoneMother", phoneMother], ["address", address],
    ["school", school], ["classGrade", classGrade], ["jerseySize", jerseySize],
    ["paymentMethod", paymentMethod], ["guardianName", guardianName], ["dateSigned", dateSigned],
  ];
  for (const [name, value] of required) if (!value) return { ok: false, error: `${name} is required` };

  if (!isValidEmail(email)) return { ok: false, error: "valid email is required" };

  const phones = [phonePlayer, phoneFather, phoneMother];
  if (phones.some((p) => !isValidPhone(p))) return { ok: false, error: "invalid phone number" };

  if (!(JERSEY_SIZES as readonly string[]).includes(jerseySize))
    return { ok: false, error: "invalid jersey size" };
  if (!(PAYMENT_VALUES as readonly string[]).includes(paymentMethod))
    return { ok: false, error: "invalid payment method" };

  return {
    ok: true,
    value: {
      playerName, idNumber, birthDate, phonePlayer,
      fatherName, motherName, phoneFather, phoneMother,
      email, address, school, classGrade,
      jerseySize, paymentMethod, guardianName, dateSigned,
    },
  };
}
