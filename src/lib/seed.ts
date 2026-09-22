// Default seed data used to initialise the JSON "database" on first run.
import type { AttendanceRecord, Coach, GalleryImage, Highlight, Person, Player, Receipt, Registration, SiteContent, Team } from "./types";

export const seedRegistrations: Registration[] = [];

// Receipts start empty; the admin issues them from the Receipts page.
export const seedReceipts: Receipt[] = [];

// Shared coach pool. Like players, coaches attach to teams by id. A coach's
// idNumber doubles as their login to the attendance portal.
export const seedCoaches: Coach[] = [
  {
    id: "co-1",
    name: { ar: "سامي خوري", he: "סامי חורי", en: "Sami Khoury" },
    idNumber: "200000001",
    phone: "050-0000001",
    image: "",
  },
  {
    id: "co-2",
    name: { ar: "نبيل عوّاد", he: "נביל עוואד", en: "Nabil Awad" },
    idNumber: "200000002",
    phone: "050-0000002",
    image: "",
  },
];

// Attendance sheets start empty; they're created from the coach portal.
export const seedAttendance: AttendanceRecord[] = [];

// Shared roster pool. Teams attach players by id; admins can edit, add or remove
// players, and create new ones inline while editing a team.
export const seedPlayers: Player[] = [
  {
    id: "pl-1",
    name: { ar: "جورج حداد", he: "ג'ורג' חדאד", en: "George Haddad" },
    number: "7",
    image: "",
  },
  {
    id: "pl-2",
    name: { ar: "إيلي خوري", he: "אלי חורי", en: "Elie Khoury" },
    number: "10",
    image: "",
  },
  {
    id: "pl-3",
    name: { ar: "رامي عسّاف", he: "ראמי עסّאף", en: "Rami Assaf" },
    number: "23",
    image: "",
  },
  {
    id: "pl-4",
    name: { ar: "نديم سمعان", he: "נדים סמעאן", en: "Nadim Samaan" },
    number: "4",
    image: "",
  },
];

export const seedTeams: Team[] = [
  {
    id: "tm-men",
    name: { ar: "الفريق الرجالي", he: "קבוצת הגברים", en: "Men's Team" },
    description: {
      ar: "فريقنا الأول ينافس في دوري IBBA بروح أرثوذكسية وإصرار.",
      he: "הקבוצה הבוגרת שלנו מתחרה בליגת IBBA ברוח אורתודוקסית ובנחישות.",
      en: "Our senior team competes in the IBBA league with Orthodox spirit and grit.",
    },
    image: "",
    ibbaLink: "https://www.ibba.co.il/",
    playerIds: ["pl-1", "pl-2", "pl-3"],
    coachIds: ["co-1"],
    matches: [
      {
        id: "mt-1",
        opponent: { ar: "نادي حيفا", he: "מועדון חיפה", en: "Haifa Club" },
        date: "2026-06-20T19:00:00.000Z",
        isHome: false,
        where: { ar: "قاعة الناصرة الرياضية", he: "אולם הספורט נצרת", en: "Nazareth Sports Hall" },
        contactName: { ar: "أبو سامر", he: "אבו סאמר", en: "Abu Samer" },
        contactPhone: "050-1234567",
        ibbaLink: "https://www.ibba.co.il/",
      },
    ],
    enabled: true,
    order: 0,
    createdAt: "2026-01-01T09:00:00.000Z",
  },
  {
    id: "tm-youth",
    name: { ar: "فريق الشباب", he: "קבוצת הנוער", en: "Youth Team" },
    description: {
      ar: "جيل المستقبل من لاعبي النادي الأرثوذكسي لكرة السلة.",
      he: "דור העתיד של שחקני אגודת הכדורסל האורתודוקסית.",
      en: "The next generation of Orthodox Basketball Association players.",
    },
    image: "",
    ibbaLink: "https://www.ibba.co.il/",
    playerIds: ["pl-4"],
    coachIds: ["co-2"],
    matches: [
      {
        id: "mt-2",
        opponent: { ar: "شباب الجليل", he: "נוער הגליל", en: "Galilee Youth" },
        date: "2026-06-27T17:30:00.000Z",
        isHome: true,
        where: { ar: "قاعة الناصرة الرياضية", he: "אולם הספורט נצרת", en: "Nazareth Sports Hall" },
      },
    ],
    enabled: true,
    order: 1,
    createdAt: "2026-01-02T09:00:00.000Z",
  },
];

export const seedHighlights: Highlight[] = [
  {
    id: "hl-1",
    embedUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    caption: { ar: "أفضل لقطات الموسم", he: "מיטב הרגעים של העונה", en: "Best moments of the season" },
    aspectRatio: "9 / 16",
  },
];

export const seedGallery: GalleryImage[] = [
  { id: "g-1", image: "", caption: { ar: "ليلة المباراة", he: "ערב משחק", en: "Game night" }, aspectRatio: "16 / 9" },
  { id: "g-2", image: "", caption: { ar: "الجمهور", he: "הקהל", en: "The crowd" }, aspectRatio: "16 / 9" },
];

export const seedStaff: Person[] = [
  {
    id: "st-1",
    name: { ar: "أبونا الياس", he: "האב איליאס", en: "Fr. Elias" },
    role: { ar: "المرشد الروحي", he: "מדריך רוחני", en: "Spiritual guide" },
    image: "",
  },
  {
    id: "st-2",
    name: { ar: "سامي خوري", he: "סامי חורי", en: "Sami Khoury" },
    role: { ar: "المدرّب الرئيسي", he: "מאמן ראשי", en: "Head coach" },
    image: "",
  },
];

export const seedVolunteers: Person[] = [
  {
    id: "vo-1",
    name: { ar: "مارينا حنا", he: "מרינה חנא", en: "Marina Hanna" },
    role: { ar: "تنسيق الفعاليات", he: "תיאום אירועים", en: "Events coordinator" },
    image: "",
  },
];

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
