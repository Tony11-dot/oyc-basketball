// Default data used to initialise the database on first run. Lists start empty —
// everything shown on the site is entered by the admin. (The old sample entries
// live in ./demoData, used only to purge them from existing databases.)
import type { AttendanceRecord, Coach, GalleryImage, Highlight, Person, Player, Receipt, Registration, SiteContent, Team } from "./types";

export const seedRegistrations: Registration[] = [];

// Receipts start empty; the admin issues them from the Receipts page.
export const seedReceipts: Receipt[] = [];

// Shared coach pool. Like players, coaches attach to teams by id. A coach's
// idNumber doubles as their login to the attendance portal.
export const seedCoaches: Coach[] = [];

// Attendance sheets start empty; they're created from the coach portal.
export const seedAttendance: AttendanceRecord[] = [];

// Shared roster pool. Teams attach players by id; admins can edit, add or remove
// players, and create new ones inline while editing a team.
export const seedPlayers: Player[] = [];

export const seedTeams: Team[] = [];

export const seedHighlights: Highlight[] = [];

export const seedGallery: GalleryImage[] = [];

export const seedStaff: Person[] = [];

export const seedVolunteers: Person[] = [];

export const seedContent: SiteContent = {
  hero: {
    title: {
      ar: "النادي الأرثوذكسي لكرة السلة",
      he: "אגודת הכדורסל האורתודוקסית",
      en: "Orthodox Basketball Association",
    },
    subtitle: {
      ar: "الناصرة",
      he: "נצרת",
      en: "Nazareth",
    },
    body: {
      ar: "روح، أخوّة، وشغف بكرة السلة. تابعوا فرقنا، شاهدوا أبرز اللقطات، وانضمّوا إلى العائلة.",
      he: "רוח, אחווה ותשוקה לכדורסל. עקבו אחרי הקבוצות שלנו, צפו בשיאים והצטרפו למשפחה.",
      en: "Spirit, brotherhood and a passion for basketball. Follow our teams, watch the highlights and join the family.",
    },
    image: "",
  },
  footer: {
    phone: "",
    email: "",
    address: {
      ar: "شارع الناصرة 6053، رقم 9",
      he: "רחוב נצרת 6053, מס׳ 9",
      en: "Nazareth St. 6053, no. 9",
    },
    social: [{ label: "Instagram", url: "https://instagram.com/oyc.nazareth" }],
  },
  gallery: seedGallery,
  staff: seedStaff,
  volunteers: seedVolunteers,
  historic: {
    title: {
      ar: "لمحة تاريخية",
      he: "מבט היסטורי",
      en: "A historic glance",
    },
    body: {
      ar: "تأسّس النادي الأرثوذكسي لكرة السلة في الناصرة ليكون بيتاً للرياضة والروح والأخوّة. منذ سنواته الأولى، رعى النادي أجيالاً من اللاعبين على أرض الملعب وخارجها، وما زال يحمل الرسالة ذاتها حتى اليوم.",
      he: "אגודת הכדורסל האורתודוקסית בנצרת נוסדה כדי להיות בית לספורט, לרוח ולאחווה. מאז שנותיה הראשונות ליוותה האגודה דורות של שחקנים, על המגרש ומחוצה לו, ועודנה נושאת את אותה השליחות גם היום.",
      en: "The Orthodox Basketball Association of Nazareth was founded to be a home for sport, spirit and brotherhood. From its earliest years the club has nurtured generations of players on and off the court, and carries the same mission today.",
    },
    image: "",
  },
  register: {
    eyebrow: { ar: "انضمّ إلينا", he: "הצטרפו אלינו", en: "Join us" },
    heading: { ar: "التسجيل في النادي", he: "הרשמה למועדון", en: "Register with the club" },
    subheading: {
      ar: "املأ بياناتك ووقّع استمارة التسجيل هنا مباشرة.",
      he: "מלאו את הפרטים וחתמו על טופס ההרשמה כאן.",
      en: "Leave your details and sign the registration form right here.",
    },
    feeNote: {
      ar: "رسوم التسجيل السنوية: 3,500 ش.ج (لا تشمل 30 ش.ج لاتحاد كرة السلة). التسجيل مشروط بتسديد رسوم السنوات السابقة.",
      he: "דמי הרשמה שנתיים: 3,500 ₪ (לא כולל 30 ₪ לאיגוד הכדורסל). ההרשמה מותנית בתשלום חובות קודמים.",
      en: "Annual registration fee: ₪3,500 (excludes the ₪30 basketball-association fee). Registration is subject to payment of previous years' dues.",
    },
    consent: {
      ar: "أُقرّ بأنني وليّ أمر اللاعب/ة، وأوافق على شروط التسجيل، وعلى نشر صور ابني/ابنتي ضمن فعاليات الجمعية، وأن التسجيل مشروط بفحص طبّي ودفع الرسوم.",
      he: "אני מאשר/ת כי אני האפוטרופוס של השחקן/ית, מסכים/ה לתנאי ההרשמה ולפרסום תמונות ילדיי במסגרת פעילויות העמותה, וכי ההרשמה מותנית בבדיקה רפואית ובתשלום.",
      en: "I confirm I am the player's guardian, agree to the registration terms and to publishing my child's photos within the club's activities, and that registration is subject to a medical check and payment of fees.",
    },
    perks: [
      { ar: "تدريبات منتظمة", he: "אימונים קבועים", en: "Regular training" },
      { ar: "مباريات في دوري IBBA", he: "משחקים בליגת IBBA", en: "Games in the IBBA league" },
      { ar: "روح أرثوذكسية وأخوّة", he: "רוח אורתודוקסית ואחווה", en: "Orthodox spirit & brotherhood" },
    ],
    feeAmount: 3530,
  },
};
