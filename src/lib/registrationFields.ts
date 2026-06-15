// Canonical registration fields — shared by the public form, the validator and
// the PDF filler so the three never drift. Each data key maps to its AcroForm
// field name in /public/forms/registration-template.pdf.

// Jersey + payment values MUST match the PDF dropdown option strings exactly
// (the payment values are the Arabic options baked into the template).
export const JERSEY_SIZES = ["8", "10", "12", "14", "XXS", "XS", "S", "M", "L", "XL"] as const;
export const PAYMENT_VALUES = ["نقدا", "شيكات", "بطاقة اعتماد"] as const;

// Every field on the official form is now required (the club asked for complete
// records). dateSigned is auto-filled client-side, so it stays effectively
// mandatory too. Keep these in sync with validation.ts and Register.tsx.
export interface RegistrationInput {
  playerName: string;
  idNumber: string;
  birthDate: string;
  phonePlayer: string;
  fatherName: string;
  motherName: string;
  phoneFather: string;
  phoneMother: string;
  email: string;
  address: string;
  school: string;
  classGrade: string;
  jerseySize: string;
  paymentMethod: string;
  guardianName: string;
  dateSigned: string;
}

/** data key → AcroForm text/choice field name in the template PDF. */
export const PDF_FIELD_MAP: Record<keyof RegistrationInput, string> = {
  playerName: "player_name",
  idNumber: "id_number",
  birthDate: "birth_date",
  phonePlayer: "phone_player",
  fatherName: "father_name",
  motherName: "mother_name",
  phoneFather: "phone_father",
  phoneMother: "phone_mother",
  email: "email",
  address: "address",
  school: "school",
  classGrade: "class_grade",
  jerseySize: "jersey_size",
  paymentMethod: "payment_method",
  guardianName: "guardian_name",
  dateSigned: "date_signed",
};

/** Choice (dropdown) fields — filled with select() instead of setText(). */
export const PDF_CHOICE_FIELDS = new Set(["jersey_size", "payment_method"]);

/** The /Sig field; we draw the captured signature image over its rectangle. */
export const SIGNATURE_FIELD = "signature_guardian";
