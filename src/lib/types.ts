// Shared domain types for the OBA Nazareth basketball site + admin platform.

export type Locale = "ar" | "he" | "en";

export type Localized = Record<Locale, string>;

export type RegistrationStatus = "new" | "signed" | "archived";

/** Admin settings stored in the database (e.g. the changeable admin password). */
export interface AdminSettings {
  passwordSalt?: string;
  passwordHash?: string;
}

/**
 * A player in the club roster. Players live in a shared pool and are attached to
 * one or more teams by id, so the same player can appear on multiple teams and
 * new teams can pick from existing players (or create a player on the spot).
 */
export interface Player {
  id: string;
  name: Localized;
  /** Jersey number (free text so "00" etc. work). */
  number?: string;
  /** Player's own phone number (optional). */
  phone?: string;
  /** Father's phone number (optional). */
  fatherPhone?: string;
  /** Mother's phone number (optional). */
  motherPhone?: string;
  image?: string;
  /** CSS object-position for the cropped photo, e.g. "center top". */
  imagePosition?: string;
  /** CSS aspect-ratio for the photo frame, e.g. "4 / 5". */
  aspectRatio?: string;
  /** Date of birth, "YYYY-MM-DD". */
  birthDate?: string;
  /** Total registration fee owed by this player, in whole shekels (₪). Defaults
   * to the club registration fee when unset. */
  feeAmount?: number;
  /** How much of {@link feeAmount} the player has paid so far, in ₪. The balance
   * still owed is `feeAmount - paidAmount`. */
  paidAmount?: number;
}

/**
 * A scheduled / played match for a team: against whom, when (date + weekday is
 * derived from the date), where, and a link to that game on the IBBA site.
 */
export interface Match {
  id: string;
  opponent: Localized;
  /** Optional opponent logo/crest. */
  opponentLogo?: string;
  /** ISO date-time. The weekday is derived from this for display. */
  date: string;
  where: Localized;
  /** The person to contact for this opponent / fixture (المسؤول). */
  contactName?: Localized;
  /** That contact person's phone number. */
  contactPhone?: string;
  /** Link to this fixture / standings on the IBBA website. */
  ibbaLink?: string;
}

/**
 * A coach in the club. Like {@link Player}, coaches live in a shared pool and are
 * attached to teams by id, so the same coach can lead several teams. A coach's
 * ID number doubles as their login for the attendance portal.
 */
export interface Coach {
  id: string;
  name: Localized;
  /** National / club ID number — also used to log in to the attendance portal. */
  idNumber?: string;
  /** Contact phone number. */
  phone?: string;
  image?: string;
  imagePosition?: string;
  aspectRatio?: string;
}

export type AttendanceStatus = "present" | "absent";

/**
 * One attendance sheet: a single team on a single date. There is at most one
 * record per (teamId, date); re-submitting from the coach portal updates it.
 * `statuses` maps a {@link Player.id} to whether they were present or absent.
 */
export interface AttendanceRecord {
  id: string;
  teamId: string;
  /** Calendar day, "YYYY-MM-DD". */
  date: string;
  /** The coach who took attendance, referencing {@link Coach.id}. */
  coachId?: string;
  statuses: Record<string, AttendanceStatus>;
  createdAt: string;
  updatedAt: string;
}

/**
 * A team. The public "Teams" section lists these as cards; tapping one opens a
 * full-screen detail sheet with its players, matches and IBBA link. Modeled on
 * the editable-card pattern (own photo, frame, detail background).
 */
