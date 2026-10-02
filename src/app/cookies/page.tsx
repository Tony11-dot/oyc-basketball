"use client";

import { LegalPage, type LegalSection } from "@/components/site/LegalPage";

const TITLE = { ar: "سياسة ملفات تعريف الارتباط", he: "מדיניות עוגיות", en: "Cookie Policy" };

const SECTIONS: LegalSection[] = [
  {
    heading: { ar: "ما الذي تغطيه هذه الصفحة", he: "מה מכסה עמוד זה", en: "What this covers" },
    body: [
      {
        ar: "هذا الموقع لا يستخدم ملفات تعريف ارتباط للإعلانات أو التتبّع. نستخدم بدلاً من ذلك التخزين المحلي في متصفحكم لبضع تفضيلات بسيطة، وملف ارتباط دخول ضروري في صفحات الإدارة والمدرّبين فقط، إضافة إلى ملفات الأمان الخاصة ببوّابة الدفع والموضّحة أدناه.",
        he: "אתר זה אינו משתמש בעוגיות פרסום או מעקב. במקום זאת אנו משתמשים באחסון מקומי בדפדפן שלכם עבור מספר העדפות פשוטות, ובעוגיית התחברות הכרחית בעמודי הניהול והמאמנים בלבד, וכן בעוגיות האבטחה של שער התשלום המתוארות להלן.",
        en: "This site does not use advertising or tracking cookies. Instead, we use your browser's local storage for a couple of simple preferences, a necessary sign-in cookie only on the admin and coach pages, and the payment gateway's security cookies described below.",
      },
    ],
  },
  {
    heading: { ar: "التخزين المحلي الذي نستخدمه", he: "האחסון המקומי שבו אנו משתמשים", en: "The local storage we use" },
    body: [
      {
        ar: "لغة العرض التي تختارونها، وتفضيلات إمكانية الوصول (حجم الخط، التباين، وغيرها) — تُحفظ فقط على جهازكم، ولا تصل إلينا.",
        he: "שפת התצוגה שבחרתם, והעדפות הנגישות (גודל טקסט, ניגודיות ועוד) — נשמרות רק במכשיר שלכם, ולא מגיעות אלינו.",
        en: "Your chosen display language, and your accessibility preferences (text size, contrast, and so on) — these are saved only on your own device and never reach us.",
      },
    ],
  },
  {
    heading: { ar: "ملف الدخول لصفحات الإدارة والمدرّبين", he: "עוגיית ההתחברות בעמודי הניהול והמאמנים", en: "The sign-in cookie on admin & coach pages" },
    body: [
      {
        ar: "عند تسجيل دخول الإدارة أو أحد المدرّبين، يُحفظ ملف ارتباط آمن (httpOnly) للحفاظ على تسجيل الدخول فقط. زوّار الموقع العام لا يحصلون على هذا الملف.",
        he: "בעת התחברות ההנהלה או אחד המאמנים, נשמרת עוגיה מאובטחת (httpOnly) שתפקידה היחיד הוא לשמור על ההתחברות. מבקרים באתר הציבורי אינם מקבלים עוגיה זו.",
        en: "When an admin or coach signs in, a secure (httpOnly) cookie is set purely to keep them signed in. Visitors browsing the public site never receive this cookie.",
      },
    ],
  },
  {
    heading: { ar: "ملفات بوّابة الدفع (Stripe)", he: "עוגיות שער התשלום (Stripe)", en: "Payment gateway cookies (Stripe)" },
    body: [
      {
        ar: "نموذج التسجيل يحمّل بوّابة الدفع الآمنة Stripe، والتي قد تضع ملفات ارتباط ضرورية لمنع الاحتيال وتأمين الدفع (مثل __stripe_mid و__stripe_sid). لا تُستخدم هذه الملفات للإعلانات، وتخضع لسياسة الخصوصية الخاصة بـ Stripe.",
        he: "טופס ההרשמה טוען את שער התשלום המאובטח Stripe, שעשוי להציב עוגיות הכרחיות למניעת הונאות ולאבטחת התשלום (כגון __stripe_mid ו-__stripe_sid). עוגיות אלה אינן משמשות לפרסום, והן כפופות למדיניות הפרטיות של Stripe.",
        en: "The registration form loads Stripe's secure payment gateway, which may set cookies that are necessary for fraud prevention and payment security (such as __stripe_mid and __stripe_sid). They are not used for advertising, and are governed by Stripe's own privacy policy.",
      },
    ],
  },
  {
    heading: { ar: "إدارة تفضيلاتكم", he: "ניהול ההעדפות שלכם", en: "Managing your preferences" },
    body: [
      {
        ar: "يمكنكم مسح التخزين المحلي لمتصفحكم في أي وقت لإعادة ضبط اللغة وتفضيلات إمكانية الوصول إلى الوضع الافتراضي، دون أي تأثير على حساب النادي الخاص بكم.",
        he: "תוכלו למחוק את האחסון המקומי בדפדפן שלכם בכל עת כדי לאפס את השפה והעדפות הנגישות לברירת המחדל, ללא כל השפעה על חשבונכם במועדון.",
        en: "You can clear your browser's local storage at any time to reset the language and accessibility preferences back to their defaults — this has no effect on your club account.",
      },
    ],
  },
];

export default function CookiesPage() {
  return <LegalPage title={TITLE} sections={SECTIONS} />;
}
