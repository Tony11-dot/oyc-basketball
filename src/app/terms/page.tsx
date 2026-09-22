"use client";

import { LegalPage, type LegalSection } from "@/components/site/LegalPage";

const TITLE = { ar: "شروط الاستخدام", he: "תנאי שימוש", en: "Terms of Use" };

const SECTIONS: LegalSection[] = [
  {
    heading: { ar: "قبول الشروط", he: "קבלת התנאים", en: "Acceptance of these terms" },
    body: [
      {
        ar: "باستخدامكم هذا الموقع أو تسجيل لاعب/ة عبره، فإنكم توافقون على الشروط التالية.",
        he: "בשימושכם באתר זה או ברישום שחקן/ית דרכו, אתם מסכימים לתנאים הבאים.",
        en: "By using this site or registering a player through it, you agree to the following terms.",
      },
    ],
  },
  {
    heading: { ar: "دقّة بيانات التسجيل", he: "דיוק פרטי ההרשמה", en: "Accuracy of registration details" },
    body: [
      {
        ar: "على وليّ الأمر تقديم معلومات صحيحة وكاملة عند التسجيل. التسجيل مشروط بفحص طبّي وبتسديد الرسوم كما هو موضّح في استمارة التسجيل.",
        he: "על ההורה/אפוטרופוס למסור מידע נכון ומלא בעת ההרשמה. ההרשמה מותנית בבדיקה רפואית ובתשלום דמי הרישום כפי שמפורט בטופס ההרשמה.",
        en: "The guardian must provide accurate, complete information at registration. Registration is subject to a medical clearance and payment of fees as set out in the registration form.",
      },
    ],
  },
  {
    heading: { ar: "الرسوم والدفع", he: "דמי רישום ותשלום", en: "Fees & payment" },
    body: [
      {
        ar: "تُعالَج مدفوعات البطاقة عبر بوّابة دفع آمنة. تُسدَّد طرق الدفع الأخرى (نقداً، شيكات، تحويل بنكي، أمر دائم) وفق تعليمات النادي والمهلة المذكورة عند التسجيل.",
        he: "תשלומים בכרטיס אשראי מעובדים דרך שער תשלום מאובטח. אמצעי תשלום אחרים (מזומן, צ'קים, העברה בנקאית, הוראת קבע) מוסדרים לפי הנחיות המועדון והמועד שצוין בעת ההרשמה.",
        en: "Card payments are processed through a secure payment gateway. Other payment methods (cash, cheques, bank transfer, standing order) are settled per the club's instructions and the deadline noted at registration.",
      },
    ],
  },
  {
    heading: { ar: "الصور والفيديو", he: "תמונות וסרטונים", en: "Photos & video" },
    body: [
      {
        ar: "بتسجيل اللاعب/ة، يوافق وليّ الأمر على استخدام صور وفيديوهات ابنه/ابنتها ضمن أنشطة النادي وترويجه، على الموقع ووسائل التواصل الاجتماعي.",
        he: "ברישום השחקן/ית, ההורה/אפוטרופוס מסכים לשימוש בתמונות ובסרטונים של ילדו/ילדתו במסגרת פעילויות המועדון וקידומו, באתר וברשתות החברתיות.",
        en: "By registering a player, the guardian consents to their child's photos and videos being used within the club's activities and promotion, on the site and on social media.",
      },
    ],
  },
  {
    heading: { ar: "السلوك والقواعد", he: "התנהגות וכללים", en: "Conduct & rules" },
    body: [
      {
        ar: "يُتوقَّع من اللاعبين وأولياء الأمور الالتزام بقواعد اتحاد كرة السلة (IBBA) وأخلاقيات النادي في كل المباريات والتدريبات.",
        he: "מהשחקנים וההורים מצופה לפעול לפי כללי איגוד הכדורסל (IBBA) ולפי כללי ההתנהגות של המועדון בכל המשחקים והאימונים.",
        en: "Players and parents are expected to follow the basketball association's (IBBA) rules and the club's code of conduct at every game and practice.",
      },
    ],
  },
  {
    heading: { ar: "المسؤولية", he: "אחריות", en: "Liability" },
    body: [
      {
        ar: "يبذل النادي عناية معقولة في تنظيم أنشطته، إلّا أنّ المشاركة في التدريبات والمباريات تحمل مخاطر اعتيادية مرتبطة بممارسة الرياضة.",
        he: "המועדון פועל בזהירות סבירה בארגון פעילותו, אולם השתתפות באימונים ובמשחקים כרוכה בסיכונים הרגילים הנלווים לפעילות ספורטיבית.",
        en: "The club takes reasonable care in organizing its activities; however, participation in practices and games carries the ordinary risks associated with the sport.",
      },
    ],
  },
  {
    heading: { ar: "تغييرات على الشروط", he: "שינויים בתנאים", en: "Changes to these terms" },
    body: [
      {
        ar: "قد يقوم النادي بتحديث هذه الشروط من وقت لآخر. يُعدّ استمراركم في استخدام الموقع بعد أي تحديث موافقة على الشروط المعدّلة.",
        he: "המועדון עשוי לעדכן תנאים אלה מעת לעת. המשך השימוש שלכם באתר לאחר עדכון מהווה הסכמה לתנאים המעודכנים.",
        en: "The club may update these terms from time to time. Continuing to use the site after an update constitutes acceptance of the revised terms.",
      },
    ],
  },
];

export default function TermsPage() {
  return <LegalPage title={TITLE} sections={SECTIONS} />;
}