export interface Team {
  id: string;
  name: Localized;
  description: Localized;
  /** Team logo / photo shown on the card. */
  image: string;
  imagePosition?: string;
  aspectRatio?: string;
  /** Optional background for the full-screen detail view. */
  detailBg?: string;
  /** Link to this team's page on the IBBA website. */
  ibbaLink?: string;
  /** Players attached to this team, referencing {@link Player.id}. */
  playerIds: string[];
  /** Coaches attached to this team, referencing {@link Coach.id}. */
  coachIds: string[];
  /** Fixtures for this team. */
  matches: Match[];
  /** When false, players on this team don't pay — every payment UI (fees,
   * balances, totals) is hidden for this team. Defaults to true when unset. */
  paymentsEnabled?: boolean;
  /** When false the team is hidden from the public site. */
  enabled: boolean;
  /** Sort order on the public site and admin list (ascending). */
  order: number;
  createdAt: string;
}

/**
 * A highlight reel. Each reel is either an uploaded/linked video or an external
 * embed (YouTube / Instagram). They cycle horizontally "like a train".
 */
export interface Highlight {
  id: string;
  /** Direct video URL (uploaded mp4/webm, or any direct file link). */
  videoUrl?: string;
  /** External video link (YouTube / Instagram) — embedded in an iframe. */
  embedUrl?: string;
  /** Optional poster image (shown before play / as a fallback). */
  poster?: string;
  caption: Localized;
  /** CSS aspect-ratio for the reel frame, e.g. "9 / 16" (vertical reels). */
  aspectRatio?: string;
}

/** A slide in the photo gallery carousel, managed in the admin. */
export interface GalleryImage {
  id: string;
  image: string;
  caption: Localized;
  imagePosition?: string;
  aspectRatio?: string;
}

/** A staff member or volunteer — a person with a localized name + role + photo.
 * Shared shape so the Staff and Volunteers sections render identically. */
export interface Person {
  id: string;
  name: Localized;
  /** Role / title, e.g. Coach, Team Manager, Volunteer. */
  role: Localized;
  image?: string;
  imagePosition?: string;
  aspectRatio?: string;
}

/** The "Historic Glance" narrative section — an editable title + body + photo. */
export interface HistoricSection {
  title: Localized;
  body: Localized;
  image?: string;
  imagePosition?: string;
  aspectRatio?: string;
}

/** Editable copy for the Registration section (the form labels stay fixed; this
 * is the surrounding marketing/legal text the admin can change). */
export interface RegisterContent {
  eyebrow: Localized;
  heading: Localized;
  subheading: Localized;
  /** The fee note shown in the invitation panel. */
  feeNote: Localized;
  /** The consent text beside the signature checkbox. */
  consent: Localized;
  /** Bullet-point perks listed in the invitation panel. */
  perks: Localized[];
  /** The amount charged by card, in whole shekels (₪). Drives the Stripe total. */
  feeAmount?: number;
}

/** A registration submitted from the public site. Mirrors the official OBA
 * Nazareth registration form (استمارة التسجيل) — every field below maps to a
 * field in /public/forms/registration-template.pdf (see lib/registrationPdf). */
export interface Registration {
  id: string;
  createdAt: string; // ISO timestamp
  status: RegistrationStatus;

  // --- Player ---
  playerName: string;
  idNumber: string;
  birthDate: string;
  phonePlayer?: string;

  // --- Parents ---
  fatherName?: string;
  motherName?: string;
  phoneFather?: string;
  phoneMother?: string;

  // --- Contact / school ---
  email: string;
  address?: string;
  school?: string;
  classGrade?: string;

  // --- Club ---
  jerseySize?: string;
  paymentMethod?: string;
  /** Payment lifecycle for card payments (others are settled offline). */
  paymentStatus?: "pending" | "paid";
  /** Reference id returned by the payment provider once a card payment clears. */
  paymentRef?: string;

  // --- Signing ---
  guardianName: string;
  dateSigned?: string;
  /** True once a signature image was captured + drawn onto the filled PDF. */
  hasSignature?: boolean;
  /** Vercel Blob URL of the filled PDF (production). In dev the PDF lives on
   * disk and is served by /api/registrations/[id]/pdf instead. */
  pdfUrl?: string;

  /** Set when the registration is marked completed in the admin. */
  signedAt?: string;

