"use client";

import { LegalPage, type LegalSection } from "@/components/site/LegalPage";

const TITLE = { ar: "سياسة الخصوصية", he: "מדיניות פרטיות", en: "Privacy Policy" };

const SECTIONS: LegalSection[] = [
  {
    heading: { ar: "من نحن", he: "מי אנחנו", en: "Who we are" },
    body: [
      {
        ar: "هذه السياسة تخصّ موقع النادي الأرثوذكسي لكرة السلة – الناصرة، وتشرح كيف نجمع بياناتكم الشخصية عبر الموقع، ولماذا، وكيف نحميها.",
        he: "מדיניות זו נוגעת לאתר של האגודה האורתודוקסית לכדורסל – נצרת, ומסבירה כיצד אנו אוספים את המידע האישי שלכם באתר, לשם מה, וכיצד אנו שומרים עליו.",
        en: "This policy covers the website of the Orthodox Basketball Association – Nazareth, and explains what personal information we collect through the site, why, and how we protect it.",
      },
    ],
  },
  {
    heading: { ar: "المعلومات التي نجمعها", he: "המידע שאנו אוספים", en: "Information we collect" },
    body: [
      {
        ar: "عند التسجيل: اسم اللاعب/ة ورقم الهويّة وتاريخ الميلاد، أسماء وهواتف الوالدين، البريد الإلكتروني والعنوان والمدرسة، مقاس الزيّ، وصورة توقيع وليّ الأمر. عند الدفع بالبطاقة، تتم معالجة بيانات البطاقة عبر بوّابة دفع آمنة تابعة لجهة خارجية — نحن لا نحتفظ ببيانات بطاقتك. لحسابات المدرّبين: رقم الهويّة والهاتف، تُستخدم أيضاً لتسجيل الدخول إلى بوّابة الحضور.",
        he: "בעת ההרשמה: שם השחקן/ית ומספר הזהות, תאריך לידה, שמות וטלפונים של ההורים, אימייל, כתובת ובית ספר, מידת מדים, וחתימת האפוטרופוס. בתשלום בכרטיס אשראי, פרטי הכרטיס מעובדים דרך שער תשלום מאובטח של צד שלישי — אנו לא שומרים את פרטי הכרטיס. עבור חשבונות מאמנים: מספר זהות וטלפון, המשמשים גם להתחברות לפורטל הנוכחות.",
        en: "At registration: the player's name, ID number and date of birth, parents' names and phone numbers, email, address and school, jersey size, and the guardian's signature. Card payments are processed through a secure third-party payment gateway — we never store your card details. For coach accounts: an ID number and phone, also used to sign in to the attendance portal.",
      },
    ],
  },
  {
    heading: { ar: "كيف نستخدم هذه المعلومات", he: "כיצד אנו משתמשים במידע", en: "How we use this information" },
    body: [
      {
        ar: "لإدارة تسجيل اللاعب في النادي، ومتابعة الحضور والفرق، والتواصل معكم بخصوص المباريات والفعاليات، واستيفاء متطلبات اتحاد كرة السلة (IBBA)، ونشر صور وفيديوهات من أنشطة النادي حسب موافقتكم عند التسجيل.",
        he: "לניהול רישום השחקן במועדון, מעקב אחר נוכחות וקבוצות, יצירת קשר לגבי משחקים ואירועים, עמידה בדרישות איגוד הכדורסל (IBBA), ופרסום תמונות וסרטונים מפעילויות המועדון בהתאם להסכמתכם בעת ההרשמה.",
        en: "To manage the player's club registration, track attendance and team rosters, contact you about games and events, meet the requirements of the basketball association (IBBA), and publish photos and videos from club activities in line with the consent given at registration.",
      },
    ],
  },
  {
    heading: { ar: "التخزين والحماية", he: "אחסון ואבטחה", en: "Storage & security" },
    body: [
      {
        ar: "تُخزَّن بياناتكم على خوادم آمنة، والوصول إليها مقتصر على إدارة النادي. لا نبيع بياناتكم الشخصية لأي طرف، ولا نشاركها إلا مع اتحاد كرة السلة عند الحاجة أو مزوّدي الخدمات التقنية الذين يشغّلون الموقع نيابة عنا.",
        he: "המידע שלכם מאוחסן על שרתים מאובטחים, והגישה אליו מוגבלת להנהלת המועדון. איננו מוכרים את המידע האישי שלכם לאף גורם, ואיננו משתפים אותו אלא עם איגוד הכדורסל בעת הצורך או עם ספקי השירותים הטכניים המפעילים את האתר עבורנו.",
        en: "Your data is stored on secure servers, and access is limited to club administrators. We do not sell your personal data to anyone, and only share it with the basketball association where required, or with the technical service providers who run the site on our behalf.",
      },
    ],
  },
  {
    heading: { ar: "حقوقكم", he: "הזכויות שלכם", en: "Your rights" },
    body: [
      {
        ar: "يمكنكم في أي وقت طلب الاطّلاع على بياناتكم أو تصحيحها أو حذفها، عبر التواصل معنا من خلال قسم «تواصل» على الموقع.",
        he: "בכל עת תוכלו לבקש לעיין במידע שלכם, לתקן אותו או למחוק אותו, על ידי פנייה אלינו דרך מקטע «צור קשר» באתר.",
        en: "You can ask to review, correct or delete your data at any time by reaching out through the Contact section of the site.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return <LegalPage title={TITLE} sections={SECTIONS} />;
}
