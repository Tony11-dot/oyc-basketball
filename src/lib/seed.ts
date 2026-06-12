// Default seed data used to initialise the JSON "database" on first run.
import type { GalleryImage, Highlight, Player, Registration, SiteContent, Team } from "./types";

export const seedRegistrations: Registration[] = [];

// Shared roster pool. Teams attach players by id; admins can edit, add or remove
// players, and create new ones inline while editing a team.
export const seedPlayers: Player[] = [
  {
    id: "pl-1",
    name: { ar: "جورج حداد", he: "ג'ורג' חדאד", en: "George Haddad" },
    number: "7",
    position: { ar: "صانع ألعاب", he: "רכז", en: "Point Guard" },
    image: "",
  },
  {
    id: "pl-2",
    name: { ar: "إيلي خوري", he: "אלי חורי", en: "Elie Khoury" },
    number: "10",
    position: { ar: "جناح", he: "קלע", en: "Shooting Guard" },
    image: "",
  },
  {
    id: "pl-3",
    name: { ar: "رامي عسّاف", he: "ראמי עסّאף", en: "Rami Assaf" },
    number: "23",
    position: { ar: "ارتكاز", he: "סנטר", en: "Center" },
    image: "",
  },
  {
    id: "pl-4",
    name: { ar: "نديم سمعان", he: "נדים סמעאן", en: "Nadim Samaan" },
    number: "4",
    position: { ar: "جناح صغير", he: "פורוורד קטן", en: "Small Forward" },
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
    matches: [
      {
        id: "mt-1",
        opponent: { ar: "نادي حيفا", he: "מועדון חיפה", en: "Haifa Club" },
        date: "2026-06-20T19:00:00.000Z",
        where: { ar: "قاعة الناصرة الرياضية", he: "אולם הספורט נצרת", en: "Nazareth Sports Hall" },
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
      ar: "جيل المستقبل من لاعبي نادي الشبيبة الأرثوذكسية.",
      he: "דור העתיד של שחקני מועדון הנוער האורתודוקסי.",
      en: "The next generation of Orthodox Youth Club players.",
    },
    image: "",
    ibbaLink: "https://www.ibba.co.il/",
    playerIds: ["pl-4"],
    matches: [
      {
        id: "mt-2",
        opponent: { ar: "شباب الجليل", he: "נוער הגליל", en: "Galilee Youth" },
        date: "2026-06-27T17:30:00.000Z",
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

export const seedContent: SiteContent = {
  hero: {
    title: {
      ar: "نادي الشبيبة الأرثوذكسية — كرة السلة",
      he: "מועדון הנוער האורתודוקסי — כדורסל",
      en: "Orthodox Youth Club — Basketball",
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
      ar: "الناصرة",
      he: "נצרת",
      en: "Nazareth",
    },
    social: [{ label: "Instagram", url: "https://instagram.com/oyc.nazareth" }],
  },
  gallery: seedGallery,
};
