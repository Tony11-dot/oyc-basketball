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
    heading: { ar: "هل يجب تقديم المعلومات؟", he: "האם חובה למסור את המידע?", en: "Do you have to provide it?" },
    body: [
      {
        ar: "لا يوجد التزام قانوني بتقديم هذه المعلومات، وتقديمها يتم بموافقتكم. لكن بدون التفاصيل الأساسية (اسم اللاعب، رقم الهويّة، تاريخ الميلاد ووسيلة تواصل مع وليّ الأمر) لا يمكن إتمام التسجيل في النادي أو في اتحاد كرة السلة.",
        he: "אין חובה חוקית למסור מידע זה, ומסירתו נעשית בהסכמתכם. עם זאת, ללא הפרטים הבסיסיים (שם השחקן, מספר תעודת זהות, תאריך לידה ודרך ליצירת קשר עם ההורה) לא ניתן להשלים את ההרשמה למועדון או לאיגוד הכדורסל.",
        en: "You are not legally required to provide this information, and you do so with your consent. However, without the basic details (the player's name, ID number, date of birth and a way to reach a parent) the registration with the club and the basketball association cannot be completed.",
      },
    ],
  },
  {
    heading: { ar: "التخزين والحماية", he: "אחסון ואבטחה", en: "Storage & security" },
    body: [
      {
        ar: "تُخزَّن بياناتكم على خوادم آمنة، والوصول إليها مقتصر على إدارة النادي. لا نبيع بياناتكم الشخصية لأي طرف، ولا نشاركها إلا مع اتحاد كرة السلة عند الحاجة أو مزوّدي الخدمات التقنية الذين يشغّلون الموقع نيابة عنا.",
        he: "המידע שלכם מאוחסן על שרתים מאובטחים, והגישה אליו מוגבלת להנהלת המועדון. איננו מוכרים את המידע האישי שלכם לאף גורם, ואיננו משתפים אותו אלא עם איגוד הכדורסל בעת הצורך או עם ספקי השירותים הטכניים המפעילים את האתר עבורנו.",
        en: "Your data is stored on secure servers, and access is limited to club administrators. We do not sell your personal data to anyone, and only share it with the basketball association where required, or with the technical service providers who run the site on our behalf (hosting, data storage, email and SMS delivery, and the Stripe payment gateway).",
      },
    ],
  },
  {
    heading: { ar: "مدة الاحتفاظ بالبيانات", he: "תקופת שמירת המידע", en: "How long we keep it" },
    body: [
      {
        ar: "نحتفظ ببيانات التسجيل طوال فترة نشاط اللاعب في النادي، ولمدّة تصل إلى سبع سنوات بعد ذلك فقط حيث يلزم القانون الاحتفاظ بسجلات مالية (مثل الإيصالات). بعد ذلك تُحذف البيانات أو تُجعل مجهولة الهويّة.",
        he: "אנו שומרים את פרטי ההרשמה כל עוד השחקן פעיל במועדון, ועד שבע שנים לאחר מכן רק במקום שבו החוק מחייב שמירת רשומות כספיות (כגון קבלות). לאחר מכן המידע נמחק או הופך לאנונימי.",
        en: "We keep registration details while the player is active in the club, and for up to seven years afterwards only where the law requires financial records (such as receipts) to be kept. After that the data is deleted or anonymised.",
      },
    ],
  },
  {
    heading: { ar: "حقوقكم", he: "הזכויות שלכם", en: "Your rights" },
    body: [
      {
        ar: "يمكنكم في أي وقت طلب الاطّلاع على بياناتكم أو تصحيحها أو حذفها، عبر التواصل مع المسؤول عن البيانات أدناه. نردّ على الطلبات خلال 30 يوماً.",
        he: "בכל עת תוכלו לבקש לעיין במידע שלכם, לתקן אותו או למחוק אותו, על ידי פנייה לאחראי על המידע המופיע להלן. אנו משיבים לבקשות תוך 30 יום.",
        en: "You can ask to review, correct or delete your data at any time by contacting the data controller below. We respond to requests within 30 days.",
      },
    ],
  },
  {
    heading: { ar: "المسؤول عن البيانات والتواصل", he: "בעל השליטה במידע ויצירת קשר", en: "Data controller & contact" },
    body: [
      {
        ar: "المسؤول عن قاعدة البيانات هو النادي الأرثوذكسي لكرة السلة (OBA) – الناصرة. للاستفسارات وطلبات الخصوصية: سعيد أبو عرب، said_abu_a@hotmail.com.",
        he: "בעל השליטה במאגר המידע הוא האגודה האורתודוקסית לכדורסל (OBA) – נצרת. לשאלות ולבקשות פרטיות: סעיד אבו ערב, said_abu_a@hotmail.com.",
        en: "The data controller is the Orthodox Basketball Association (OBA) – Nazareth. For questions and privacy requests: Said Abu Arab, said_abu_a@hotmail.com.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return <LegalPage title={TITLE} sections={SECTIONS} />;
}
