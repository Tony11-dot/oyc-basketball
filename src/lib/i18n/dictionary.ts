import type { Locale } from "../types";

// UI string dictionary. Page *content* (hero copy, teams, players) lives in the
// data layer and is localised there; this covers chrome, labels and buttons.

export interface Dict {
  dir: "rtl" | "ltr";
  langName: string;
  nav: {
    home: string;
    teams: string;
    highlights: string;
    gallery: string;
    register: string;
    contact: string;
  };
  hero: { badge: string; cta: string; secondary: string };
  teams: {
    eyebrow: string;
    heading: string;
    subheading: string;
    empty: string;
    players: string;
    matches: string;
    noPlayers: string;
    noMatches: string;
    vs: string;
    at: string;
    viewIbba: string;
    teamIbba: string;
    open: string;
  };
  highlights: { eyebrow: string; heading: string; subheading: string; empty: string };
  gallery: { eyebrow: string; heading: string; subheading: string };
  register: {
    eyebrow: string;
    heading: string;
    subheading: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    notes: string;
    notesOptional: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    signCta: string;
    signHelp: string;
    registerAnother: string;
    perks: string[];
    errors: { required: string; phone: string; email: string; generic: string };
    form: {
      sectionPlayer: string; sectionParents: string; sectionContact: string; sectionClub: string; sectionSign: string;
      player: string; idNumber: string; birthDate: string; phonePlayer: string;
      father: string; mother: string; phoneFather: string; phoneMother: string;
      address: string; school: string; grade: string;
      jerseySize: string; jerseyPlaceholder: string;
      payment: string; paymentPlaceholder: string; paymentCash: string; paymentCheck: string; paymentCard: string;
      guardian: string; date: string;
      signature: string; signatureHint: string; clear: string;
      consent: string; feeNote: string; optional: string;
    };
  };
  footer: { contact: string; address: string; follow: string; rights: string; adminLink: string };
  admin: {
    loading: string;
    viewSite: string;
    signOut: string;
    save: string;
    saving: string;
    refresh: string;
    actions: { add: string; edit: string; delete: string; cancel: string; search: string };
    nav: { overview: string; registrations: string; teams: string; content: string; sections: string; settings: string };
    settings: {
      title: string;
      subtitle: string;
      current: string;
      newPass: string;
      confirm: string;
      save: string;
      saved: string;
      mismatch: string;
      tooShort: string;
      wrongCurrent: string;
    };
    login: {
      title: string;
      subtitle: string;
      passwordLabel: string;
      signIn: string;
      signingIn: string;
      wrong: string;
      error: string;
      demo: string;
    };
    titles: {
      overview: string;
      overviewSub: string;
      registrations: string;
      registrationsSub: string;
      teams: string;
      teamsSub: string;
      content: string;
      contentSub: string;
    };
    contentTabs: { hero: string; highlights: string; gallery: string; blocks: string; footer: string; backgrounds: string };
    preview: { label: string };
    toasts: { saved: string; saveError: string };
    imageUpload: { upload: string; replace: string; remove: string; uploading: string; failed: string };
    positioner: { label: string; hint: string; reset: string; frameShape: string; align: string };
    sections: {
      subtitle: string;
      tip: string;
      shown: string;
      hidden: string;
      showHint: string;
      hideHint: string;
      moveUp: string;
      moveDown: string;
    };
    gallery: { add: string; empty: string; caption: string };
    fields: {
      headline: string;
      subtitle: string;
      body: string;
      phone: string;
      email: string;
      address: string;
      socialLinks: string;
      addLink: string;
      linkLabel: string;
    };
    team: {
      none: string;
      addTitle: string;
      cover: string;
      coverHint: string;
      name: string;
      description: string;
      detailBg: string;
      detailBgHint: string;
      ibbaLink: string;
      ibbaLinkHint: string;
      show: string;
      deleteTitle: string;
      deleteWarn: string;
      players: string;
      playersHint: string;
      selectExisting: string;
      addExisting: string;
      addNew: string;
      newPlayerName: string;
      number: string;
      position: string;
      detach: string;
      noPlayers: string;
      matches: string;
      matchesHint: string;
      addMatch: string;
      opponent: string;
      opponentLogo: string;
      matchDate: string;
      matchWhere: string;
      matchIbba: string;
      removeMatch: string;
      noMatches: string;
      roster: string;
      rosterHint: string;
    };
    highlight: {
      subtitle: string;
      add: string;
      none: string;
      video: string;
      videoHint: string;
      embed: string;
      embedHint: string;
      or: string;
      poster: string;
      caption: string;
    };
    reg: {
      none: string;
      name: string;
      phone: string;
      email: string;
      status: string;
      date: string;
      details: string;
      notes: string;
      markSigned: string;
      markNew: string;
      delete: string;
      deleteConfirm: string;
      allStatuses: string;
      viewPdf: string;
      noPdf: string;
    };
    status: { new: string; signed: string; archived: string };
    overview: { totalRegs: string; thisMonth: string; teams: string; players: string; latest: string; viewAll: string; none: string };
  };
}

