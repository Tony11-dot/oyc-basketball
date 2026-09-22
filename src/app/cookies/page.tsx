"use client";

import { LegalPage, type LegalSection } from "@/components/site/LegalPage";

const TITLE = { ar: "سياسة ملفات تعريف الارتباط", he: "מדיניות עוגיות", en: "Cookie Policy" };

const SECTIONS: LegalSection[] = [
  {
    heading: { ar: "ما الذي تغطيه هذه الصفحة", he: "מה מכסה עמוד זה", en: "What this covers" },
    body: [
      {
        ar: "هذا الموقع لا يستخدم ملفات تعريف ارتباط للإعلانات أو التتبّع. نستخدم بدلاً من ذلك التخزين المحلي في متصفحكم لبضع تفضيلات بسيطة، وملف ارتباط دخول ضروري في صفحات الإدارة والمدرّبين فقط.",
        he: "אתר זה אינו משתמש בעוגיות פרסום או מעקב. במקום זאת אנו משתמשים באחסון מקומי בדפדפן שלכם עבור מספר העדפות פשוטות, ובעוגיית התחברות הכרחית בעמודי הניהול והמאמנים בלבד.",
        en: "This site does not use advertising or tracking cookies. Instead, we use your browser's local storage for a couple of simple preferences, and a necessary sign-in cookie only on the admin and coach pages.",
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
        ar: "عند تسجيل دخول الإدارة أو أحد المدرّبين، يُحفظ ملف ارتباط آمن (httpOnly) للحفاظ على تسجيل الدخول فقط. زوّار الموقع العام لا يحصلون على أي ملف ارتباط من هذا النوع.",
        he: "בעת התחברות ההנהלה או אחד המאמנים, נשמרת עוגיה מאובטחת (httpOnly) שתפקידה היחיד הוא לשמור על ההתחברות. מבקרים באתר הציבורי אינם מקבלים עוגיה מסוג זה כלל.",
        en: "When an admin or coach signs in, a secure (httpOnly) cookie is set purely to keep them signed in. Visitors browsing the public site never receive this or any other cookie.",
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