  // --- Legacy (older records / seed data) ---
  firstName?: string;
  lastName?: string;
  phone?: string;
  notes?: string;
}

/** Payment method options for a manually-issued receipt. Mirrors the three
 * methods on the registration form (cash / cheque / credit card). */
export type ReceiptMethod = "نقدا" | "شيكات" | "بطاقة اعتماد" | "تحويل بنكي" | "أمر دائم";

/** A payment receipt issued from the admin. The admin fills a name, an amount
 * and a payment method; the system renders a formal Arabic PDF from it. */
export interface Receipt {
  id: string;
  /** Sequential human-friendly number shown on the PDF (e.g. 1, 2, 3…). */
  number: number;
  /** Roster player this receipt was issued to, when picked from the roster
   * (older receipts and one-off names typed by hand have none). */
  playerId?: string;
  /** Who paid — a snapshot of the player's name at issue time (or free text
   * for a receipt with no linked player). */
  name: string;
  /** Amount paid, in whole shekels (₪). */
  amount: number;
  /** How the payment was made. */
  method: ReceiptMethod;
  /** Optional free-text note / what the payment was for. */
  note?: string;
  /** ISO timestamp the receipt was created. */
  createdAt: string;
}

/** Per-field text styling chosen in the admin Content editor. All optional —
 * unset properties fall back to the site's default design. */
export interface TextStyle {
  fontFamily?: string; // id from FONT_OPTIONS
  fontSize?: number; // px
  bold?: boolean;
  italic?: boolean;
  align?: "start" | "center" | "end";
  color?: string; // hex
}

// ---- Custom content blocks (the admin "block builder") ----------------------

export type BlockType = "heading" | "paragraph" | "image" | "button";

/** Max width of a block on larger screens. On phones every block is full-width
 * so the layout always stays natural and readable. */
export type BlockWidth = "full" | "wide" | "medium" | "narrow";

export interface Block {
  id: string;
  type: BlockType;
  text?: Localized;
  image?: string;
  href?: string;
  style?: TextStyle;
  align: "start" | "center" | "end";
  width: BlockWidth;
}

/** Where the custom block section sits on the public page. */
export type BlocksPosition = "afterHero" | "afterTeams" | "beforeRegister" | "beforeFooter";

export interface SiteContent {
  hero: {
    title: Localized;
    subtitle: Localized;
    body: Localized;
    image: string;
    imagePosition?: string;
    aspectRatio?: string;
  };
  footer: {
    phone: string;
    email: string;
    address: Localized;
    social: { label: string; url: string }[];
  };
  /** Optional per-field text styles, keyed by STYLE_KEYS (e.g. "hero.title"). */
  styles?: Record<string, TextStyle>;
  /** Inline text overrides for otherwise-fixed UI strings, keyed by a dictionary
   * dot-path (e.g. "highlights.heading"). Each holds all three languages; when
   * set it replaces the built-in dictionary default on the public site. */
  overrides?: Record<string, Localized>;
  /** Admin-built custom blocks and where they render on the page. */
  blocks?: Block[];
  blocksPosition?: BlocksPosition;
  /** Photo gallery carousel slides, managed in the admin. */
  gallery?: GalleryImage[];
  /** Coaching / administrative staff shown in the Staff section. */
  staff?: Person[];
  /** Club volunteers shown in the Volunteers section. */
  volunteers?: Person[];
  /** "Historic Glance" narrative section content. */
  historic?: HistoricSection;
  /** Editable copy for the Registration section. */
  register?: RegisterContent;
  /** Optional background image per section, keyed by section id
   * (home/teams/highlights/gallery/register). */
  backgrounds?: Record<string, string>;
  /** Admin-chosen order of the reorderable sections on the home page. */
  sectionOrder?: string[];
  /** Section ids hidden from the page + nav (managed in admin → Sections). */
  hiddenSections?: string[];
}