export const dictionaries: Record<Locale, Dict> = {
  ar: {
    dir: "rtl",
    langName: "العربية",
    nav: { home: "الرئيسية", teams: "الفرق", highlights: "أبرز اللقطات", gallery: "الصور", register: "التسجيل", contact: "تواصل" },
    hero: { badge: "نادي الشبيبة الأرثوذكسية — الناصرة", cta: "سجّل الآن", secondary: "شاهد الفرق" },
    teams: {
      eyebrow: "فرقنا",
      heading: "الفرق",
      subheading: "تعرّف على فرقنا، لاعبيها ومبارياتها.",
      empty: "لا توجد فرق لعرضها حالياً.",
      players: "اللاعبون",
      matches: "المباريات",
      noPlayers: "لم تتم إضافة لاعبين بعد.",
      noMatches: "لا توجد مباريات مجدولة بعد.",
      vs: "ضد",
      at: "في",
      viewIbba: "صفحة IBBA",
      teamIbba: "صفحة الفريق على IBBA",
      open: "التفاصيل",
    },
    highlights: { eyebrow: "لقطات", heading: "أبرز اللقطات", subheading: "أجمل اللحظات من الملعب.", empty: "لا توجد مقاطع بعد." },
    gallery: { eyebrow: "من أجوائنا", heading: "الصور", subheading: "لحظات من المباريات والحياة في النادي." },
    register: {
      eyebrow: "انضمّ إلينا",
      heading: "التسجيل في النادي",
      subheading: "اترك بياناتك وأكمل استمارة التوقيع عبر DocuSign.",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      notes: "ملاحظات",
      notesOptional: "ملاحظات (اختياري)",
      submit: "إرسال التسجيل",
      submitting: "جارٍ الإرسال…",
      successTitle: "تم استلام تسجيلك!",
      successBody: "أرسلنا تأكيداً إلى بريدك الإلكتروني، وستتواصل معك إدارة النادي قريباً.",
      signCta: "فتح استمارة التوقيع",
      signHelp: "ستُفتح استمارة DocuSign بنافذة جديدة، مع تعبئة اسمك وبريدك مسبقاً.",
      registerAnother: "تسجيل شخص آخر",
      perks: ["تدريبات منتظمة", "مباريات في دوري IBBA", "روح أرثوذكسية وأخوّة"],
      errors: { required: "حقل مطلوب", phone: "رقم هاتف غير صالح", email: "بريد إلكتروني غير صالح", generic: "حدث خطأ. حاول مجدداً." },
      form: {
        sectionPlayer: "بيانات اللاعب/ة", sectionParents: "بيانات الوالدين", sectionContact: "العنوان والمدرسة", sectionClub: "النادي", sectionSign: "الإقرار والتوقيع",
        player: "اسم اللاعب/ة", idNumber: "رقم الهويّة", birthDate: "تاريخ الميلاد", phonePlayer: "هاتف اللاعب/ة",
        father: "اسم الأب", mother: "اسم الأم", phoneFather: "هاتف الأب", phoneMother: "هاتف الأم",
        address: "العنوان", school: "المدرسة", grade: "الصف",
        jerseySize: "مقاس الزيّ الرياضي", jerseyPlaceholder: "— اختر المقاس —",
        payment: "طريقة دفع الرسوم", paymentPlaceholder: "— طريقة الدفع —", paymentCash: "نقداً", paymentCheck: "شيكات", paymentCard: "بطاقة اعتماد",
        guardian: "اسم وليّ الأمر", date: "التاريخ",
        signature: "توقيع وليّ الأمر", signatureHint: "وقّع بإصبعك أو الفأرة داخل الإطار", clear: "مسح",
        consent: "أُقرّ بأنني وليّ أمر اللاعب/ة، وأوافق على شروط التسجيل، وعلى نشر صور ابني/ابنتي ضمن فعاليات الجمعية، وأن التسجيل مشروط بفحص طبّي ودفع الرسوم.",
        feeNote: "رسوم التسجيل السنوية: 3,500 ش.ج (لا تشمل 30 ش.ج لاتحاد كرة السلة). التسجيل مشروط بتسديد رسوم السنوات السابقة.",
        optional: "اختياري",
      },
    },
    footer: { contact: "تواصل", address: "العنوان", follow: "تابعنا", rights: "جميع الحقوق محفوظة.", adminLink: "الإدارة" },
    admin: {
      loading: "جارٍ التحميل…",
      viewSite: "عرض الموقع",
      signOut: "تسجيل الخروج",
      save: "حفظ التغييرات",
      saving: "جارٍ الحفظ…",
      refresh: "تحديث",
      actions: { add: "إضافة", edit: "تعديل", delete: "حذف", cancel: "إلغاء", search: "بحث" },
      nav: { overview: "نظرة عامة", registrations: "التسجيلات", teams: "الفرق", content: "المحتوى", sections: "الأقسام", settings: "الإعدادات" },
      settings: {
        title: "الإعدادات",
        subtitle: "تغيير كلمة مرور الإدارة.",
        current: "كلمة المرور الحالية",
        newPass: "كلمة مرور جديدة",
        confirm: "تأكيد كلمة المرور",
        save: "تحديث كلمة المرور",
        saved: "تم تحديث كلمة المرور",
        mismatch: "كلمتا المرور غير متطابقتين",
        tooShort: "كلمة المرور قصيرة جداً (٤ أحرف على الأقل)",
        wrongCurrent: "كلمة المرور الحالية غير صحيحة",
      },
      login: {
        title: "دخول الإدارة",
        subtitle: "أدخل كلمة مرور الإدارة للمتابعة.",
        passwordLabel: "كلمة المرور",
        signIn: "دخول",
        signingIn: "جارٍ الدخول…",
        wrong: "كلمة مرور خاطئة. حاول مجدداً.",
        error: "حدث خطأ ما. حاول مجدداً.",
        demo: "كلمة مرور تجريبية:",
      },
      titles: {
        overview: "لوحة التحكم",
        overviewSub: "نظرة عامة على التسجيلات والفرق.",
        registrations: "التسجيلات",
        registrationsSub: "عرض من سجّل في النادي ومتابعة حالة التوقيع.",
        teams: "الفرق",
        teamsSub: "أنشئ الفرق وأضف اللاعبين والمباريات وروابط IBBA.",
        content: "المحتوى",
        contentSub: "تحرير النصوص والخطوط والصور. تتحدث المعاينة فوراً؛ تُنشر التغييرات عند الحفظ.",
      },
      contentTabs: { hero: "الرئيسية", highlights: "أبرز اللقطات", gallery: "الصور", blocks: "بلوكات", footer: "التذييل", backgrounds: "الخلفيات" },
      preview: { label: "معاينة حية — تتحدث عند الحفظ" },
      toasts: { saved: "تم الحفظ — ظاهر على الموقع", saveError: "تعذّر الحفظ" },
      imageUpload: { upload: "رفع صورة", replace: "استبدال الصورة", remove: "إزالة", uploading: "جارٍ الرفع…", failed: "فشل الرفع" },
      positioner: { label: "تموضع الصورة", hint: "اسحب الصورة لتأطيرها", reset: "إعادة ضبط", frameShape: "شكل الإطار:", align: "محاذاة:" },
      sections: {
        subtitle: "إظهار/إخفاء الأقسام وإعادة ترتيبها. يؤثر على الصفحة وعلى ألسنة التنقّل.",
        tip: "نصيحة: إخفاء التسجيل أو التواصل يزيلهما من الموقع — يُفضَّل إبقاؤهما ظاهرين.",
        shown: "ظاهر",
        hidden: "مخفي",
        showHint: "مخفي — اضغط للإظهار",
        hideHint: "ظاهر — اضغط للإخفاء",
        moveUp: "تحريك للأعلى",
        moveDown: "تحريك للأسفل",
      },
      gallery: { add: "إضافة صورة", empty: "لا توجد صور بعد. أضف صوراً للكاروسيل.", caption: "تعليق (اختياري)" },
      fields: {
        headline: "العنوان الرئيسي",
        subtitle: "العنوان الفرعي",
        body: "النص",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        address: "العنوان",
        socialLinks: "روابط التواصل",
        addLink: "إضافة رابط",
        linkLabel: "اسم الرابط",
      },
      team: {
        none: "لا توجد فرق بعد.",
        addTitle: "إضافة فريق",
        cover: "صورة الفريق",
        coverHint: "تظهر على البطاقة",
        name: "اسم الفريق",
        description: "وصف",
        detailBg: "خلفية التفاصيل",
        detailBgHint: "تظهر بملء الشاشة عند فتح الفريق",
        ibbaLink: "رابط IBBA للفريق",
        ibbaLinkHint: "رابط صفحة الفريق على موقع IBBA",
        show: "إظهار الفريق على الموقع",
        deleteTitle: "حذف الفريق",
        deleteWarn: "حذف؟ لن يظهر على الموقع. اللاعبون يبقون في القائمة العامة.",
        players: "اللاعبون",
        playersHint: "أضف لاعباً موجوداً أو أنشئ لاعباً جديداً فوراً",
        selectExisting: "اختر لاعباً موجوداً…",
        addExisting: "إضافة",
        addNew: "+ لاعب جديد",
        newPlayerName: "اسم اللاعب الجديد",
        number: "الرقم",
        position: "المركز",
        detach: "إزالة من الفريق",
        noPlayers: "لم تتم إضافة لاعبين بعد.",
        matches: "المباريات",
        matchesHint: "ضد من، متى، أين، ورابط IBBA",
        addMatch: "+ إضافة مباراة",
        opponent: "الخصم",
        opponentLogo: "شعار الخصم",
        matchDate: "التاريخ والوقت",
        matchWhere: "المكان",
        matchIbba: "رابط IBBA للمباراة",
        removeMatch: "إزالة",
        noMatches: "لا مباريات بعد.",
        roster: "القائمة العامة للاعبين",
        rosterHint: "تظهر هنا كل اللاعبين؛ احذف لاعباً لإزالته من كل الفرق.",
      },
      highlight: {
        subtitle: "أضف مقاطع الفيديو — ملف مرفوع أو رابط يوتيوب/إنستغرام.",
        add: "إضافة مقطع",
        none: "لا توجد مقاطع بعد.",
        video: "ملف فيديو",
        videoHint: "ارفع mp4/webm، أو الصق رابط فيديو مباشر",
        embed: "رابط يوتيوب / إنستغرام",
        embedHint: "الصق رابط المشاهدة وسيُضمَّن",
        or: "أو",
        poster: "صورة مصغّرة (اختياري)",
        caption: "تعليق",
      },
      reg: {
        none: "لا توجد تسجيلات بعد.",
        name: "الاسم",
        phone: "الهاتف",
        email: "البريد",
        status: "الحالة",
        date: "التاريخ",
        details: "تفاصيل التسجيل",
        notes: "ملاحظات",
        markSigned: "وضع كموقَّع",
        markNew: "إرجاع إلى جديد",
        delete: "حذف",
        deleteConfirm: "حذف هذا التسجيل؟ لا يمكن التراجع.",
        allStatuses: "كل الحالات",
        viewPdf: "عرض الاستمارة (PDF)",
        noPdf: "لا توجد استمارة محفوظة",
      },
      status: { new: "جديد", signed: "موقَّع", archived: "مؤرشف" },
      overview: { totalRegs: "إجمالي التسجيلات", thisMonth: "هذا الشهر", teams: "الفرق", players: "اللاعبون", latest: "أحدث التسجيلات", viewAll: "عرض الكل", none: "لا تسجيلات بعد." },
    },
  },
  he: {
    dir: "rtl",
    langName: "עברית",
    nav: { home: "בית", teams: "קבוצות", highlights: "שיאים", gallery: "גלריה", register: "הרשמה", contact: "צור קשר" },
    hero: { badge: "מועדון הנוער האורתודוקסי — נצרת", cta: "להרשמה", secondary: "לקבוצות" },
    teams: {
      eyebrow: "הקבוצות שלנו",
      heading: "קבוצות",
      subheading: "הכירו את הקבוצות, השחקנים והמשחקים.",
      empty: "אין קבוצות להצגה כרגע.",
      players: "שחקנים",
      matches: "משחקים",
      noPlayers: "עדיין לא נוספו שחקנים.",
      noMatches: "אין משחקים מתוזמנים עדיין.",
      vs: "נגד",
      at: "ב־",
      viewIbba: "עמוד IBBA",
      teamIbba: "עמוד הקבוצה ב-IBBA",
      open: "פרטים",
    },
    highlights: { eyebrow: "קליפים", heading: "שיאים", subheading: "הרגעים הכי טובים מהמגרש.", empty: "אין סרטונים עדיין." },
    gallery: { eyebrow: "הצצה אלינו", heading: "גלריה", subheading: "רגעים מהמשחקים ומחיי המועדון." },
    register: {
      eyebrow: "הצטרפו אלינו",
      heading: "הרשמה למועדון",
      subheading: "השאירו פרטים והשלימו את טופס החתימה ב-DocuSign.",
      firstName: "שם פרטי",
      lastName: "שם משפחה",
      phone: "טלפון",
      email: "אימייל",
      notes: "הערות",
      notesOptional: "הערות (לא חובה)",
      submit: "שליחת הרשמה",
      submitting: "שולח…",
      successTitle: "ההרשמה התקבלה!",
      successBody: "שלחנו אישור לאימייל שלכם, והמועדון יצור איתכם קשר בקרוב.",
      signCta: "פתיחת טופס החתימה",
      signHelp: "טופס DocuSign ייפתח בכרטיסייה חדשה, עם השם והאימייל ממולאים מראש.",
      registerAnother: "הרשמה נוספת",
      perks: ["אימונים קבועים", "משחקים בליגת IBBA", "רוח אורתודוקסית ואחווה"],
      errors: { required: "שדה חובה", phone: "מספר טלפון לא תקין", email: "כתובת אימייל לא תקינה", generic: "אירעה שגיאה. נסו שוב." },
      form: {
        sectionPlayer: "פרטי השחקן/ית", sectionParents: "פרטי ההורים", sectionContact: "כתובת ובית ספר", sectionClub: "מועדון", sectionSign: "הצהרה וחתימה",
        player: "שם השחקן/ית", idNumber: "מספר זהות", birthDate: "תאריך לידה", phonePlayer: "טלפון השחקן/ית",
        father: "שם האב", mother: "שם האם", phoneFather: "טלפון האב", phoneMother: "טלפון האם",
        address: "כתובת", school: "בית ספר", grade: "כיתה",
        jerseySize: "מידת מדים", jerseyPlaceholder: "— בחר מידה —",
        payment: "אופן תשלום", paymentPlaceholder: "— אופן תשלום —", paymentCash: "מזומן", paymentCheck: "צ'קים", paymentCard: "כרטיס אשראי",
        guardian: "שם האפוטרופוס", date: "תאריך",
        signature: "חתימת האפוטרופוס", signatureHint: "חתמו עם האצבע או העכבר במסגרת", clear: "ניקוי",
        consent: "אני מאשר/ת כי אני האפוטרופוס של השחקן/ית, מסכים/ה לתנאי ההרשמה ולפרסום תמונות ילדיי במסגרת פעילויות העמותה, וכי ההרשמה מותנית בבדיקה רפואית ובתשלום.",
        feeNote: "דמי הרשמה שנתיים: 3,500 ₪ (לא כולל 30 ₪ לאיגוד הכדורסל). ההרשמה מותנית בתשלום חובות קודמים.",
        optional: "רשות",
      },
    },
    footer: { contact: "צור קשר", address: "כתובת", follow: "עקבו אחרינו", rights: "כל הזכויות שמורות.", adminLink: "ניהול" },
    admin: {
      loading: "טוען…",
      viewSite: "צפייה באתר",
      signOut: "התנתקות",
      save: "שמירת שינויים",
      saving: "שומר…",
      refresh: "רענון",
      actions: { add: "הוספה", edit: "עריכה", delete: "מחיקה", cancel: "ביטול", search: "חיפוש" },
      nav: { overview: "סקירה", registrations: "הרשמות", teams: "קבוצות", content: "תוכן", sections: "מקטעים", settings: "הגדרות" },
      settings: {
        title: "הגדרות",
        subtitle: "שינוי סיסמת הניהול.",
        current: "סיסמה נוכחית",
        newPass: "סיסמה חדשה",
        confirm: "אישור סיסמה",
        save: "עדכון סיסמה",
        saved: "הסיסמה עודכנה",
        mismatch: "הסיסמאות אינן תואמות",
        tooShort: "הסיסמה קצרה מדי (לפחות 4 תווים)",
        wrongCurrent: "הסיסמה הנוכחית שגויה",
      },
      login: {
        title: "כניסת מנהל",
        subtitle: "הזינו את סיסמת המנהל כדי להמשיך.",
        passwordLabel: "סיסמה",
        signIn: "כניסה",
        signingIn: "מתחבר…",
        wrong: "סיסמה שגויה. נסו שוב.",
        error: "משהו השתבש. נסו שוב.",
        demo: "סיסמת הדגמה:",
      },
      titles: {
        overview: "לוח בקרה",
        overviewSub: "סקירה של ההרשמות והקבוצות.",
        registrations: "הרשמות",
        registrationsSub: "מי נרשם למועדון ומעקב אחר סטטוס החתימה.",
        teams: "קבוצות",
        teamsSub: "צרו קבוצות והוסיפו שחקנים, משחקים וקישורי IBBA.",
        content: "תוכן",
        contentSub: "עריכת טקסט, גופנים ותמונות. התצוגה מתעדכנת תוך כדי; השינויים נשמרים בלחיצה.",
      },
      contentTabs: { hero: "בית", highlights: "שיאים", gallery: "גלריה", blocks: "בלוקים", footer: "כותרת תחתונה", backgrounds: "רקעים" },
      preview: { label: "תצוגה חיה — מתעדכנת בעת שמירה" },
      toasts: { saved: "נשמר — באתר עכשיו", saveError: "השמירה נכשלה" },
      imageUpload: { upload: "העלאת תמונה", replace: "החלפת תמונה", remove: "הסרה", uploading: "מעלה…", failed: "ההעלאה נכשלה" },
      positioner: { label: "מיקום התמונה", hint: "גררו את התמונה כדי למסגר אותה", reset: "איפוס", frameShape: "צורת המסגרת:", align: "יישור:" },
      sections: {
        subtitle: "הצגה/הסתרה של מקטעים ושינוי הסדר. משפיע גם על העמוד וגם על לשוניות הניווט.",
        tip: "טיפ: הסתרת הרשמה או צור קשר מסירה אותם מהאתר — בדרך כלל כדאי להשאיר אותם מוצגים.",
        shown: "מוצג",
        hidden: "מוסתר",
        showHint: "מוסתר — לחצו כדי להציג",
        hideHint: "מוצג — לחצו כדי להסתיר",
        moveUp: "העברה למעלה",
        moveDown: "העברה למטה",
      },
      gallery: { add: "הוספת תמונה", empty: "אין תמונות עדיין. הוסיפו תמונות לקרוסלה.", caption: "כיתוב (לא חובה)" },
      fields: {
        headline: "כותרת ראשית",
        subtitle: "כותרת משנה",
        body: "תוכן",
        phone: "טלפון",
        email: "אימייל",
        address: "כתובת",
        socialLinks: "רשתות חברתיות",
        addLink: "הוספת קישור",
        linkLabel: "שם הקישור",
      },
      team: {
        none: "אין קבוצות עדיין.",
        addTitle: "הוספת קבוצה",
        cover: "תמונת הקבוצה",
        coverHint: "מוצגת על הכרטיס",
        name: "שם הקבוצה",
        description: "תיאור",
        detailBg: "רקע מסך מלא",
        detailBgHint: "מוצג במסך מלא בפתיחת הקבוצה",
        ibbaLink: "קישור IBBA לקבוצה",
        ibbaLinkHint: "קישור לעמוד הקבוצה באתר IBBA",
        show: "הצגת הקבוצה באתר",
        deleteTitle: "מחיקת קבוצה",
        deleteWarn: "למחוק? לא תוצג באתר. השחקנים נשארים ברשימה הכללית.",
        players: "שחקנים",
        playersHint: "הוסיפו שחקן קיים או צרו שחקן חדש מיד",
        selectExisting: "בחרו שחקן קיים…",
        addExisting: "הוספה",
        addNew: "+ שחקן חדש",
        newPlayerName: "שם השחקן החדש",
        number: "מספר",
        position: "תפקיד",
        detach: "הסרה מהקבוצה",
        noPlayers: "עדיין לא נוספו שחקנים.",
        matches: "משחקים",
        matchesHint: "נגד מי, מתי, איפה, וקישור IBBA",
        addMatch: "+ הוספת משחק",
        opponent: "יריבה",
        opponentLogo: "סמל היריבה",
        matchDate: "תאריך ושעה",
        matchWhere: "מיקום",
        matchIbba: "קישור IBBA למשחק",
        removeMatch: "הסרה",
        noMatches: "אין משחקים עדיין.",
        roster: "רשימת שחקנים כללית",
        rosterHint: "כאן מופיעים כל השחקנים; מחיקת שחקן מסירה אותו מכל הקבוצות.",
      },
      highlight: {
        subtitle: "הוסיפו סרטונים — קובץ שהועלה או קישור YouTube/Instagram.",
        add: "הוספת סרטון",
        none: "אין סרטונים עדיין.",
        video: "קובץ וידאו",
        videoHint: "העלו mp4/webm, או הדביקו קישור וידאו ישיר",
        embed: "קישור YouTube / Instagram",
        embedHint: "הדביקו קישור צפייה והוא יוטמע",
        or: "או",
        poster: "תמונה ממוזערת (לא חובה)",
        caption: "כיתוב",
      },
      reg: {
        none: "אין הרשמות עדיין.",
        name: "שם",
        phone: "טלפון",
        email: "אימייל",
        status: "סטטוס",
        date: "תאריך",
        details: "פרטי ההרשמה",
        notes: "הערות",
        markSigned: "סימון כחתום",
        markNew: "החזרה לחדש",
        delete: "מחיקה",
        deleteConfirm: "למחוק את ההרשמה? לא ניתן לבטל.",
        allStatuses: "כל הסטטוסים",
        viewPdf: "צפייה בטופס (PDF)",
        noPdf: "אין טופס שמור",
      },
      status: { new: "חדש", signed: "חתום", archived: "בארכיון" },
      overview: { totalRegs: "סך ההרשמות", thisMonth: "החודש", teams: "קבוצות", players: "שחקנים", latest: "הרשמות אחרונות", viewAll: "הצגת הכל", none: "אין הרשמות עדיין." },
    },
  },
  en: {
    dir: "ltr",
    langName: "English",
    nav: { home: "Home", teams: "Teams", highlights: "Highlights", gallery: "Gallery", register: "Register", contact: "Contact" },
    hero: { badge: "Orthodox Youth Club — Nazareth", cta: "Register now", secondary: "See teams" },
    teams: {
      eyebrow: "Our teams",
      heading: "Teams",
      subheading: "Meet our teams, their players and their fixtures.",
      empty: "No teams to show right now.",
      players: "Players",
      matches: "Matches",
      noPlayers: "No players added yet.",
      noMatches: "No matches scheduled yet.",
      vs: "vs",
      at: "at",
      viewIbba: "IBBA page",
      teamIbba: "Team page on IBBA",
      open: "Details",
    },
    highlights: { eyebrow: "Clips", heading: "Highlights", subheading: "The best moments from the court.", empty: "No clips yet." },
    gallery: { eyebrow: "A look inside", heading: "Gallery", subheading: "Moments from the games and club life." },
    register: {
      eyebrow: "Join us",
      heading: "Register with the club",
      subheading: "Leave your details and complete the signing form via DocuSign.",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone",
      email: "Email",
      notes: "Notes",
      notesOptional: "Notes (optional)",
      submit: "Submit registration",
      submitting: "Submitting…",
      successTitle: "Registration received!",
      successBody: "We emailed you a confirmation and the club will be in touch soon.",
      signCta: "Open the signing form",
      signHelp: "A DocuSign form opens in a new tab, with your name and email pre-filled.",
      registerAnother: "Register someone else",
      perks: ["Regular training", "Games in the IBBA league", "Orthodox spirit & brotherhood"],
      errors: { required: "Required field", phone: "Invalid phone number", email: "Invalid email address", generic: "Something went wrong. Please try again." },
      form: {
        sectionPlayer: "Player details", sectionParents: "Parents", sectionContact: "Address & school", sectionClub: "Club", sectionSign: "Declaration & signature",
        player: "Player name", idNumber: "ID number", birthDate: "Date of birth", phonePlayer: "Player phone",
        father: "Father's name", mother: "Mother's name", phoneFather: "Father's phone", phoneMother: "Mother's phone",
        address: "Address", school: "School", grade: "Grade / class",
        jerseySize: "Jersey size", jerseyPlaceholder: "— Select size —",
        payment: "Payment method", paymentPlaceholder: "— Payment method —", paymentCash: "Cash", paymentCheck: "Cheques", paymentCard: "Credit card",
        guardian: "Guardian name", date: "Date",
        signature: "Guardian signature", signatureHint: "Sign with your finger or mouse in the box", clear: "Clear",
        consent: "I confirm I am the player's guardian, agree to the registration terms and to publishing my child's photos within the club's activities, and that registration is subject to a medical check and payment of fees.",
        feeNote: "Annual registration fee: ₪3,500 (excludes the ₪30 basketball-association fee). Registration is subject to payment of previous years' dues.",
        optional: "optional",
      },
    },
    footer: { contact: "Contact", address: "Address", follow: "Follow us", rights: "All rights reserved.", adminLink: "Admin" },
    admin: {
      loading: "Loading…",
      viewSite: "View site",
      signOut: "Sign out",
      save: "Save changes",
      saving: "Saving…",
      refresh: "Refresh",
      actions: { add: "Add", edit: "Edit", delete: "Delete", cancel: "Cancel", search: "Search" },
      nav: { overview: "Overview", registrations: "Registrations", teams: "Teams", content: "Content", sections: "Sections", settings: "Settings" },
      settings: {
        title: "Settings",
        subtitle: "Change the admin password.",
        current: "Current password",
        newPass: "New password",
        confirm: "Confirm password",
        save: "Update password",
        saved: "Password updated",
        mismatch: "Passwords don't match",
        tooShort: "Password too short (at least 4 characters)",
        wrongCurrent: "Current password is incorrect",
      },
      login: {
        title: "Admin sign in",
        subtitle: "Enter the admin password to continue.",
        passwordLabel: "Password",
        signIn: "Sign in",
        signingIn: "Signing in…",
        wrong: "Incorrect password. Try again.",
        error: "Something went wrong. Try again.",
        demo: "Demo password:",
      },
      titles: {
        overview: "Dashboard",
        overviewSub: "Overview of registrations and teams.",
        registrations: "Registrations",
        registrationsSub: "See who registered with the club and track signing status.",
        teams: "Teams",
        teamsSub: "Create teams and add players, matches and IBBA links.",
        content: "Content",
        contentSub: "Edit text, fonts and images. The preview updates as you type; changes go live on save.",
      },
      contentTabs: { hero: "Home", highlights: "Highlights", gallery: "Gallery", blocks: "Blocks", footer: "Footer", backgrounds: "Backgrounds" },
      preview: { label: "Live preview — updates when you Save" },
      toasts: { saved: "Saved — live on the site", saveError: "Could not save" },
      imageUpload: { upload: "Upload image", replace: "Replace image", remove: "Remove", uploading: "Uploading…", failed: "Upload failed" },
      positioner: { label: "Reposition photo", hint: "drag the image to frame it", reset: "Reset", frameShape: "Frame shape:", align: "Align:" },
      sections: {
        subtitle: "Show/hide sections and reorder them. This controls both the page and the nav tabs.",
        tip: "Tip: hiding Register or Contact removes them from the site — usually keep those on.",
        shown: "Shown",
        hidden: "Hidden",
        showHint: "Hidden — tap to show",
        hideHint: "Shown — tap to hide",
        moveUp: "Move up",
        moveDown: "Move down",
      },
      gallery: { add: "Add image", empty: "No images yet. Add images to the carousel.", caption: "Caption (optional)" },
      fields: {
        headline: "Headline",
        subtitle: "Subtitle",
        body: "Body",
        phone: "Phone",
        email: "Email",
        address: "Address",
        socialLinks: "Social links",
        addLink: "Add link",
        linkLabel: "Link label",
      },
      team: {
        none: "No teams yet.",
        addTitle: "Add team",
        cover: "Team photo",
        coverHint: "shown on the card",
        name: "Team name",
        description: "Description",
        detailBg: "Detail background",
        detailBgHint: "shown full-screen when the team is opened",
        ibbaLink: "Team IBBA link",
        ibbaLinkHint: "link to the team's page on the IBBA website",
        show: "Show this team on the site",
        deleteTitle: "Delete team",
        deleteWarn: "Delete it? It won't show on the site. Players stay in the shared roster.",
        players: "Players",
        playersHint: "Attach an existing player or create a new one instantly",
        selectExisting: "Select an existing player…",
        addExisting: "Add",
        addNew: "+ New player",
        newPlayerName: "New player name",
        number: "Number",
        position: "Position",
        detach: "Remove from team",
        noPlayers: "No players added yet.",
        matches: "Matches",
        matchesHint: "who, when, where, and an IBBA link",
        addMatch: "+ Add match",
        opponent: "Opponent",
        opponentLogo: "Opponent logo",
        matchDate: "Date & time",
        matchWhere: "Where",
        matchIbba: "Match IBBA link",
        removeMatch: "Remove",
        noMatches: "No matches yet.",
        roster: "Shared player roster",
        rosterHint: "Every player appears here; deleting a player removes them from all teams.",
      },
      highlight: {
        subtitle: "Add video clips — an uploaded file or a YouTube/Instagram link.",
        add: "Add clip",
        none: "No clips yet.",
        video: "Video file",
        videoHint: "upload mp4/webm, or paste a direct video link",
        embed: "YouTube / Instagram link",
        embedHint: "paste a watch link and it will be embedded",
        or: "or",
        poster: "Poster image (optional)",
        caption: "Caption",
      },
      reg: {
        none: "No registrations yet.",
        name: "Name",
        phone: "Phone",
        email: "Email",
        status: "Status",
        date: "Date",
        details: "Registration details",
        notes: "Notes",
        markSigned: "Mark as signed",
        markNew: "Mark as new",
        delete: "Delete",
        deleteConfirm: "Delete this registration? This cannot be undone.",
        allStatuses: "All statuses",
        viewPdf: "View form (PDF)",
        noPdf: "No saved form",
      },
      status: { new: "New", signed: "Signed", archived: "Archived" },
      overview: { totalRegs: "Total registrations", thisMonth: "This month", teams: "Teams", players: "Players", latest: "Latest registrations", viewAll: "View all", none: "No registrations yet." },
    },
  },
};

export const LOCALES: Locale[] = ["ar", "he", "en"];
export const DEFAULT_LOCALE: Locale = "ar";
