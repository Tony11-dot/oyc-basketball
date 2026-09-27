// The sample entries that earlier versions seeded into a fresh database. They are
// no longer seeded; this file only exists so db.ts can find and remove any copy
// that is still stored and was never edited by the admin.
import type { Coach, GalleryImage, Highlight, Person, Player, Team } from "./types";

export const demoCoaches: Coach[] = [
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

export const demoPlayers: Player[] = [
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

export const demoTeams: Team[] = [
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

export const demoHighlights: Highlight[] = [
  {
    id: "hl-1",
    embedUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    caption: { ar: "أفضل لقطات الموسم", he: "מיטב הרגעים של העונה", en: "Best moments of the season" },
    aspectRatio: "9 / 16",
  },
];

export const demoGallery: GalleryImage[] = [
  { id: "g-1", image: "", caption: { ar: "ليلة المباراة", he: "ערב משחק", en: "Game night" }, aspectRatio: "16 / 9" },
  { id: "g-2", image: "", caption: { ar: "الجمهور", he: "הקהל", en: "The crowd" }, aspectRatio: "16 / 9" },
];

export const demoStaff: Person[] = [
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

export const demoVolunteers: Person[] = [
  {
    id: "vo-1",
    name: { ar: "مارينا حنا", he: "מרינה חנא", en: "Marina Hanna" },
    role: { ar: "تنسيق الفعاليات", he: "תיאום אירועים", en: "Events coordinator" },
    image: "",
  },
];
