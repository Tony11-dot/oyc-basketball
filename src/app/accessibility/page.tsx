"use client";

import { LegalPage, type LegalSection } from "@/components/site/LegalPage";

const TITLE = { ar: "بيان إمكانية الوصول", he: "הצהרת נגישות", en: "Accessibility Statement" };

const SECTIONS: LegalSection[] = [
  {
    heading: { ar: "التزامنا", he: "המחויבות שלנו", en: "Our commitment" },
    body: [
      {
        ar: "يرى النادي الأرثوذكسي لكرة السلة (OBA) – الناصرة أهمية كبيرة في إتاحة موقعه لجميع الأشخاص، بمن فيهم ذوو الإعاقة. عملنا على ملاءمة الموقع وفق أنظمة المساواة في الحقوق للأشخاص ذوي الإعاقة (ملاءمات إتاحة الخدمة)، 2013، والمعيار الإسرائيلي ت\"י 5568، المبني على إرشادات WCAG 2.0 بمستوى AA.",
        he: "האגודה האורתודוקסית לכדורסל (OBA) – נצרת רואה חשיבות רבה בהנגשת האתר לכלל האנשים, לרבות אנשים עם מוגבלות. פעלנו להתאים את האתר לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע\"ג-2013, ולתקן הישראלי ת\"י 5568, המבוסס על הנחיות WCAG 2.0 ברמה AA.",
        en: "The Orthodox Basketball Association (OBA) – Nazareth is committed to making its website usable by everyone, including people with disabilities. We have worked to bring the site in line with the Equal Rights for Persons with Disabilities (Service Accessibility Adjustments) Regulations, 2013, and Israeli Standard IS 5568, which is based on the WCAG 2.0 guidelines at level AA.",
      },
    ],
  },
  {
    heading: { ar: "ما قمنا به", he: "מה עשינו", en: "What we have done" },
    body: [
      {
        ar: "الموقع متاح بالعربية والعبرية والإنجليزية مع اتجاه كتابة صحيح لكل لغة؛ يمكن التنقّل فيه بلوحة المفاتيح؛ للصور نصوص بديلة؛ ويتلاءم مع الهواتف وتكبير الشاشة. كما تتيح أداة الوصول (الزر في أسفل الصفحة) تكبير النص، وتباينًا عاليًا، وعرضًا بالأبيض والأسود، وتسطير الروابط، وتقليل الحركة — وتُحفظ هذه الإعدادات على جهازكم.",
        he: "האתר זמין בערבית, בעברית ובאנגלית עם כיווניות נכונה לכל שפה; ניתן לנווט בו באמצעות המקלדת; לתמונות יש טקסט חלופי; והוא מותאם לטלפונים ולהגדלת מסך. בנוסף, רכיב הנגישות (הכפתור בתחתית העמוד) מאפשר הגדלת טקסט, ניגודיות גבוהה, תצוגה בגווני אפור, הדגשת קישורים וצמצום תנועה — וההגדרות נשמרות במכשיר שלכם.",
        en: "The site is available in Arabic, Hebrew and English with the correct text direction for each; it can be navigated by keyboard; images have text alternatives; and it adapts to phones and screen zoom. The accessibility tool (the button at the bottom of the page) also offers larger text, high contrast, grayscale, underlined links and reduced motion — your choices are saved on your device.",
      },
    ],
  },
  {
    heading: { ar: "قيود معروفة", he: "מגבלות ידועות", en: "Known limitations" },
    body: [
      {
        ar: "قد لا تكون بعض المحتويات التي يرفعها النادي، مثل مقاطع الفيديو من المباريات أو ملفات PDF، متاحة بالكامل (مثلاً بدون ترجمة نصية). نعمل على تحسين ذلك باستمرار. إذا واجهتم صعوبة في أيّ جزء من الموقع، يسعدنا تقديم المعلومات أو إتمام التسجيل بطريقة أخرى.",
        he: "ייתכן שחלק מהתכנים שהמועדון מעלה, כגון סרטוני משחקים או קובצי PDF, אינם נגישים במלואם (למשל ללא כתוביות). אנו פועלים לשפר זאת באופן שוטף. אם נתקלתם בקושי בחלק כלשהו של האתר, נשמח לספק את המידע או להשלים את ההרשמה בדרך אחרת.",
        en: "Some content the club uploads, such as game videos or PDF files, may not be fully accessible (for example, without captions). We keep working to improve this. If any part of the site is hard to use, we will gladly provide the information or complete a registration another way.",
      },
    ],
  },
  {
    heading: { ar: "إتاحة المرافق والنشاطات", he: "נגישות המתקנים והפעילויות", en: "Facilities & activities" },
    body: [
      {
        ar: "تُقام التدريبات والمباريات البيتية في القاعات الرياضية التي يستخدمها النادي. للاستفسار عن الإتاحة الفيزيائية لقاعة معيّنة (مدخل، مواقف، مقاعد للجمهور، مراحيض) أو لطلب ترتيب خاص لمشارك أو زائر، يُرجى التواصل مع منسّق الإتاحة قبل الموعد وسنساعد قدر الإمكان.",
        he: "האימונים ומשחקי הבית מתקיימים באולמות הספורט שבהם משתמש המועדון. לשאלות על הנגישות הפיזית של אולם מסוים (כניסה, חניה, מושבי קהל, שירותים) או לבקשת התאמה למשתתף או למבקר, נא לפנות לרכז הנגישות מראש ונסייע ככל האפשר.",
        en: "Practices and home games take place in the sports halls the club uses. For questions about the physical accessibility of a particular hall (entrance, parking, spectator seating, restrooms), or to request an adjustment for a participant or visitor, please contact the accessibility coordinator in advance and we will help as far as we can.",
      },
    ],
  },
  {
    heading: { ar: "منسّق الإتاحة", he: "רכז הנגישות", en: "Accessibility coordinator" },
    body: [
      {
        ar: "لملاحظات أو طلبات تتعلّق بإمكانية الوصول: سعيد أبو عرب، said_abu_a@hotmail.com. نرجو ذكر الصفحة والمشكلة التي واجهتموها، وسنردّ في أقرب وقت ممكن.",
        he: "להערות או בקשות בנושא נגישות: סעיד אבו ערב, said_abu_a@hotmail.com. נא לציין את העמוד ואת הבעיה שבה נתקלתם, ונחזור אליכם בהקדם האפשרי.",
        en: "For feedback or requests about accessibility: Said Abu Arab, said_abu_a@hotmail.com. Please mention the page and the problem you ran into, and we will get back to you as soon as possible.",
      },
    ],
  },
  {
    heading: { ar: "تاريخ التحديث", he: "תאריך עדכון", en: "Last updated" },
    body: [{ ar: "أكتوبر 2026", he: "אוקטובר 2026", en: "October 2026" }],
  },
];

export default function AccessibilityPage() {
  return <LegalPage title={TITLE} sections={SECTIONS} />;
}
